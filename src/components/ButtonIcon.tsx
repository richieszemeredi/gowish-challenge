import { Check, LoaderCircle, X, type LucideIcon } from "lucide-react";

export type ButtonStatus = "idle" | "loading" | "success" | "error";

const ICONS: Record<Exclude<ButtonStatus, "idle">, LucideIcon> = {
  loading: LoaderCircle,
  success: Check,
  error: X,
};

export function ButtonIcon({
  status,
  idle,
}: {
  status: ButtonStatus;
  idle: LucideIcon;
}): React.JSX.Element {
  const Icon = status === "idle" ? idle : ICONS[status];
  return (
    <Icon
      aria-hidden="true"
      className={`size-4 ${status === "loading" ? "motion-safe:animate-spin" : ""}`}
    />
  );
}
