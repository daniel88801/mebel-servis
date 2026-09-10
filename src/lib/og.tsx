import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export const ogSize = { width: 1200, height: 630 };
export const ogType = "image/jpeg";

/**
 * ImageResponse умеет отдавать только PNG, а PNG без потерь для фотографии
 * весит около мегабайта. Пережимаем в JPEG — та же картинка укладывается
 * примерно в 150 КБ. Цветовую субдискретизацию не включаем: иначе медный
 * акцент на тексте расползается цветной каймой.
 */
async function toJpeg(image: ImageResponse) {
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png)
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": ogType,
      // Превью для конкретного адреса не меняется до следующей выкатки.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

const fontsDir = join(process.cwd(), "public/og-fonts");
const publicDir = join(process.cwd(), "public");

async function loadFonts() {
  const [unbounded, manrope] = await Promise.all([
    readFile(join(fontsDir, "Unbounded.ttf")),
    readFile(join(fontsDir, "Manrope.ttf")),
  ]);
  return [
    { name: "Unbounded", data: unbounded, weight: 700 as const, style: "normal" as const },
    { name: "Manrope", data: manrope, weight: 500 as const, style: "normal" as const },
  ];
}

export async function fileToDataUri(publicPath: string) {
  const rel = publicPath.replace(/^\//, "");
  const abs = join(publicDir, rel);
  if (!existsSync(abs)) return null;
  const buf = await readFile(abs);
  const ext = rel.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function ogScene({
  photo,
  kicker,
  title,
}: {
  photo: string;
  kicker: string;
  title: string;
}) {
  const src = (await fileToDataUri(photo)) ?? (await fileToDataUri("/images/og/home.jpg"));
  return toJpeg(
    new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          background: "#111111",
          color: "#f2f1ed",
        }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.62) 52%, rgba(17,17,17,0.22) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: "#c45c32",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            width: 760,
            height: 630,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c45c32",
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Unbounded",
                fontSize: title.length > 28 ? 52 : 64,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                fontFamily: "Manrope",
                fontSize: 24,
                color: "#d5d4cf",
              }}
            >
              Мебель-Сервис · Нижний Новгород
            </div>
          </div>
        </div>
      </div>,
      { ...ogSize, fonts: await loadFonts() },
    ),
  );
}

export async function ogProduct({
  photo,
  kicker,
  title,
  sku,
  price,
}: {
  photo: string;
  kicker: string;
  title: string;
  sku: string;
  price: string;
}) {
  const src = (await fileToDataUri(photo)) ?? (await fileToDataUri("/images/og/catalog.jpg"));
  const short = title.length > 72 ? `${title.slice(0, 70)}…` : title;
  return toJpeg(
    new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#f2f1ed",
          color: "#111111",
        }}
      >
        <div
          style={{
            width: 620,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e8e7e3",
            borderRight: "2px solid #111111",
          }}
        >
          {src ? (
            <img src={src} alt="" width={540} height={540} style={{ objectFit: "contain" }} />
          ) : null}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 48px 48px 44px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontSize: 20,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#c45c32",
            }}
          >
            {kicker}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Manrope",
                fontSize: 22,
                color: "#55534e",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {sku}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Unbounded",
                fontSize: short.length > 42 ? 36 : 44,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
              }}
            >
              {short}
            </div>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                fontFamily: "Unbounded",
                fontSize: 36,
                color: "#c45c32",
              }}
            >
              {price}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontSize: 20,
              color: "#55534e",
            }}
          >
            Мебель-Сервис · Нижний Новгород
          </div>
        </div>
      </div>,
      { ...ogSize, fonts: await loadFonts() },
    ),
  );
}
