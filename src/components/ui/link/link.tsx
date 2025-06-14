import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React from "react";
import { LinkIndicator } from "./indicator";

interface LinkProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Link({ children, ...props }: LinkProps & NextLinkProps & React.ComponentProps<"a">) {
  return (
    <NextLink {...props}>
      {children}
      <LinkIndicator href={props.href.toString()} />
    </NextLink>
  );
}
