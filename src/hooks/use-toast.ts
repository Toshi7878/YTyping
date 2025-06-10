import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  id?: string | number;
  title?: string;
  description?: string;
  status?: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
  position?: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { id, title, description, status = "info", duration } = options;
    
    const message = description || title || "";
    
    switch (status) {
      case "success":
        sonnerToast.success(message, { id, duration });
        break;
      case "error":
        sonnerToast.error(message, { id, duration });
        break;
      case "warning":
        sonnerToast.warning(message, { id, duration });
        break;
      default:
        sonnerToast(message, { id, duration });
    }
  };

  const close = (id?: string | number) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  };

  const closeAll = () => {
    sonnerToast.dismiss();
  };

  const update = (id: string | number, options: ToastOptions) => {
    close(id);
    toast({ ...options, id });
  };

  const isActive = (id: string | number) => {
    // Note: Sonner doesn't have a built-in isActive method
    // This is a workaround that may not be 100% accurate
    return false;
  };

  return {
    toast,
    close,
    closeAll,
    update,
    isActive,
  };
}

// For compatibility with Chakra UI's useToast hook
export const createStandaloneToast = () => {
  return {
    toast: (options: ToastOptions) => {
      const { id, title, description, status = "info", duration } = options;
      const message = description || title || "";
      
      switch (status) {
        case "success":
          sonnerToast.success(message, { id, duration });
          break;
        case "error":
          sonnerToast.error(message, { id, duration });
          break;
        case "warning":
          sonnerToast.warning(message, { id, duration });
          break;
        default:
          sonnerToast(message, { id, duration });
      }
    },
  };
};