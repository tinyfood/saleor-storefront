import { FormError } from "../Form";

export type Style = "white" | "grey";

export interface IClassNameArgs {
  errors?: FormError[];
  iconLeft?: React.ReactNode;
  styleType?: Style;
}

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  errors?: FormError[];
  helpText?: string;
  label?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  styleType?: Style;
}