import { Check, LoaderCircle, Plus, X, type LucideIcon } from "lucide-react";

export type ButtonStatus = "idle" | "loading" | "success" | "error";

const ICONS: Record<ButtonStatus, LucideIcon> = {
  idle: Plus,
  loading: LoaderCircle,
  success: Check,
  error: X,
};

export function ButtonIcon({
  status,
}: {
  status: ButtonStatus;
}): React.JSX.Element {
  const Icon = ICONS[status];
  return (
    <Icon
      aria-hidden="true"
      className={`size-4 motion-safe:transition motion-safe:duration-200 motion-safe:starting:scale-50 motion-safe:starting:opacity-0 ${status === "loading" ? "motion-safe:animate-spin" : ""}`}
    />
  );
}
