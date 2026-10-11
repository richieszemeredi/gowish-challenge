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

export function AddItemForm(): React.JSX.Element {
  const { mutate, isPending, isError, isSuccess } = useAddItem();
  const status = useTransientStatus(
    isPending ? "loading" : isSuccess ? "success" : isError ? "error" : "idle",
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
        register={register("title")}
        error={errors.title?.message}
      />
      <TextField
        label="Price (DKK)"
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
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending} status={status}>
          {isPending ? "Adding…" : isError ? "Retry" : "Add wish"}
        </Button>
        <p role="status">
          {isError ? (
            <StatusMessage>Couldn’t add the wish.</StatusMessage>
          ) : null}
          {isSuccess ? (
            <StatusMessage visible={status === "success"}>
              Wish added.
            </StatusMessage>
          ) : null}
        </p>
      </div>
    </form>
  );
}
