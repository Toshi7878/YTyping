import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ClearSelectionOnNavigate() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname変更時のみ発火させたいため
  useEffect(() => {
    window.getSelection()?.removeAllRanges();
  }, [pathname]);

  return null;
}
