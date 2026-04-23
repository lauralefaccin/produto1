import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const BIBLIOTECARIOS_KEY = "acervo_bibliotecarios";
const LEITORES_KEY = "acervo_leitores";

const BIBLIOTECARIOS_INICIAL = [
  {
    id: 1,
    nome: "Admin Bibliotecário",
    cpf: "000.000.000-00",
    login: "admin",
    senha: "admin123",
    tipo: "bibliotecario",
  },
];

function readBibliotecarios() {
  try {
    const saved = localStorage.getItem(BIBLIOTECARIOS_KEY);
    if (!saved) {
      localStorage.setItem(BIBLIOTECARIOS_KEY, JSON.stringify(BIBLIOTECARIOS_INICIAL));
      return BIBLIOTECARIOS_INICIAL;
    }
    return JSON.parse(saved);
  } catch {
    return BIBLIOTECARIOS_INICIAL;
  }
}

function readLeitores() {
  try {
    const saved = localStorage.getItem(LEITORES_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveBibliotecario(novo) {
  const lista = readBibliotecarios();
  lista.push(novo);
  localStorage.setItem(BIBLIOTECARIOS_KEY, JSON.stringify(lista));
}

export function saveLeitor(novo) {
  const lista = readLeitores();
  lista.push(novo);
  localStorage.setItem(LEITORES_KEY, JSON.stringify(lista));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem("sessao_atual");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((login, senha, tipo) => {
    if (tipo === "bibliotecario") {
      const lista = readBibliotecarios();
      const found = lista.find((b) => b.login === login && b.senha === senha);
      if (!found) return { ok: false, erro: "Login ou senha incorretos." };
      const sessao = { ...found, tipo: "bibliotecario" };
      sessionStorage.setItem("sessao_atual", JSON.stringify(sessao));
      setUser(sessao);
      return { ok: true };
    } else {
      const lista = readLeitores();
      const found = lista.find((l) => l.login === login && l.senha === senha);
      if (!found) return { ok: false, erro: "Login ou senha incorretos." };
      const sessao = { ...found, tipo: "leitor" };
      sessionStorage.setItem("sessao_atual", JSON.stringify(sessao));
      setUser(sessao);
      return { ok: true };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("sessao_atual");
    setUser(null);
  }, []);

  const cadastrarBibliotecario = useCallback(({ nome, cpf, login, senha }) => {
    const lista = readBibliotecarios();
    if (lista.find((b) => b.login === login)) {
      return { ok: false, erro: "Login já cadastrado." };
    }
    const novo = {
      id: Date.now(),
      nome,
      cpf,
      login,
      senha,
      tipo: "bibliotecario",
    };
    saveBibliotecario(novo);
    return { ok: true };
  }, []);

  const cadastrarLeitor = useCallback(({ nome, cpf, login, senha }) => {
    const lista = readLeitores();
    if (lista.find((l) => l.login === login)) {
      return { ok: false, erro: "Login já cadastrado." };
    }
    const novo = {
      id: Date.now(),
      nome,
      cpf,
      login,
      senha,
      data_registro: new Date().toISOString().split("T")[0],
      tipo: "leitor",
    };
    saveLeitor(novo);
    return { ok: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, cadastrarBibliotecario, cadastrarLeitor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  // Retorna objeto vazio seguro se chamado fora do AuthProvider
  if (!ctx) return { user: null, login: () => {}, logout: () => {}, cadastrarBibliotecario: () => {}, cadastrarLeitor: () => {} };
  return ctx;
}