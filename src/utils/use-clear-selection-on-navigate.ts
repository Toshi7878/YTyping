import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const useClearSelectionOnNavigate = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.getSelection) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  }, [pathname]);
};
