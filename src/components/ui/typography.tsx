import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function H1({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance" {...props}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>{children}</h3>;
}

export function H4({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props}>
      {children}
    </h4>
  );
}

export function H5({ children, className }: { children: ReactNode; className?: string }) {
  return <h5 className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)}>{children}</h5>;
}

export function H6({ children, className }: { children: ReactNode; className?: string }) {
  return <h6 className={cn("scroll-m-20 text-base font-semibold tracking-tight", className)}>{children}</h6>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function Small({ children, className }: { children: ReactNode; className?: string }) {
  return <small className={cn("text-sm leading-none font-medium", className)}>{children}</small>;
}
