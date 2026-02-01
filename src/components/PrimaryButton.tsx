import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import "./PrimaryButton.scss";

type PrimaryButtonCommonProps = {
  label: string;
  icon?: ReactNode;
};

export type PrimaryButtonProps =
  | (PrimaryButtonCommonProps & {
      to: LinkProps["to"];
      className?: string;
    } & Omit<LinkProps, "children" | "to" | "className">)
  | (PrimaryButtonCommonProps & {
      to?: undefined;
      className?: string;
    } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">);

export function PrimaryButton(props: PrimaryButtonProps) {
  const { label, icon } = props;
  const className =
    "className" in props && props.className ? props.className : undefined;
  const mergedClassName = ["primaryButton", className].filter(Boolean).join(" ");

  const contents = (
    <>
      {icon ? (
        <span className="primaryButton__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="primaryButton__label">{label}</span>
    </>
  );

  if ("to" in props && props.to !== undefined) {
    const { to, ...linkProps } = props;
    return (
      <Link to={to} className={mergedClassName} {...linkProps}>
        {contents}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props;
  return (
    <button type={type} className={mergedClassName} {...buttonProps}>
      {contents}
    </button>
  );
}

