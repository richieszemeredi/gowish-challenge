import { z } from "zod";

const PRICE = /^(\d+)(?:[.,](\d{1,2}))?$/;

// Parses "12", "12.5" or "12,50" to minor units without going through floats.
const toMinor = (price: string): number => {
  const [, whole = "0", frac = ""] = PRICE.exec(price) ?? [];
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
};

export const newWishItemSchema = z.object({
  title: z.string().trim().min(1, "Enter a title"),
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .refine((v) => !v.startsWith("-"), "Price can't be negative")
    .refine((v) => v.startsWith("-") || PRICE.test(v), "Enter a valid price")
    .transform(toMinor),
  url: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.url({ protocol: /^https?$/ }).safeParse(v).success,
      "Enter a valid link, e.g. https://example.com",
    )
    .transform((v) => v || undefined),
});

export type NewWishItemInput = z.input<typeof newWishItemSchema>;
export type NewWishItem = z.output<typeof newWishItemSchema>;
