import { IClassNameArgs } from "./types";

export const generateClassName = ({ errors, iconLeft, styleType }: IClassNameArgs) => {
  const baseClass = "input__field";
  const errorsClass = errors && errors.length ? " input__field--error" : "";
  const iconLeftClass = iconLeft ? " input__field--left-icon" : "";
  const styleTypeClass = styleType === "grey" ? " input__field--grey" : "";

  return baseClass.concat(errorsClass, iconLeftClass, styleTypeClass);
};