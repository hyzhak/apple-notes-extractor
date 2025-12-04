import fs from 'node:fs/promises';
import path from 'node:path';
const INDEX_FILENAME = 'index.json';

export interface ExportConfig {
  targetDir: string;
  force?: boolean;
  includeAttachments?: boolean;
}

export interface ExportContext {
  targetDir: string;
  notesPath: string;
  artifactsPath: string;
  indexPath: string;
  includeAttachments: boolean;
}

async function ensureDirectoryExists(targetDir: string): Promise<void> {
  await fs.mkdir(targetDir, { recursive: true });
}

async function isDirectoryEmpty(dir: string, allowedNames: string[] = []): Promise<boolean> {
  const entries = await fs.readdir(dir);
  const meaningful = entries.filter((name) => !allowedNames.includes(name));
  return meaningful.length === 0;
}

export async function validateTargetDirectory(targetDir: string, force: boolean): Promise<void> {
  const stats = await fs.stat(targetDir).catch(() => undefined);
  if (!stats) {
    return;
  }
  if (!stats.isDirectory()) {
    throw new Error(`Target path must be a directory: ${targetDir}`);
  }
  // Some environments drop a node-compile-cache folder beside the app; allow it when empty otherwise.
  const allowed = ['node-compile-cache'];
  if (!(await isDirectoryEmpty(targetDir, allowed)) && !force) {
    throw new Error('Target directory must be empty unless --force is provided.');
  }
}

export async function createExportContext(config: ExportConfig): Promise<ExportContext> {
  if (!path.isAbsolute(config.targetDir)) {
    throw new Error('Target directory must be an absolute path.');
  }

  const force = Boolean(config.force);
  const includeAttachments = Boolean(config.includeAttachments);

  await ensureDirectoryExists(config.targetDir);
  await validateTargetDirectory(config.targetDir, force);

  const notesPath = path.join(config.targetDir, 'notes');
  const artifactsPath = path.join(config.targetDir, 'artifacts');
  const indexPath = path.join(config.targetDir, INDEX_FILENAME);

  await fs.mkdir(notesPath, { recursive: true });
  if (includeAttachments) {
    await fs.mkdir(artifactsPath, { recursive: true });
  }

  return {
    targetDir: config.targetDir,
    notesPath,
    artifactsPath,
    indexPath,
    includeAttachments
  };
}
