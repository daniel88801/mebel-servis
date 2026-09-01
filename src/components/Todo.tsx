/**
 * Заметное место под реальные данные компании.
 *
 * Тарифы, сроки и условия должен подтвердить заказчик — выдумывать их нельзя.
 * Блок намеренно виден на странице, чтобы его нельзя было случайно выкатить в бой.
 * Найти все: `grep -rn "<Todo" src/`
 */
export function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span className="todo" role="note">
      <span className="todo-tag mono">уточнить</span>
      {children}
    </span>
  );
}

export function TodoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="todo-block" role="note">
      <p className="todo-tag mono">Заполнить перед запуском</p>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
