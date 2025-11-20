import { Pool } from "pg"; // Import the Pool class from the 'pg' package for connection pooling

// Ensure the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL"); // Stop execution if DATABASE_URL is missing
}

// Create a new PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use the URL from your .env file
    max: 10,               // Maximum number of simultaneous connections in the pool
    idleTimeoutMillis: 30000, // Time (ms) a client can sit idle before being closed
    connectionTimeoutMillis: 2000, // Max time (ms) to wait when connecting before throwing an error
});

// Handle errors emitted by the pool
pool.on("error", (err) => {
    console.error("Postgres pool error:", err); // Log any unexpected errors
});

// Export the pool for use in API routes or other modules
export default pool;