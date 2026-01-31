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
  resolvePromise: (confirmed: boolean) => void;
}

const store: { state: State | undefined; onStoreChange?: () => void } = { state: undefined };

const setState = (nextState: State | undefined) => {
  store.state = nextState;
  // useSyncExternalStoreに変更を通知しConfirmer再レンダリング
  store.onStoreChange?.();
};

// --- Public API ---

const show = (options: ConfirmDialogOptions, variant: State["variant"] = "warning") =>
  new Promise<boolean>((resolvePromise) => {
    setState({ options, variant, resolvePromise });
  });

export const confirmDialog = {
  warning: (options: ConfirmDialogOptions) => show(options, "warning"),
  danger: (options: ConfirmDialogOptions) => show(options, "destructive"),
};

// --- Component ---

export function Confirmer() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      store.onStoreChange = onStoreChange;
      return () => {
        store.onStoreChange = undefined;
      };
    },
    () => store.state, // getSnapshot,
    () => store.state, // getServerSnapshot,
  );

  if (!state) return null;
  const { options, variant, resolvePromise } = state;

  const close = (confirmed: boolean) => {
    resolvePromise(confirmed);
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
