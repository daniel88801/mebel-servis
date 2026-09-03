import { expect, test, type Page } from "@playwright/test";

async function dismissChrome(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ms-cookie-consent",
      JSON.stringify({ v: "2026-09-03", choice: "all", at: new Date().toISOString() }),
    );
  });
}

const PUBLIC_PAGES: { path: string; heading: string | RegExp }[] = [
  { path: "/", heading: /Мебель, которая выдерживает объект/ },
  { path: "/catalog", heading: "Каталог" },
  { path: "/catalog/sale", heading: "Распродажа" },
  { path: "/about", heading: "О компании" },
  { path: "/contacts", heading: /Контакт/ },
  { path: "/delivery", heading: /Доставк/ },
  { path: "/payment", heading: /Оплат/ },
  { path: "/wholesale", heading: /Опт/ },
  { path: "/privacy", heading: /Политика/ },
  { path: "/consent", heading: /Согласие/ },
  { path: "/oferta", heading: /Оферта/ },
  { path: "/login", heading: "Вход в кабинет" },
  { path: "/register", heading: "Создать кабинет" },
  { path: "/cart", heading: "Корзина" },
];

test.describe("Публичные страницы", () => {
  test.beforeEach(async ({ page }) => {
    await dismissChrome(page);
  });

  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} открывается`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("h1").first()).toContainText(heading);
    });
  }

  test("несуществующий адрес даёт 404", async ({ page }) => {
    const res = await page.goto("/no-such-page-xyz", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("не найдена");
  });
});

test.describe("Главная и каталог", () => {
  test.beforeEach(async ({ page }) => {
    await dismissChrome(page);
  });

  test("на главной есть категории, распродажа выделена, слайдер листается", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".cat-sale")).toBeVisible();
    await expect(page.locator(".cat-sale .badge-sale")).toContainText("Распродажа");
    await expect(page.locator(".hero-slide-label")).toBeVisible();
    const first = await page.locator(".hero-slide-label").textContent();
    await page.getByRole("button", { name: "Следующий интерьер" }).click();
    await expect(page.locator(".hero-slide-label")).not.toHaveText(first ?? "");
  });

  test("в каталоге цена начинается с «от», стикер распродажи на плитке", async ({ page }) => {
    await page.goto("/catalog/sale", { waitUntil: "domcontentloaded" });
    const price = page.locator(".card .price").first();
    await expect(price).toHaveText(/^от\s/);
    await expect(page.locator(".card .badge-sale").first()).toContainText("Распродажа");
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText("Распродажа");
  });

  test("карточка товара открывается из каталога", async ({ page }) => {
    await page.goto("/catalog/sale", { waitUntil: "domcontentloaded" });
    const name = (await page.locator(".card h3").first().textContent())?.trim() ?? "";
    await page.locator(".card h3 a").first().click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator("h1")).toContainText(name);
  });

  test("поиск в каталоге сужает выдачу", async ({ page }) => {
    await page.goto("/catalog", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Поиск по каталогу").fill("кровать");
    await expect(page.locator(".card h3").first()).toContainText(/кроват/i);
  });

  test("на «О компании» распродажа выделена, фото производства современное", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".nomen-sale")).toContainText("Распродажа");
    await expect(page.locator(".split img").first()).toHaveAttribute("src", /production-beds/);
  });

  test("PDF-каталог отдаётся", async ({ request }) => {
    const res = await request.get("/downloads/mebel-servis-katalog.pdf");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toMatch(/pdf/);
    expect((await res.body()).byteLength).toBeGreaterThan(50_000);
  });
});

test.describe("Логин и регистрация", () => {
  test.beforeEach(async ({ page }) => {
    await dismissChrome(page);
  });

  test("баннер интерьера только на десктопе", async ({ page }, info) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    const visual = page.locator(".auth-visual");
    if (info.project.name === "mobile") {
      await expect(visual).toBeHidden();
    } else {
      await expect(visual).toBeVisible();
      await expect(visual.getByRole("heading")).toContainText("Спецификации и заказы");
    }
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    if (info.project.name === "mobile") {
      await expect(page.locator(".auth-visual")).toBeHidden();
    } else {
      await expect(page.locator(".auth-visual")).toBeVisible();
    }
  });

  test("неверный пароль показывает ошибку", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill("nobody@example.com");
    await page.locator('input[name="password"]').fill("wrongpass");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page.locator(".form-error")).toBeVisible();
  });
});

test.describe("Cookie и документы", () => {
  test("баннер требует явного выбора, без «продолжая»", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("region", { name: "Использование файлов cookie" });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Яндекс.Метрика");
    await expect(banner).not.toContainText(/Продолжая/i);
    await expect(banner.getByRole("button", { name: "Принять все" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Только необходимые" })).toBeVisible();
    await banner.getByRole("button", { name: "Только необходимые" }).click();
    await expect(banner).toHaveCount(0);
  });

  test("служебная лента без пароля недоступна", async ({ page }) => {
    const res = await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
  });

  test("оферта и согласие — отдельные документы", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "ms-cookie-consent",
        JSON.stringify({ v: "2026-09-03", choice: "necessary", at: new Date().toISOString() }),
      );
    });
    await page.goto("/oferta", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText("не интернет-магазин");
    await expect(page.locator("main")).toContainText("отдельным согласием");
    await page.goto("/consent", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText("Не входит в оферту");
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".auth-form")).toContainText("согласие на обработку персональных данных");
    await expect(page.locator(".auth-form a[href='/consent']")).toBeVisible();
  });
});


