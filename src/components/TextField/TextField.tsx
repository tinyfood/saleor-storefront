import * as React from "react";

import { generateClassName } from "./misc";
import { Style, TextFieldProps } from "./types";

import "./scss/index.scss";

const TextField: React.FC<TextFieldProps> = ({
  label = "",
  iconLeft,
  iconRight,
  errors,
  helpText,
  styleType = "white" as Style,
  ...rest
}) =>  (
  <div className="input">
    {iconLeft ? <span className="input__icon-left">{iconLeft}</span> : null}
    {iconRight ? <span className="input__icon-right">{iconRight}</span> : null}
    <div className="input__content">
      <input
        {...rest}
        className={generateClassName({ errors, iconLeft, styleType })}
      />
      {label ? <span className="input__label">{label}</span> : null}
    </div>
    {errors && (
      <span className="input__error">
        {errors.map(error => error.message).join(" ")}
      </span>
    )}
    {helpText && <span className="input__help-text">{helpText}</span>}
  </div>
);

export default TextField;
