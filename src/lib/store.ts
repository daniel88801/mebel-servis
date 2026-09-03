import { getDb } from "./db";
import { newId } from "./auth";

export type CartLine = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number | null;
  qty: number;
};

export type Order = {
  id: string;
  number: string;
  user_id: string;
  status: string;
  name: string;
  phone: string;
  company: string;
  comment: string;
  delivery: string;
  address: string;
  total: number | null;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  sku: string;
  name: string;
  image: string;
  price: number | null;
  qty: number;
};

type CartRow = {
  product_id: string;
  sku: string;
  name: string;
  image: string;
  price: number | null;
  qty: number;
};

function lineFromRow(row: CartRow): CartLine {
  return {
    id: row.product_id,
    sku: row.sku,
    name: row.name,
    image: row.image,
    price: row.price,
    qty: row.qty,
  };
}

export function getCart(userId: string): CartLine[] {
  const rows = getDb()
    .prepare(
      "SELECT product_id, sku, name, image, price, qty FROM cart_items WHERE user_id = ? ORDER BY name",
    )
    .all(userId) as CartRow[];
  return rows.map(lineFromRow);
}

export function addCartLine(userId: string, line: Omit<CartLine, "qty">, qty = 1) {
  const existing = getDb()
    .prepare("SELECT qty FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(userId, line.id) as { qty: number } | undefined;
  if (existing) {
    getDb()
      .prepare("UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?")
      .run(existing.qty + qty, userId, line.id);
    return;
  }
  getDb()
    .prepare(
      `INSERT INTO cart_items (user_id, product_id, sku, name, image, price, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(userId, line.id, line.sku, line.name, line.image, line.price, qty);
}

export function setCartQty(userId: string, productId: string, qty: number) {
  if (qty < 1) {
    getDb().prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(userId, productId);
    return;
  }
  getDb()
    .prepare("UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?")
    .run(qty, userId, productId);
}

export function clearCart(userId: string) {
  getDb().prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
}

export function mergeCart(userId: string, lines: CartLine[]) {
  for (const line of lines) {
    if (!line.id || !line.qty) continue;
    addCartLine(
      userId,
      {
        id: line.id,
        sku: line.sku,
        name: line.name,
        image: line.image,
        price: line.price,
      },
      Math.max(1, Math.floor(Number(line.qty) || 1)),
    );
  }
  return getCart(userId);
}

function nextOrderNumber() {
  return nextNumber("orders", "MS");
}

export function createOrder(
  userId: string,
  input: {
    name: string;
    phone: string;
    company: string;
    comment: string;
    delivery: string;
    address: string;
    items: CartLine[];
  },
) {
  const items = input.items.filter((i) => i.qty > 0);
  if (!items.length) throw new Error("empty");
  const id = newId();
  const number = nextOrderNumber();
  const total = items.every((i) => i.price != null)
    ? items.reduce((n, i) => n + (i.price as number) * i.qty, 0)
    : null;
  const created = new Date().toISOString();
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO orders (id, number, user_id, status, name, phone, company, comment, delivery, address, total, created_at)
       VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      number,
      userId,
      input.name,
      input.phone,
      input.company,
      input.comment,
      input.delivery,
      input.address,
      total,
      created,
    );
    const ins = db.prepare(
      `INSERT INTO order_items (order_id, product_id, sku, name, image, price, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of items) {
      ins.run(id, item.id, item.sku, item.name, item.image, item.price, item.qty);
    }
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return { id, number, total, created_at: created, items };
}

export function listOrders(userId: string): Order[] {
  return getDb()
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Order[];
}

export function getOrder(userId: string, id: string) {
  const order = getDb()
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(id, userId) as Order | undefined;
  if (!order) return null;
  const items = getDb()
    .prepare(
      "SELECT product_id, sku, name, image, price, qty FROM order_items WHERE order_id = ?",
    )
    .all(id) as OrderItem[];
  return { ...order, items };
}

export const ORDER_STATUS: Record<string, string> = {
  new: "Новый",
  processing: "В работе",
  quoted: "КП отправлено",
  completed: "Выполнен",
  cancelled: "Отменён",
};

export const DELIVERY_LABEL: Record<string, string> = {
  pickup: "Самовывоз с производства",
  city: "Доставка по Нижнему Новгороду",
  transport: "Отправка транспортной компанией",
};

export type Lead = {
  id: string;
  number: string;
  name: string;
  phone: string;
  company: string;
  comment: string;
  product: string;
  source: string;
  created_at: string;
};

function nextNumber(table: "orders" | "leads", prefixHead: string) {
  const year = new Date().getFullYear();
  const prefix = `${prefixHead}-${year}-`;
  const row = getDb()
    .prepare(`SELECT number FROM ${table} WHERE number LIKE ? ORDER BY number DESC LIMIT 1`)
    .get(`${prefix}%`) as { number: string } | undefined;
  const n = row ? Number(row.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(5, "0")}`;
}

export function createLead(input: {
  name: string;
  phone: string;
  company: string;
  comment: string;
  product: string;
  source: string;
}): Lead {
  const id = newId();
  const number = nextNumber("leads", "L");
  const created_at = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO leads (id, number, name, phone, company, comment, product, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      number,
      input.name,
      input.phone,
      input.company,
      input.comment,
      input.product,
      input.source,
      created_at,
    );
  return { id, number, created_at, ...input };
}

export function listRecentLeads(limit = 100): Lead[] {
  return getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Lead[];
}

export function listRecentOrders(limit = 50): Order[] {
  return getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Order[];
}

export function logCookieConsent(input: {
  choice: string;
  version: string;
  ip: string;
  userAgent: string;
}) {
  getDb()
    .prepare(
      `INSERT INTO consent_logs (id, choice, version, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(newId(), input.choice, input.version, input.ip, input.userAgent, new Date().toISOString());
}
