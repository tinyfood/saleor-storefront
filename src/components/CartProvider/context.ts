import { createContext } from "react";

import { ApolloError } from "apollo-client";
import {
  Checkout_lines,
  Checkout_lines_totalPrice
} from "../../checkout/types/Checkout";
import { Omit } from "../../core/tsUtils";

export interface CartLineI
  extends Omit<Checkout_lines, "__typename" | "id" | "totalPrice"> {
  totalPrice?: string | Checkout_lines_totalPrice | null;
  // quantity?: number;
}

export type AddCartLineI = Omit<CartLineI, "quantity">;

export interface CartLineInterface {
  variantId: string;
  variant?: any;
  quantity: number;
}

export interface CartInterface {
  errors: ApolloError[] | null;
  lines: CartLineI[];
  loading: boolean;
  add(variant: AddCartLineI, quantity?: number): void;
  changeQuantity(variant: AddCartLineI, quantity: number);
  clear(): void;
  clearErrors(): void;
  fetch(): void;
  getQuantity(): number;
  getTotal(): { currency: string; amount: number };
  remove(variant: AddCartLineI): void;
  subtract(variant: AddCartLineI, quantity?: number): void;
}

/* tslint:disable:no-empty */
export const CartContext = createContext<CartInterface>({
  add: (variant, quantity = 1) => {},
  changeQuantity: (variant, quantity) => {},
  clear: () => {},
  clearErrors: () => {},
  errors: null,
  fetch: () => {},
  getQuantity: () => 0,
  getTotal: () => ({ currency: "USD", amount: 0 }),
  lines: [],
  loading: false,
  remove: variant => {},
  subtract: (variant, quantity = 1) => {}
});
/* tslint:enable:no-empty */
