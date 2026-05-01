import { Router } from "express";
import pool from "../db/pool.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.use(authMiddleware);

// GET /api/estante — retorna estante do usuário logado
router.get("/", async (req, res) => {
  const usuarioId = req.user.id;
  const usuarioTipo = req.user.tipo;

  try {
    const { rows } = await pool.query(
      `SELECT l.*, e.adicionado_em
       FROM estante e
       JOIN livros l ON l.id = e.livro_id
       WHERE e.usuario_id = $1 AND e.usuario_tipo = $2
       ORDER BY e.adicionado_em DESC`,
      [usuarioId, usuarioTipo]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar estante." });
  }
});

// POST /api/estante/:livroId — adiciona livro à estante
router.post("/:livroId", async (req, res) => {
  const usuarioId = req.user.id;
  const usuarioTipo = req.user.tipo;
  const { livroId } = req.params;
  const livroIdNumber = Number(livroId);
  const leitorId = usuarioTipo === "leitor" ? usuarioId : null;

  if (!Number.isInteger(livroIdNumber) || livroIdNumber <= 0) {
    return res.status(400).json({ erro: "ID do livro inválido." });
  }

  try {
    await pool.query(
      `INSERT INTO estante (usuario_id, usuario_tipo, livro_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_tipo, usuario_id, livro_id) DO NOTHING`,
      [usuarioId, usuarioTipo, livroIdNumber]
    );
    return res.status(201).json({ mensagem: "Livro adicionado à estante." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao adicionar à estante." });
  }
});

// DELETE /api/estante/:livroId — remove livro da estante
router.delete("/:livroId", async (req, res) => {
  const usuarioId = req.user.id;
  const usuarioTipo = req.user.tipo;
  const { livroId } = req.params;
  const livroIdNumber = Number(livroId);

  if (!Number.isInteger(livroIdNumber) || livroIdNumber <= 0) {
    return res.status(400).json({ erro: "ID do livro inválido." });
  }

  try {
    await pool.query(
      "DELETE FROM estante WHERE usuario_id=$1 AND usuario_tipo=$2 AND livro_id=$3",
      [usuarioId, usuarioTipo, livroIdNumber]
    );
    return res.json({ mensagem: "Livro removido da estante." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao remover da estante." });
  }
});

export default router;