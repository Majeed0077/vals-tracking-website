import crypto from "crypto";
import type { PaymentProvider } from "@/models/PaymentTransaction";

type CreateIntentInput = {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
};

type CreateIntentOutput = {
  providerRef: string;
  paymentUrl?: string;
  status: "pending" | "authorized";
};

function randomRef(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export async function createPaymentIntent(
  input: CreateIntentInput
): Promise<CreateIntentOutput> {
  // External providers can be wired here; for now this returns provider-ready placeholders.
  switch (input.provider) {
    case "stripe":
      return {
        providerRef: randomRef("stripe"),
        paymentUrl: `/checkout/stripe?order=${input.orderId}`,
        status: "pending",
      };
    case "jazzcash":
      return {
        providerRef: randomRef("jazz"),
        paymentUrl: `/checkout/jazzcash?order=${input.orderId}`,
        status: "pending",
      };
    case "easypaisa":
      return {
        providerRef: randomRef("ep"),
        paymentUrl: `/checkout/easypaisa?order=${input.orderId}`,
        status: "pending",
      };
    case "mock":
    default:
      return {
        providerRef: randomRef("mock"),
        paymentUrl: `/checkout/mock?order=${input.orderId}&amount=${input.amount}`,
        status: "authorized",
      };
  }
}
