import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import "./SecondaryButton.scss";

type SecondaryButtonCommonProps = {
  label: string;
  icon?: ReactNode;
};

export type SecondaryButtonProps =
  | (SecondaryButtonCommonProps & {
      to: LinkProps["to"];
      className?: string;
    } & Omit<LinkProps, "children" | "to" | "className">)
  | (SecondaryButtonCommonProps & {
      to?: undefined;
      className?: string;
    } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">);

export function SecondaryButton(props: SecondaryButtonProps) {
  const { label, icon } = props;
  const className =
    "className" in props && props.className ? props.className : undefined;
  const mergedClassName = ["secondaryButton", className]
    .filter(Boolean)
    .join(" ");

  const contents = (
    <>
      {icon ? (
        <span className="secondaryButton__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="secondaryButton__label">{label}</span>
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

