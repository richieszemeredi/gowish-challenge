import { createContext, use } from "react";

export type Notify = (message: string, retry?: () => void) => void;

export const ToastContext = createContext<Notify>(() => undefined);

export const useToast = (): Notify => use(ToastContext);
