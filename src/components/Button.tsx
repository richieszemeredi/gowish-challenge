import type { LucideIcon } from "lucide-react";
import { ButtonIcon, type ButtonStatus } from "./ButtonIcon";

type Props = {
  type?: "button" | "submit";
  disabled?: boolean;
  status?: ButtonStatus;
  icon: LucideIcon;
  wide?: boolean;
  label?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export function Button({
  type = "button",
  disabled = false,
  status = "idle",
  icon,
  wide = false,
  label,
  onClick,
  children,
}: Props): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={`${wide ? "flex w-full" : "inline-flex"} items-center justify-center gap-2 rounded-full bg-mint-soft px-4 py-1.5 font-medium transition-colors duration-200 enabled:cursor-pointer enabled:hover:bg-mint disabled:opacity-60`}
    >
      <ButtonIcon key={status} status={status} idle={icon} />
      {children}
    </button>
  );
}
