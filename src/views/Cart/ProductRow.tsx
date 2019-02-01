import classNames from "classnames";
import * as React from "react";
import { Link } from "react-router-dom";
import ReactSVG from "react-svg";

import { Checkout_lines_variant } from "../../checkout/types/Checkout";

import { CachedThumbnail, DebouncedTextField } from "../../components";
import { generateProductUrl } from "../../core/utils";
import cartAddImg from "../../images/cart-add.svg";
import cartRemoveImg from "../../images/cart-remove.svg";
import cartSubtractImg from "../../images/cart-subtract.svg";
import { VariantList_productVariants_edges_node } from "../Product/types/VariantList";

export type LineI = (
  | VariantList_productVariants_edges_node
  | Checkout_lines_variant) & {
  quantity: number;
  totalPrice: string;
};

const ProductRow: React.FC<{
  mediumScreen: boolean;
  processing: boolean;
  line: LineI;
  invalid: boolean;
  add(variantId: string): void;
  changeQuantity(variantId: string, quantity: number): void;
  remove(variantId: string): void;
  subtract(variantId: string): void;
}> = ({
  invalid,
  add,
  changeQuantity,
  mediumScreen,
  processing,
  remove,
  subtract,
  line
}) => {
  const { product } = line.variant;
  const productUrl = generateProductUrl(product.id, product.name);

  return (
    <tr
      className={classNames({
        "cart-page__table-row--processing": processing
      })}
    >
      <td className="cart-page__thumbnail">
        <div>
          {mediumScreen && (
            <Link to={productUrl}>
              <CachedThumbnail source={product} />
            </Link>
          )}
          <Link to={productUrl}>
            {product.name}
            {line.name && ` (${line.name})`}
          </Link>
        </div>
      </td>
      {mediumScreen && <td>{line.variant.price.localized}</td>}
      <td className="cart-page__table__quantity-cell">
        {mediumScreen ? (
          <div>
            <ReactSVG path={cartAddImg} onClick={() => add(line.id)} />
            <p>{line.quantity}</p>
            <ReactSVG
              path={cartSubtractImg}
              onClick={() => subtract(line.id)}
            />
          </div>
        ) : (
          <DebouncedTextField
            value={line.quantity}
            onChange={evt =>
              changeQuantity(line.id, parseInt(evt.target.value, 10))
            }
            resetValue={invalid}
            disabled={processing}
          />
        )}
      </td>
      <td>{line.totalPrice}</td>
      <td>
        <ReactSVG path={cartRemoveImg} onClick={() => remove(line.id)} />
      </td>
    </tr>
  );
};

export default ProductRow;
