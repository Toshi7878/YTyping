import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva("bg-card text-card-foreground flex flex-col gap-6 rounded-sm py-6 shadow-sm", {
  variants: {
    variant: {
      default: "custom-card-shadow",
      map: "py-0 map-card-hover transition-shadow duration-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Card({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

const cardContentVariants = cva("px-6", {
  variants: {
    variant: {
      default: "",
      map: "flex items-start rounded-md p-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function CardContent({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardContentVariants>) {
  return <div data-slot="card-content" className={cn(cardContentVariants({ variant }), className)} {...props} />;
}

const CardContentWithThumbnail = ({
  children,
  src,
  className,
  ...props
}: { src: string | undefined } & React.ComponentProps<typeof CardContent>) => {
  return (
    <div
      data-slot="card-content"
      className={cn("rounded-sm px-4 py-4", className)}
      style={{
        background: src
          ? `var(--card-with-thumbnail), url(${src}) center center / cover no-repeat`
          : "var(--card-with-thumbnail)",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />
  );
}

interface CardWithContentProps extends Omit<React.ComponentProps<"div">, "className"> {
  variant?: VariantProps<typeof cardVariants>["variant"];
  children: React.ReactNode;
  className?: {
    card?: string;
    cardContent?: string;
  };
}

function CardWithContent({ className, variant, children, ...props }: CardWithContentProps) {
  return (
    <div data-slot="card" className={cn(cardVariants({ variant }), className?.card)} {...props}>
      <div data-slot="card-content" className={cn(cardContentVariants({ variant }), className?.cardContent)}>
        {children}
      </div>
    </div>
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardContentWithThumbnail,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardWithContent,
};
