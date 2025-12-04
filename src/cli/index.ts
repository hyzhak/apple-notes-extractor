import fs from 'node:fs/promises';
import { Command } from 'commander';
import { z } from 'zod';
import { createExportContext } from '../lib/export-context';
import { ensureMacOS } from '../lib/notes-bridge';
import { readFirstNote } from '../lib/notes-reader';
import { writeNoteHtml } from '../services/file-writer';

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

    const note = await readFirstNote();
    const context = await createExportContext({
      targetDir: parsed.target,
      force: parsed.force,
      includeAttachments: false
    });

    const writeResult = await writeNoteHtml(note, context.notesPath);

    const indexEntries = [
      {
        noteId: note.id,
        noteName: note.name,
        artifacts: [],
        folderPath: note.folderPath,
        createdAtUtc: note.createdAtUtc,
        modifiedAtUtc: note.modifiedAtUtc,
        htmlPath: writeResult.relativeHtmlPath
      }
    ];

    const summary = {
      status: 'ok',
      indexPath: context.indexPath,
      notesPath: context.notesPath,
      exported: indexEntries.length,
      firstNote: {
        id: note.id,
        name: note.name,
        folderPath: note.folderPath,
        htmlPath: writeResult.relativeHtmlPath
      }
    };

    await fs.writeFile(context.indexPath, JSON.stringify(indexEntries, null, 2), 'utf8');

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
