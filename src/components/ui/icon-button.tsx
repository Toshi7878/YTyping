import { Bookmark, type LucideProps } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import { BiEdit } from "react-icons/bi";
import { FaRankingStar } from "react-icons/fa6";
import { IoMdInformationCircleOutline, IoMdSettings } from "react-icons/io";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "children" | "asChild">;

export const SettingIconButton = (props: IconButtonProps) => {
  return (
    <Button type="button" variant="unstyled" size="icon" {...props}>
      <IoMdSettings />
    </Button>
  );
};

export const InfoIconButton = (props: IconButtonProps) => {
  return (
    <Button type="button" variant="unstyled" size="icon" {...props}>
      <IoMdInformationCircleOutline />
    </Button>
  );
};

export const BookmarkListIconButton = ({
  fill,
  bookmarked = false,
  size = "default",
  ...props
}: IconButtonProps & {
  fill?: LucideProps["fill"];
  size?: "default" | "xs";
  bookmarked?: boolean;
}) => {
  const sizeVariants = {
    default: "",
    xs: "size-4",
  } as const;

  return (
    <Button type="button" variant="unstyled" size="icon" {...props}>
      <Bookmark
        strokeWidth={2.5}
        fill={bookmarked ? "currentColor" : "none"}
        className={cn(sizeVariants[size], bookmarked && "text-primary-light")}
      />
    </Button>
  );
};

export const EditIconLinkButton = <R extends string>({
  href,
  replace,
  ...props
}: IconButtonProps & { href: Route<R>; replace?: boolean }) => {
  return (
    <Button variant="unstyled" size="icon" asChild {...props}>
      <Link href={href} replace={replace}>
        <BiEdit />
      </Link>
    </Button>
  );
};

export const RankingStarIconButton = ({
  label,
  size = "default",
  fill = "none",
  className,
  ...props
}: IconButtonProps & { label?: string; size?: "default" | "xs"; fill?: LucideProps["fill"] }) => {
  const sizeVariants = {
    default: "",
    xs: "size-4",
  } as const;

  return (
    <Button type="button" variant="unstyled" size="icon" className={cn("gap-1", className)} {...props}>
      <FaRankingStar className={cn(sizeVariants[size])} />
      {label && <span className="select-none font-mono">{label}</span>}
    </Button>
  );
};
