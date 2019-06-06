import * as React from "react";

import { Button } from "..";
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
  style,
  ...rest
}) => {

  return (
  <div className="input" style={style}>
    <div className="input__content-with-button">
      <input
        {...rest}
        className={generateClassName({ errors, iconLeft, styleType })}
      />
      {label ? <span className="input__label">{label}</span> : null}
      <Button skewed={false} className="input__button">APPLY</Button>
    </div>
    {errors && (
      <span className="input__error">
        {errors.map(error => error.message).join(" ")}
      </span>
    )}
    {helpText && <span className="input__help-text">{helpText}</span>}
  </div>
);
    }

export default TextField;
