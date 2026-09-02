import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { getCatalogProductId, productPath, replaceCatalogProductUrl } from "../src/productRouting.js";

const PUBLIC_ORIGIN = "https://homeeasy.com.co";
const PRODUCT_IDS = [
  "sheer-elegance",
  "vertesse",
  "enrollable-screen",
  "enrollable-blackout",
  "onda-serena",
  "panel-japones",
  "honeycell",
  "romana",
  "vertical",
  "viewtex",
  "classic-50",
  "mini-micro",
];
const requireBuiltArtifact = process.env.HOMEEASY_REQUIRE_DIST === "1";

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
const readBinary = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url));

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta\\s+(?:property|name)="${escaped}"\\s+content="([^"]+)"\\s*\\/?>`));
  assert.ok(match, `Missing metadata field: ${property}`);
  return match[1];
}

function canonicalHref(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/);
  assert.ok(match, "Missing canonical link");
  return match[1];
}

function jpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff, "Expected a JPEG signature");
  assert.equal(buffer[1], 0xd8, "Expected a JPEG signature");
  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (frameMarkers.has(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    assert.ok(segmentLength >= 2, "Invalid JPEG segment");
    offset += segmentLength + 2;
  }
  throw new Error("JPEG dimensions not found");
}

test("the home share card uses the real brand system and only verified service facts", async () => {
  const [html, source, socialImage] = await Promise.all([
    read("index.html"),
    read("public/assets/og-homeeasy-popayan-source.svg"),
    readBinary("public/assets/og-homeeasy-popayan.jpg"),
  ]);

  assert.equal(metaContent(html, "og:image"), `${PUBLIC_ORIGIN}/assets/og-homeeasy-popayan.jpg`);
  assert.equal(metaContent(html, "og:image:type"), "image/jpeg");
  assert.equal(metaContent(html, "og:image:width"), "1200");
  assert.equal(metaContent(html, "og:image:height"), "630");
  assert.deepEqual(jpegDimensions(socialImage), { width: 1200, height: 630 });
  assert.match(source, /#B2566C/i);
  assert.match(source, /#B48745/i);
  assert.match(source, /hommy-hero-approved\.png/);
  assert.match(source, /Visita sin costo/);
  assert.match(source, /Medición, fabricación/);
  assert.match(source, /\+57 333 431 9374/);
  assert.match(source, /Transversal 9 # 6N-26/);
  assert.match(source, /font-weight="400"/);
  assert.match(source, /font-size="54"/);
  assert.doesNotMatch(source, /font-size="(?:9|10|11|12|13)(?:\.|\")/);
  assert.doesNotMatch(source, /número 1|la mejor|líder|transforma tu espacio/iu);
});

test("all twelve systems keep product metadata while loading the existing catalogue", async () => {
  const sitemap = await read("public/sitemap.xml");

  for (const productId of PRODUCT_IDS) {
    const [html, socialSource, socialImage] = await Promise.all([
      read(`productos/${productId}/index.html`),
      read(`public/assets/og-products/${productId}.svg`),
      readBinary(`public/assets/og-products/${productId}.jpg`),
    ]);
    const canonical = `${PUBLIC_ORIGIN}/productos/${productId}/`;
    const socialUrl = `${PUBLIC_ORIGIN}/assets/og-products/${productId}.jpg`;

    assert.equal(canonicalHref(html), canonical);
    assert.equal(metaContent(html, "og:url"), canonical);
    assert.equal(metaContent(html, "og:image"), socialUrl);
    assert.equal(metaContent(html, "og:image:secure_url"), socialUrl);
    assert.equal(metaContent(html, "og:image:type"), "image/jpeg");
    assert.equal(metaContent(html, "og:image:width"), "1200");
    assert.equal(metaContent(html, "og:image:height"), "630");
    assert.equal(metaContent(html, "twitter:image"), socialUrl);
    assert.match(html, new RegExp(`data-catalog-product="${productId}"`));
    assert.match(html, /<div id="root"><\/div>/);
    assert.match(html, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
    assert.doesNotMatch(html, /product-hero|product-specification|Ver ficha completa|Compartir ficha/);
    assert.match(sitemap, new RegExp(`<loc>${canonical.replaceAll("/", "\\/")}<\\/loc>`));

    assert.match(socialSource, /Visita sin costo · Medición · Instalación/);
    assert.match(socialSource, /#B2566C/i);
    assert.doesNotMatch(socialSource, /#8E3E52/i);
    assert.match(socialSource, /fill="#F2F3F4" fill-opacity="\.98"/);
    assert.match(socialSource, /font-weight="400"/);
    assert.match(socialSource, /font-size="22"/);
    assert.doesNotMatch(socialSource, /font-size="(?:9|10|11|12|13)(?:\.|\")/);
    assert.doesNotMatch(socialSource, /número 1|la mejor|líder/iu);
    assert.deepEqual(jpegDimensions(socialImage), { width: 1200, height: 630 });
  }
});

test("the catalogue keeps each permanent product URL inside the same explorer", async () => {
  const [app, viteConfig, sharingStyles] = await Promise.all([
    read("src/App.jsx"),
    read("vite.config.mjs"),
    read("src/catalog-sharing-v18.css"),
  ]);

  assert.match(app, /Compartir este producto/);
  assert.match(app, /navigator\.share/);
  assert.match(app, /navigator\.clipboard/);
  assert.match(app, /https:\/\/homeeasy\.com\.co/);
  assert.match(app, /productIdFromCurrentLocation/);
  assert.match(app, /"\.catalog-mobile-selector"[\s\S]*?"\.product-explorer"/);
  assert.match(app, /window\.scrollTo\(\{ top: Math\.max\(0, targetTop\), behavior: "auto" \}\)/);
  assert.doesNotMatch(app, /Ver ficha completa/);
  assert.match(viteConfig, /productPageInputs/);
  assert.match(sharingStyles, /html\.is-product-direct-entry/);
  assert.match(sharingStyles, /scroll-snap-type: none !important/);
  assert.match(sharingStyles, /min-height: 44px/);
  assert.match(sharingStyles, /@media \(max-width: 760px\)/);
});

test("product routing selects and rewrites catalogue URLs without navigation", () => {
  assert.equal(productPath("sheer-elegance"), "/productos/sheer-elegance/");
  assert.equal(
    getCatalogProductId({ pathname: "/productos/honeycell/", search: "" }, PRODUCT_IDS),
    "honeycell",
  );
  assert.equal(
    getCatalogProductId({ pathname: "/", search: "?producto=romana" }, PRODUCT_IDS),
    "romana",
  );
  assert.equal(getCatalogProductId({ pathname: "/productos/no-existe/", search: "" }, PRODUCT_IDS), null);

  let replacedUrl = null;
  const fakeWindow = {
    location: {
      href: "https://homeeasy.com.co/?producto=romana#productos",
      pathname: "/",
      search: "?producto=romana",
      hash: "#productos",
    },
    history: {
      state: null,
      replaceState: (_state, _title, url) => { replacedUrl = url; },
    },
  };
  replaceCatalogProductUrl(fakeWindow, "romana");
  assert.equal(replacedUrl, "/productos/romana/");
});

test("the production build preserves every shareable product route", { skip: !requireBuiltArtifact }, async () => {
  for (const productId of PRODUCT_IDS) {
    const htmlPath = `dist/client/productos/${productId}/index.html`;
    const socialImagePath = `dist/client/assets/og-products/${productId}.jpg`;
    const [html, socialImage] = await Promise.all([read(htmlPath), readBinary(socialImagePath)]);
    assert.equal(canonicalHref(html), `${PUBLIC_ORIGIN}/productos/${productId}/`);
    assert.match(html, new RegExp(`data-catalog-product="${productId}"`));
    assert.match(html, /<div id="root"><\/div>/);
    assert.doesNotMatch(html, /product-hero|product-specification|Ver ficha completa/);
    assert.deepEqual(jpegDimensions(socialImage), { width: 1200, height: 630 });
  }
  await access(new URL("../dist/client/index.html", import.meta.url));
});
