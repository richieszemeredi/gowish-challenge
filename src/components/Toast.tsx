import { useEffect, useState } from "react";
import { StatusMessage } from "./StatusMessage";

export function Toast({
  children,
  ms = 3000,
}: {
  children: React.ReactNode;
  ms?: number;
}): React.JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false);
    }, ms);
    return () => {
      clearTimeout(id);
    };
  }, [ms]);

  return (
    <StatusMessage
      visible={visible}
      className="inline-block rounded-full border border-white/70 bg-card px-4 py-2 font-medium shadow-soft"
    >
      {children}
    </StatusMessage>
  );
}
