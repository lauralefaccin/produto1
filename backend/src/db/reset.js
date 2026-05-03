import pool from "./pool.js";

async function reset() {
  const client = await pool.connect();
  try {
    console.log("⚠️  Apagando tabelas...");
    await client.query(`
      DROP TABLE IF EXISTS estante CASCADE;
      DROP TABLE IF EXISTS leitores CASCADE;
      DROP TABLE IF EXISTS bibliotecarios CASCADE;
      DROP TABLE IF EXISTS livros CASCADE;
      DROP TABLE IF EXISTS generos CASCADE;
    `);
    console.log("✅ Tabelas removidas. Rode 'npm run db:init' para recriar.");
  } catch (err) {
    console.error("Erro ao apagar tabelas:", err);
  } finally {
    client.release();
    process.exit();
  }
}

reset();
