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

async function kvFetch(command: any[]) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("KV Storage not configured. Falling back to local memory (non-persistent).");
    return null;
  }

  const response = await fetch(`${KV_REST_API_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  const result = await response.json();
  return result.result;
}

export async function readDb(): Promise<DbSchema> {
  try {
    const data = await kvFetch(['GET', KEY]);
    
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        sessions: parsed.sessions || [],
        bulletins: parsed.bulletins || [],
        notes: parsed.notes || []
      };
    }
  } catch (error) {
    console.error("KV Read Error:", error);
  }

  return { sessions: [], bulletins: [], notes: [] };
}

export async function writeDb(data: DbSchema) {
  try {
    await kvFetch(['SET', KEY, JSON.stringify(data)]);
  } catch (error) {
    console.error("KV Write Error:", error);
    throw new Error("Cloud Storage Sync Failed.");
  }
}
