import { useState, useEffect, useMemo } from "react";
import { getGeneroColor, useGeneros } from "../data/generos";
import "./Livros.css"; // Reaproveitando os estilos
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import lixeiraIcon from "../imagens/icons/lixeira.png";

export default function Estante() {
  const { user } = useAuth();
  const [livrosEstante, setLivrosEstante] = useState([]);
  const generos = useGeneros();

  useEffect(() => {
    fetchEstante();
    const handler = () => fetchEstante();
    window.addEventListener("estante:changed", handler);
    return () => window.removeEventListener("estante:changed", handler);
  }, [user]);

  async function fetchEstante() {
    if (!user) {
      setLivrosEstante([]);
      return;
    }

    try {
      const estante = await api.getEstante();
      setLivrosEstante(estante);
    } catch (err) {
      console.error("Erro ao carregar estante:", err.message);
      setLivrosEstante([]);
    }
  }

  const getCorGenero = (generoNome) => {
    const generoCustomizado = generos.find(g => g.nome === generoNome);
    if (generoCustomizado?.cor) {
      return generoCustomizado.cor;
    }
    return getGeneroColor(generoNome);
  };

  const removerDaEstante = async (id) => {
    if (!window.confirm("Tem certeza de que deseja remover este livro da estante? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      await api.removerEstante(id);
      setLivrosEstante((current) => current.filter((livro) => livro.id !== id));
      window.dispatchEvent(new CustomEvent("estante:changed"));
    } catch (err) {
      console.error("Erro ao remover da estante:", err.message);
      alert("Não foi possível remover o livro da estante.");
    }
  };

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">MINHA CONTA</p>
          <h1>Minha Estante</h1>
        </div>
      </header>

      {livrosEstante.length === 0 ? (
        <div className="livros-vazio">
          Sua estante está vazia. Vá até a aba "Livros" e clique no ícone 🔖 para adicionar!
        </div>
      ) : (
        <div className="livros-grid">
          {livrosEstante.map((livro) => (
            <article
              key={livro.id}
              className="livro-card"
              style={{ "--livro-accent": getCorGenero(livro.genero) }}
            >
              <div className="livro-card-header">
                <p className="livro-genero">{livro.genero}</p>
                <button className="btn-delete" onClick={() => removerDaEstante(livro.id)}>
                  <img src={lixeiraIcon} alt="Remover da estante" />
                </button>
              </div>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">{livro.autor}</p>
              
              <div className="livro-meta">
                <button className="btn-ler" onClick={() => alert("Abrindo leitor...")}>
                  Ler Livro
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}