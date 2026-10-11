import { ButtonIcon, type ButtonStatus } from "./ButtonIcon";

type Props = {
  type?: "button" | "submit";
  disabled?: boolean;
  status?: ButtonStatus;
  children: React.ReactNode;
};

export function Button({
  type = "button",
  disabled = false,
  status = "idle",
  children,
}: Props): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-1.5 font-medium transition-colors duration-200 enabled:cursor-pointer enabled:hover:bg-mint disabled:opacity-60"
    >
      <ButtonIcon key={status} status={status} />
      {children}
    </button>
  );
}
