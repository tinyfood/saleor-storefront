import * as React from "react";

import { ApolloClient, ApolloError } from "apollo-client";
import {
  CheckoutContext,
  CheckoutContextInterface
} from "../../checkout/context";
import {
  getCheckoutQuery,
  updateCheckoutLineQuery
} from "../../checkout/queries";
import {
  updateCheckoutLine,
  updateCheckoutLineVariables
} from "../../checkout/types/updateCheckoutLine";
import { maybe, priceToString } from "../../core/utils";
import {
  productVariatnsQuery,
  TypedProductVariantsQuery
} from "../../views/Product/queries";
import {
  VariantList,
  VariantListVariables,
  VariantList_productVariants
} from "../../views/Product/types/VariantList";
import {
  CartContext,
  CartInterface,
  CartLineInterface,
  CartLineI
} from "./context";
import { Checkout_lines_variant } from "../../checkout/types/Checkout";
import { nodeVariantToCartLineVariant } from "./uitls";

export default class CartProvider extends React.Component<
  {
    children: any;
    locale: string;
    apolloClient: ApolloClient<any>;
    checkout: CheckoutContextInterface;
  },
  CartInterface & { synced: boolean }
> {
  static contextType = CheckoutContext;
  static getQuantity = lines =>
    lines.reduce((sum, line) => sum + line.quantity, 0);
  static getTotal = (lines): { amount: number; currency: string } => {
    const amount = lines.reduce(
      (sum, line) => sum + line.variant.price.amount * line.quantity,
      0
    );
    const { currency } = lines[0].variant.price;
    return { amount, currency };
  };

  constructor(props) {
    super(props);

    let lines;
    try {
      lines = JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      lines = [];
    }

    this.state = {
      synced: false,
      add: this.add,
      changeQuantity: this.changeQuantity,
      clear: this.clear,
      clearErrors: this.clearErrors,
      errors: null,
      fetch: this.fetch,
      getQuantity: this.getQuantity,
      getTotal: this.getTotal,
      lines,
      loading: false,
      remove: this.remove,
      subtract: this.subtract
    };
  }

  getLine = (variantId: string): CartLineI =>
    this.state.lines.find(({ variant: { id } }) => id === variantId);

  changeQuantity = async (
    variant: Checkout_lines_variant,
    quantity: number
  ) => {
    this.setState({ loading: true });

    const checkoutID = maybe(() => this.props.checkout.checkout.id);
    let apiError = false;

    if (checkoutID) {
      const { apolloClient } = this.props;
      const {
        data: {
          checkoutLinesUpdate: { errors, checkout }
        }
      } = await apolloClient.mutate<
        updateCheckoutLine,
        updateCheckoutLineVariables
      >({
        mutation: updateCheckoutLineQuery,
        update: (cache, { data: { checkoutLinesUpdate } }) => {
          cache.writeQuery({
            data: {
              checkout: checkoutLinesUpdate.checkout
            },
            query: getCheckoutQuery
          });
        },
        variables: {
          checkoutId: checkoutID,
          lines: [
            {
              quantity,
              variantId: variant.id
            }
          ]
        }
      });
      apiError = !!errors.length;
      if (apiError) {
        this.setState({
          errors: [...errors],
          loading: false
        });
      } else {
        this.props.checkout.update({ checkout });
      }
    }

    if (!apiError) {
      const newLine = {
        quantity,
        totalPrice: this.geLineTotalPrice(variant, quantity),
        variant
      };
      this.setState(prevState => {
        let lines = prevState.lines.filter(
          stateLine => stateLine.variant.id !== newLine.variant.id
        );
        if (newLine.quantity > 0) {
          lines = [...lines, newLine];
        }
        return { lines, loading: false };
      });
    }
  };

  add = (variant: Checkout_lines_variant, quantity = 1) => {
    const cartLine = this.getLine(variant.id);
    const newQuantity = cartLine ? cartLine.quantity + quantity : quantity;
    this.changeQuantity(variant, newQuantity);
  };

  subtract = (variant: Checkout_lines_variant, quantity = 1) => {
    const line = this.getLine(variant.id);
    const newQuantity = line ? line.quantity - quantity : quantity;
    this.changeQuantity(variant, newQuantity);
  };

  clear = () => this.setState({ lines: [], errors: [] });

  clearErrors = () => this.setState({ errors: [] });

  fetch = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length) {
      this.setState({ loading: true });
      let lines;
      const { apolloClient } = this.props;
      const { data, errors } = await apolloClient.query<
        VariantList,
        VariantListVariables
      >({
        query: productVariatnsQuery,
        variables: {
          ids: cart.map(line => line.variantId)
        }
      });
      const quantityMapping = cart.reduce((obj, line) => {
        obj[line.variantId] = line.quantity;
        return obj;
      }, {});
      lines = data.productVariants
        ? data.productVariants.edges.map(variant => ({
            quantity: quantityMapping[variant.node.id],
            variant: variant.node,
            variantId: variant.node.id
          }))
        : [];

      this.setState({
        errors: errors
          ? [
              new ApolloError({
                graphQLErrors: errors
              })
            ]
          : null,
        lines: errors ? [] : lines,
        loading: false
      });
    }
  };

  getQuantity = () => CartProvider.getQuantity(this.state.lines);

  getTotal = () => CartProvider.getTotal(this.state.lines);

  geLineTotalPrice = (
    variant: Checkout_lines_variant,
    quantity: number
  ): string => {
    return priceToString(
      {
        amount: quantity * variant.price.amount,
        currency: variant.price.currency
      },
      this.props.locale
    );
  };

  remove = variantId => this.changeQuantity(variantId, 0);

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.lines) !== JSON.stringify(prevState.lines)) {
      localStorage.setItem("cart", JSON.stringify(this.state.lines));
    }
  }

  extractVariantsAfterSync = ({ productVariants }: VariantList): void =>
    this.setState(prevState => {
      const lines = prevState.lines
        .map(({ quantity, variant: { id } }) => {
          const { node } = productVariants.edges.find(
            ({ node }) => node.id === id
          );
          const variant = nodeVariantToCartLineVariant(node);
          if (!variant) {
            return;
          }
          return {
            quantity,
            totalPrice: this.geLineTotalPrice(variant, quantity),
            variant
          };
        })
        .filter(line => line);
      return { lines, synced: true };
    });

  getContext = () => ({
    ...this.state,
    add: this.add,
    changeQuantity: this.changeQuantity,
    clearErrors: this.clearErrors,
    remove: this.remove,
    subtract: this.subtract
  });
  render() {
    console.log(this.props);
    const provider = (
      <CartContext.Provider value={this.getContext()}>
        {this.props.children}
      </CartContext.Provider>
    );

    if (!this.props.checkout.checkout && !this.state.synced) {
      return (
        <TypedProductVariantsQuery
          displayLoader={false}
          variables={{
            ids: this.state.lines.map(line => line.variant.id)
          }}
          onCompleted={this.extractVariantsAfterSync}
        >
          {() => provider}
        </TypedProductVariantsQuery>
      );
    }

    return provider;
  }
}
