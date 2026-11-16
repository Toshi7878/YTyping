import { useTranslations } from "next-intl";
import { useEffect } from "react";

export const useNavigationGuard = (isDirty: boolean) => {
  const t = useTranslations("common");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isDirty && event.target instanceof Element && event.target.closest('a:not([target="_blank"])')) {
        if (!window.confirm(t("confirmLeave"))) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleClick, true);
    };
  }, [isDirty, t]);
};
