import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";



// Load database URL from environment variables
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});


async function testConnection() {
    try {
        // Connect to the database
        await client.connect();
        console.log("DB connected successfully!");
    } catch (error) {
        console.error("DB connection error:", error);
    }
}

export default client;

// Call the testConnection function when this module is loaded
testConnection();
