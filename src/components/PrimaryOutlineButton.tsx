import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import "./PrimaryOutlineButton.scss";

type PrimaryOutlineButtonCommonProps = {
  label: string;
  icon?: ReactNode;
};

export type PrimaryOutlineButtonProps =
  | (PrimaryOutlineButtonCommonProps & {
      to: LinkProps["to"];
      className?: string;
    } & Omit<LinkProps, "children" | "to" | "className">)
  | (PrimaryOutlineButtonCommonProps & {
      to?: undefined;
      className?: string;
    } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">);

export function PrimaryOutlineButton(props: PrimaryOutlineButtonProps) {
  const { label, icon } = props;
  const className =
    "className" in props && props.className ? props.className : undefined;
  const mergedClassName = ["primaryOutlineButton", className]
    .filter(Boolean)
    .join(" ");

  const contents = (
    <>
      {icon ? (
        <span className="primaryOutlineButton__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="primaryOutlineButton__label">{label}</span>
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
