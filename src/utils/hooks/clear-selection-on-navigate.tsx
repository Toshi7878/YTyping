"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ClearSelectionOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.getSelection()?.removeAllRanges();
  }, [pathname]);

  return null;
}
