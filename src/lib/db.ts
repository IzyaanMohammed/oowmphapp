export interface DbSchema {
  sessions: any[];
  bulletins: any[];
  notes: any[];
}

// Using Vercel KV / Upstash REST API to avoid needing new npm packages
// This works perfectly on Vercel and locally with zero setup other than 2 env vars.
const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY = 'mph_database_v3';

// Simple server-side in-memory cache to prevent redundant hits within a short window
let serverCache: { data: DbSchema; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds

async function kvFetch(command: any[]) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("KV Storage not configured. Falling back to local memory (non-persistent).");
    return null;
  }

  const start = Date.now();
  try {
    const response = await fetch(`${KV_REST_API_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      // Prevent hanging forever if the KV store is slow
      signal: AbortSignal.timeout(8000), 
    });

    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error(`[KV] Command ${command[0]} failed:`, error);
    return null;
  }
}

export async function readDb(): Promise<DbSchema> {
  const now = Date.now();
  
  // Return cached data if available and fresh
  if (serverCache && (now - serverCache.timestamp < CACHE_TTL)) {
    return serverCache.data;
  }

  try {
    const data = await kvFetch(['GET', KEY]);
    
    let db: DbSchema = { sessions: [], bulletins: [], notes: [] };

    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      db = {
        sessions: parsed.sessions || [],
        bulletins: parsed.bulletins || [],
        notes: parsed.notes || []
      };
    }

    // Update cache
    serverCache = { data: db, timestamp: now };
    return db;

  } catch (error) {
    console.error("KV Read Error:", error);
    return serverCache?.data || { sessions: [], bulletins: [], notes: [] };
  }
}

export async function writeDb(data: DbSchema) {
  try {
    // Invalidate cache on write
    serverCache = { data, timestamp: Date.now() };
    
    await kvFetch(['SET', KEY, JSON.stringify(data)]);
  } catch (error) {
    console.error("KV Write Error:", error);
    throw new Error("Cloud Storage Sync Failed.");
  }
}
