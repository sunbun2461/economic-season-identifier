import { readFile, writeFile, unlink, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', '..', 'data', 'cache');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface CacheEntry<T> {
  fetched: string;
  data: T;
}

function cacheFilePath(key: string): string {
  // Sanitize key to be a safe filename
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(CACHE_DIR, `${safe}.json`);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const filePath = cacheFilePath(key);
  try {
    await access(filePath);
    const raw = await readFile(filePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - new Date(entry.fetched).getTime();
    if (age > CACHE_TTL_MS) {
      return null; // expired
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheGetStale<T>(key: string): Promise<T | null> {
  // Returns cached data even if expired (for fallback on API failure)
  const filePath = cacheFilePath(key);
  try {
    const raw = await readFile(filePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  const filePath = cacheFilePath(key);
  const entry: CacheEntry<T> = {
    fetched: new Date().toISOString(),
    data,
  };
  await writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
}

export async function cacheBust(key: string): Promise<void> {
  const filePath = cacheFilePath(key);
  try {
    await unlink(filePath);
  } catch {
    // File doesn't exist — that's fine
  }
}

export async function cacheBustAll(): Promise<void> {
  const { readdir } = await import('fs/promises');
  try {
    const files = await readdir(CACHE_DIR);
    await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(f => unlink(join(CACHE_DIR, f)).catch(() => {}))
    );
  } catch {
    // Cache dir doesn't exist — fine
  }
}
