import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "./Button";
import { StatusMessage } from "./StatusMessage";

const FADE_MS = 500;

export function Toast({
  children,
  ms = 3000,
  retry,
  onExpire,
}: {
  children: React.ReactNode;
  ms?: number;
  retry?: () => void;
  onExpire?: () => void;
}): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  const expire = useRef(onExpire);

  useEffect(() => {
    expire.current = onExpire;
  });

  useEffect(() => {
    const hide = setTimeout(() => {
      setVisible(false);
    }, ms);
    // Remove once the fade-out has finished.
    const remove = setTimeout(() => {
      expire.current?.();
    }, ms + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [ms]);

  return (
    <StatusMessage
      visible={visible}
      className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-white/70 bg-card px-4 py-2 font-medium shadow-soft"
    >
      {children}
      {retry ? (
        <Button icon={RotateCcw} onClick={retry}>
          Retry
        </Button>
      ) : null}
    </StatusMessage>
  );
}
