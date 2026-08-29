import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getAdjacentProductId } from "../src/components/catalogNavigation.js";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
const baseStyles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const ci = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

function extractCssBlock(source, header, startAt = 0) {
  const headerIndex = source.indexOf(header, startAt);
  assert.ok(headerIndex >= 0, `Missing CSS block: ${header}`);
  const openIndex = source.indexOf("{", headerIndex);
  assert.ok(openIndex >= 0, `Missing opening brace for: ${header}`);
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openIndex + 1, index);
  }
  assert.fail(`Missing closing brace for: ${header}`);
}

function cssRules(source) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1].split(",").map((item) => item.trim()),
    declarations: match[2],
  }));
}

function cssRule(source, selector) {
  const rules = cssRules(source).filter((rule) => rule.selectors.includes(selector));
  assert.ok(rules.length > 0, `Missing CSS rule: ${selector}`);
  return rules.at(-1).declarations;
}

function cssDeclaration(rule, property) {
  const declaration = rule
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${property}:`));
  assert.ok(declaration, `Missing ${property} declaration`);
  return declaration.slice(declaration.indexOf(":") + 1).trim();
}

function firstNumber(value, unit) {
  const match = value.match(new RegExp(`(-?\\d+(?:\\.\\d+)?)${unit}`));
  assert.ok(match, `Expected a ${unit} value in: ${value}`);
  return Number(match[1]);
}

function cssLengthPx(value) {
  if (value === "0") return 0;
  return firstNumber(value, "px");
}

test("the mobile catalogue suite is part of pull request CI", () => {
  assert.match(ci, /name:\s*Test mobile catalog[\s\S]*?run:\s*pnpm run test:catalog/);
});

test("mobile product arrows wrap inside the active filtered set", () => {
  const items = [{ id: "one" }, { id: "two" }, { id: "three" }];
  assert.equal(getAdjacentProductId(items, "one", -1), "three");
  assert.equal(getAdjacentProductId(items, "three", 1), "one");
  assert.equal(getAdjacentProductId(items.slice(0, 1), "one", 1), "one");
  assert.equal(getAdjacentProductId([], "one", 1), null);
});

test("the catalogue exposes one accessible mobile selector and a native picker", () => {
  assert.match(app, /className="catalog-mobile-selector"/);
  assert.match(app, /aria-haspopup="dialog"/);
  assert.match(app, /<dialog[\s\S]*?id="catalog-product-picker"/);
  assert.match(app, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(app, /className="visually-hidden">\{selected\.name\},/);
  assert.match(app, /aria-pressed=\{filter === value\}/);
  assert.doesNotMatch(app, /className="product-explorer" aria-live=/);
});

test("mobile hides the duplicate family rail and keeps gallery labels readable", () => {
  assert.match(styles, /@media \(max-width: 760px\),[\s\S]*?\.catalog-list\s*\{\s*display:\s*none/);
  assert.match(styles, /max-width: 900px\) and \(max-height: 650px\) and \(hover: none\) and \(pointer: coarse\)/);
  assert.match(styles, /\.product-filters button\s*\{[\s\S]*?min-height:\s*44px[\s\S]*?font-size:\s*14px/);
  assert.match(styles, /\.media-thumbnails button\s*\{[\s\S]*?width:\s*100px[\s\S]*?flex:\s*0 0 100px/);
  assert.match(styles, /\.media-thumbnails button > span:last-child\s*\{[\s\S]*?font-size:\s*12px/);
  assert.match(styles, /\.video-slide p span,[\s\S]*?\.gallery-badge\s*\{\s*font-size:\s*12px/);
  assert.match(styles, /\.video-slide p strong\s*\{\s*font-size:\s*14px/);
  assert.match(styles, /scroll-snap-type:\s*x mandatory/);
});

test("Hommy and the catalogue meet with measured spacing and no negative-margin patch", () => {
  const recommenderRule = cssRule(styles, ".recommender");
  assert.equal(cssLengthPx(cssDeclaration(recommenderRule, "padding-block-end")), 0);

  const desktopEditorialStart = baseStyles.indexOf("/* HOMEEASY_EDITORIAL_REFINEMENT_2026 */");
  const desktopEditorialEnd = baseStyles.indexOf("@media (max-width: 1050px)", desktopEditorialStart);
  assert.ok(desktopEditorialStart >= 0 && desktopEditorialEnd > desktopEditorialStart);
  const desktopSectionRule = cssRule(
    baseStyles.slice(desktopEditorialStart, desktopEditorialEnd),
    ".section-shell",
  );
  const desktopGap = firstNumber(cssDeclaration(desktopSectionRule, "padding-block"), "px");
  assert.ok(desktopGap >= 96 && desktopGap <= 128, `desktop gap was ${desktopGap}px`);

  const handoffStart = styles.indexOf("/* HERO → HOMMY");
  assert.ok(handoffStart >= 0);
  const mobileHandoff = extractCssBlock(styles, "@media (max-width: 760px),", handoffStart);
  const mobileProductsRule = cssRule(mobileHandoff, ".products");
  const mobileGap = firstNumber(cssDeclaration(mobileProductsRule, "padding-top"), "px");
  assert.ok(mobileGap >= 64 && mobileGap <= 88, `mobile gap was ${mobileGap}px`);

  const spacingRules = cssRules(styles).filter(({ selectors }) => selectors.some((selector) => [
    ".recommender",
    ".recommender + .products",
    ".products",
  ].includes(selector)));
  for (const { declarations } of spacingRules) {
    assert.doesNotMatch(declarations, /\bmargin(?:-[\w-]+)?\s*:\s*-\d/);
  }
});

test("only the catalogue heading receives the subtle viewport entry", () => {
  const productsSource = app.slice(app.indexOf("function Products("), app.indexOf("function Wallpaper("));
  assert.match(productsSource, /<section[\s\S]*?id="productos"[\s\S]*?ref=\{[^}]+\}/);
  assert.match(productsSource, /is-catalog-heading-visible/);
  assert.match(productsSource, /catalog-entry-heading/);
  assert.match(productsSource, /IntersectionObserver/);
  assert.match(productsSource, /entry\.boundingClientRect\.top\s*>\s*0/);
  assert.doesNotMatch(productsSource, /ScrollTrigger/);

  const reducedMotionStart = styles.indexOf("@media (prefers-reduced-motion: reduce)");
  assert.ok(reducedMotionStart >= 0);
  const motionStyles = styles.slice(0, reducedMotionStart);
  const heading = cssRule(motionStyles, ".catalog-entry-heading");
  const visibleHeading = cssRule(motionStyles, ".products.is-catalog-heading-visible .catalog-entry-heading");
  assert.equal(cssDeclaration(heading, "opacity"), "0");
  const offset = firstNumber(cssDeclaration(heading, "transform"), "px");
  const duration = firstNumber(cssDeclaration(heading, "transition"), "ms");
  assert.ok(offset >= 12 && offset <= 16, `catalogue offset was ${offset}px`);
  assert.ok(duration >= 400 && duration <= 500, `catalogue duration was ${duration}ms`);
  assert.doesNotMatch(heading, /\bfilter\s*:|\bscale\(/);
  assert.equal(cssDeclaration(visibleHeading, "opacity"), "1");
  assert.equal(cssDeclaration(visibleHeading, "transform"), "translateY(0)");

  const revealTargets = cssRules(styles)
    .flatMap(({ selectors }) => selectors)
    .filter((selector) => selector.includes("is-catalog-heading-visible"));
  assert.deepEqual([...new Set(revealTargets)], [
    ".products.is-catalog-heading-visible .catalog-entry-heading",
  ]);

  const reducedMotion = extractCssBlock(styles, "@media (prefers-reduced-motion: reduce)");
  const reducedHeading = cssRule(reducedMotion, ".catalog-entry-heading");
  assert.equal(cssDeclaration(reducedHeading, "opacity"), "1");
  assert.equal(cssDeclaration(reducedHeading, "transform"), "none");
  assert.equal(cssDeclaration(reducedHeading, "transition"), "none");
});
