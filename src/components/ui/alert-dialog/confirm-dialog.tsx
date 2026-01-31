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

let state: {
  open: boolean;
  options?: ConfirmDialogOptions;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  resolve?: (value: boolean) => void;
} = { open: false };

let listener: (() => void) | null = null;

// --- Public API ---

const open = (options: ConfirmDialogOptions, variant: (typeof state)["variant"] = "warning") =>
  new Promise<boolean>((resolve) => {
    state = { open: true, options, variant, resolve };
    listener?.();
  });

export const confirmDialog = Object.assign((options: ConfirmDialogOptions) => open(options), {
  warning: (options: ConfirmDialogOptions) => open(options, "warning"),
  destructive: (options: ConfirmDialogOptions) => open(options, "destructive"),
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
      listener = fn;
      return () => {
        listener = null;
      };
    },
    () => state,
    () => state,
  );

  const close = (result: boolean) => {
    resolve?.(result);
    state = { open: false };
    listener?.();
  };

  if (!options) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(o) => !o && close(false)}>
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
