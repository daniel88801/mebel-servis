(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function money(n) {
    if (n == null || n === "") return "по запросу";
    return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  }

  function categoryById(id) {
    return MS.categories.find((c) => c.id === id);
  }

  function productsByCategory(id) {
    return MS.products.filter((p) => p.category === id);
  }

  function productById(id) {
    return MS.products.find((p) => p.id === id);
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function logoSvg() {
    return `<svg class="logo-mark" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect x="1.2" y="1.2" width="39.6" height="39.6" rx="8" stroke="#161814" stroke-width="1.6"/>
      <path d="M11 28.5h20M11 21h20M14 14.5h14" stroke="#161814" stroke-width="1.7" stroke-linecap="square"/>
      <path d="M11 14.5v14M31 14.5v14M21 14.5v14" stroke="#C45C32" stroke-width="1.7"/>
    </svg>`;
  }

  function headerHTML(active) {
    const c = MS.company;
    return `<div class="header-inner">
      <a class="logo" href="index.html">
        ${logoSvg()}
        <span class="logo-text"><strong>Мебель-Сервис</strong><span>производство · Н. Новгород</span></span>
      </a>
      <nav class="nav" id="nav">
        <a href="catalog.html" class="${active === "catalog" ? "active" : ""}">Каталог</a>
        <a href="about.html" class="${active === "about" ? "active" : ""}">О компании</a>
        <a href="contacts.html" class="${active === "contacts" ? "active" : ""}">Контакты</a>
      </nav>
      <div class="header-actions">
        <a class="header-phone" href="tel:+79200050110">${c.phones[0]}</a>
        <button class="btn btn-primary btn-sm" data-open-request>Оставить заявку</button>
        <button class="burger" id="burger" aria-label="Меню"><span></span><span></span><span></span></button>
      </div>
    </div>`;
  }

  function footerHTML() {
    const c = MS.company;
    const cats = MS.categories
      .map((cat) => `<li><a href="catalog.html?cat=${cat.id}">${cat.name}</a></li>`)
      .join("");
    return `<div class="wrap footer-grid">
      <div>
        <a class="logo" href="index.html">${logoSvg()}<span class="logo-text"><strong>Мебель-Сервис</strong><span>ООО «Мебель-Сервис»</span></span></a>
        <p style="margin-top:16px;max-width:36ch">Производим металлическую и корпусную мебель для объектов с интенсивной эксплуатацией. От единичного изделия до оснащения крупного объекта.</p>
      </div>
      <div>
        <h4>Каталог</h4>
        <ul>${cats}</ul>
      </div>
      <div>
        <h4>Компания</h4>
        <ul>
          <li><a href="about.html">О компании</a></li>
          <li><a href="contacts.html">Контакты и реквизиты</a></li>
          <li><a href="privacy.html">Политика конфиденциальности</a></li>
        </ul>
      </div>
      <div>
        <h4>Связаться</h4>
        <ul>
          <li><a href="tel:+79200050110">${c.phones[0]}</a></li>
          <li><a href="tel:+79308117395">${c.phones[1]}</a></li>
          <li><a href="mailto:${c.email}">${c.email}</a></li>
          <li>${c.address}</li>
          <li>${c.hours}</li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>© ${new Date().getFullYear()} ${c.legal}. ИНН ${c.inn}</span>
      <span>Цены ориентировочные, для оптовых партий — по запросу</span>
    </div>`;
  }

  function modalHTML() {
    return `<div class="modal" id="request-modal" role="dialog" aria-modal="true">
      <div class="modal-card">
        <p class="mono kicker" style="color:var(--copper)">Заявка</p>
        <h3>Расчёт поставки</h3>
        <p class="note" id="request-product-note">Опишите объект и объём — ответим в рабочее время.</p>
        <form class="form-grid" data-form="request" style="margin-top:16px">
          <input type="hidden" name="product" id="request-product">
          <label>Имя<input name="name" required placeholder="Как к вам обращаться"></label>
          <label>Телефон<input name="phone" required placeholder="+7 ("></label>
          <label>Компания / объект<input name="company" placeholder="Необязательно"></label>
          <label>Комментарий<textarea name="comment" placeholder="Количество, сроки, ТЗ"></textarea></label>
          <label class="check"><input type="checkbox" required> Согласен на обработку персональных данных</label>
          <button class="btn btn-primary" type="submit">Отправить</button>
          <div class="form-ok">Заявка принята. Мы свяжемся с вами в ближайшее рабочее время.</div>
        </form>
      </div>
    </div>`;
  }

  function productCard(p) {
    const badge = p.badge ? `<span class="badge">${p.badge}</span>` : "";
    return `<article class="card">
      <a href="product.html?id=${p.id}" class="card-img-wrap">
        <div class="card-img"><img src="${p.image}" alt="${p.name}"></div>
        ${badge}
      </a>
      <div class="card-body">
        <span class="mono card-sku">${p.sku}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        ${p.sizes ? `<p class="note">${p.sizes}</p>` : ""}
        <div class="price">${p.price == null ? "по запросу" : money(p.price) + " <small>от</small>"}</div>
        <div class="product-actions">
          <a class="btn btn-ghost btn-sm" href="product.html?id=${p.id}">Подробнее</a>
          <button class="btn btn-copper btn-sm" data-open-request data-product="${p.name} [${p.sku}]">В заявку</button>
        </div>
      </div>
    </article>`;
  }

  function bindForms() {
    $$("[data-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const list = JSON.parse(localStorage.getItem("ms-leads") || "[]");
        list.push({ ...data, at: new Date().toISOString() });
        localStorage.setItem("ms-leads", JSON.stringify(list));
        const ok = form.querySelector(".form-ok");
        if (ok) ok.classList.add("show");
        form.reset();
      });
    });
  }

  function bindModal() {
    const modal = $("#request-modal");
    document.addEventListener("click", (e) => {
      const open = e.target.closest("[data-open-request]");
      if (open) {
        const product = open.getAttribute("data-product") || "";
        $("#request-product").value = product;
        $("#request-product-note").textContent = product
          ? `Позиция: ${product}`
          : "Опишите объект и объём — ответим в рабочее время.";
        modal.classList.add("open");
      }
      if (e.target === modal) modal.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") modal.classList.remove("open");
    });
  }

  function initShell(active) {
    const header = $("[data-header]");
    const footer = $("[data-footer]");
    if (header) header.innerHTML = headerHTML(active);
    if (footer) footer.innerHTML = footerHTML();
    document.body.insertAdjacentHTML("beforeend", modalHTML());
    $("#burger")?.addEventListener("click", () => $("#nav").classList.toggle("open"));
    bindForms();
    bindModal();
  }

  function renderHome() {
    const cats = $("#home-cats");
    if (cats) {
      cats.innerHTML = MS.categories
        .map(
          (c) => `<a class="cat" href="catalog.html?cat=${c.id}">
            <img src="${c.image}" alt="${c.name}">
            <div class="cat-body"><span class="mono">${c.short}</span><h3>${c.name}</h3></div>
          </a>`
        )
        .join("");
    }
    const hits = $("#home-hits");
    if (hits) {
      const featured = [];
      for (const cat of MS.categories) {
        const list = productsByCategory(cat.id);
        if (list[0]) featured.push(list[0]);
        if (featured.length >= 8) break;
      }
      hits.innerHTML = featured.map(productCard).join("");
    }
    const adv = $("#home-adv");
    if (adv) {
      adv.innerHTML = MS.advantages
        .map(
          (a, i) => `<div class="adv-item">
            <div class="mono n">0${i + 1}</div>
            <h3>${a.t}</h3>
            <p>${a.d}</p>
          </div>`
        )
        .join("");
    }
  }

  function renderCatalog() {
    const grid = $("#catalog-grid");
    if (!grid) return;
    const search = $("#search");
    const sort = $("#sort");
    const title = $("#cat-title");
    const lead = $("#cat-lead");
    const countEl = $("#cat-count");
    const filtersEl = $("#filters");
    const state = {
      cat: param("cat") || "all",
      color: "",
      badge: "",
      pmin: "",
      pmax: "",
      wmin: "",
      wmax: "",
      hmin: "",
      hmax: "",
      dmin: "",
      dmax: "",
    };

    const priced = MS.products.filter((p) => p.price != null).map((p) => p.price);
    const widths = MS.products.map((p) => p.width).filter(Boolean);
    const heights = MS.products.map((p) => p.height).filter(Boolean);
    const depths = MS.products.map((p) => p.length).filter(Boolean);
    const colors = [...new Set(MS.products.flatMap((p) => p.colors || []))].sort();
    const badges = [...new Set(MS.products.map((p) => p.badge).filter(Boolean))];

    function paintFilters() {
      filtersEl.innerHTML = `
        <h4>Раздел</h4>
        <select id="f-cat">
          <option value="all">Все разделы</option>
          ${MS.categories.map((c) => `<option value="${c.id}" ${state.cat === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
        </select>
        <h4>Цвет</h4>
        <select id="f-color">
          <option value="">Все цвета</option>
          ${colors.map((c) => `<option value="${c}" ${state.color === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
        <h4>Цена, ₽</h4>
        <div class="filter-row">
          <input id="f-pmin" type="number" min="0" placeholder="от" value="${state.pmin}">
          <input id="f-pmax" type="number" min="0" placeholder="до" value="${state.pmax}">
        </div>
        <h4>Ширина, мм</h4>
        <div class="filter-row">
          <input id="f-wmin" type="number" min="0" placeholder="от" value="${state.wmin}">
          <input id="f-wmax" type="number" min="0" placeholder="до" value="${state.wmax}">
        </div>
        <h4>Высота, мм</h4>
        <div class="filter-row">
          <input id="f-hmin" type="number" min="0" placeholder="от" value="${state.hmin}">
          <input id="f-hmax" type="number" min="0" placeholder="до" value="${state.hmax}">
        </div>
        <h4>Длина / глубина, мм</h4>
        <div class="filter-row">
          <input id="f-dmin" type="number" min="0" placeholder="от" value="${state.dmin}">
          <input id="f-dmax" type="number" min="0" placeholder="до" value="${state.dmax}">
        </div>
        <h4>Метка</h4>
        <select id="f-badge">
          <option value="">Все</option>
          ${badges.map((b) => `<option value="${b}" ${state.badge === b ? "selected" : ""}>${b}</option>`).join("")}
        </select>
        <button class="btn btn-ghost btn-sm" id="f-reset" type="button" style="width:100%;margin-top:16px">Сбросить фильтры</button>
      `;
    }

    function num(id) {
      const v = $(id)?.value;
      return v === "" || v == null ? null : Number(v);
    }

    function inRange(val, min, max) {
      if (val == null) return !(min || max);
      if (min != null && val < min) return false;
      if (max != null && val > max) return false;
      return true;
    }

    function draw() {
      const q = (search.value || "").toLowerCase().trim();
      let list = state.cat === "all" ? [...MS.products] : productsByCategory(state.cat);
      const pmin = num("#f-pmin");
      const pmax = num("#f-pmax");
      const wmin = num("#f-wmin");
      const wmax = num("#f-wmax");
      const hmin = num("#f-hmin");
      const hmax = num("#f-hmax");
      const dmin = num("#f-dmin");
      const dmax = num("#f-dmax");
      if (state.color) list = list.filter((p) => (p.colors || []).includes(state.color));
      if (state.badge) list = list.filter((p) => p.badge === state.badge);
      if (pmin != null || pmax != null) list = list.filter((p) => inRange(p.price, pmin, pmax));
      if (wmin != null || wmax != null) list = list.filter((p) => inRange(p.width, wmin, wmax));
      if (hmin != null || hmax != null) list = list.filter((p) => inRange(p.height, hmin, hmax));
      if (dmin != null || dmax != null) list = list.filter((p) => inRange(p.length, dmin, dmax));
      if (q) {
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.desc || "").toLowerCase().includes(q)
        );
      }
      if (sort.value === "price-asc") list.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
      if (sort.value === "price-desc") list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      if (sort.value === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      const cat = categoryById(state.cat);
      title.textContent = cat ? cat.name : "Каталог";
      lead.textContent = cat
        ? cat.text
        : "Полный каталог: фильтры по разделу, цвету, цене и размерам. Серийные партии и изготовление по ТЗ.";
      if (countEl) countEl.textContent = `Найдено: ${list.length}`;
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty">Ничего не найдено. Измените фильтры.</div>`;
    }

    function bindFilters() {
      $("#f-cat").addEventListener("change", (e) => {
        state.cat = e.target.value;
        const url = new URL(location.href);
        if (state.cat === "all") url.searchParams.delete("cat");
        else url.searchParams.set("cat", state.cat);
        history.replaceState(null, "", url);
        draw();
      });
      $("#f-color").addEventListener("change", (e) => {
        state.color = e.target.value;
        draw();
      });
      $("#f-badge").addEventListener("change", (e) => {
        state.badge = e.target.value;
        draw();
      });
      ["#f-pmin", "#f-pmax", "#f-wmin", "#f-wmax", "#f-hmin", "#f-hmax", "#f-dmin", "#f-dmax"].forEach((id) => {
        $(id).addEventListener("input", draw);
      });
      $("#f-reset").addEventListener("click", () => {
        state.cat = "all";
        state.color = "";
        state.badge = "";
        history.replaceState(null, "", "catalog.html");
        paintFilters();
        bindFilters();
        search.value = "";
        sort.value = "default";
        draw();
      });
    }

    paintFilters();
    bindFilters();
    search.addEventListener("input", draw);
    sort.addEventListener("change", draw);
    draw();
  }

  function renderProduct() {
    const root = $("#product");
    if (!root) return;
    const p = productById(param("id"));
    if (!p) {
      root.innerHTML = `<div class="empty">Товар не найден. <a href="catalog.html">Вернуться в каталог</a></div>`;
      return;
    }
    const cat = categoryById(p.category);
    const related = productsByCategory(p.category)
      .filter((x) => x.id !== p.id)
      .slice(0, 4);
    $("#crumbs").innerHTML = `<a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / <a href="catalog.html?cat=${cat.id}">${cat.name}</a> / ${p.sku}`;
    root.innerHTML = `
      <div class="product-gallery"><img src="${p.image}" alt="${p.name}"></div>
      <div>
        <p class="mono" style="color:var(--copper)">${p.sku}${p.badge ? " · " + p.badge : ""}</p>
        <h1>${p.name}</h1>
        ${p.desc ? `<p>${p.desc}</p>` : ""}
        <div class="price" style="font-size:1.6rem;margin-top:16px">${p.price == null ? "Цена по запросу" : money(p.price) + " <small>от, оптовая цена — по запросу</small>"}</div>
        <table class="spec">
          <tr><td>Артикул</td><td>${p.sku || "—"}</td></tr>
          <tr><td>Категория</td><td><a href="catalog.html?cat=${cat.id}">${cat.name}</a></td></tr>
          ${p.sizes ? `<tr><td>Габариты</td><td>${p.sizes}</td></tr>` : ""}
          ${p.material ? `<tr><td>Материалы</td><td>${p.material}</td></tr>` : ""}
          ${(p.colors || []).length ? `<tr><td>Декоры</td><td><span class="colors">${p.colors.map((c) => `<span class="color">${c}</span>`).join("")}</span></td></tr>` : ""}
        </table>
        <div class="product-actions">
          <button class="btn btn-primary" data-open-request data-product="${p.name} [${p.sku}]">Запросить коммерческое предложение</button>
          <a class="btn btn-ghost" href="catalog.html?cat=${cat.id}">В категорию</a>
        </div>
        <p class="note">Изготавливаем по ТЗ: размеры, комплектация, цвет каркаса и декор ЛДСП.</p>
      </div>`;
    const rel = $("#related");
    if (rel) rel.innerHTML = related.map(productCard).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    initShell(page === "product" ? "catalog" : page);
    if (page === "home") renderHome();
    if (page === "catalog") renderCatalog();
    if (page === "product") renderProduct();
  });
})();
