import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function Table() {
  const { user } = useAuth();
  const [livros, setLivros] = useState([]);

  useEffect(() => {
    async function loadLivros() {
      if (!user) {
        setLivros([]);
        return;
      }

      try {
        const livrosApi = await api.getLivros();
        setLivros(livrosApi);
      } catch (err) {
        console.error("Erro ao carregar últimos livros:", err.message);
        setLivros([]);
      }
    }

    loadLivros();
  }, [user]);

  const ultimosLivros = useMemo(() => {
    return [...livros]
      .sort((a, b) => new Date(b.criado_em || b.adicionado_em || b.id) - new Date(a.criado_em || a.adicionado_em || a.id))
      .slice(0, 5);
  }, [livros]);

  return (
    <div className="table">
      <h2>Últimos livros adicionados</h2>

      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Gênero</th>
            <th>Ano</th>
          </tr>
        </thead>

        <tbody>
          {ultimosLivros.length > 0 ? (
            ultimosLivros.map((livro) => (
              <tr key={livro.id}>
                <td>{livro.titulo}</td>
                <td>{livro.autor}</td>
                <td>{livro.genero}</td>
                <td>{livro.ano || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                Adicione um livro para aparecer aqui.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}