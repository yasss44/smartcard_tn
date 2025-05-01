import React, { createContext, useContext, useState } from "react";
import { 
  Toast, 
  ToastAction, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from "./Toast";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "success" | "destructive";
  duration?: number;
};

type ToastContextType = {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);

    // Auto-remove toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, title, description, action, variant, duration }) => (
          <Toast key={id} variant={variant} duration={duration}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {action && (
              <ToastAction altText={action.label} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )}
            <ToastClose onClick={() => removeToast(id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};
