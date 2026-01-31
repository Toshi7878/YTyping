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

// --- Types ---

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  actionButton: string;
  actionButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
}

interface DialogState {
  open: boolean;
  options: ConfirmDialogOptions | null;
  resolve: ((value: boolean) => void) | null;
}

// --- Store (外部ストア) ---

const initialState: DialogState = {
  open: false,
  options: null,
  resolve: null,
};

let state: DialogState = initialState;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function setState(newState: DialogState) {
  state = newState;
  for (const listener of listeners) {
    listener();
  }
}

// --- Public API ---

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    setState({
      open: true,
      options,
      resolve,
    });
  });
}

// --- Component ---

export function ConfirmDialog() {
  const { open, options, resolve } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const handleClose = (result: boolean) => {
    resolve?.(result);
    setState(initialState);
  };

  if (!options) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" onClick={() => handleClose(false)} variant="outline">
            キャンセル
          </Button>
          <Button type="button" onClick={() => handleClose(true)} variant={options.actionButtonVariant ?? "warning"}>
            {options.actionButton}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
