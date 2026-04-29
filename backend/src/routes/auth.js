import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";

const router = Router();

function gerarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { login, senha, tipo } = req.body;

  if (!login || !senha || !tipo) {
    return res.status(400).json({ erro: "login, senha e tipo são obrigatórios." });
  }

  try {
    const tabela = tipo === "bibliotecario" ? "bibliotecarios" : "leitores";
    const { rows } = await pool.query(
      `SELECT * FROM ${tabela} WHERE login = $1`,
      [login]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Login ou senha incorretos." });
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ erro: "Login ou senha incorretos." });
    }

    const token = gerarToken({
      id:    usuario.id,
      nome:  usuario.nome,
      cpf:   usuario.cpf,
      login: usuario.login,
      tipo,
    });

    return res.json({
      token,
      usuario: {
        id:    usuario.id,
        nome:  usuario.nome,
        cpf:   usuario.cpf,
        login: usuario.login,
        tipo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// POST /api/auth/cadastro
router.post("/cadastro", async (req, res) => {
  const { nome, cpf, login, senha, tipo } = req.body;

  if (!nome || !login || !senha || !tipo) {
    return res.status(400).json({ erro: "nome, login, senha e tipo são obrigatórios." });
  }
  if (senha.length < 4) {
    return res.status(400).json({ erro: "A senha deve ter no mínimo 4 caracteres." });
  }

  try {
    const tabela = tipo === "bibliotecario" ? "bibliotecarios" : "leitores";

    // Verifica duplicidade
    const { rows: exist } = await pool.query(
      `SELECT id FROM ${tabela} WHERE login = $1`,
      [login]
    );
    if (exist.length > 0) {
      return res.status(409).json({ erro: "Login já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);

    if (tipo === "bibliotecario") {
      await pool.query(
        `INSERT INTO bibliotecarios (nome, cpf, login, senha_hash) VALUES ($1,$2,$3,$4)`,
        [nome, cpf || null, login, hash]
      );
    } else {
      await pool.query(
        `INSERT INTO leitores (nome, cpf, login, senha_hash) VALUES ($1,$2,$3,$4)`,
        [nome, cpf || null, login, hash]
      );
    }

    return res.status(201).json({ mensagem: "Cadastro realizado com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

export default router;