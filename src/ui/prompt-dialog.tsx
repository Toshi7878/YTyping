"use client";

import { useState, useSyncExternalStore } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input/input";
import { Textarea } from "@/ui/textarea";

interface PromptDialogOptions {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel: string;
  maxLength?: number;
  /** 1行の入力欄(Input)にする。デフォルトは複数行(Textarea) */
  singleLine?: boolean;
}

// --- Store ---

interface State {
  options: PromptDialogOptions;
  resolvePromise: (value: string | null) => void;
}

const store: { state?: State; onStoreChange?: () => void } = {};

const setState = (nextState: State | undefined) => {
  store.state = nextState;
  store.onStoreChange?.();
};

// --- Public API ---

/** 入力された文字列を返す。キャンセル時は null。 */
export const promptDialog = (options: PromptDialogOptions) =>
  new Promise<string | null>((resolvePromise) => {
    setState({ options, resolvePromise });
  });

// --- Component ---

export const PromptDialogHost = () => {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      store.onStoreChange = onStoreChange;
      return () => {
        store.onStoreChange = undefined;
      };
    },
    () => store.state,
    () => store.state,
  );

  if (!state) return null;
  return <PromptDialogContent state={state} />;
};

const PromptDialogContent = ({ state: { options, resolvePromise } }: { state: State }) => {
  const [value, setValue] = useState("");

  const close = (result: string | null) => {
    resolvePromise(result);
    setState(undefined);
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && close(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {options.singleLine ? (
          <Input
            autoFocus
            value={value}
            placeholder={options.placeholder}
            maxLength={options.maxLength}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && value.trim()) close(value.trim());
            }}
          />
        ) : (
          <Textarea
            autoFocus
            value={value}
            placeholder={options.placeholder}
            maxLength={options.maxLength}
            className="min-h-30"
            onChange={(e) => setValue(e.target.value)}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(null)}>キャンセル</AlertDialogCancel>
          <Button variant="destructive" disabled={!value.trim()} onClick={() => close(value.trim())}>
            {options.confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
