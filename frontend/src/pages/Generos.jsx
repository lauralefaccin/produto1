import { useMemo, useState } from "react";
import "./Livros.css";
import { GENEROS, getGeneroColor, normalizarGenero } from "../data/generos";
import { useAcervo } from "../data/acervo";

export default function Generos() {
  const acervo = useAcervo();
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState("cards");

  const livrosPorGenero = useMemo(() => {
    return acervo.reduce((acc, livro) => {
      const generoNormalizado = normalizarGenero(livro.genero);
      acc[generoNormalizado] = (acc[generoNormalizado] || 0) + 1;
      return acc;
    }, {});
  }, [acervo]);

  const generosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return GENEROS;
    }

    return GENEROS.filter((item) => {
      const alvo = `${item.nome} ${item.descricao}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [busca]);

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">Catálogo</p>
          <h1>Gêneros</h1>
        </div>

        <button type="button" className="livros-add-btn">
          + Adicionar Gênero
        </button>
      </header>

      <div className="livros-filters">
        <label htmlFor="busca-generos" className="livros-search">
          <span aria-hidden="true">🔎</span>
          <input
            id="busca-generos"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar gênero..."
          />
        </label>

        <select disabled aria-label="Todos os gêneros">
          <option>Todos os gêneros</option>
        </select>

        <select
          value={modo}
          onChange={(event) => setModo(event.target.value)}
          aria-label="Modo de visualização"
        >
          <option value="cards">Cards</option>
          <option value="lista">Lista</option>
        </select>
      </div>

      {modo === "cards" && (
        <div className="livros-grid">
          {generosFiltrados.map((item) => (
            <article
              key={item.nome}
              className="livro-card"
              style={{ "--livro-accent": getGeneroColor(item.nome) }}
            >
              <h3>{item.nome}</h3>
              <p className="livro-autor">{item.descricao}</p>

              <div className="livro-meta">
                <p>Livros no acervo</p>
                <p>{livrosPorGenero[item.nome] || 0}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {modo === "lista" && (
        <div className="livros-lista">
          {generosFiltrados.map((item) => (
            <article
              key={item.nome}
              className="livro-row"
              style={{ "--livro-accent": getGeneroColor(item.nome) }}
            >
              <div>
                <h3>{item.nome}</h3>
                <p className="livro-autor">{item.descricao}</p>
              </div>
              <p>Livros no acervo</p>
              <p>{livrosPorGenero[item.nome] || 0}</p>
            </article>
          ))}
        </div>
      )}

      {generosFiltrados.length === 0 && (
        <p className="livros-vazio">Nenhum gênero encontrado para a busca.</p>
      )}
    </section>
  );
}