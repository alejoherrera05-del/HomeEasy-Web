import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "src/assets/process-image/final-800.b64");
const output = resolve(root, "public/assets/process-materials-final.webp");

const encoded = (await readFile(source, "utf8")).trim();
const buffer = Buffer.from(encoded, "base64");
const webpMagic = buffer.subarray(0, 4).toString("ascii") === "RIFF"
  && buffer.subarray(8, 12).toString("ascii") === "WEBP";

if (!webpMagic || buffer.length < 40_000) {
  throw new Error(`Invalid HomeEasy process image: ${buffer.length} bytes`);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Prepared process image: ${buffer.length} bytes`);
