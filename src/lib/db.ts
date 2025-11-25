import { neon } from '@neondatabase/serverless';

//Ensure that the DATABASE_URL is defined in .env
if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in environment variables");
}

// Create and export a Neon connection pool
export const sql = neon(process.env.DATABASE_URL);