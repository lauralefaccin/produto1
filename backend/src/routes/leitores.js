import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";
import { authMiddleware, soBibliotecario } from "../middlewares/auth.js";

const router = Router();

// Todas as rotas exigem login de bibliotecário
router.use(authMiddleware, soBibliotecario);

// GET /api/leitores
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, cpf, login, data_registro
       FROM leitores
       ORDER BY nome`
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar leitores." });
  }
});

// POST /api/leitores
router.post("/", async (req, res) => {
  const { nome, cpf, login, senha, data_registro } = req.body;

  if (!nome || !login || !senha) {
    return res.status(400).json({ erro: "nome, login e senha são obrigatórios." });
  }

  try {
    const { rows: exist } = await pool.query(
      "SELECT id FROM leitores WHERE login = $1",
      [login]
    );
    if (exist.length > 0) {
      return res.status(409).json({ erro: "Login já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      `INSERT INTO leitores (nome, cpf, login, senha_hash, data_registro)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, cpf, login, data_registro`,
      [nome, cpf || null, login, hash, data_registro || null]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao criar leitor." });
  }
});

// PUT /api/leitores/:id  — atualiza login e/ou senha
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { login, senha } = req.body;

  if (!login) {
    return res.status(400).json({ erro: "Login é obrigatório." });
  }

  try {
    // Verifica se login já está em uso por outro leitor
    const { rows: exist } = await pool.query(
      "SELECT id FROM leitores WHERE login = $1 AND id <> $2",
      [login, id]
    );
    if (exist.length > 0) {
      return res.status(409).json({ erro: "Login já usado por outro leitor." });
    }

    let query, params;
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      query  = `UPDATE leitores SET login=$1, senha_hash=$2 WHERE id=$3
                RETURNING id, nome, cpf, login, data_registro`;
      params = [login, hash, id];
    } else {
      query  = `UPDATE leitores SET login=$1 WHERE id=$2
                RETURNING id, nome, cpf, login, data_registro`;
      params = [login, id];
    }

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ erro: "Leitor não encontrado." });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar leitor." });
  }
});

// DELETE /api/leitores/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM leitores WHERE id = $1",
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ erro: "Leitor não encontrado." });
    }
    return res.json({ mensagem: "Leitor removido com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao remover leitor." });
  }
});

export default router;