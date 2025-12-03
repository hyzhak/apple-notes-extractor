#!/usr/bin/env node
import { run } from "@jxa/run";

const main = async () => {
  const started = Date.now();
  try {
    const pong = await run(() => {
      const Notes = Application("Notes");
      Notes.includeStandardAdditions = true;
      return { appRunning: Notes.running(), appName: Notes.name() };
    });
    const elapsedMs = Date.now() - started;
    console.log(JSON.stringify({ ok: true, elapsedMs, pong }, null, 2));
  } catch (error) {
    const elapsedMs = Date.now() - started;
    console.error(
      JSON.stringify(
        { ok: false, elapsedMs, error: error instanceof Error ? error.message : String(error) },
        null,
        2
      )
    );
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
