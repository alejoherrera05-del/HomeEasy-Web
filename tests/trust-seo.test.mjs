import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const PUBLIC_ORIGIN = "https://homeeasy.com.co/";
const requireBuiltArtifact = process.env.HOMEEASY_REQUIRE_DIST === "1";
const builtArtifactAvailable = await access(new URL("../dist/client/index.html", import.meta.url))
  .then(() => true)
  .catch(() => false);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

function localBusinessJson(html) {
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, "Missing LocalBusiness JSON-LD");
  const data = JSON.parse(match[1]);
  if (!Array.isArray(data["@graph"])) return data;
  const business = data["@graph"].find((node) => node["@id"] === `${PUBLIC_ORIGIN}#negocio`);
  assert.ok(business, "Missing business node in JSON-LD graph");
  return business;
}

test("the custom domain is the only canonical public origin", async () => {
  const [html, robots, sitemap, cname, workflow] = await Promise.all([
    read("index.html"),
    read("public/robots.txt"),
    read("public/sitemap.xml"),
    read("public/CNAME"),
    read(".github/workflows/deploy-staging-pages.yml"),
  ]);

  assert.equal(canonicalHref(html), PUBLIC_ORIGIN);
  assert.equal(metaContent(html, "og:url"), PUBLIC_ORIGIN);
  assert.equal(metaContent(html, "og:image"), `${PUBLIC_ORIGIN}assets/og-homeeasy-popayan.jpg`);
  assert.equal(metaContent(html, "twitter:image"), `${PUBLIC_ORIGIN}assets/og-homeeasy-popayan.jpg`);
  assert.match(robots, /^Sitemap: https:\/\/homeeasy\.com\.co\/sitemap\.xml$/m);
  assert.match(sitemap, /<loc>https:\/\/homeeasy\.com\.co\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/homeeasy\.com\.co\/persianas-popayan\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/homeeasy\.com\.co\/papel-de-colgadura-popayan\/<\/loc>/);
  assert.match(sitemap, /<image:loc>https:\/\/homeeasy\.com\.co\/assets\//);
  for (const content of [html, robots, sitemap]) assert.doesNotMatch(content, /alejoherrera05-del\.github\.io|\/HomeEasy-Web\//);
  assert.equal(cname.trim(), "homeeasy.com.co");
  assert.match(workflow, /pnpm run build/);
  assert.doesNotMatch(workflow, /--base=\/HomeEasy-Web\//);
});

test("local business metadata has a stable identity and complete image text", async () => {
  const html = await read("index.html");
  const business = localBusinessJson(html);
  assert.ok(Array.isArray(business["@type"]));
  assert.ok(business["@type"].includes("LocalBusiness"));
  assert.equal(business["@id"], `${PUBLIC_ORIGIN}#negocio`);
  assert.equal(business.url, PUBLIC_ORIGIN);
  assert.equal(business.telephone, "+573334319374");
  assert.equal(business.address.addressLocality, "Popayán");
  assert.equal(metaContent(html, "twitter:image:alt"), "Hommy de HomeEasy en un ambiente interior con datos de visita, medición e instalación");
  assert.equal(business.image, `${PUBLIC_ORIGIN}assets/og-homeeasy-popayan.jpg`);
});

test("local service pages are crawlable, canonical, and useful without JavaScript", async () => {
  const pages = [
    {
      path: "public/persianas-popayan/index.html",
      canonical: `${PUBLIC_ORIGIN}persianas-popayan/`,
      heading: /<h1[^>]*>\s*Persianas a medida\s*<span>en Popayán<\/span>/,
    },
    {
      path: "public/papel-de-colgadura-popayan/index.html",
      canonical: `${PUBLIC_ORIGIN}papel-de-colgadura-popayan/`,
      heading: /<h1[^>]*>\s*Papel de colgadura\s*<span>en Popayán<\/span>/,
    },
  ];

  for (const page of pages) {
    const html = await read(page.path);
    assert.equal(canonicalHref(html), page.canonical);
    assert.match(html, page.heading);
    assert.match(html, /Transversal 9 # 6N-26/);
    assert.match(html, /\+57 333 431 9374/);
    assert.match(html, /<main/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
  }

  const blindsPage = await read("public/persianas-popayan/index.html");
  assert.match(blindsPage, /Información de sistemas e imágenes basada en catálogos oficiales Pentagrama/);
});

test("the image sitemap only associates images that appear on each page", async () => {
  const sitemap = await read("public/sitemap.xml");
  const entries = [
    {
      canonical: `${PUBLIC_ORIGIN}persianas-popayan/`,
      htmlPath: "public/persianas-popayan/index.html",
      images: [
        "assets/pentagrama/sheer-elegance-room-official.jpg",
        "assets/pentagrama/screen-office-official.jpg",
        "assets/pentagrama/blackout-bedroom-official.jpg",
      ],
    },
    {
      canonical: `${PUBLIC_ORIGIN}papel-de-colgadura-popayan/`,
      htmlPath: "public/papel-de-colgadura-popayan/index.html",
      images: ["assets/wallpaper-room.jpg"],
    },
  ];

  assert.equal((sitemap.match(/<url>/g) ?? []).length, 15);
  assert.equal((sitemap.match(/<\/url>/g) ?? []).length, 15);

  for (const entry of entries) {
    const html = await read(entry.htmlPath);
    const urlBlock = sitemap.match(new RegExp(`<url>\\s*<loc>${escapeRegExp(entry.canonical)}<\\/loc>[\\s\\S]*?<\\/url>`));
    assert.ok(urlBlock, `Missing sitemap block for ${entry.canonical}`);

    for (const imagePath of entry.images) {
      assert.match(urlBlock[0], new RegExp(`<image:loc>${escapeRegExp(PUBLIC_ORIGIN + imagePath)}<\\/image:loc>`));
      assert.match(html, new RegExp(`(?:src|content)="/${escapeRegExp(imagePath)}"`));
      await access(new URL(`../public/${imagePath}`, import.meta.url));
    }
  }
});

test("the built Pages artifact preserves the domain and visible local contact data", { skip: !requireBuiltArtifact && !builtArtifactAvailable }, async () => {
  const [html, cname, assetNames, blindsPage, wallpaperPage] = await Promise.all([
    read("dist/client/index.html"),
    read("dist/client/CNAME"),
    readdir(new URL("../dist/client/assets/", import.meta.url)),
    read("dist/client/persianas-popayan/index.html"),
    read("dist/client/papel-de-colgadura-popayan/index.html"),
  ]);
  assert.equal(canonicalHref(html), PUBLIC_ORIGIN);
  assert.equal(localBusinessJson(html)["@id"], `${PUBLIC_ORIGIN}#negocio`);
  assert.equal(cname.trim(), "homeeasy.com.co");
  assert.match(html, /src="\/assets\/[^"/]+\.js"/);
  assert.doesNotMatch(html, /\/HomeEasy-Web\//);

  const bundleName = assetNames.find((name) => /^index-.*\.js$/.test(name));
  assert.ok(bundleName, "Missing built JavaScript bundle");
  const bundle = await read(`dist/client/assets/${bundleName}`);
  assert.match(bundle, /\+57 333 431 9374/);
  assert.match(bundle, /Transversal 9 # 6N-26/);
  assert.match(bundle, /Agendar visita sin costo/);
  assert.equal(canonicalHref(blindsPage), `${PUBLIC_ORIGIN}persianas-popayan/`);
  assert.equal(canonicalHref(wallpaperPage), `${PUBLIC_ORIGIN}papel-de-colgadura-popayan/`);
  await access(new URL("../dist/client/seo-local.css", import.meta.url));
});

test("the visible closing section exposes complete local contact routes", async () => {
  const contact = await read("src/components/ContactSection.jsx");
  assert.match(contact, /Persianas bien elegidas, medidas e instaladas\./);
  assert.match(contact, /Agendar visita sin costo/);
  assert.match(contact, /Hablar por WhatsApp/);
  assert.match(contact, /href="tel:\+573334319374"/);
  assert.match(contact, /Transversal 9 # 6N-26/);
  assert.match(contact, /Popayán, Cauca/);
  assert.match(contact, /href="\/persianas-popayan\/"/);
  assert.match(contact, /href="\/papel-de-colgadura-popayan\/"/);
});

test("mobile navigation and reduced motion keep their accessible behavior", async () => {
  const [app, styles, fixes] = await Promise.all([
    read("src/App.jsx"),
    read("src/styles.css"),
    read("src/visual-qa-fixes.css"),
  ]);
  assert.match(app, /aria-controls="main-navigation"/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(styles, /\.menu-button \{[^}]*min-width: 44px;[^}]*min-height: 44px;/s);
  assert.match(fixes, /\.hero-actions \.button \{ min-height: 44px;/);
  assert.match(fixes, /\.hero-sticky > \.stage-track button \{ min-height: 44px;/);
});
