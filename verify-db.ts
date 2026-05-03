import { readDb } from './src/lib/db';

async function verify() {
    console.log("--- FIRESTORE CONNECTIVITY VERIFICATION ---");
    try {
        const start = Date.now();
        const data = await readDb();
        const end = Date.now();
        
        console.log("✅ Connection Successful");
        console.log(`⏱️ Latency: ${end - start}ms`);
        console.log("📊 Data Summary:");
        console.log(`   - Sessions: ${data.sessions.length}`);
        console.log(`   - Bulletins: ${data.bulletins.length}`);
        console.log(`   - Notes: ${data.notes.length}`);
        console.log("------------------------------------------");
    } catch (e) {
        console.error("❌ Connection Failed");
        console.error(e);
    }
}

verify();
