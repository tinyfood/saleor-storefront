import { priceToString } from "../../core/utils";
import {
  VariantList,
  VariantList_productVariants_edges_node
} from "../../views/Product/types/VariantList";
import { CartLineInterface, CartLine } from "./context";
import {
  ProductDetails_product_variants,
  ProductDetails_product
} from "../../views/Product/types/ProductDetails";
import { Checkout_lines_variant } from "../../checkout/types/Checkout";
import { productUrl } from "../App/routes";

export const getTotal = (
  variantList: VariantList,
  lines: CartLineInterface[],
  locale?: string
): string => {
  const amount = lines.reduce((sum, { variantId, quantity }) => {
    const { node } = variantList.productVariants.edges.find(
      ({ node: { id } }) => id === variantId
    );
    return sum + node.price.amount * quantity;
  }, 0);
  const { currency } = variantList.productVariants.edges[0].node.price;

  return priceToString({ amount, currency }, locale);
};

export const nodeVariantToCartLineVariant = ({
  __typename,
  id,
  name,
  price,
  product
}: VariantList_productVariants_edges_node): Checkout_lines_variant => ({
  __typename,
  id,
  name,
  price,
  product
});

export const productToCartLineVariant = (
  product: ProductDetails_product,
  variantId: string
): Checkout_lines_variant => {
  const variant = product.variants.find(({ id }) => id === variantId);

  return {
    __typename: variant.__typename,
    id: variant.id,
    name: variant.name,
    price: variant.price,
    product: {
      __typename: product.__typename,
      id: product.id,
      name: product.name,
      thumbnail: product.thumbnail,
      thumbnail2x: product.thumbnail2x
    }
  };
};

// export const convertToCartLine = (
//   data: ProductDetails_product
// ): Checkout_lines_variant => {
//   switch (data.__typename) {
//     case "Product":
//       return {
//         __typename: data.__typename,
//         id: data.id,
//         name: data.name,
//         price: data.price
//       };
//   }
// };
