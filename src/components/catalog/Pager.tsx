"use client";

/** Номера страниц с многоточиями: 1 … 4 5 6 … 35. */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const around = [current - 1, current, current + 1].filter((n) => n > 1 && n < total);
  const out: (number | "gap")[] = [1];
  if (around[0] > 2) out.push("gap");
  out.push(...around);
  if (around[around.length - 1] < total - 1) out.push("gap");
  out.push(total);
  return out;
}

export function Pager({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <nav className="pager" aria-label="Страницы каталога">
      <button
        type="button"
        className="pager-arrow"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      <ul className="pager-list">
        {pageNumbers(current, total).map((page, i) =>
          page === "gap" ? (
            <li key={`gap-${i}`} className="pager-gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                className={page === current ? "pager-page is-current" : "pager-page"}
                aria-current={page === current ? "page" : undefined}
                onClick={() => onChange(page)}
              >
                {page}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pager-arrow"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        aria-label="Следующая страница"
      >
        →
      </button>
    </nav>
  );
}
