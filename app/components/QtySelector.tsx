"use client";

import { useState } from "react";

type QtySelectorProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
};

export default function QtySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  value,
  onChange,
}: QtySelectorProps) {
  const [internalQty, setInternalQty] = useState(() => Math.max(min, defaultValue));
  const qty = value ?? internalQty;

  const canDecrement = qty > min;
  const canIncrement = qty < max;

  const handleDecrease = () => {
    if (!canDecrement) return;
    const next = Math.max(min, qty - 1);
    if (onChange) onChange(next);
    if (value === undefined) setInternalQty(next);
  };

  const handleIncrease = () => {
    if (!canIncrement) return;
    const next = Math.min(max, qty + 1);
    if (onChange) onChange(next);
    if (value === undefined) setInternalQty(next);
  };

  return (
    <div className="product-qty">
      <button type="button" onClick={handleDecrease} disabled={!canDecrement} aria-label="Decrease quantity">
        -
      </button>
      <input type="number" min={min} max={max} value={qty} readOnly />
      <button type="button" onClick={handleIncrease} disabled={!canIncrement} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
