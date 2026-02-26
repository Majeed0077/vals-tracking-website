export type ProductDiscountType = "percentage" | "fixed";

export type ProductDiscount = {
  type: ProductDiscountType;
  value: number;
  startAt?: string | Date;
  endAt?: string | Date;
};

export type ProductPriceInput = {
  price: number;
  discount?: ProductDiscount;
};

function toDate(value: string | Date | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isDiscountActive(
  discount: ProductDiscount | undefined,
  now = new Date()
): boolean {
  if (!discount || !discount.type) return false;
  const value = Number(discount.value ?? 0);
  if (!Number.isFinite(value) || value <= 0) return false;

  const startAt = toDate(discount.startAt);
  const endAt = toDate(discount.endAt);
  if (startAt && now < startAt) return false;
  if (endAt && now > endAt) return false;
  return true;
}

export function resolveProductPricing(input: ProductPriceInput, now = new Date()) {
  const basePrice = Math.max(0, Number(input.price ?? 0) || 0);
  const discount = input.discount;

  if (!isDiscountActive(discount, now)) {
    return {
      basePrice,
      finalPrice: basePrice,
      discountAmount: 0,
      discountPercent: 0,
      hasDiscount: false,
    };
  }

  const rawValue = Math.max(0, Number(discount?.value ?? 0) || 0);
  let discountAmount = 0;

  if (discount?.type === "percentage") {
    const pct = Math.min(100, rawValue);
    discountAmount = (basePrice * pct) / 100;
  } else {
    discountAmount = rawValue;
  }

  discountAmount = Math.min(basePrice, discountAmount);
  const finalPrice = Math.max(0, basePrice - discountAmount);
  const discountPercent =
    basePrice > 0 ? Math.round((discountAmount / basePrice) * 100) : 0;

  return {
    basePrice,
    finalPrice,
    discountAmount,
    discountPercent,
    hasDiscount: discountAmount > 0,
  };
}

