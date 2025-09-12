"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast:
            "!text-base group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:text-base group-[.toaster]:leading-relaxed",
          description: "group-[.toast]:text-sm group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/90",
          success: "!bg-success !text-success-foreground [&_[data-description]]:!text-success-foreground",
          error: "!bg-destructive !text-destructive-foreground [&_[data-description]]:!text-destructive-foreground",
          warning: "!bg-warning !text-warning-foreground [&_[data-description]]:!text-warning-foreground",
          info: "!bg-info !text-info-foreground [&_[data-description]]:!text-info-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
