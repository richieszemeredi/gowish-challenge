import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddItem } from "@/hooks/useAddItem";
import { useTransientStatus } from "@/hooks/useTransientStatus";
import {
  newWishItemSchema,
  type NewWishItem,
  type NewWishItemInput,
} from "@/schemas/newWishItem";
import { Button } from "./Button";
import { StatusMessage } from "./StatusMessage";
import { TextField } from "./TextField";

export function AddItemForm({
  onAdded,
}: {
  onAdded: () => void;
}): React.JSX.Element {
  const { mutate, isPending, isError } = useAddItem();
  const status = useTransientStatus(
    isPending ? "loading" : isError ? "error" : "idle",
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewWishItemInput, unknown, NewWishItem>({
    resolver: zodResolver(newWishItemSchema),
    defaultValues: { title: "", price: "", url: "" },
  });

  const submit = handleSubmit((values) => {
    mutate(
      {
        title: values.title,
        priceMinor: values.price,
        ...(values.url !== undefined && { url: values.url }),
      },
      {
        onSuccess: () => {
          reset();
          onAdded();
        },
      },
    );
  });

  return (
    <form
      onSubmit={(e) => void submit(e)}
      noValidate
      className="flex flex-col gap-4"
    >
      <TextField
        label="Title"
        required
        register={register("title")}
        error={errors.title?.message}
      />
      <TextField
        label="Price (DKK)"
        required
        inputMode="decimal"
        register={register("price")}
        error={errors.price?.message}
      />
      <TextField
        label="Link (optional)"
        type="url"
        inputMode="url"
        register={register("url")}
        error={errors.url?.message}
      />
      <p className="text-sm text-ink-soft">
        <span aria-hidden="true">* </span>Required
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p role="status" className="min-h-6">
          {isError ? (
            <StatusMessage>Couldn’t add the wish.</StatusMessage>
          ) : null}
        </p>
        <Button type="submit" disabled={isPending} status={status}>
          {isPending ? "Adding…" : isError ? "Retry" : "Add wish"}
        </Button>
      </div>
    </form>
  );
}
