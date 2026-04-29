import { Router } from "express";
import pool from "../db/pool.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.use(authMiddleware);

// GET /api/estante — retorna estante do leitor logado
router.get("/", async (req, res) => {
  const leitorId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT l.*, e.adicionado_em
       FROM estante e
       JOIN livros l ON l.id = e.livro_id
       WHERE e.leitor_id = $1
       ORDER BY e.adicionado_em DESC`,
      [leitorId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar estante." });
  }
});

// POST /api/estante/:livroId — adiciona livro à estante
router.post("/:livroId", async (req, res) => {
  const leitorId = req.user.id;
  const { livroId } = req.params;

  try {
    await pool.query(
      `INSERT INTO estante (leitor_id, livro_id) VALUES ($1, $2)
       ON CONFLICT (leitor_id, livro_id) DO NOTHING`,
      [leitorId, livroId]
    );
    return res.status(201).json({ mensagem: "Livro adicionado à estante." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao adicionar à estante." });
  }
});

// DELETE /api/estante/:livroId — remove livro da estante
router.delete("/:livroId", async (req, res) => {
  const leitorId = req.user.id;
  const { livroId } = req.params;

  try {
    await pool.query(
      "DELETE FROM estante WHERE leitor_id=$1 AND livro_id=$2",
      [leitorId, livroId]
    );
    return res.json({ mensagem: "Livro removido da estante." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao remover da estante." });
  }
});

export default router;