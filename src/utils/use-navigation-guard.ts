import { useEffect } from "react";

export const useNavigationGuard = (isDirty: boolean) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isDirty && event.target instanceof Element && event.target.closest('a:not([target="_blank"])')) {
        if (!window.confirm("ページを離れても良いですか？")) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
        return;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);
};
