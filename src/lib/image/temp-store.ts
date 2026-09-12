import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface StoredFileInfo {
  id: string;
  originalName: string;
  sanitizedFilename: string;
  mime: string;
  format: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: number;
  expiresAt: number;
}

const TEMP_DIR_NAME = 'mjimage-temp-store';
const BASE_TEMP_DIR = path.join(os.tmpdir(), TEMP_DIR_NAME);
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

// In-memory catalog of active files for fast lookup and TTL checking
const fileRegistry = new Map<string, StoredFileInfo>();
let dirInitialized = false;

async function ensureDirectoryExists(): Promise<void> {
  if (dirInitialized) return;
  try {
    await fs.mkdir(BASE_TEMP_DIR, { recursive: true });
    dirInitialized = true;
  } catch (err) {
    console.error('Failed to create temp directory:', err);
  }
}

/**
 * Saves a processed image buffer into the secure ephemeral store.
 */
export async function saveTempImage(
  buffer: Buffer,
  meta: {
    originalName: string;
    targetExt: string;
    mime: string;
    format: string;
    width: number;
    height: number;
  }
): Promise<StoredFileInfo> {
  await ensureDirectoryExists();
  
  // Sweep old files periodically
  cleanupOrphanedFiles().catch(() => {});

  const fileId = crypto.randomUUID();
  const safeExt = meta.targetExt.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  const diskFilename = `${fileId}.${safeExt}`;
  const diskPath = path.join(BASE_TEMP_DIR, diskFilename);

  const cleanOriginalBase = meta.originalName.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
  const sanitizedFilename = `${cleanOriginalBase || 'image'}-mjimage.${safeExt}`;

  await fs.writeFile(diskPath, buffer);

  const now = Date.now();
  const fileInfo: StoredFileInfo = {
    id: fileId,
    originalName: meta.originalName,
    sanitizedFilename,
    mime: meta.mime,
    format: meta.format,
    sizeBytes: buffer.length,
    width: meta.width,
    height: meta.height,
    createdAt: now,
    expiresAt: now + DEFAULT_TTL_MS,
  };

  fileRegistry.set(fileId, fileInfo);
  return fileInfo;
}

/**
 * Retrieves a file buffer and its metadata by UUID.
 * Falls back to disk scan when registry is cold (e.g. after HMR restart in dev).
 * Returns null if not found or expired.
 */
export async function getTempImage(
  fileId: string
): Promise<{ buffer: Buffer; info: StoredFileInfo } | null> {
  // UUID validation to reject path injection attacks
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(fileId)) {
    return null;
  }

  await ensureDirectoryExists();

  // --- Path 1: Hot registry lookup (production / same process) ---
  const info = fileRegistry.get(fileId);
  if (info) {
    if (Date.now() > info.expiresAt) {
      await deleteTempImage(fileId);
      return null;
    }

    const diskFilename = `${fileId}.${info.format}`;
    const diskPath = path.join(BASE_TEMP_DIR, diskFilename);

    try {
      const buffer = await fs.readFile(diskPath);
      return { buffer, info };
    } catch {
      fileRegistry.delete(fileId);
      // Fall through to disk scan below
    }
  }

  // --- Path 2: Cold-registry disk fallback (HMR wiped the in-memory Map) ---
  // Scan the temp dir for any file whose name starts with this UUID
  try {
    const files = await fs.readdir(BASE_TEMP_DIR);
    const match = files.find((f) => f.startsWith(fileId + '.'));
    if (!match) return null;

    const diskPath = path.join(BASE_TEMP_DIR, match);
    const stats = await fs.stat(diskPath);

    // Enforce TTL based on file modification time
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs > DEFAULT_TTL_MS) {
      // Expired — clean up silently
      await fs.unlink(diskPath).catch(() => {});
      return null;
    }

    const ext = match.replace(`${fileId}.`, '');
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      tiff: 'image/tiff',
    };
    const mime = mimeMap[ext] || `image/${ext}`;

    // Reconstruct a minimal StoredFileInfo for this orphaned disk file
    const reconstructed: StoredFileInfo = {
      id: fileId,
      originalName: 'image',
      sanitizedFilename: `image-mjimage.${ext}`,
      mime,
      format: ext,
      sizeBytes: stats.size,
      width: 0,
      height: 0,
      createdAt: stats.mtimeMs,
      expiresAt: stats.mtimeMs + DEFAULT_TTL_MS,
    };

    // Re-register so subsequent requests skip the scan
    fileRegistry.set(fileId, reconstructed);

    const buffer = await fs.readFile(diskPath);
    return { buffer, info: reconstructed };
  } catch {
    return null;
  }
}

/**
 * Explicitly removes an ephemeral file from disk and registry.
 */
export async function deleteTempImage(fileId: string): Promise<void> {
  const info = fileRegistry.get(fileId);
  fileRegistry.delete(fileId);

  if (info) {
    const diskFilename = `${fileId}.${info.format}`;
    const diskPath = path.join(BASE_TEMP_DIR, diskFilename);
    try {
      await fs.unlink(diskPath);
    } catch {
      // Ignore if already unlinked
    }
  }
}

/**
 * Sweeps expired or orphaned files older than TTL from disk and registry.
 */
export async function cleanupOrphanedFiles(): Promise<number> {
  await ensureDirectoryExists();
  const now = Date.now();
  let cleanedCount = 0;

  // 1. Clean registry-tracked expired files
  for (const [id, info] of fileRegistry.entries()) {
    if (now > info.expiresAt) {
      await deleteTempImage(id);
      cleanedCount++;
    }
  }

  // 2. Clean disk orphaned files that might be left from prior process restarts
  try {
    const files = await fs.readdir(BASE_TEMP_DIR);
    for (const file of files) {
      const filePath = path.join(BASE_TEMP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > DEFAULT_TTL_MS) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      } catch {
        // file may have been removed concurrently
      }
    }
  } catch {
    // directory read error
  }

  return cleanedCount;
}
