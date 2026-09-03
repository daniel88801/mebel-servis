import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

async function dismissChrome(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ms-cookie-consent",
      JSON.stringify({ v: "2026-09-03", choice: "all", at: new Date().toISOString() }),
    );
  });
}

async function checkFormBoxes(page: Page, selector: string) {
  const boxes = page.locator(`${selector} input[type=checkbox]`);
  const count = await boxes.count();
  for (let i = 0; i < count; i++) await boxes.nth(i).check();
}

function uniqueEmail() {
  return `e2e${Date.now()}${Math.floor(Math.random() * 1e4)}@example.com`;
}

const PASSWORD = "secret123";

async function createUser(
  request: APIRequestContext,
  email: string,
  extra: { name?: string; phone?: string; company?: string } = {},
) {
  const res = await request.post("/api/auth/register", {
    data: {
      name: extra.name ?? "E2E Покупатель",
      email,
      phone: extra.phone ?? "+79201112233",
      company: extra.company ?? "ООО E2E",
      password: PASSWORD,
    },
  });
  const body = await res.json().catch(() => ({}));
  expect(res.ok(), String(body.error ?? res.status())).toBeTruthy();
}

/** Регистрация в том же cookie jar, что и страница. */
async function loginAsNewUser(
  page: Page,
  extra: { name?: string; phone?: string; company?: string } = {},
) {
  const email = uniqueEmail();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await createUser(page.request, email, extra);
  return email;
}

async function addSaleItem(page: Page) {
  await page.goto("/catalog/sale", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "В корзину" }).first().click();
  await expect(page.locator(".header-icon-count")).toBeVisible();
}

test.describe("Регистрация и вход", () => {
  test.beforeEach(async ({ page }) => {
    await dismissChrome(page);
  });

  test("регистрация через форму открывает кабинет", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="name"]').fill("Анна Регистрация");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phone"]').fill("+79205554433");
    await page.locator('input[name="company"]').fill("Школа №1");
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="password2"]').fill(PASSWORD);
    await page.locator(".auth-form input[type=checkbox]").check();
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/account"),
      page.getByRole("button", { name: "Создать кабинет" }).click(),
    ]);
    await expect(page.locator("h1").first()).toHaveText("Кабинет");
    await expect(page.locator("main")).toContainText(email);
    await expect(page.locator('input[name="name"]')).toHaveValue("Анна Регистрация");
  });

  test("пароли не совпадают — ошибка без запроса", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="name"]').fill("Тест");
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="phone"]').fill("+79201112233");
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="password2"]').fill("otherpass");
    await page.locator(".auth-form input[type=checkbox]").check();
    await page.getByRole("button", { name: "Создать кабинет" }).click();
    await expect(page.locator(".form-error")).toContainText("Пароли не совпадают");
    await expect(page).toHaveURL(/\/register/);
  });

  test("повторный email нельзя зарегистрировать, вход работает", async ({ page, request }) => {
    const email = uniqueEmail();
    await createUser(request, email);

    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="name"]').fill("Дубль");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phone"]').fill("+79201112233");
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="password2"]').fill(PASSWORD);
    await page.locator(".auth-form input[type=checkbox]").check();
    await page.getByRole("button", { name: "Создать кабинет" }).click();
    await expect(page.locator(".form-error")).toContainText(/уже зарегистрирован/);

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/account"),
      page.getByRole("button", { name: "Войти" }).click(),
    ]);
    await expect(page.locator("h1").first()).toHaveText("Кабинет");
  });

  test("неверный пароль не пускает в кабинет", async ({ page, request }) => {
    const email = uniqueEmail();
    await createUser(request, email);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("wrongpass");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page.locator(".form-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("выход закрывает кабинет", async ({ page, request }) => {
    await loginAsNewUser(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Выйти" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Профиль, корзина и оформление заказа", () => {
  test.beforeEach(async ({ page }) => {
    await dismissChrome(page);
  });

  test("гость не оформляет заказ без входа", async ({ page }) => {
    await addSaleItem(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Войти" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Регистрация" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Оформить заказ" })).toHaveCount(0);
  });

  test("количество в корзине меняется", async ({ page, request }) => {
    await loginAsNewUser(page);
    await addSaleItem(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Больше" }).click();
    await expect(page.locator(".cart-qty input")).toHaveValue("2");
    await page.getByRole("button", { name: "Меньше" }).click();
    await expect(page.locator(".cart-qty input")).toHaveValue("1");
  });

  test("профиль сохраняется на сервере", async ({ page, request }) => {
    await loginAsNewUser(page, { name: "Старое Имя" });
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="name"]').fill("Новое Имя");
    await page.locator('input[name="company"]').fill("Новый объект");
    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.locator(".form-ok")).toContainText("обновлены");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="name"]')).toHaveValue("Новое Имя");
    await expect(page.locator('input[name="company"]')).toHaveValue("Новый объект");
  });

  test("оформление заказа с доставкой и запись в кабинете", async ({ page, request }) => {
    await loginAsNewUser(page);
    await addSaleItem(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".cart-line")).toHaveCount(1);

    await page.getByText("Доставка по Нижнему Новгороду").click();
    await page.locator('input[name="address"]').fill("Нижний Новгород, ул. Гордеевская, 139Б");
    await page.locator('textarea[name="comment"]').fill("Нужна поставка на объект");
    await checkFormBoxes(page, "form.form-grid");
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith("/account/orders/")),
      page.getByRole("button", { name: "Оформить заказ" }).click(),
    ]);

    await expect(page.locator("h1").first()).toContainText(/Заказ MS-\d{4}-\d+/);
    await expect(page.locator("main")).toContainText("Доставка по Нижнему Новгороду");
    await expect(page.locator("main")).toContainText("Гордеевская");
    await expect(page.locator("main")).toContainText("Нужна поставка на объект");
    await expect(page.locator(".cart-line")).toHaveCount(1);

    await page.getByRole("link", { name: "К списку заказов" }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".quote-link")).toHaveCount(1);
    await page.locator(".quote-link").click();
    await expect(page.locator("h1").first()).toContainText("Заказ MS-");
  });

  test("доставка без адреса не проходит", async ({ page, request }) => {
    await loginAsNewUser(page);
    await addSaleItem(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await page.getByText("Отправка транспортной компанией").click();
    await checkFormBoxes(page, "form.form-grid");
    await page.getByRole("button", { name: "Оформить заказ" }).click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('input[name="address"]')).toBeVisible();
  });

  test("гостевая корзина переносится после регистрации", async ({ page }) => {
    await addSaleItem(page);
    await page.goto("/register?next=/cart", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="name"]').fill("Гость");
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="phone"]').fill("+79201112233");
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="password2"]').fill(PASSWORD);
    await page.locator(".auth-form input[type=checkbox]").check();
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/cart"),
      page.getByRole("button", { name: "Создать кабинет" }).click(),
    ]);
    await expect(page.locator(".cart-line")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Оформить заказ" })).toBeVisible();
  });
});
