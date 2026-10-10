import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/ui/button";
import { cn } from "@/utils/cn";

interface ImportantNoticeLinkButtonProps {
  linkUrl: string | null;
  linkLabel: string | null;
  className?: string;
}

const DEFAULT_LINK_LABEL = "詳細はこちら";

/** お知らせに設定されたリンクボタン。サイト内パスは同じタブ、外部URLは別タブで開く */
export const ImportantNoticeLinkButton = ({ linkUrl, linkLabel, className }: ImportantNoticeLinkButtonProps) => {
  if (!linkUrl) return null;

  const label = linkLabel || DEFAULT_LINK_LABEL;
  const classes = cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit", className);

  if (linkUrl.startsWith("/")) {
    return (
      <Link href={linkUrl as Route} className={classes} prefetch={false}>
        {label}
      </Link>
    );
  }

  return (
    <a href={linkUrl} className={classes} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
};
