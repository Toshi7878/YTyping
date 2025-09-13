// src/components/ThemeSheet.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { THEME_LIST } from "@/styles/const";
import { useTheme } from "next-themes";
import { useState } from "react";

export function ThemeSheet() {
  const [open, setOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Theme
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="space-y-4">
        <SheetHeader>
          <SheetTitle>Theme</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-center gap-2">
          {THEME_LIST.map((theme) => (
            <Button
              key={theme}
              type="button"
              variant={resolvedTheme === theme ? "default" : "outline"}
              onClick={() => {
                setTheme(theme);
              }}
            >
              {theme}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
