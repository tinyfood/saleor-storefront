# Checkout
This document describes the concepts, architecture, and flow of the checkout process in Storefront 2.0.

Checkout objects hold all the necessary information required to create an order, such as:
- customer's email
- items that a customer wants to buy
- billing and/or shipping address
- shipping details (if shipping is required)
- payment information

Checkout is stored in the database only when we have an email address that identifies the customer.
If there is no email address, information about items customers want to buy is stored in browser's `localStorage` as "local cart".


## Flow
When shipping is required, checkout flow consists of five steps:
- `A` - shipping address
- `B` - shipping method
- `C` - billing address
- `D` - payment
- `E` - checkout summary

When shipping isn't required (customer is buying only digital products), the flow consists of these three steps:
- `C` - billing address
- `D` - payment
- `E` - checkout summary


### 1. Guest customers
For guest customers who don't have an account (or aren't logged in), we store the cart items local cart.

1.1 Shipping is required

Checkout is created in the database only after guest customers finish the `A` step and provide an email address. Once API returns the checkout token and users completes checkout steps, we update the checkout object subsequently with API calls.

1.2 No shipping

Checkout is created in the database after guest customers finish the `C` step and provide an email address. API returns checkout token; on completing each subsequent step, we update the checkout object with API calls.


### 2. Registered customer
For registered customers, email is already known before starting the checkout flow, therefore we synchronize each of their actions immediately. When they add items to cart, we either create a new checkout with these items. If they already have unfinished checkout, we use that object and update it with new items.

2.1. Shipping is required

We have the checkout token; completing each step synchronizes the state with the database.

2.2. No shipping

Same as 2.1.


### 3. Synchronizing database checkouts with local carts
When customers log in to Storefront 2.0, we fetch their database checkouts.

3.1 Customer has a local cart

If a customer had an open checkout, we override it with contents of the local cart, because in that case, we assume that local carts are always the newest ones. If the customer had no open checkout, nothing gets overrode and local cart simply is saved into the database.

Note: See [this issue comment](https://github.com/mirumee/saleor-storefront/issues/219#issuecomment-456767396) about our reasons to not introduce any logic to merge local carts with older open checkouts returned by API

3.2 No local cart

If a customer had an open checkout, we use it as the current one. Since the customer is logged in, there is no need to use the local cart.
