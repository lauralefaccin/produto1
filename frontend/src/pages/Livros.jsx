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
    []
  );

  const livrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return acervo.filter((livro) => {
      const atendeGenero = genero === "Todos os gêneros" || livro.genero === genero;

      if (!atendeGenero) {
        return false;
      }

      if (!termo) {
        return true;
      }

      const alvoBusca = `${livro.titulo} ${livro.autor} ${livro.isbn}`.toLowerCase();
      return alvoBusca.includes(termo);
    });
  }, [busca, genero]);

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">Acervo</p>
          <h1>Livros</h1>
        </div>

        <button type="button" className="livros-add-btn">
          + Adicionar Livro
        </button>
      </header>

      <div className="livros-filters">
        <label htmlFor="busca-livros" className="livros-search">
          <span aria-hidden="true">🔎</span>
          <input
            id="busca-livros"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar por título, autor ou ISBN..."
          />
        </label>

        <select
          value={genero}
          onChange={(event) => setGenero(event.target.value)}
          aria-label="Filtrar por gênero"
        >
          {generos.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
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
          {livrosFiltrados.map((livro) => (
            <article
              key={livro.id}
              className="livro-card"
              style={{ "--livro-accent": getGeneroColor(livro.genero) }}
            >
              <p className="livro-genero">{livro.genero}</p>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">
                {livro.autor} • {livro.nacionalidade}
              </p>

              <div className="livro-meta">
                <p>
                  {livro.editora} • {livro.ano}
                </p>
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
                <p className="livro-autor">
                  {livro.autor} • {livro.nacionalidade}
                </p>
              </div>
              <p>
                {livro.editora} • {livro.ano}
              </p>
            </article>
          ))}
        </div>
      )}

      {livrosFiltrados.length === 0 && (
        <p className="livros-vazio">Nenhum livro encontrado para os filtros selecionados.</p>
      )}
    </section>
  );
}