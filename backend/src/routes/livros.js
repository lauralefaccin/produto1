import { Router } from "express";
import pool from "../db/pool.js";
import { authMiddleware, soBibliotecario } from "../middlewares/auth.js";

const router = Router();

// GET /api/livros — público (leitores e bibliotecários)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM livros ORDER BY titulo"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar livros." });
  }
});

// POST /api/livros — só bibliotecário
router.post("/", authMiddleware, soBibliotecario, async (req, res) => {
  const { titulo, autor, nacionalidade, editora, ano, exemplares, isbn, genero } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({ erro: "titulo e autor são obrigatórios." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO livros (titulo, autor, nacionalidade, editora, ano, exemplares, isbn, genero)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [titulo, autor, nacionalidade || null, editora || null,
       ano || null, exemplares || 1, isbn || null, genero || null]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao criar livro." });
  }
});

// PUT /api/livros/:id — só bibliotecário
router.put("/:id", authMiddleware, soBibliotecario, async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, nacionalidade, editora, ano, exemplares, isbn, genero } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE livros
       SET titulo=$1, autor=$2, nacionalidade=$3, editora=$4,
           ano=$5, exemplares=$6, isbn=$7, genero=$8
       WHERE id=$9
       RETURNING *`,
      [titulo, autor, nacionalidade || null, editora || null,
       ano || null, exemplares || 1, isbn || null, genero || null, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ erro: "Livro não encontrado." });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar livro." });
  }
});

// DELETE /api/livros/:id — só bibliotecário
router.delete("/:id", authMiddleware, soBibliotecario, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM livros WHERE id = $1", [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ erro: "Livro não encontrado." });
    }
    return res.json({ mensagem: "Livro removido com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao remover livro." });
  }
});

export default router;