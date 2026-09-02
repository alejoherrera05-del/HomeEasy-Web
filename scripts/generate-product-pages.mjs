#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appPath = path.join(root, "src", "App.jsx");
const publicDirectory = path.join(root, "public");
const productsDirectory = path.join(root, "productos");
const productSocialDirectory = path.join(publicDirectory, "assets", "og-products");
const publicOrigin = "https://homeeasy.com.co";
const lastModified = "2026-09-02";

const photo = (src, label, alt) => ({ type: "image", src, label, alt });
const officialVideo = (id, title, duration) => ({
  type: "video",
  id,
  title,
  duration,
  label: "Video oficial",
});

function readProductsFromApp(source) {
  const declaration = "const products = ";
  const start = source.indexOf(declaration);
  const nextDeclaration = source.indexOf("const recommenderQuestions", start);

  if (start < 0 || nextDeclaration < 0) {
    throw new Error("Could not locate the HomeEasy product catalogue in src/App.jsx");
  }

  const expressionStart = source.indexOf("[", start);
  const catalogueSource = source.slice(expressionStart, nextDeclaration);
  const expressionEnd = catalogueSource.lastIndexOf("];");
  if (expressionEnd < 0) throw new Error("Could not locate the end of the HomeEasy product catalogue");
  const expression = catalogueSource.slice(0, expressionEnd + 1);
  const loadCatalogue = Function("photo", "officialVideo", `return (${expression});`);
  const products = loadCatalogue(photo, officialVideo);

  if (!Array.isArray(products) || products.length !== 12) {
    throw new Error(`Expected 12 HomeEasy products, received ${products?.length ?? "none"}`);
  }

  return products;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonForHtml(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function mimeTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

function imageDimensions(buffer) {
  const isPng = buffer.length >= 24
    && buffer[0] === 0x89
    && buffer.toString("ascii", 1, 4) === "PNG";

  if (isPng) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (startOfFrameMarkers.has(marker)) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    if (segmentLength < 2) break;
    offset += segmentLength + 2;
  }

  return null;
}

async function primaryImageData(product) {
  const image = product.media.find((item) => item.type === "image");
  if (!image) throw new Error(`Product ${product.id} has no primary image`);

  const relativePath = image.src.replace(/^\//, "");
  const absolutePath = path.join(publicDirectory, relativePath);
  const buffer = await readFile(absolutePath);
  const dimensions = imageDimensions(buffer);

  return {
    ...image,
    absoluteUrl: `${publicOrigin}${image.src}`,
    mimeType: mimeTypeFor(absolutePath),
    dimensions,
  };
}

function productJsonLd(product, canonical, image) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonical}#producto`,
        name: product.name,
        description: product.short,
        image: [image.absoluteUrl],
        category: "Persianas y cortinas",
        url: canonical,
        brand: {
          "@type": "Brand",
          name: "Pentagrama",
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Ideal para", value: product.ideal },
          { "@type": "PropertyValue", name: "Materiales", value: product.material },
          { "@type": "PropertyValue", name: "Accionamiento", value: product.control },
          { "@type": "PropertyValue", name: "Sistema", value: product.system },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "HomeEasy",
            item: `${publicOrigin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Persianas en Popayán",
            item: `${publicOrigin}/persianas-popayan/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: canonical,
          },
        ],
      },
    ],
  };
}

