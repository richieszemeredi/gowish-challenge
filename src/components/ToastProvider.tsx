import { useCallback, useRef, useState } from "react";
import { ToastContext } from "@/hooks/useToast";
import { Toast } from "./Toast";

type Entry = { id: number; message: string; retry?: () => void };

const MAX_VISIBLE = 5;

// One shared live region, so every toast is announced from the same place.
// Toasts stack (newest last) and each one leaves on its own timer.
export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((message: string, retry?: () => void): void => {
    const id = nextId.current++;
    setEntries((prev) =>
      [...prev, { id, message, ...(retry && { retry }) }].slice(-MAX_VISIBLE),
    );
  }, []);

  const remove = useCallback((id: number): void => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <ToastContext value={notify}>
      {children}
      <div
        role="status"
        className="pointer-events-none fixed right-4 bottom-20 z-10 sm:right-6 sm:bottom-24"
      >
        <div className="flex flex-col items-end gap-2">
          {entries.map((e) => (
            <Toast
              key={e.id}
              ms={e.retry ? 8000 : 3000}
              onExpire={() => {
                remove(e.id);
              }}
              {...(e.retry && { retry: e.retry })}
            >
              {e.message}
            </Toast>
          ))}
        </div>
      </div>
    </ToastContext>
  );
}
