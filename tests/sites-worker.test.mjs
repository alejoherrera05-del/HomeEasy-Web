import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static HTML and assets with their original responses", async () => {
  for (const [pathname, contentType] of [
    ["/", "text/html"],
    ["/productos/sheer-elegance/", "text/html"],
    ["/persianas-popayan/", "text/html"],
    ["/assets/app.js", "application/javascript"],
  ]) {
    const calls = [];
    const response = await worker.fetch(new Request(`https://example.test${pathname}`), {
      ASSETS: {
        fetch: async (request) => {
          calls.push(new URL(request.url).pathname);
          return new Response("asset", { status: 200, headers: { "content-type": contentType } });
        },
      },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), contentType);
    assert.deepEqual(calls, [pathname]);
  }
});

test("unknown product pages and other missing paths remain genuine 404s", async () => {
  for (const pathname of [
    "/productos/no-existe/",
    "/flow/step-two?source=share",
    "/assets/missing.jpg",
    "/api/missing",
  ]) {
    const calls = [];
    const request = new Request(`https://example.test${pathname}`, { headers: { accept: "text/html" } });
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async (req) => {
          calls.push(new URL(req.url).pathname + new URL(req.url).search);
          return new Response("Not found", { status: 404 });
        },
      },
    });
    assert.equal(response.status, 404);
    assert.equal(await response.text(), "Not found");
    assert.deepEqual(calls, [new URL(request.url).pathname + new URL(request.url).search]);
  }
});

test("forwards original HTTP methods and requests, without translating them", async () => {
  for (const method of ["HEAD", "POST"]) {
    const request = new Request("https://example.test/api/item", { method });
    let forwardedMethod = "";
    const response = await worker.fetch(request, {
      ASSETS: { fetch: async (req) => {
        forwardedMethod = req.method;
        return new Response(null, { status: 405 });
      } },
    });
    assert.equal(forwardedMethod, method);
    assert.equal(response.status, 405);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
