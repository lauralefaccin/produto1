import { useMemo, useState } from "react";
import "./Livros.css";
import { getGeneroColor } from "../data/generos";
import { useAcervo } from "../data/acervo";

export default function Livros() {
  const acervo = useAcervo();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState("Todos os gêneros");
  const [modo, setModo] = useState("cards");

  const generos = useMemo(
    () => ["Todos os gêneros", ...new Set(acervo.map((item) => item.genero))],
    [acervo]
  );

  const livrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return acervo.filter((livro) => {
      const atendeGenero = genero === "Todos os gêneros" || livro.genero === genero;
      if (!atendeGenero) return false;
      if (!termo) return true;
      const alvoBusca = `${livro.titulo} ${livro.autor} ${livro.isbn}`.toLowerCase();
      return alvoBusca.includes(termo);
    });
  }, [busca, genero, acervo]);

  // FUNÇÃO PARA SALVAR NA ESTANTE
  const adicionarAEstante = (livro) => {
    const estanteAtual = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    
    // Verifica se o livro já está lá para não duplicar
    if (estanteAtual.find((item) => item.id === livro.id)) {
      alert("Este livro já está na sua estante!");
      return;
    }

    const novaEstante = [...estanteAtual, livro];
    localStorage.setItem("minhaEstante", JSON.stringify(novaEstante));
    alert(`${livro.titulo} foi adicionado à sua Estante!`);
  };

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">Acervo</p>
          <h1>Livros</h1>
        </div>
        <button type="button" className="livros-add-btn">+ Adicionar Livro</button>
      </header>

      <div className="livros-filters">
        <label htmlFor="busca-livros" className="livros-search">
          <span aria-hidden="true">🔎</span>
          <input
            id="busca-livros"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por título, autor..."
          />
        </label>

        <select value={genero} onChange={(e) => setGenero(e.target.value)}>
          {generos.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select value={modo} onChange={(e) => setModo(e.target.value)}>
          <option value="cards">Cards</option>
          <option value="lista">Lista</option>
        </select>
      </div>

      {modo === "cards" && (
        <div className="livros-grid">
          {livrosFiltrados.map((livro) => (
            <article
              key={livro.id}
              className="livro-card"
              style={{ "--livro-accent": getGeneroColor(livro.genero) }}
            >
              <div className="livro-card-header">
                <p className="livro-genero">{livro.genero}</p>
                <button 
                  className="btn-add-estante" 
                  onClick={() => adicionarAEstante(livro)}
                  title="Salvar na Estante"
                >
                  🔖
                </button>
              </div>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">{livro.autor} • {livro.nacionalidade}</p>
              <div className="livro-meta">
                <p>{livro.editora} • {livro.ano}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {modo === "lista" && (
        <div className="livros-lista">
          {livrosFiltrados.map((livro) => (
            <article
              key={livro.id}
              className="livro-row"
              style={{ "--livro-accent": getGeneroColor(livro.genero) }}
            >
              <div>
                <p className="livro-genero">{livro.genero}</p>
                <h3>{livro.titulo}</h3>
                <p className="livro-autor">{livro.autor}</p>
              </div>
              <button 
                className="btn-add-estante-list" 
                onClick={() => adicionarAEstante(livro)}
              >
                🔖 Salvar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}