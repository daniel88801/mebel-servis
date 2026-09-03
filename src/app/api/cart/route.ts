import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addCartLine, clearCart, getCart, mergeCart, setCartQty, type CartLine } from "@/lib/store";
import { clean } from "@/lib/validate";

export const runtime = "nodejs";

function parseLine(raw: Record<string, unknown>): Omit<CartLine, "qty"> | null {
  const id = clean(raw.id, 160);
  const sku = clean(raw.sku, 80);
  const name = clean(raw.name, 240);
  const image = clean(raw.image, 300);
  if (!id || !name) return null;
  const price = typeof raw.price === "number" && Number.isFinite(raw.price) ? Math.round(raw.price) : null;
  return { id, sku, name, image, price };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: getCart(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужно войти" }, { status: 401 });
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = clean(raw.action, 20);

  if (action === "clear") {
    clearCart(user.id);
    return NextResponse.json({ items: [] });
  }
  if (action === "merge" && Array.isArray(raw.items)) {
    const items = mergeCart(user.id, raw.items as CartLine[]);
    return NextResponse.json({ items });
  }
  if (action === "set") {
    const id = clean(raw.id, 160);
    const qty = Math.floor(Number(raw.qty) || 0);
    if (!id) return NextResponse.json({ error: "Нет позиции" }, { status: 422 });
    setCartQty(user.id, id, qty);
    return NextResponse.json({ items: getCart(user.id) });
  }

  const line = parseLine(raw);
  if (!line) return NextResponse.json({ error: "Нет позиции" }, { status: 422 });
  addCartLine(user.id, line, Math.max(1, Math.floor(Number(raw.qty) || 1)));
  return NextResponse.json({ items: getCart(user.id) });
}
