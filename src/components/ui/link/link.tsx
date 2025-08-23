"use client";
import { useCanUploadState } from "@/app/edit/_lib/atoms/stateAtoms";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useHasMapUploadPermission";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LinkProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Link({ children, ...props }: LinkProps & NextLinkProps & React.ComponentProps<"a">) {
  const pathname = usePathname();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname.includes("/user/register")) {
      e.preventDefault();
      return;
    }

    if (pathname.includes("/edit") && canUpload && hasUploadPermission) {
      const confirmUpload = window.confirm("このページを離れると、行った変更が保存されない可能性があります。");
      if (!confirmUpload) {
        e.preventDefault();
        return;
      }
    }
  };

  return (
    <NextLink {...props} onClick={handleClick}>
      {children}
    </NextLink>
  );
}
