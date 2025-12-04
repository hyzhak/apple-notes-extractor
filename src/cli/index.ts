import fs from 'node:fs/promises';
import { Command } from 'commander';
import { z } from 'zod';
import { createExportContext } from '../lib/export-context';
import { ensureMacOS, fetchNotesSummary } from '../lib/notes-bridge';

const cliSchema = z.object({
  target: z.string().min(1, 'Target directory is required'),
  force: z.boolean().optional()
});

export async function main(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name('apple-notes-export')
    .description('Apple Notes export CLI (MVP smoke run)')
    .requiredOption('-t, --target <dir>', 'Absolute path to target directory')
    .option('-f, --force', 'Allow non-empty target directory', false)
    .option('--include-attachments', 'Attachments disabled in MVP smoke run', false)
    .option('--version', 'Show version');

  program.exitOverride();

  try {
    program.parse(argv);
    const options = program.opts<{
      target: string;
      force?: boolean;
      includeAttachments?: boolean;
    }>();
    const parsed = cliSchema.parse({
      target: options.target,
      force: Boolean(options.force)
    });

    ensureMacOS();

    const notesSummary = await fetchNotesSummary();
    const context = await createExportContext({
      targetDir: parsed.target,
      force: parsed.force,
      includeAttachments: false
    });

    const summary = {
      noteCount: notesSummary.totalNotes,
      firstNote: notesSummary.firstNote
    };

    await fs.writeFile(context.indexPath, JSON.stringify(summary, null, 2), 'utf8');

    // Smoke-run summary to stdout for MVP.
    process.stdout.write(
      JSON.stringify(
        {
          status: 'ok',
          notesPath: context.notesPath,
          indexPath: context.indexPath,
          attachments: 'disabled',
          noteCount: notesSummary.totalNotes,
          firstNote: notesSummary.firstNote
        },
        null,
        2
      ) + '\n'
    );
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
