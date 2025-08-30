"use client";

// eslint-disable-next-line no-restricted-imports
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LinkProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Link({ children, ...props }: LinkProps & NextLinkProps & React.ComponentProps<"a">) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname.includes("/user/register")) {
      e.preventDefault();
      return;
    }
  };

  return (
    <NextLink {...props} onClick={handleClick}>
      {children}
    </NextLink>
  );
}
