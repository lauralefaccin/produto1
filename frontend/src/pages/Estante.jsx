import { useState, useEffect } from "react";
import { getGeneroColor, useGeneros } from "../data/generos";
import "./Livros.css"; // Reaproveitando os estilos

export default function Estante() {
  const [livrosEstante, setLivrosEstante] = useState([]);
  const generos = useGeneros();

  // Carrega os livros salvos ao abrir a página
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    setLivrosEstante(salvos);
  }, []);

  const getCorGenero = (generoNome) => {
    const generoCustomizado = generos.find(g => g.nome === generoNome);
    if (generoCustomizado?.cor) {
      return generoCustomizado.cor;
    }
    return getGeneroColor(generoNome);
  };

  const removerDaEstante = (id) => {
    if (window.confirm("Deseja remover este livro da sua estante?")) {
      const novaLista = livrosEstante.filter((l) => l.id !== id);
      setLivrosEstante(novaLista);
      localStorage.setItem("minhaEstante", JSON.stringify(novaLista));
      window.dispatchEvent(new CustomEvent("estante:changed"));
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
                  🗑️
                </button>
              </div>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">{livro.autor}</p>
              
              <div className="livro-meta">
                <button className="btn-ler" onClick={() => alert("Abrindo leitor...")}>
                  📖 Ler Livro
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}