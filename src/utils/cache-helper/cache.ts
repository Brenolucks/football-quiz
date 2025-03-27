import fs from 'fs/promises';
import path from 'path';

const cacheFilePath = path.resolve('cache/playerClubsCache.json');

export async function readCache(): Promise<Record<string, string[]>> {
  try {
    const data = await fs.readFile(cacheFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

export async function writeCache(cache: Record<string, string[]>) {
  await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2), 'utf-8');
}
