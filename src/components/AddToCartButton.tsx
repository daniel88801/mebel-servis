"use client";

import { useState } from "react";
import { useCart, type CartLine } from "./CartProvider";

export function AddToCartButton({
  product,
  className = "btn btn-copper btn-sm",
  children = "В корзину",
}: {
  product: Omit<CartLine, "qty">;
  className?: string;
  children?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        add(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Добавлено" : children}
    </button>
  );
}
