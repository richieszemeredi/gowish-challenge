import { useEffect, useState } from "react";
import type { ButtonStatus } from "@/components/ButtonIcon";

// Shows success/error for `ms`, then falls back to idle.
export const useTransientStatus = (
  status: ButtonStatus,
  ms = 2000,
): ButtonStatus => {
  const [expired, setExpired] = useState<ButtonStatus | null>(null);

  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const id = setTimeout(() => {
      setExpired(status);
    }, ms);
    return () => {
      clearTimeout(id);
      setExpired(null);
    };
  }, [status, ms]);

  return expired === status ? "idle" : status;
};
