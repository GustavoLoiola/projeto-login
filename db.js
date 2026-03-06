const { Pool } = require("pg");

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  pool = new Pool({
    user: "projeto_login_db_user",
    host: "dpg-d6gus16a2pns7387c80g-a.ohio-postgres.render.com",
    database: "projeto_login_db",
    password: "slmw6c3h4sreZEbPGuKL71g3Ly1esOrW",
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

module.exports = pool;