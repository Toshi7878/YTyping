"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog/alert-dialog";
import { createContext, useCallback, useContext, useReducer, useRef } from "react";
import { Button } from "../button";
import { Input } from "../input/input";

export const AlertDialogContext = createContext<
  <T extends AlertAction>(params: T) => Promise<T["type"] extends "alert" | "confirm" ? boolean : null | string>
>(() => null!);

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

const defaultCancelButtonText: string = "Cancel";
const defaultActionButtonText: string = "Okay";

export type AlertAction =
  | {
      type: "alert";
      title: string;
      body?: string;
      cancelButton?: string;
      cancelButtonVariant?: ButtonVariant;
    }
  | {
      type: "confirm";
      title: string;
      body?: string;
      cancelButton?: string;
      actionButton?: string;
      cancelButtonVariant?: ButtonVariant;
      actionButtonVariant?: ButtonVariant;
    }
  | {
      type: "prompt";
      title: string;
      body?: string;
      cancelButton?: string;
      actionButton?: string;
      defaultValue?: string;
      cancelButtonVariant?: ButtonVariant;
      actionButtonVariant?: ButtonVariant;
      inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    }
  | { type: "close" };

interface AlertDialogState {
  open: boolean;
  title: string;
  body: string;
  type: "alert" | "confirm" | "prompt";
  cancelButton: string;
  actionButton: string;
  cancelButtonVariant: ButtonVariant;
  actionButtonVariant: ButtonVariant;
  defaultValue?: string;
  inputProps?: React.PropsWithoutRef<
    Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "size">
  >;
}

export function alertDialogReducer(state: AlertDialogState, action: AlertAction): AlertDialogState {
  switch (action.type) {
    case "close":
      return { ...state, open: false };
    case "alert":
    case "confirm":
    case "prompt":
      return {
        ...state,
        open: true,
        ...action,
        cancelButton:
          action.cancelButton || (action.type === "alert" ? defaultActionButtonText : defaultCancelButtonText),
        actionButton: ("actionButton" in action && action.actionButton) || defaultActionButtonText,
        cancelButtonVariant: action.cancelButtonVariant || "default",
        actionButtonVariant: ("actionButtonVariant" in action && action.actionButtonVariant) || "default",
      };
    default:
      return state;
  }
}

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alertDialogReducer, {
    open: false,
    title: "",
    body: "",
    type: "alert",
    cancelButton: defaultCancelButtonText,
    actionButton: defaultActionButtonText,
    cancelButtonVariant: "default",
    actionButtonVariant: "default",
  });

  const resolveRef = useRef<((tf: any) => void) | undefined>(undefined);

  function close() {
    dispatch({ type: "close" });
    resolveRef.current?.(false);
  }

  function confirm(value?: string) {
    dispatch({ type: "close" });
    resolveRef.current?.(value ?? true);
  }

  const dialog = useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params);

    return new Promise<T["type"] extends "alert" | "confirm" ? boolean : null | string>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  return (
    <AlertDialogContext.Provider value={dialog}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) close();
          return;
        }}
      >
        <AlertDialogContent asChild>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirm(event.currentTarget.prompt?.value);
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.body ? <AlertDialogDescription>{state.body}</AlertDialogDescription> : null}
            </AlertDialogHeader>
            {state.type === "prompt" && <Input name="prompt" defaultValue={state.defaultValue} {...state.inputProps} />}
            <AlertDialogFooter>
              <Button type="button" onClick={close} variant={state.cancelButtonVariant}>
                {state.cancelButton}
              </Button>
              {state.type === "alert" ? null : (
                <Button type="submit" variant={state.actionButtonVariant}>
                  {state.actionButton}
                </Button>
              )}
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}

type Params<T extends "alert" | "confirm" | "prompt"> = Omit<Extract<AlertAction, { type: T }>, "type"> | string;

export function useConfirm() {
  const dialog = useContext(AlertDialogContext);

  return useCallback(
    (params: Params<"confirm">) => {
      return dialog({
        ...(typeof params === "string" ? { title: params } : params),
        type: "confirm",
      });
    },
    [dialog],
  );
}

export function usePrompt() {
  const dialog = useContext(AlertDialogContext);

  return (params: Params<"prompt">) =>
    dialog({
      ...(typeof params === "string" ? { title: params } : params),
      type: "prompt",
    });
}

export function useAlert() {
  const dialog = useContext(AlertDialogContext);
  return (params: Params<"alert">) =>
    dialog({
      ...(typeof params === "string" ? { title: params } : params),
      type: "alert",
    });
}
