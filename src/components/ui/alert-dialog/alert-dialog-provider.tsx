"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { buttonVariants } from "../button";
import { Button } from "../button";

export interface ConfirmOptions {
  title: string;
  description?: string;
  actionButton: string;
  actionButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
}

interface AlertDialogState {
  open: boolean;
  title: string;
  description?: string;
  actionButton: string;
  actionButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
}

const initialState: AlertDialogState = {
  open: false,
  title: "",
  description: undefined,
  actionButton: "",
  actionButtonVariant: "warning",
};

type ConfirmFn = (params: ConfirmOptions) => Promise<boolean>;

const AlertDialogContext = createContext<ConfirmFn>(() => Promise.resolve(false));

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertDialogState>(initialState);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const close = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(result);
  }, []);

  const confirm: ConfirmFn = useCallback(({ title, description, actionButton }) => {
    setState({ open: true, title, description, actionButton });

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
            {state.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" onClick={() => close(false)} variant="outline">
              キャンセル
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
