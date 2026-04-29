import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem("sessao_atual");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (login, senha, tipo) => {
    try {
      const data = await api.login(login, senha, tipo);
      // Salva token + dados do usuário na sessão
      const sessao = { ...data.usuario, token: data.token };
      sessionStorage.setItem("sessao_atual", JSON.stringify(sessao));
      setUser(sessao);
      return { ok: true };
    } catch (err) {
      return { ok: false, erro: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("sessao_atual");
    setUser(null);
  }, []);

  const cadastrarUsuario = useCallback(async ({ nome, cpf, login, senha, tipo }) => {
    try {
      await api.cadastro({ nome, cpf, login, senha, tipo });
      return { ok: true };
    } catch (err) {
      return { ok: false, erro: err.message };
    }
  }, []);
  
  // Mantém assinatura compatível com Auth.jsx
  const cadastrarBibliotecario = (dados) =>
    cadastrarUsuario({ ...dados, tipo: "bibliotecario" });

  const cadastrarLeitor = (dados) =>
    cadastrarUsuario({ ...dados, tipo: "leitor" });

  return (
    <AuthContext.Provider value={{ user, login, logout, cadastrarBibliotecario, cadastrarLeitor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, login: () => {}, logout: () => {}, cadastrarBibliotecario: () => {}, cadastrarLeitor: () => {} };
  return ctx;
}