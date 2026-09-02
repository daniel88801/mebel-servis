/**
 * Иконки типов объектов для раздела «Кому поставляем».
 * Тонкая линия в одну ширину, чтобы не спорить с фотографиями каталога.
 */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ClientIcons = {
  army: (
    <svg {...base}>
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.6 7.5 10 4.3-1.4 7.5-5.4 7.5-10v-6L12 2.5Z" />
      <path d="m9.5 11.5 2 2 3.5-4" />
    </svg>
  ),
  dorms: (
    <svg {...base}>
      <path d="M3.5 21h17M5.5 21V6l6.5-3 6.5 3v15" />
      <path d="M9.5 9.5h1.5M13 9.5h1.5M9.5 13h1.5M13 13h1.5" />
      <path d="M10 21v-4h4v4" />
    </svg>
  ),
  education: (
    <svg {...base}>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
      <path d="M6.5 10.8V16c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-5.2" />
      <path d="M21.5 8.5v5" />
    </svg>
  ),
  social: (
    <svg {...base}>
      <path d="M4 20V9.5L12 4l8 5.5V20" />
      <path d="M3 20h18" />
      <path d="M12 10.5v5M9.5 13h5" />
    </svg>
  ),
  industrial: (
    <svg {...base}>
      <path d="M3 21V11l5 3.5V11l5 3.5V11l5 3.5V21H3Z" />
      <path d="M18 11V4h3v17" />
      <path d="M2 21h20" />
    </svg>
  ),
  hotels: (
    <svg {...base}>
      <path d="M3 19v-7.5h13a4 4 0 0 1 4 4V19" />
      <path d="M3 19v2M21 19v2M3 11.5V6" />
      <path d="M6.5 11.5V9h4.5v2.5" />
    </svg>
  ),
};
