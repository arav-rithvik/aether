// Loads engine/.env into process.env BEFORE any SDK client reads its key.
// override:true so a stale/invalid key exported in the shell can't shadow the file.
import dotenv from "dotenv";
import path from "node:path";

// engine/.env first (optional), then root .env.local (has the OpenAI key + Convex URL) wins.
dotenv.config({ path: path.join(import.meta.dirname, "..", ".env"), override: true });
dotenv.config({ path: path.join(import.meta.dirname, "..", "..", ".env.local"), override: true });
