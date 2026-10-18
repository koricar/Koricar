/**
 * Import an Apify Encar dataset (JSON array) into the `cars` table.
 * Usage: pnpm --filter @workspace/api-server import:apify ./dataset.json [--mark-missing]
 *
 * --mark-missing: cars NOT in this file are set to "unavailable". Only use it when the file
 * is a full pull of the same filter (not an incremental one).
 */
import { readFileSync } from "node:fs";
import { importApifyItems } from "../lib/import-cars";

async function main() {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) throw new Error("usage: import-apify <dataset.json> [--mark-missing]");
  const items = JSON.parse(readFileSync(file, "utf8"));
  console.log(await importApifyItems(items, flags.includes("--mark-missing")));
  const { pool } = await import("@workspace/db");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
