"use client";

import type { VariantProps } from "class-variance-authority";
import { useSyncExternalStore } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, type buttonVariants } from "../button";

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  actionButton: string;
}

// --- Store ---

const store: {
  open: boolean;
  options?: ConfirmDialogOptions;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  resolve?: (value: boolean) => void;
  listener?: () => void;
  set: (patch: Partial<typeof store>) => void;
} = {
  open: false,
  set(patch) {
    Object.assign(this, patch);
    this.listener?.();
  },
};

// --- Public API ---

export const confirmDialog = Object.assign((options: ConfirmDialogOptions) => showDialog(options), {
  warning: (options: ConfirmDialogOptions) => showDialog(options, "warning"),
  destructive: (options: ConfirmDialogOptions) => showDialog(options, "destructive"),
});

const showDialog = (options: ConfirmDialogOptions, variant: (typeof store)["variant"] = "warning") =>
  new Promise<boolean>((resolve) => {
    store.set({ open: true, options, variant, resolve });
  });

// --- Component ---

export function ConfirmDialog() {
  const {
    open: isOpen,
    options,
    variant,
    resolve,
  } = useSyncExternalStore(
    (fn) => {
      store.listener = fn;
      return () => {
        store.listener = undefined;
      };
    },
    () => store,
    () => store,
  );

  const close = (result: boolean) => {
    resolve?.(result);
    store.set({ open: false, options: undefined, resolve: undefined });
  };

  if (!options) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            キャンセル
          </Button>
          <Button type="button" variant={variant} onClick={() => close(true)}>
            {options.actionButton}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
