"use client";

import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

export const LinkIndicator = ({ href }: { href: string }) => {
  const { pending } = useLinkStatus();
  const currentPath = usePathname();

  const shouldShowIndicator = pending && href !== currentPath;

  return shouldShowIndicator ? <span className="bg-primary-light indicator fixed top-0 left-0 z-50 h-[3px]" /> : null;
};
