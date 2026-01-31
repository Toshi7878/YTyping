"use client";

import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ButtonVariant = ComponentProps<typeof AlertDialogAction>["variant"];

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  actionButton: string;
}

// --- Store ---

interface State {
  open: boolean;
  options?: ConfirmDialogOptions;
  variant?: ButtonVariant;
  resolve?: (value: boolean) => void;
}

let state: State = { open: false };
let listener: (() => void) | undefined;

const setState = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listener?.();
};

// --- Public API ---

export const confirmDialog = {
  warning: (options: ConfirmDialogOptions) => show(options, "warning"),
  destructive: (options: ConfirmDialogOptions) => show(options, "destructive"),
} as const;

const show = (options: ConfirmDialogOptions, variant: ButtonVariant = "warning") =>
  new Promise<boolean>((resolve) => {
    setState({ open: true, options, variant, resolve });
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
        listener = undefined;
      };
    },
    () => state,
    () => state,
  );

  const close = (result: boolean) => {
    resolve?.(result);
    setState({ open: false, options: undefined, resolve: undefined });
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
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant={variant}>{options.actionButton}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
