import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";
import "dotenv/config"; // Pour charger les variables d'environnement

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });