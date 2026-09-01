import { company } from "@/data/catalog";
import { absolute, SITE_URL } from "@/lib/site";

/**
 * Микроразметка выводится как обычный <script type="application/ld+json">.
 * Данные — наши собственные, внешнего ввода тут нет, поэтому сериализуем напрямую,
 * экранируя только `<`, чтобы содержимое не могло закрыть тег раньше времени.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legal,
  alternateName: company.name,
  url: SITE_URL,
  logo: absolute("/favicon.svg"),
  image: absolute("/images/og.png"),
  telephone: company.phones,
  email: company.email,
  taxID: company.inn,
  vatID: company.inn,
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressLocality: company.city,
    streetAddress: "ул. Гордеевская, 139Б",
    postalCode: "603116",
  },
  openingHours: "Mo-Fr 09:00-17:00",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: company.name,
  url: SITE_URL,
  inLanguage: "ru-RU",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: absolute("/catalog?q={search_term_string}") },
    "query-input": "required name=search_term_string",
  },
};
