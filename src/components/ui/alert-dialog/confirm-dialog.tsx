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
  options: ConfirmDialogOptions;
  variant: ComponentProps<typeof AlertDialogAction>["variant"];
  resolve: (confirmed: boolean) => void;
}

const store: { state: State | undefined; listener?: () => void } = { state: undefined };

const setState = (patch: State | undefined) => {
  store.state = patch;
  // useSyncExternalStoreに変更を通知しConfirmDialog再レンダリング
  store.listener?.();
};

// --- Public API ---

const show = (options: ConfirmDialogOptions, variant: State["variant"] = "warning") =>
  new Promise<boolean>((resolve) => {
    setState({ options, variant, resolve });
  });

export const confirmDialog = {
  warning: (options: ConfirmDialogOptions) => show(options, "warning"),
  destructive: (options: ConfirmDialogOptions) => show(options, "destructive"),
};

// --- Component ---

export function ConfirmDialog() {
  const state = useSyncExternalStore(
    (fn) => {
      store.listener = fn;
      return () => {
        store.listener = undefined;
      };
    },
    () => store.state, // getSnapshot,
    () => store.state, // getServerSnapshot,
  );

  if (!state) return null;
  const { options, variant, resolve } = state;

  const close = (confirmed: boolean) => {
    resolve(confirmed);
    setState(undefined);
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && close(false)}>
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
