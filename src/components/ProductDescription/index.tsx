import * as React from "react";

import { Button, SelectField, TextField } from "..";
import { ProductPriceInterface } from "../../core/types";
import { CartContext } from "../CartProvider/context";
import { SelectValue } from "../SelectField";

import { ProductDetails_product } from "../../views/Product/types/ProductDetails";
import AddToCartButton from "./AddToCartButton";
import "./scss/index.scss";
import { productToCartLineVariant } from "../CartProvider/uitls";

interface ProductDescriptionProps {
  product: ProductDetails_product;
  children: React.ReactNode;
  addToCart(varinatId: string, quantity?: number): void;
}

interface ProductDescriptionState {
  primaryPicker?: { label: string; values: string[]; selected?: string };
  secondaryPicker?: { label: string; values: string[]; selected?: string };
  quantity: number;
  variants: { [x: string]: string[] };
  variant: string;
  variantStock: number;
  price: ProductPriceInterface;
}

class ProductDescription extends React.Component<
  ProductDescriptionProps,
  ProductDescriptionState
> {
  constructor(props) {
    super(props);
    const { variants } = this.props.product;
    const pickers =
      variants[0].attributes &&
      variants[0].attributes[0] &&
      variants[0].attributes[0].attribute &&
      this.createPickers();
    this.state = {
      ...pickers,
      price: variants[0].price,
      quantity: 1,
      variant: "",
      variantStock: null
    };
  }

  componentWillMount() {
    this.getVariant();
  }

  createPickers = () => {
    const { variants: productVariants } = this.props.product;

    const primaryPicker = {
      label: productVariants[0].attributes[0].attribute.name,
      selected: "",
      values: []
    };

    let secondaryPicker;

    if (productVariants[0].attributes.length > 1) {
      secondaryPicker = {
        label: productVariants[0].attributes
          .slice(1)
          .map(attribute => attribute.attribute.name)
          .join(" / "),
        selected: "",
        values: []
      };
    }

    const variants = {};

    productVariants.map(variant => {
      if (!primaryPicker.values.includes(variant.attributes[0].value.value)) {
        primaryPicker.values.push(variant.attributes[0].value.value);
      }

      if (secondaryPicker) {
        const combinedValues = variant.attributes
          .slice(1)
          .map(attribute => attribute.value.value)
          .join(" / ");

        if (!secondaryPicker.values.includes(combinedValues)) {
          secondaryPicker.values.push(combinedValues);
        }

        if (variants[variant.attributes[0].value.value]) {
          variants[variant.attributes[0].value.value] = [
            ...variants[variant.attributes[0].value.value],
            combinedValues
          ];
        } else {
          variants[variant.attributes[0].value.value] = [combinedValues];
        }
      }

      primaryPicker.selected = primaryPicker.values[0];
      if (secondaryPicker) {
        secondaryPicker.selected = secondaryPicker.values[0];
      }
    });

    return {
      primaryPicker,
      secondaryPicker,
      variants
    };
  };

  onPrimaryPickerChange = value => {
    const primaryPicker = this.state.primaryPicker;
    primaryPicker.selected = value;
    this.setState({ primaryPicker });
    if (this.state.secondaryPicker) {
      if (
        !this.state.variants[value].includes(
          this.state.secondaryPicker.selected
        )
      ) {
        this.onSecondaryPickerChange("");
        this.setState({ variant: "" });
      } else {
        this.getVariant();
      }
    } else {
      this.getVariant();
    }
  };

  onSecondaryPickerChange = value => {
    const secondaryPicker = this.state.secondaryPicker;
    secondaryPicker.selected = value;
    this.setState({ secondaryPicker });
    this.getVariant();
  };

  getVariant = () => {
    const { variants } = this.props.product;
    const { primaryPicker, secondaryPicker } = this.state;
    let variant;
    if (!secondaryPicker && primaryPicker) {
      variant = variants.find(
        variant => variant.name === `${primaryPicker.selected}`
      );
    } else if (secondaryPicker && primaryPicker) {
      variant = variants.find(
        variant =>
          variant.name ===
          `${primaryPicker.selected} / ${secondaryPicker.selected}`
      );
    } else {
      variant = variants[0];
    }
    const variantStock = variant.stockQuantity;
    const price = variant.price;
    this.setState({ variant: variant.id, variantStock, price });
  };

  handleSubmit = () => {
    // this.props.addToCart(this.state.variant, this.state.quantity);
    this.props.addToCart(
      productToCartLineVariant(this.props.product, this.state.variant),
      this.state.quantity
    );
  };

  render() {
    const {
      children,
      product: { name }
    } = this.props;
    const {
      price,
      primaryPicker,
      quantity,
      secondaryPicker,
      variant,
      variants,
      variantStock
    } = this.state;
    return (
      <div className="product-description">
        <h3>{name}</h3>
        <h4>{price.localized}</h4>
        <div className="product-description__variant-picker">
          {primaryPicker ? (
            <SelectField
              onChange={(e: SelectValue) => this.onPrimaryPickerChange(e.value)}
              label={primaryPicker.label}
              key={primaryPicker.label}
              value={{
                label: primaryPicker.selected,
                value: primaryPicker.selected
              }}
              options={primaryPicker.values.map(value => ({
                label: value,
                value
              }))}
            />
          ) : null}
          {secondaryPicker ? (
            <SelectField
              onChange={(e: SelectValue) =>
                this.onSecondaryPickerChange(e.value)
              }
              label={secondaryPicker.label}
              key={secondaryPicker.label}
              value={
                secondaryPicker.selected && {
                  label: secondaryPicker.selected,
                  value: secondaryPicker.selected
                }
              }
              options={secondaryPicker.values.map(value => ({
                isDisabled: !variants[primaryPicker.selected].includes(value),
                label: value,
                value
              }))}
            />
          ) : null}
          <TextField
            type="number"
            label="Quantity"
            value={quantity || ""}
            onChange={e => this.setState({ quantity: Number(e.target.value) })}
          />
        </div>
        <div className="product-description__about">
          <h4>Description</h4>
          {children}
        </div>
        <CartContext.Consumer>
          {({ lines }) => {
            const calculateQuantityWithCart = () => {
              const cartLine = lines.find(line => line.variantId === variant);
              return cartLine ? quantity + cartLine.quantity : quantity;
            };
            return (
              <AddToCartButton
                className="product-description__action"
                onClick={this.handleSubmit}
                disabled={
                  !(
                    quantity !== 0 &&
                    (variant && variantStock >= calculateQuantityWithCart())
                  )
                }
              >
                Add to basket
              </AddToCartButton>
            );
          }}
        </CartContext.Consumer>
      </div>
    );
  }
}

export default ProductDescription;
