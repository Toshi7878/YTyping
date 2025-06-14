"use client";

import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomToastProps {
  type: "success" | "error" | "warning";
  title: string;
  message?: string;
  size?: "sm" | "md";
}

export const useCustomToast = () => {
  return ({ type, title, message }: CustomToastProps) => {
    const description = message || undefined;

    switch (type) {
      case "success":
        toast.success(title, {
          description,
          icon: <CheckCircle className="h-4 w-4" />,
        });
        break;
      case "error":
        toast.error(title, {
          description,
          icon: <AlertCircle className="h-4 w-4" />,
        });
        break;
      case "warning":
        toast.warning(title, {
          description,
          icon: <AlertTriangle className="h-4 w-4" />,
        });
        break;
      default:
        toast(title, { description });
    }
  };
};
