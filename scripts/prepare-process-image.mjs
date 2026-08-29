import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const partsDir = resolve(root, "src/assets/process-image");
const output = resolve(root, "public/assets/process-materials-final.webp");

const parts = [];
for (let index = 1; index <= 8; index += 1) {
  const name = `part${String(index).padStart(2, "0")}.b64`;
  parts.push((await readFile(resolve(partsDir, name), "utf8")).trim());
}

const buffer = Buffer.from(parts.join(""), "base64");
const webpMagic = buffer.subarray(0, 4).toString("ascii") === "RIFF"
  && buffer.subarray(8, 12).toString("ascii") === "WEBP";

if (!webpMagic || buffer.length < 30_000) {
  throw new Error(`Invalid HomeEasy process image: ${buffer.length} bytes`);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Prepared process image: ${buffer.length} bytes`);
