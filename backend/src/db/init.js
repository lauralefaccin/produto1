import pool from "./pool.js";
import bcrypt from "bcrypt";

async function init() {
  const client = await pool.connect();

  try {
    console.log("🔧 Iniciando criação das tabelas...");

    await client.query(`
      -- Gêneros literários
      CREATE TABLE IF NOT EXISTS generos (
        id          SERIAL PRIMARY KEY,
        nome        VARCHAR(100) NOT NULL UNIQUE,
        cor         VARCHAR(20)  NOT NULL DEFAULT '#c08928',
        descricao   TEXT,
        criado_em   TIMESTAMP DEFAULT NOW()
      );

      -- Livros do acervo
      CREATE TABLE IF NOT EXISTS livros (
        id            SERIAL PRIMARY KEY,
        titulo        VARCHAR(255) NOT NULL,
        autor         VARCHAR(255) NOT NULL,
        nacionalidade VARCHAR(100),
        editora       VARCHAR(150),
        ano           INTEGER,
        exemplares    INTEGER NOT NULL DEFAULT 1,
        isbn          VARCHAR(30),
        genero        VARCHAR(100),
        criado_em     TIMESTAMP DEFAULT NOW()
      );

      -- Bibliotecários
      CREATE TABLE IF NOT EXISTS bibliotecarios (
        id            SERIAL PRIMARY KEY,
        nome          VARCHAR(255) NOT NULL,
        cpf           VARCHAR(20)  UNIQUE,
        login         VARCHAR(100) NOT NULL UNIQUE,
        senha_hash    TEXT         NOT NULL,
        criado_em     TIMESTAMP DEFAULT NOW()
      );

      -- Leitores
      CREATE TABLE IF NOT EXISTS leitores (
        id               SERIAL PRIMARY KEY,
        nome             VARCHAR(255) NOT NULL,
        cpf              VARCHAR(20)  UNIQUE,
        login            VARCHAR(100) NOT NULL UNIQUE,
        senha_hash       TEXT         NOT NULL,
        data_registro    DATE         DEFAULT CURRENT_DATE,
        criado_em        TIMESTAMP    DEFAULT NOW()
      );

      -- Estante pessoal do leitor
      CREATE TABLE IF NOT EXISTS estante (
        id          SERIAL PRIMARY KEY,
        leitor_id   INTEGER NOT NULL REFERENCES leitores(id) ON DELETE CASCADE,
        livro_id    INTEGER NOT NULL REFERENCES livros(id)   ON DELETE CASCADE,
        adicionado_em TIMESTAMP DEFAULT NOW(),
        UNIQUE(leitor_id, livro_id)
      );
    `);

    console.log("✅ Tabelas criadas.");

    // ── Seed: Gêneros ──────────────────────────────────────
    const generosExistentes = await client.query("SELECT COUNT(*) FROM generos");
    if (parseInt(generosExistentes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO generos (nome, cor, descricao) VALUES
          ('Clássico', '#c7922d', 'Obras atemporais que marcaram gerações e estilos literários.'),
          ('Romance',  '#2d5c4e', 'Histórias centradas em relações humanas, sentimentos e conflitos.'),
          ('Ficção',   '#486ca5', 'Narrativas inventivas que exploram ideias, cenários e personagens.'),
          ('Fantasia', '#7a5a92', 'Mundos imaginários com elementos mágicos.')
        ON CONFLICT (nome) DO NOTHING;
      `);
      console.log("✅ Gêneros inseridos.");
    }

    // ── Seed: Livros ───────────────────────────────────────
    const livrosExistentes = await client.query("SELECT COUNT(*) FROM livros");
    if (parseInt(livrosExistentes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO livros (titulo, autor, nacionalidade, editora, ano, exemplares, isbn, genero) VALUES
          ('Dom Quixote',                        'Miguel de Cervantes', 'Espanhol',   'Penguin',             1605, 3, '978-0142437230', 'Clássico'),
          ('O Cortiço',                          'Aluísio Azevedo',     'Brasileiro', 'Ática',               1890, 4, '978-8508151172', 'Romance'),
          ('1984',                               'George Orwell',       'Britânico',  'Companhia das Letras', 1949, 2, '978-8535914849', 'Ficção'),
          ('Grande Sertão: Veredas',             'João Guimarães Rosa', 'Brasileiro', 'Nova Fronteira',      1956, 3, '978-8520923252', 'Ficção'),
          ('Harry Potter e a Pedra Filosofal',   'J.K. Rowling',        'Britânico',  'Rocco',               1997, 5, '978-8532511010', 'Fantasia');
      `);
      console.log("✅ Livros inseridos.");
    }

    // ── Seed: Admin bibliotecário ──────────────────────────
    const admExistente = await client.query(
      "SELECT COUNT(*) FROM bibliotecarios WHERE login = 'admin'"
    );
    if (parseInt(admExistente.rows[0].count) === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await client.query(
        `INSERT INTO bibliotecarios (nome, cpf, login, senha_hash)
         VALUES ('Admin Bibliotecário', '000.000.000-00', 'admin', $1)`,
        [hash]
      );
      console.log("✅ Admin criado (login: admin / senha: admin123).");
    }

    // ── Seed: Leitores de exemplo ──────────────────────────
    const leitoresExistentes = await client.query("SELECT COUNT(*) FROM leitores");
    if (parseInt(leitoresExistentes.rows[0].count) === 0) {
      const exemplos = [
        { nome: "Ana Luiza Pereira",    cpf: "123.456.789-00", login: "ana",    senha: "ana123" },
        { nome: "Carlos Eduardo Souza", cpf: "987.654.321-11", login: "carlos", senha: "carlos123" },
        { nome: "Juliana Ferreira",     cpf: "456.789.123-22", login: "juli",   senha: "juli123" },
      ];
      for (const l of exemplos) {
        const hash = await bcrypt.hash(l.senha, 10);
        await client.query(
          `INSERT INTO leitores (nome, cpf, login, senha_hash)
           VALUES ($1, $2, $3, $4)`,
          [l.nome, l.cpf, l.login, hash]
        );
      }
      console.log("✅ Leitores de exemplo inseridos.");
    }

    console.log("\n🎉 Banco de dados pronto!");
  } catch (err) {
    console.error("❌ Erro ao inicializar banco:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

init();