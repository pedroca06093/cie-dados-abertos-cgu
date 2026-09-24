import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const base = "https://portaldatransparencia.gov.br/download-de-dados/";
const output = new URL("../out/", import.meta.url);
await mkdir(output, { recursive: true });
const manifest = { updatedAt: new Date().toISOString(), sources: {} };

for (const type of ["CEIS", "CNEP"]) {
  const slug = type.toLowerCase();
  const pageUrl = base + slug;
  const page = await fetch(pageUrl, { signal: AbortSignal.timeout(20000) });
  if (!page.ok) throw new Error(`${type}: catálogo respondeu HTTP ${page.status}`);
  const html = await page.text();
  const dates = html.split("\n").filter((line) => line.includes("arquivos.push(")).flatMap((line) => {
    const start = line.indexOf("arquivos.push(") + "arquivos.push(".length;
    const end = line.indexOf(")", start);
    try {
      const item = JSON.parse(line.slice(start, end));
      return item.origem === type && item.ano && item.mes && item.dia ? [item.ano + item.mes + item.dia] : [];
    } catch { return []; }
  }).sort().reverse();
  if (!dates.length) throw new Error(`${type}: data da fonte não encontrada`);
  const date = dates[0];
  const source = pageUrl + "/" + date;
  const response = await fetch(source, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`${type}: arquivo respondeu HTTP ${response.status}`);
  const zip = new Uint8Array(await response.arrayBuffer());
  if (zip.length < 100 || zip.length > 20000000 || zip[0] !== 0x50 || zip[1] !== 0x4b) throw new Error(`${type}: ZIP inválido`);
  await writeFile(new URL(`${slug}.zip`, output), zip);
  manifest.sources[type] = { date, source, sha256: createHash("sha256").update(zip).digest("hex"), bytes: zip.length };
  console.log(`${type}: ${date}, ${zip.length} bytes`);
}
await writeFile(new URL("manifest.json", output), JSON.stringify(manifest, null, 2) + "\n");
