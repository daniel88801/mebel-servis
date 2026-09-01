"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/data/catalog";
import { EMPTY_RANGE, type Bounds, type Counts, type Filters, type Range } from "./filters";

const rub = new Intl.NumberFormat("ru-RU");

function Group({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="fgroup" open={open}>
      <summary>{title}</summary>
      <div className="fgroup-body">{children}</div>
    </details>
  );
}

function RangeFields({
  value,
  bounds,
  unit,
  onChange,
}: {
  value: Range;
  bounds: [number, number] | null;
  unit?: string;
  onChange: (r: Range) => void;
}) {
  const format = (n: number) => (unit === "₽" ? rub.format(n) : String(n));
  return (
    <>
      <div className="filter-row">
        <input
          type="number"
          inputMode="numeric"
          min={bounds?.[0]}
          max={bounds?.[1]}
          placeholder="от"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          aria-label="Значение от"
        />
        <input
          type="number"
          inputMode="numeric"
          min={bounds?.[0]}
          max={bounds?.[1]}
          placeholder="до"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          aria-label="Значение до"
        />
      </div>
      {bounds && (
        <p className="fhint">
          В разделе: {format(bounds[0])}–{format(bounds[1])}
          {unit ? ` ${unit}` : ""}
        </p>
      )}
    </>
  );
}

/** Список вариантов с числами. Пустые варианты не исчезают, а гаснут — так видно тупики. */
function CheckList({
  values,
  counts,
  selected,
  onToggle,
  collapseAfter = 8,
}: {
  values: string[];
  counts: Map<string, number>;
  selected: string[];
  onToggle: (value: string) => void;
  collapseAfter?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...values].sort((a, b) => {
    const pick = (v: string) => (selected.includes(v) ? 1 : 0);
    if (pick(b) !== pick(a)) return pick(b) - pick(a);
    return (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
  });
  const visible = expanded ? sorted : sorted.slice(0, collapseAfter);
  const hidden = sorted.length - visible.length;

  return (
    <>
      <ul className="fcheck">
        {visible.map((value) => {
          const count = counts.get(value) ?? 0;
          const checked = selected.includes(value);
          return (
            <li key={value}>
              <label className={count === 0 && !checked ? "is-empty" : undefined}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={count === 0 && !checked}
                  onChange={() => onToggle(value)}
                />
                <span className="fcheck-label">{value}</span>
                <span className="fcheck-count">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <button type="button" className="flink" onClick={() => setExpanded(true)}>
          Показать ещё {hidden}
        </button>
      )}
      {expanded && sorted.length > collapseAfter && (
        <button type="button" className="flink" onClick={() => setExpanded(false)}>
          Свернуть
        </button>
      )}
    </>
  );
}

export function FilterPanel({
  filters,
  setFilters,
  counts,
  bounds,
  options,
  categories,
  categoryCounts,
  activeCategory,
}: {
  filters: Filters;
  setFilters: (update: (f: Filters) => Filters) => void;
  counts: Counts;
  bounds: Bounds;
  options: { colors: string[]; coatings: string[]; badges: string[] };
  categories: Category[];
  categoryCounts: Map<string, number>;
  activeCategory: Category | null;
}) {
  const toggle = (key: "colors" | "coatings" | "badges") => (value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const setRange = (key: "price" | "width" | "height" | "depth") => (range: Range) =>
    setFilters((f) => ({ ...f, [key]: range }));

  const hasSizes = bounds.width || bounds.height || bounds.depth;

  return (
    <div className="fpanel">
      <nav className="fsections" aria-label="Разделы каталога">
        <p className="fsections-title">Разделы</p>
        <ul>
          <li>
            <Link href="/catalog" className={activeCategory ? "" : "is-active"}>
              <span>Все разделы</span>
              <span className="fcheck-count">{categoryCounts.get("all") ?? 0}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/catalog/${c.id}`}
                className={activeCategory?.id === c.id ? "is-active" : ""}
              >
                <span>{c.name}</span>
                <span className="fcheck-count">{categoryCounts.get(c.id) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Group title="Цена, ₽" open>
        <RangeFields
          value={filters.price}
          bounds={bounds.price}
          unit="₽"
          onChange={setRange("price")}
        />
      </Group>

      {options.colors.length > 0 && (
        <Group title="Цвет и декор" open={options.colors.length <= 8}>
          <CheckList
            values={options.colors}
            counts={counts.colors}
            selected={filters.colors}
            onToggle={toggle("colors")}
          />
        </Group>
      )}

      {hasSizes && (
        <Group title="Габариты, мм">
          <p className="fhint">Ширина</p>
          <RangeFields value={filters.width} bounds={bounds.width} onChange={setRange("width")} />
          <p className="fhint" style={{ marginTop: 12 }}>
            Высота
          </p>
          <RangeFields
            value={filters.height}
            bounds={bounds.height}
            onChange={setRange("height")}
          />
          <p className="fhint" style={{ marginTop: 12 }}>
            Длина или глубина
          </p>
          <RangeFields value={filters.depth} bounds={bounds.depth} onChange={setRange("depth")} />
        </Group>
      )}

      {bounds.load && (
        <Group title="Нагрузка">
          <input
            type="number"
            inputMode="numeric"
            min={bounds.load[0]}
            max={bounds.load[1]}
            placeholder={`от ${bounds.load[0]} кг`}
            value={filters.minLoad}
            onChange={(e) => setFilters((f) => ({ ...f, minLoad: e.target.value }))}
            aria-label="Нагрузка от, кг"
          />
          <p className="fhint">
            В разделе: до {bounds.load[1]} кг. Указана только у части позиций.
          </p>
        </Group>
      )}

      {options.coatings.length > 0 && (
        <Group title="Покрытие">
          <CheckList
            values={options.coatings}
            counts={counts.coatings}
            selected={filters.coatings}
            onToggle={toggle("coatings")}
          />
        </Group>
      )}

      {options.badges.length > 0 && (
        <Group title="Метка">
          <CheckList
            values={options.badges}
            counts={counts.badges}
            selected={filters.badges}
            onToggle={toggle("badges")}
          />
        </Group>
      )}

      {counts.gost > 0 && (
        <label className="fcheck-single">
          <input
            type="checkbox"
            checked={filters.gostOnly}
            onChange={(e) => setFilters((f) => ({ ...f, gostOnly: e.target.checked }))}
          />
          <span className="fcheck-label">Только по ГОСТ</span>
          <span className="fcheck-count">{counts.gost}</span>
        </label>
      )}
    </div>
  );
}

export { EMPTY_RANGE };
