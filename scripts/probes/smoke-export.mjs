#!/usr/bin/env node
import fs from "fs/promises";
import os from "os";
import path from "path";
import { runExport } from "../../dist/index.js";

const makeTempDir = async () => fs.mkdtemp(path.join(os.tmpdir(), "apple-notes-export-"));

const runOnce = async (label) => {
  const dir = await makeTempDir();
  const started = Date.now();
  await runExport({ targetDir: dir, includeAttachments: true, force: true });
  const elapsedMs = Date.now() - started;
  return { label, dir, elapsedMs };
};

const compareFiles = async (aDir, bDir) => {
  const readFileMap = async (dir) => {
    const entries = [];
    const walk = async (rel = "") => {
      const full = path.join(dir, rel);
      const items = await fs.readdir(full, { withFileTypes: true });
      for (const item of items) {
        const nextRel = path.join(rel, item.name);
        if (item.isDirectory()) {
          await walk(nextRel);
        } else if (item.isFile()) {
          const data = await fs.readFile(path.join(dir, nextRel));
          entries.push({ path: nextRel, size: data.length, hash: data.toString("base64") });
        }
      }
    };
    await walk("");
    entries.sort((x, y) => x.path.localeCompare(y.path));
    return entries;
  };

  const a = await readFileMap(aDir);
  const b = await readFileMap(bDir);
  const same =
    a.length === b.length &&
    a.every((entry, idx) => entry.path === b[idx].path && entry.size === b[idx].size && entry.hash === b[idx].hash);
  return { same, aCount: a.length, bCount: b.length };
};

const main = async () => {
  const first = await runOnce("run1");
  const second = await runOnce("run2");
  const comparison = await compareFiles(first.dir, second.dir);
  console.log(
    JSON.stringify(
      {
        first,
        second,
        comparison,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
