import { cn } from "@/lib/utils";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

interface TextLinkProps {
  href: Route;
  children: ReactNode;
  className?: string;
}

const TextLink = ({ href, children, className, ...props }: TextLinkProps & ComponentProps<typeof Link>) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-primary-light hover:text-primary-light/80 flex flex-row items-center gap-1 underline transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default TextLink;
