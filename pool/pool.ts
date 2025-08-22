import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const userPool = new Pool({
   connectionString: process.env.DATABASE_URL
});

const guestPool = new Pool({
    connectionString: process.env.GUEST_DATABASE_URL,
});

export default userPool;