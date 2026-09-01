import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const contact = await readFile(new URL("../src/components/ContactSection.jsx", import.meta.url), "utf8");

function parseAttributes(source) {
  const attributes = {};
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;

  for (const match of source.matchAll(attributePattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? "";
  }

  return attributes;
}

function htmlTags(tagName) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  return [...indexHtml.matchAll(pattern)].map((match) => parseAttributes(match[1]));
}

function metaContent(selector, value) {
  const meta = htmlTags("meta").find((attributes) => attributes[selector] === value);
  assert.ok(meta, `Missing <meta ${selector}="${value}">`);
  return meta.content;
}

function linkByRel(rel, predicate = () => true) {
  return htmlTags("link").find((attributes) => (
    attributes.rel?.split(/\s+/).includes(rel) && predicate(attributes)
  ));
}

function structuredDataNodes() {
  const scripts = [...indexHtml.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )].map((match) => JSON.parse(match[1]));
  const nodes = [];

  for (const value of scripts) {
    const queue = Array.isArray(value) ? [...value] : [value];
    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      nodes.push(node);
      if (Array.isArray(node["@graph"])) queue.push(...node["@graph"]);
    }
  }

  return nodes;
}

function hasSchemaType(node, type) {
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  return types.includes(type);
}

function openingTagWithClass(source, className) {
  const tags = source.match(/<[^>]+>/g) ?? [];
  return tags.find((tag) => new RegExp(
    `\\bclassName=["'][^"']*\\b${className}\\b[^"']*["']`,
  ).test(tag));
}

function assertNoSnippetContainer(source, className) {
  const tag = openingTagWithClass(source, className);
  assert.ok(tag, `Missing JSX container .${className}`);
  assert.match(
    tag,
    /\bdata-nosnippet(?:=(?:""|''|\{true\}|["']true["']))?(?=\s|\/?>)/,
    `.${className} must opt its repeated CTA labels out of Google snippets`,
  );
}

function parseSquareSize(value) {
  const match = /^(\d+)x(\d+)$/i.exec(value ?? "");
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width === height ? width : null;
}

function faviconPublicUrl(href) {
  let path = href.replace(/^%BASE_URL%/, "/");
  if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  path = decodeURIComponent(path).replace(/^\/+/, "");
  assert.ok(path && !path.includes(".."), `Unsafe or empty favicon path: ${href}`);
  return new URL(`../public/${path}`, import.meta.url);
}

async function assertDeclaredAssetExists(link) {
  assert.ok(link?.href, "Declared favicon link must include an href");
  const details = await stat(faviconPublicUrl(link.href));
  assert.ok(details.isFile() && details.size > 0, `${link.href} must resolve to a non-empty public file`);
}

test("the preferred Google site name is explicit and consistent", () => {
  const nodes = structuredDataNodes();
  const website = nodes.find((node) => hasSchemaType(node, "WebSite"));
  const localBusiness = nodes.find((node) => hasSchemaType(node, "LocalBusiness"));
  const canonical = linkByRel("canonical");

  assert.ok(website, "The home page must declare WebSite structured data");
  assert.equal(website.name, "HomeEasy");
  assert.ok(
    (Array.isArray(website.alternateName) ? website.alternateName : [website.alternateName])
      .includes("HomeEasy Popayán"),
    "WebSite.alternateName must include the local brand variant",
  );
  assert.equal(website.url, "https://homeeasy.com.co/");
  assert.equal(canonical?.href, website.url);
  assert.equal(metaContent("property", "og:site_name"), website.name);
  assert.equal(localBusiness?.name, website.name);
});

test("the search and social titles lead with the HomeEasy brand", () => {
  const title = indexHtml.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  assert.ok(title, "Missing document title");

  for (const [label, value] of [
    ["title", title],
    ["og:title", metaContent("property", "og:title")],
    ["twitter:title", metaContent("name", "twitter:title")],
  ]) {
    assert.match(value, /^HomeEasy\b/, `${label} must be brand-first`);
    assert.match(value, /persianas/i, `${label} must still describe the primary service`);
    assert.match(value, /Popayán/i, `${label} must retain the local search intent`);
  }

  assert.equal(metaContent("property", "og:title"), title);
  assert.equal(metaContent("name", "twitter:title"), title);
});

test("the meta description is a concrete branded trust summary", () => {
  const description = metaContent("name", "description");

  assert.match(description, /^HomeEasy\b/);
  for (const signal of [/Popayán/i, /persianas/i, /papel de colgadura/i, /asesor/i, /medici[oó]n/i, /instalaci[oó]n/i]) {
    assert.match(description, signal);
  }
  assert.ok(description.length >= 110 && description.length <= 170);
  assert.doesNotMatch(description, /Cotizar proyecto|Agendar visita sin costo|Hablar por WhatsApp/i);
});

test("favicon declarations provide SVG, raster, ICO, and touch fallbacks", async () => {
  const svg = linkByRel("icon", (link) => link.type === "image/svg+xml");
  const png = linkByRel("icon", (link) => link.type === "image/png");
  const ico = linkByRel("icon", (link) => link.type === "image/x-icon" || /\.ico(?:$|[?#])/i.test(link.href ?? ""));
  const touch = linkByRel("apple-touch-icon");

  assert.ok(svg, "Missing SVG favicon");
  assert.equal(svg.sizes, "any");
  assert.ok(png, "Missing raster favicon fallback");
  assert.ok(parseSquareSize(png.sizes) >= 48, "Raster favicon must declare a square size of at least 48px");
  assert.ok(ico, "Missing ICO favicon fallback");
  assert.ok(touch, "Missing apple-touch-icon fallback");
  assert.ok(parseSquareSize(touch.sizes) >= 180, "Touch icon must declare a square size of at least 180px");

  await Promise.all([svg, png, ico, touch].map(assertDeclaredAssetExists));
});

test("the repeated closing conversion labels are excluded from generated search snippets", () => {
  assertNoSnippetContainer(contact, "contact-v4-actions");
});
