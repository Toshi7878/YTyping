"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALE_LABELS, LOCALES } from "@/i18n/config";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";

export const LanguageDropdownSubmenu = () => {
  const t = useTranslations("header.language");
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (locale: string) => {
    if (locale === currentLocale) return;

    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t("label")}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-40">
          {LOCALES.map((locale) => (
            <DropdownMenuItem
              key={locale}
              className={currentLocale === locale ? "font-bold" : undefined}
              closeOnClick={false}
              disabled={isPending}
              onClick={() => handleLocaleChange(locale)}
            >
              <span>{LOCALE_LABELS[locale]}</span>
              {currentLocale === locale ? <Check className="ml-auto size-5 hover:text-primary-foreground" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
