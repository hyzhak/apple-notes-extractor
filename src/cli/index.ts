import { Command } from 'commander';
import { z } from 'zod';
import { createRequire } from 'node:module';
import { createExportContext } from '../lib/export-context';
import { ensureMacOS } from '../lib/notes-bridge';
import { exportNotes } from '../lib/export-runner';
import { parseFolderFilters } from '../lib/filter-schema';

const require = createRequire(import.meta.url);
// Keep CLI usable from both compiled dist/ and ts-node/src:
// - dist/cli.js sits beside dist/package.json        -> ../package.json
// - src/cli/index.ts sits under src/                 -> ../../package.json
const cliPath = new URL('.', import.meta.url).pathname;
const pkgUrl = cliPath.includes('/dist/')
  ? new URL('../package.json', import.meta.url)
  : new URL('../../package.json', import.meta.url);
const version =
  (require(pkgUrl.pathname) as { version?: string }).version ??
  'unknown';

const cliSchema = z.object({
  target: z.string().min(1, 'Target directory is required'),
  force: z.boolean().optional(),
  includeAttachments: z.boolean().optional(),
  includeFolder: z.array(z.string()).optional(),
  excludeFolder: z.array(z.string()).optional()
});

export async function main(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name('apple-notes-export')
    .description('Apple Notes export CLI (MVP smoke run)')
    .version(version)
    .requiredOption('-t, --target <dir>', 'Absolute path to target directory')
    .option('-f, --force', 'Allow non-empty target directory', false)
    .option('--include-attachments', 'Attachments export is not yet implemented', false)
    .option('--include-folder <paths...>', 'Include only folders (prefix match)', [])
    .option('--exclude-folder <paths...>', 'Exclude folders (prefix match)', []);

  program.exitOverride();

  try {
    program.parse(argv);
    const options = program.opts<{
      target: string;
      force?: boolean;
      includeAttachments?: boolean;
      includeFolder?: string[];
      excludeFolder?: string[];
    }>();
    const parsed = cliSchema.parse({
      target: options.target,
      force: Boolean(options.force),
      includeAttachments: Boolean(options.includeAttachments),
      includeFolder: options.includeFolder,
      excludeFolder: options.excludeFolder
    });

    ensureMacOS();

    if (parsed.includeAttachments) {
      // Attachments are deferred; keep UX explicit.
      process.stderr.write('Warning: --include-attachments is not implemented yet; continuing without attachments.\n');
    }

    const context = await createExportContext({
      targetDir: parsed.target,
      force: parsed.force,
      includeAttachments: false
    });

    const filters = parseFolderFilters({
      includeFolders: parsed.includeFolder,
      excludeFolders: parsed.excludeFolder
    });

    const result = await exportNotes(context, {}, filters);

    const summary = {
      status: 'ok',
      indexPath: result.indexPath,
      notesPath: result.notesPath,
      exported: result.exported,
      skipped: result.skipped,
      firstNote: result.firstNote
    };

    process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
    process.exitCode = 0;
  } catch (error) {
    const maybeCommanderError = error as Error & { code?: string };
    if (maybeCommanderError?.code === 'commander.executeSubCommandAsync') {
      throw error;
    }
    process.stderr.write(`Error: ${(maybeCommanderError as Error).message}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main(process.argv);
}
