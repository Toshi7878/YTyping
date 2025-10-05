import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface H1Props {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className, ...props }: H1Props & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}
      {...props}
    >
      {children}
    </h1>
  );
}

interface H2Props {
  children: ReactNode;
  className?: string;
}

export function H2({ children, className, ...props }: H2Props & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
}

interface H3Props {
  children: ReactNode;
  className?: string;
}

export function H3({ children, className, ...props }: H3Props & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: { children: ReactNode; className?: string }) {
  return <h4 className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)}>{children}</h4>;
}

export function Large({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-lg font-semibold", className)}>{children}</div>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-3">{children}</p>;
}

export function Small({ children, className }: { children: ReactNode; className?: string }) {
  return <small className={cn("text-sm leading-none font-medium", className)}>{children}</small>;
}

interface LinkTextProps {
  href: Route;
  children: ReactNode;
  className?: string;
}

export const LinkText = ({ href, children, className, ...props }: LinkTextProps & ComponentProps<typeof Link>) => {
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

export function UList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("my-6 ml-6 list-disc space-y-2", className)}>
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

interface OListProps {
  items: ReactNode[];
  className?: string;
  listClassName?: string;
}

export function OList({ items, className, listClassName }: OListProps) {
  return (
    <ol className={cn("my-6 ml-6 list-decimal space-y-2", className)}>
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
        <li key={i} className={listClassName}>
          {item}
        </li>
      ))}
    </ol>
  );
}
