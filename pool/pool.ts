import { Pool } from 'pg';

const connectionString = "postgresql://postgres.aqvjlyigrkfikzkfomza:wCBrkihVgfbs9PGV@aws-0-us-east-2.pooler.supabase.com:5432/postgres";
const userPool = new Pool({
   connectionString,
});

const guestPool = new Pool({
    connectionString: "postgresql://postgres.jfwwkjxxzrucksryojyg:kerm7pig@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
});

export default userPool;