"use client";

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
import { Button } from "../button";

export interface ConfirmOptions {
  title: string;
  body?: string;
  actionButton: string;
}

interface AlertDialogState {
  open: boolean;
  title: string;
  body?: string;
  actionButton: string;
}

const initialState: AlertDialogState = {
  open: false,
  title: "",
  body: undefined,
  actionButton: "",
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

  const confirm: ConfirmFn = useCallback(({ title, body, actionButton }) => {
    setState({ open: true, title, body, actionButton });

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
            <Button type="button" onClick={() => close(false)} variant="outline">
              キャンセル
            </Button>
            <Button type="button" onClick={() => close(true)} variant="warning">
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
