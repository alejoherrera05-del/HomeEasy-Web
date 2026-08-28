import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getAdjacentProductId } from "../src/components/catalogNavigation.js";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
const ci = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

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
