import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const partsDir = resolve(root, "src/assets/process-image-v7");
const output = resolve(root, "public/assets/process-materials-final.webp");
const expectedBytes = 52_028;
const expectedSha256 = "0c6b6f7561e99f1b2afaa83ff52bc1f579df48ee43dd456cfc337fca8f425e7d";

const parts = [];
for (let index = 1; index <= 10; index += 1) {
  const name = `chunk${String(index).padStart(2, "0")}.b64`;
  parts.push((await readFile(resolve(partsDir, name), "utf8")).trim());
}

const buffer = Buffer.from(parts.join(""), "base64");
const sha256 = createHash("sha256").update(buffer).digest("hex");
const webpMagic = buffer.subarray(0, 4).toString("ascii") === "RIFF"
  && buffer.subarray(8, 12).toString("ascii") === "WEBP";

if (!webpMagic || buffer.length !== expectedBytes || sha256 !== expectedSha256) {
  throw new Error(
    `Invalid HomeEasy process image: ${buffer.length} bytes, sha256=${sha256}`,
  );
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Prepared verified process image: ${buffer.length} bytes, sha256=${sha256}`);
