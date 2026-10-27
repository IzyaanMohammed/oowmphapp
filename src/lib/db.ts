import fs from 'fs';
import path from 'path';

export interface DbSchema {
  sessions: any[];
  bulletins: any[];
  notes: any[];
}

// Support Vercel KV / Upstash REST API credentials under standard or custom environment variable names
const getKvUrl = () => {
  if (process.env.UPSTASH_KV_REST_API_URL) return process.env.UPSTASH_KV_REST_API_URL;
  if (process.env.KV_REST_API_URL) return process.env.KV_REST_API_URL;
  if (process.env.UPSTASH_REDIS_REST_URL) return process.env.UPSTASH_REDIS_REST_URL;
  if (process.env.VERCEL_KV_REST_API_URL) return process.env.VERCEL_KV_REST_API_URL;
  return undefined;
};

const getKvToken = () => {
  if (process.env.UPSTASH_KV_REST_API_TOKEN) return process.env.UPSTASH_KV_REST_API_TOKEN;
  if (process.env.KV_REST_API_TOKEN) return process.env.KV_REST_API_TOKEN;
  if (process.env.UPSTASH_REDIS_REST_TOKEN) return process.env.UPSTASH_REDIS_REST_TOKEN;
  if (process.env.VERCEL_KV_REST_API_TOKEN) return process.env.VERCEL_KV_REST_API_TOKEN;
  return undefined;
};

const KV_REST_API_URL = getKvUrl();
const KV_REST_API_TOKEN = getKvToken();


const KEY = 'mph_database_v3';
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');


function readDiskDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
        bulletins: Array.isArray(parsed?.bulletins) ? parsed.bulletins : [],
        notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
      };
    }
  } catch (err) {
    console.error('[DB Disk Read Error]', err);
  }
  return { sessions: [], bulletins: [], notes: [] };
}

function writeDiskDb(data: DbSchema) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Disk Write Error]', err);
  }
}

async function kvFetch(command: any[]) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(`${KV_REST_API_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000), 
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`[KV HTTP Error] status=${response.status}`);
      return null;
    }

    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error(`[KV Command Failed] ${command[0]}:`, error);
    return null;
  }
}

export async function readDb(): Promise<DbSchema> {
  // 1. Try reading from KV cloud database if configured
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    try {
      const data = await kvFetch(['GET', KEY]);
      if (data !== null && data !== undefined) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const dbData: DbSchema = {
          sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
          bulletins: Array.isArray(parsed?.bulletins) ? parsed.bulletins : [],
          notes: Array.isArray(parsed?.notes) ? parsed.notes : []
        };
        // Sync local disk copy for backup
        writeDiskDb(dbData);
        return dbData;
      } else {
        // If KV is connected but key is empty, seed disk DB to KV
        const diskData = readDiskDb();
        if (diskData.sessions.length > 0 || diskData.bulletins.length > 0 || diskData.notes.length > 0) {
          console.log('[KV DB] Seeding initial disk data to Cloud KV...');
          await kvFetch(['SET', KEY, JSON.stringify(diskData)]);
        }
        return diskData;
      }
    } catch (e) {
      console.error('[KV Read Exception]', e);
    }
  }

  // 2. Fallback to persistent disk file (data/db.json)
  return readDiskDb();
}

export async function writeDb(data: DbSchema) {
  // Write to local disk file for backup
  writeDiskDb(data);

  // Sync to KV cloud storage if available
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    try {
      const res = await kvFetch(['SET', KEY, JSON.stringify(data)]);
      if (!res) {
        console.warn('[KV Write Sync] Failed to write to cloud KV');
      } else {
        console.log('[KV Write Sync] Cloud KV successfully updated');
      }
    } catch (error) {
      console.error('[KV Write Sync Error]', error);
    }
  }
}

