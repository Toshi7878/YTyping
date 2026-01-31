"use client";

import { type ComponentProps, useSyncExternalStore } from "react";
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

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  actionButton: string;
}

// --- Store ---

interface State {
  open: boolean;
  options?: ConfirmDialogOptions;
  variant?: ComponentProps<typeof AlertDialogAction>["variant"];
  resolve?: (value: boolean) => void;
}

const store: { state: State; listener: (() => void) | undefined } = {
  state: { open: false },
  listener: undefined,
};

const setState = (patch: State) => {
  store.state = { ...store.state, ...patch };

  // useSyncExternalStoreに変更を通知しConfirmDialog再レンダリング
  store.listener?.();
};

// --- Public API ---

const show = (options: ConfirmDialogOptions, variant: State["variant"] = "warning") =>
  new Promise<boolean>((resolve) => {
    setState({ open: true, options, variant, resolve });
  });

export const confirmDialog = {
  warning: (options: ConfirmDialogOptions) => show(options, "warning"),
  destructive: (options: ConfirmDialogOptions) => show(options, "destructive"),
} as const;

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
    () => store.state, // getSnapshot,
    () => store.state, // getServerSnapshot,
  );
  if (!isOpen || !options || !resolve) return null;

  const close = (result: boolean) => {
    resolve(result);
    setState({ open: false, options: undefined, resolve: undefined });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant={variant} onClick={() => close(true)}>
            {options.actionButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
