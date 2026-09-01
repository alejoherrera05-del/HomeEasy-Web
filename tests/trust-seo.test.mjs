import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const PUBLIC_ORIGIN = "https://homeeasy.com.co/";
const requireBuiltArtifact = process.env.HOMEEASY_REQUIRE_DIST === "1";
const builtArtifactAvailable = await access(new URL("../dist/client/index.html", import.meta.url))
  .then(() => true)
  .catch(() => false);

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
  return JSON.parse(match[1]);
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
  assert.equal(metaContent(html, "og:image"), `${PUBLIC_ORIGIN}assets/homeeasy-hero-room.jpg`);
  assert.equal(metaContent(html, "twitter:image"), `${PUBLIC_ORIGIN}assets/homeeasy-hero-room.jpg`);
  assert.match(robots, /^Sitemap: https:\/\/homeeasy\.com\.co\/sitemap\.xml$/m);
  assert.match(sitemap, /<loc>https:\/\/homeeasy\.com\.co\/<\/loc>/);
  for (const content of [html, robots, sitemap]) assert.doesNotMatch(content, /alejoherrera05-del\.github\.io|\/HomeEasy-Web\//);
  assert.equal(cname.trim(), "homeeasy.com.co");
  assert.match(workflow, /vite build --base=\//);
  assert.doesNotMatch(workflow, /--base=\/HomeEasy-Web\//);
});

test("local business metadata has a stable identity and complete image text", async () => {
  const html = await read("index.html");
  const business = localBusinessJson(html);
  assert.equal(business["@type"], "LocalBusiness");
  assert.equal(business["@id"], `${PUBLIC_ORIGIN}#negocio`);
  assert.equal(business.url, PUBLIC_ORIGIN);
  assert.equal(business.telephone, "+573334319374");
  assert.equal(business.address.addressLocality, "Popayán");
  assert.equal(metaContent(html, "twitter:image:alt"), "Ambiente HomeEasy con persianas en un ventanal contemporáneo");
});

test("the built Pages artifact preserves the domain and visible local contact data", { skip: !requireBuiltArtifact && !builtArtifactAvailable }, async () => {
  const [html, cname, assetNames] = await Promise.all([
    read("dist/client/index.html"),
    read("dist/client/CNAME"),
    readdir(new URL("../dist/client/assets/", import.meta.url)),
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
});

test("the visible closing section exposes complete local contact routes", async () => {
  const contact = await read("src/components/ContactSection.jsx");
  assert.match(contact, /Persianas bien elegidas, medidas e instaladas\./);
  assert.match(contact, /Agendar visita sin costo/);
  assert.match(contact, /Hablar por WhatsApp/);
  assert.match(contact, /href="tel:\+573334319374"/);
  assert.match(contact, /Transversal 9 # 6N-26/);
  assert.match(contact, /Popayán, Cauca/);
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
