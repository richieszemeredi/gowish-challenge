import type { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  error?: string | undefined;
  inputMode?: "decimal" | "url";
  type?: string;
  register: UseFormRegisterReturn;
};

export function TextField({
  label,
  error,
  inputMode,
  type = "text",
  register,
}: Props): React.JSX.Element {
  const hasError = error !== undefined;
  const errorId = `${register.name}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={register.name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={register.name}
        type={type}
        inputMode={inputMode}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={`rounded-full border bg-card px-4 py-2 ${hasError ? "border-2 border-coral" : "border-line"}`}
        {...register}
      />
      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-full bg-coral-soft px-3 py-1 text-sm font-medium text-ink motion-safe:transition motion-safe:duration-200 motion-safe:starting:-translate-y-1 motion-safe:starting:scale-95 motion-safe:starting:opacity-0"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
