import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Livros.css";
import { GENEROS, getGeneroColor, useGeneros } from "../data/generos";
import { saveAcervo, useAcervo } from "../data/acervo";
import { useAutores } from "../data/autores";
import { useAuth } from "../context/AuthContext";
import estanteIcon from "../imagens/icons/estante (2).png";

export default function Livros() {
  const acervo = useAcervo();
  const autores = useAutores();
  const generos = useGeneros();
  const [busca, setBusca] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const generoParam = params.get("genero");
  const [genero, setGenero] = useState(generoParam || "Todos os gêneros");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("genero");
    if (g) setGenero(g);
  }, [location.search]);
  const [modo, setModo] = useState("cards");

  const { user } = useAuth();
  const isBibliotecario = user?.tipo === "bibliotecario";

  const initialForm = {
    genero: "",
    titulo: "",
    autorId: "",
    autorNome: "",
    nacionalidade: "",
    editora: "",
    ano: "",
  };

  const [formLivro, setFormLivro] = useState(initialForm);
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const getCorGenero = (generoNome) => {
    const generoCustomizado = generos.find((g) => g.nome === generoNome);
    if (generoCustomizado?.cor) {
      return generoCustomizado.cor;
    }
    return getGeneroColor(generoNome);
  };

  const autoresMap = useMemo(
    () => Object.fromEntries(autores.map((autor) => [autor.id, autor.nome])),
    [autores]
  );

  const generosOptions = useMemo(
    () => ["Todos os gêneros", ...generos.map((g) => g.nome)],
    [generos]
  );

  const getAutorNome = (livro) => {
    const autorId = Number(livro.autorId);
    return autoresMap[autorId] || livro.autor || "";
  };

  const livrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return acervo.filter((livro) => {
      const atendeGenero = genero === "Todos os gêneros" || livro.genero === genero;
      if (!atendeGenero) return false;
      if (!termo) return true;
      const autorNome = getAutorNome(livro);
      const alvoBusca = `${livro.titulo} ${autorNome}`.toLowerCase();
      return alvoBusca.includes(termo);
    });
  }, [busca, genero, acervo, autoresMap]);

  // FUNÇÃO PARA SALVAR NA ESTANTE
  const adicionarAEstante = (livro, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const estanteAtual = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    const ids = Array.isArray(estanteAtual)
      ? estanteAtual.map((item) => (typeof item === "number" ? item : item?.id)).filter(Boolean)
      : [];

    if (ids.includes(livro.id)) {
      alert("Este livro já está na sua estante!");
      return;
    }

    const novaEstante = [...ids, livro.id];
    localStorage.setItem("minhaEstante", JSON.stringify(novaEstante));
    window.dispatchEvent(new CustomEvent("estante:changed"));
    alert(`${livro.titulo} foi adicionado à sua Estante!`);
  };

  const abrirAdicionarLivro = () => {
    setFormLivro(initialForm);
    setEditandoId(null);
    setFormAberto(true);
  };

  const abrirEditarLivro = (livro) => {
    setFormLivro({
      genero: livro.genero || "",
      titulo: livro.titulo || "",
      autorId: livro.autorId?.toString() || "",
      autorNome: getAutorNome(livro),
      nacionalidade: livro.nacionalidade || "",
      editora: livro.editora || "",
      ano: livro.ano?.toString() || "",
    });
    setEditandoId(livro.id);
    setFormAberto(true);
  };

  const cancelarFormulario = () => {
    setFormLivro(initialForm);
    setEditandoId(null);
    setFormAberto(false);
  };

  const salvarLivro = () => {
    if (!formLivro.titulo.trim() || !formLivro.autorId || !formLivro.genero.trim()) {
      alert("Preencha pelo menos título, autor e gênero.");
      return;
    }

    const autorId = Number(formLivro.autorId);
    const autorNome = autoresMap[autorId] || formLivro.autorNome.trim();

    if (!autorId || !autorNome) {
      alert("Selecione um autor válido existente.");
      return;
    }

    const livroFormatado = {
      ...formLivro,
      titulo: formLivro.titulo.trim(),
      autorId,
      autor: autorNome,
      genero: formLivro.genero.trim(),
      nacionalidade: formLivro.nacionalidade.trim(),
      editora: formLivro.editora.trim(),
      ano: Number(formLivro.ano) || 0,
    };

    const novoAcervo = editandoId
      ? acervo.map((livro) => (livro.id === editandoId ? { ...livro, ...livroFormatado, id: editandoId } : livro))
      : [...acervo, { ...livroFormatado, id: Date.now() }];

    saveAcervo(novoAcervo);
    cancelarFormulario();
  };

  const excluirLivro = (livro) => {
    if (!window.confirm(`Tem certeza de que deseja excluir "${livro.titulo}"? Esta ação removerá o livro de todas as páginas, incluindo a Estante de leitores.`)) {
      return;
    }
    saveAcervo(acervo.filter((item) => item.id !== livro.id));
    const estanteAtual = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    const novaIds = Array.isArray(estanteAtual)
      ? estanteAtual.map((item) => (typeof item === "number" ? item : item?.id)).filter(Boolean).filter((id) => id !== livro.id)
      : [];
    localStorage.setItem("minhaEstante", JSON.stringify(novaIds));
    window.dispatchEvent(new CustomEvent("estante:changed"));
    if (editandoId === livro.id) {
      cancelarFormulario();
    }
  };

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">Acervo</p>
          <h1>Livros</h1>
        </div>
        {isBibliotecario && (
          <button type="button" className="livros-add-btn" onClick={abrirAdicionarLivro}>
            + Adicionar Livro
          </button>
        )}
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
          {generosOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select value={modo} onChange={(e) => setModo(e.target.value)}>
          <option value="cards">Cards</option>
          <option value="lista">Lista</option>
        </select>
      </div>

      {formAberto && (
        <>
          <div className="modal-backdrop" onClick={cancelarFormulario} />
          <section className="livros-form-panel modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="livros-form-grid">
              <label>
                Gênero
                <select
                  value={formLivro.genero}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, genero: e.target.value }))}
                >
                  <option value="">Selecione um gênero</option>
                  {generos.map((g) => (
                    <option key={g.nome} value={g.nome}>{g.nome}</option>
                  ))}
                </select>
              </label>
              <label>
                Título
                <input
                  value={formLivro.titulo}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título do livro"
                />
              </label>
              <label>
                Autor
                <select
                  value={formLivro.autorId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedAutor = autores.find((autor) => autor.id.toString() === selectedId);
                    setFormLivro((prev) => ({
                      ...prev,
                      autorId: selectedId,
                      autorNome: selectedAutor ? selectedAutor.nome : "",
                    }));
                  }}
                >
                  <option value="">Selecione um autor existente</option>
                  {autores.map((autor) => (
                    <option key={autor.id} value={autor.id}>
                      {autor.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nacionalidade
                <input
                  value={formLivro.nacionalidade}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, nacionalidade: e.target.value }))}
                  placeholder="Nacionalidade"
                />
              </label>
              <label>
                Editora
                <input
                  value={formLivro.editora}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, editora: e.target.value }))}
                  placeholder="Editora"
                />
              </label>
              <label>
                Ano
                <input
                  value={formLivro.ano}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, ano: e.target.value }))}
                  placeholder="Ano de publicação"
                  type="number"
                />
              </label>
            </div>
            <div className="livros-form-actions">
              <button type="button" className="btn-add-estante-list" onClick={salvarLivro}>
                {editandoId ? "Salvar alterações" : "Salvar livro"}
              </button>
              <button type="button" className="btn-delete" onClick={cancelarFormulario}>
                Cancelar
              </button>
            </div>
          </section>
        </>
      )}

      {modo === "cards" && (
        <div className="livros-grid">
          {livrosFiltrados.map((livro) => (
            <article
              key={livro.id}
              className="livro-card"
              style={{ "--livro-accent": getCorGenero(livro.genero) }}
            >
              <div className="livro-card-header">
                <p className="livro-genero">{livro.genero}</p>
                <button 
                  className="btn-add-estante" 
                  onClick={(e) => adicionarAEstante(livro, e)}
                  title="Salvar na Estante"
                >
                  <img src={estanteIcon} alt="Salvar na Estante" />
                </button>
              </div>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">{getAutorNome(livro)} • {livro.nacionalidade}</p>
              <div className="livro-meta">
                <p>{livro.editora} • {livro.ano}</p>
              </div>
              {isBibliotecario && (
                <div className="livro-card-actions">
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => abrirEditarLivro(livro)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => excluirLivro(livro)}
                  >
                    Excluir
                  </button>
                </div>
              )}
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
              style={{ "--livro-accent": getCorGenero(livro.genero) }}
            >
              <div>
                <p className="livro-genero">{livro.genero}</p>
                <h3>{livro.titulo}</h3>
                <p className="livro-autor">{getAutorNome(livro)}</p>
                <p className="livro-meta-row">{livro.editora} • {livro.ano}</p>
                {isBibliotecario && (
                  <div className="livro-row-actions">
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => abrirEditarLivro(livro)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => excluirLivro(livro)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
              <button 
                className="btn-add-estante-list" 
                onClick={(e) => adicionarAEstante(livro, e)}
              >
                <img src={estanteIcon} alt="Salvar na Estante" /> Salvar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}