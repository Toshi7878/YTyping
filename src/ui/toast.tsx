"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Button } from "./button";

const toastManager = ToastPrimitive.createToastManager();

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  /** 同じidのトーストは新しく追加せず更新される */
  id?: string;
  description?: ReactNode;
  /** 表示時間(ms)。Infinity なら自動で閉じない */
  duration?: number;
}

const addToast = (type: ToastType) => (title: ReactNode, options?: ToastOptions) =>
  toastManager.add({
    id: options?.id,
    type,
    title,
    description: options?.description,
    // Base UI では timeout: 0 が「自動で閉じない」
    timeout: options?.duration === Infinity ? 0 : options?.duration,
  });

/**
 * sonner 互換の呼び出し口（`window.__ytyping.toast` でユーザースクリプトにも公開している）。
 * Base UI の ToastManager を薄くラップしている。
 */
const toast = {
  success: addToast("success"),
  error: addToast("error"),
  warning: addToast("warning"),
  info: addToast("info"),
  dismiss: (id?: string) => toastManager.close(id),
};

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom select-none rounded-2xl border bg-background text-base text-foreground leading-relaxed shadow-lg outline-none will-change-transform focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[type=success]:bg-success data-[type=success]:text-success-foreground",
        "data-[type=error]:bg-destructive data-[type=error]:text-destructive-foreground",
        "data-[type=warning]:bg-warning data-[type=warning]:text-warning-foreground",
        "data-[type=info]:bg-info data-[type=info]:text-info-foreground",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) min-h-16 [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("font-medium", className)} {...props} />;
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
}

function ToastClose({ className, children, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="閉じる"
      render={<Button variant="ghost" size="icon" />}
      className={cn("size-7 shrink-0 text-current opacity-70 hover:opacity-100", className)}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-4" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  const className = "size-5";

  switch (type) {
    case "success":
      return <CircleCheckIcon aria-hidden="true" className={className} />;
    case "info":
      return <InfoIcon aria-hidden="true" className={className} />;
    case "warning":
      return <TriangleAlertIcon aria-hidden="true" className={className} />;
    case "error":
      return <OctagonXIcon aria-hidden="true" className={className} />;
    case "loading":
      return <Loader2Icon aria-hidden="true" className={cn(className, "animate-spin")} />;
    default:
      return null;
  }
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <span data-slot="toast-icon" className="shrink-0">
          <ToastIcon type={toastItem.type} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster(props: Omit<ToastPrimitive.Provider.Props, "toastManager">) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} {...props}>
      <ToastPrimitive.Portal data-slot="toast-portal">
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

export { Toaster, toast };
