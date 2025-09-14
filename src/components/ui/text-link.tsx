import { cn } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";

interface TextLinkProps {
  href: Route;
  children: React.ReactNode;
  className?: string;
}

const TextLink = ({ href, children, className, ...props }: TextLinkProps & React.ComponentProps<typeof Link>) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-primary-light hover:text-primary-light/80 flex flex-row items-center gap-1 transition-colors hover:underline",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default TextLink;
