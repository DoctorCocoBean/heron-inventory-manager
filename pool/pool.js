const { Pool } = require("pg");

const connectionString = "postgresql://postgres.aqvjlyigrkfikzkfomza:wCBrkihVgfbs9PGV@aws-0-us-east-2.pooler.supabase.com:5432/postgres";
module.exports = new Pool({
  connectionString,
});

// module.exports = new Pool({
//     host: "localhost",
//     user: "postgres",
//     database: "top_users",
//     password: "",
//     port: 5432
// });

