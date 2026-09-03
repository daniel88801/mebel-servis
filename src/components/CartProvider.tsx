"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_KEY = "ms-cart-v1";

export type CartLine = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number | null;
  qty: number;
};

export type ShopUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
};

type CartContext = {
  ready: boolean;
  user: ShopUser | null;
  items: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  refreshUser: () => Promise<ShopUser | null>;
};

const Ctx = createContext<CartContext | null>(null);

function readLocal(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function patchLocal(update: (prev: CartLine[]) => CartLine[]) {
  const next = update(readLocal());
  writeLocal(next);
  return next;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ShopUser | null>(null);
  const [items, setItems] = useState<CartLine[]>([]);

  const refreshUser = useCallback(async () => {
    const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({ user: null }));
    setUser(me.user ?? null);
    return me.user as ShopUser | null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({ user: null }));
      if (cancelled) return;
      const current = (me.user ?? null) as ShopUser | null;
      setUser(current);
      if (current) {
        const guest = readLocal();
        if (guest.length) {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "merge", items: guest }),
          });
          localStorage.removeItem(CART_KEY);
        }
        const data = await fetch("/api/cart").then((r) => r.json()).catch(() => ({ items: [] }));
        if (!cancelled) setItems(data.items ?? []);
      } else {
        setItems(readLocal());
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(
    (line: Omit<CartLine, "qty">, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((p) => p.id === line.id);
        const next = found
          ? prev.map((p) => (p.id === line.id ? { ...p, qty: p.qty + qty } : p))
          : [...prev, { ...line, qty }];
        if (!user) writeLocal(next);
        return next;
      });
      if (user) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...line, qty }),
        }).then((r) => r.json()).then((d) => d.items && setItems(d.items)).catch(() => {});
      }
    },
    [user],
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      setItems((prev) => {
        const next = qty < 1 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p));
        if (!user) writeLocal(next);
        return next;
      });
      if (user) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set", id, qty }),
        }).then((r) => r.json()).then((d) => d.items && setItems(d.items)).catch(() => {});
      }
    },
    [user],
  );

  const remove = useCallback(
    (id: string) => {
      setQty(id, 0);
    },
    [setQty],
  );

  const clear = useCallback(() => {
    setItems([]);
    if (user) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      }).catch(() => {});
    } else {
      writeLocal([]);
    }
  }, [user]);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ ready, user, items, count, add, setQty, remove, clear, refreshUser }),
    [ready, user, items, count, add, setQty, remove, clear, refreshUser],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart вне CartProvider");
  return ctx;
}

export function formatSpec(items: CartLine[]) {
  return items
    .map((i) => `${i.sku} — ${i.name} × ${i.qty}${i.price != null ? ` (от ${i.price} ₽)` : ""}`)
    .join("\n");
}