function splitCardTitle(name) {
  const words = name.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > 15 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function splitCardFact(value) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > 29 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function productSocialCard(product, image, index) {
  const titleLines = splitCardTitle(product.name);
  const titleTspans = titleLines
    .map((line, lineIndex) => `<tspan x="48" dy="${lineIndex === 0 ? 0 : 46}">${escapeHtml(line)}</tspan>`)
    .join("");
  const factLines = splitCardFact(product.facts[0]);
  const factTspans = factLines
    .map((line, lineIndex) => `<tspan x="720" dy="${lineIndex === 0 ? 0 : 31}">${escapeHtml(line)}</tspan>`)
    .join("");
  const titleY = titleLines.length > 1 ? 544 : 554;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" style="display:block;width:100vw;height:100vh" role="img" aria-labelledby="title description">
  <title id="title">${escapeHtml(product.name)} · HomeEasy Popayán</title>
  <desc id="description">Vista previa HomeEasy con fotografía oficial de ${escapeHtml(product.name)}. Visita sin costo · Medición · Instalación en Popayán.</desc>
  <defs>
    <filter id="badge-shadow" x="-20%" y="-30%" width="140%" height="180%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#191919" flood-opacity=".16" />
    </filter>
    <linearGradient id="photo-shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".55" stop-color="#191919" stop-opacity="0" />
      <stop offset="1" stop-color="#191919" stop-opacity=".13" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#F2F3F4" />
  <image href="${escapeHtml(image.src)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" />
  <rect width="1200" height="458" fill="url(#photo-shade)" />

  <g filter="url(#badge-shadow)">
    <rect x="34" y="30" width="346" height="104" rx="3" fill="#F2F3F4" fill-opacity=".96" />
  </g>
  <g transform="translate(52 47) scale(.052)" fill="#B2566C">
    <path fill-rule="evenodd" d="M512 42 78 954h286V850h-92l240-548 240 548h-92v104h286L512 42Zm-45 570h90v180h-90V612Z" />
  </g>
  <text x="116" y="82" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="32" font-weight="400" letter-spacing="-1.4"><tspan fill="#B2566C">Home</tspan><tspan fill="#B48745">Easy</tspan></text>
  <text x="117" y="107" fill="#5C5654" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="14" font-weight="400" letter-spacing="1">PERSIANAS &amp; PAPEL DE COLGADURA</text>

  <rect x="0" y="458" width="1200" height="172" fill="#F2F3F4" fill-opacity=".98" />
  <rect x="0" y="458" width="1200" height="7" fill="#B2566C" />
  <text x="48" y="490" fill="#B2566C" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="17" font-weight="400" letter-spacing="1.7">${escapeHtml(product.tag.toUpperCase())}</text>
  <text x="48" y="${titleY}" fill="#191919" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="42" font-weight="400" letter-spacing="-1.7">${titleTspans}</text>

  <line x1="674" y1="490" x2="674" y2="602" stroke="#D2CDC8" stroke-width="1" />
  <text x="720" y="526" fill="#373331" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="22" font-weight="400">${factTspans}</text>
  <text x="720" y="599" fill="#B2566C" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="20" font-weight="400">Visita sin costo</text>
  <text x="1152" y="599" text-anchor="end" fill="#5C5654" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="16" font-weight="400">${String(index + 1).padStart(2, "0")} / 12</text>
</svg>
`;
}

function productPage(product, image) {
  const canonical = `${publicOrigin}/productos/${product.id}/`;
  const title = `${product.name} en Popayán | HomeEasy`;
  const description = `${product.short} Conoce materiales, accionamiento y usos con HomeEasy en Popayán.`;
  const socialImageUrl = `${publicOrigin}/assets/og-products/${product.id}.jpg`;
  const socialImageAlt = `Vista previa HomeEasy de ${product.name} con fotografía oficial del sistema`;

  return `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#B2566C" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" href="/assets/homeeasy-triangle-mark.svg" type="image/svg+xml" />
  <link rel="preload" href="${escapeHtml(image.src)}" as="image" />

  <meta property="og:type" content="product" />
  <meta property="og:locale" content="es_CO" />
  <meta property="og:site_name" content="HomeEasy" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${socialImageUrl}" />
  <meta property="og:image:secure_url" content="${socialImageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${socialImageUrl}" />
  <meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}" />

  <script type="application/ld+json">
${jsonForHtml(productJsonLd(product, canonical, image))}
  </script>
  <title>${escapeHtml(title)}</title>
</head>
<body data-catalog-product="${escapeHtml(product.id)}">
  <div id="root"></div>
  <noscript>Activa JavaScript para abrir ${escapeHtml(product.name)} dentro del catálogo HomeEasy.</noscript>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;
}

function sitemap(products, images) {
  const productEntries = products.map((product) => {
    const image = images.get(product.id);
    return `  <url>
    <loc>${publicOrigin}/productos/${product.id}/</loc>
    <lastmod>${lastModified}</lastmod>
    <image:image>
      <image:loc>${image.absoluteUrl}</image:loc>
    </image:image>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  <url>
    <loc>${publicOrigin}/</loc>
    <lastmod>${lastModified}</lastmod>
  </url>
  <url>
    <loc>${publicOrigin}/persianas-popayan/</loc>
    <lastmod>${lastModified}</lastmod>
    <image:image>
      <image:loc>${publicOrigin}/assets/pentagrama/sheer-elegance-room-official.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>${publicOrigin}/assets/pentagrama/screen-office-official.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>${publicOrigin}/assets/pentagrama/blackout-bedroom-official.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>${publicOrigin}/papel-de-colgadura-popayan/</loc>
    <lastmod>${lastModified}</lastmod>
    <image:image>
      <image:loc>${publicOrigin}/assets/wallpaper-room.jpg</image:loc>
    </image:image>
  </url>
${productEntries}
</urlset>
`;
}

const appSource = await readFile(appPath, "utf8");
const products = readProductsFromApp(appSource);
const images = new Map();

await mkdir(productsDirectory, { recursive: true });
await mkdir(productSocialDirectory, { recursive: true });

for (const [index, product] of products.entries()) {
  const image = await primaryImageData(product);
  images.set(product.id, image);
  await writeFile(
    path.join(productSocialDirectory, `${product.id}.svg`),
    productSocialCard(product, image, index),
    "utf8",
  );
  const outputDirectory = path.join(productsDirectory, product.id);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), productPage(product, image), "utf8");
}

await writeFile(path.join(publicDirectory, "sitemap.xml"), sitemap(products, images), "utf8");
console.log(`Generated ${products.length} product pages and sitemap.xml`);
