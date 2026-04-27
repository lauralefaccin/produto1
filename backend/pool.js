import pg from "pg";
import dotenv from "dotenv";
 
dotenv.config();
 
const { Pool } = pg;
 
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "atlasbook",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
});
 
pool.on("error", (err) => {
  console.error("Erro inesperado no pool do PostgreSQL:", err);
});
 
export default pool;