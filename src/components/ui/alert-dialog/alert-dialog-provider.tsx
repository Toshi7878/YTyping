"use client";

import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

export interface ConfirmOptions {
  title: string;
  body?: string;
  cancelButton?: string;
  actionButton?: string;
  cancelButtonVariant?: ButtonVariant;
  actionButtonVariant?: ButtonVariant;
}

interface AlertDialogState {
  open: boolean;
  title: string;
  body?: string;
  cancelButton: string;
  actionButton: string;
  cancelButtonVariant: ButtonVariant;
  actionButtonVariant: ButtonVariant;
}

const initialState: AlertDialogState = {
  open: false,
  title: "",
  body: undefined,
  cancelButton: "Cancel",
  actionButton: "Okay",
  cancelButtonVariant: "default",
  actionButtonVariant: "default",
};

type ConfirmFn = (params: ConfirmOptions | string) => Promise<boolean>;

const AlertDialogContext = createContext<ConfirmFn>(() => Promise.resolve(false));

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertDialogState>(initialState);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const close = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(result);
  }, []);

  const confirm: ConfirmFn = useCallback((params) => {
    const options = typeof params === "string" ? { title: params } : params;

    setState({
      open: true,
      title: options.title,
      body: options.body,
      cancelButton: options.cancelButton ?? "Cancel",
      actionButton: options.actionButton ?? "Okay",
      cancelButtonVariant: options.cancelButtonVariant ?? "default",
      actionButtonVariant: options.actionButtonVariant ?? "default",
    });

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  return (
    <AlertDialogContext.Provider value={confirm}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            {state.body && <AlertDialogDescription>{state.body}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" onClick={() => close(false)} variant={state.cancelButtonVariant}>
              {state.cancelButton}
            </Button>
            <Button type="button" onClick={() => close(true)} variant={state.actionButtonVariant}>
              {state.actionButton}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}

export function useConfirm() {
  return useContext(AlertDialogContext);
}
