import { Bookmark, type LucideProps } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import { BiEdit } from "react-icons/bi";
import { IoMdInformationCircleOutline, IoMdSettings } from "react-icons/io";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "children" | "asChild">;

export const SettingIconButton = (props: IconButtonProps) => {
  return (
    <Button variant="unstyled" size="icon" {...props}>
      <IoMdSettings className="size-24 md:size-9" />
    </Button>
  );
};

export const InfoIconButton = (props: IconButtonProps) => {
  return (
    <Button variant="unstyled" size="icon" {...props}>
      <IoMdInformationCircleOutline className="size-24 md:size-9" />
    </Button>
  );
};

export const BookmarkListIconButton = ({
  fill,
  iconClassName,
  ...props
}: IconButtonProps & { fill?: LucideProps["fill"]; iconClassName?: string }) => {
  return (
    <Button variant="unstyled" size="icon" {...props}>
      <Bookmark strokeWidth={2.5} fill={fill} className={cn("size-24 md:size-9", iconClassName)} />
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
        <BiEdit className="size-24 md:size-9" />
      </Link>
    </Button>
  );
};
