import { useMemo, useState } from "react";
import "./Livros.css";
import { GENEROS, getGeneroColor, useGeneros, loadGeneros } from "../data/generos";
import { saveAcervo, useAcervo } from "../data/acervo";
import { useAuth } from "../context/AuthContext";

export default function Livros() {
  const acervo = useAcervo();
  const generos = useGeneros();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState("Todos os gêneros");
  const [modo, setModo] = useState("cards");

  const { user } = useAuth();
  const isBibliotecario = user?.tipo === "bibliotecario";

  const initialForm = {
    genero: "",
    titulo: "",
    autor: "",
    nacionalidade: "",
    editora: "",
    ano: "",
  };

  const [formLivro, setFormLivro] = useState(initialForm);
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const getCorGenero = (generoNome) => {
    const generoCustomizado = generos.find(g => g.nome === generoNome);
    if (generoCustomizado?.cor) {
      return generoCustomizado.cor;
    }
    return getGeneroColor(generoNome);
  };

  const generosOptions = useMemo(
    () => ["Todos os gêneros", ...generos.map((g) => g.nome)],
    [generos]
  );

  const livrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return acervo.filter((livro) => {
      const atendeGenero = genero === "Todos os gêneros" || livro.genero === genero;
      if (!atendeGenero) return false;
      if (!termo) return true;
      const alvoBusca = `${livro.titulo} ${livro.autor}`.toLowerCase();
      return alvoBusca.includes(termo);
    });
  }, [busca, genero, acervo]);

  // FUNÇÃO PARA SALVAR NA ESTANTE
  const adicionarAEstante = (livro, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const estanteAtual = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    
    if (estanteAtual.find((item) => item.id === livro.id)) {
      alert("Este livro já está na sua estante!");
      return;
    }

    const novaEstante = [...estanteAtual, livro];
    localStorage.setItem("minhaEstante", JSON.stringify(novaEstante));
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
      autor: livro.autor || "",
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
    if (!formLivro.titulo.trim() || !formLivro.autor.trim() || !formLivro.genero.trim()) {
      alert("Preencha pelo menos título, autor e gênero.");
      return;
    }

    const livroFormatado = {
      ...formLivro,
      titulo: formLivro.titulo.trim(),
      autor: formLivro.autor.trim(),
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
    if (!window.confirm(`Deseja excluir "${livro.titulo}"?`)) return;
    saveAcervo(acervo.filter((item) => item.id !== livro.id));
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
                <input
                  value={formLivro.autor}
                  onChange={(e) => setFormLivro((prev) => ({ ...prev, autor: e.target.value }))}
                  placeholder="Nome do autor"
                />
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
                  🔖
                </button>
              </div>
              <h3>{livro.titulo}</h3>
              <p className="livro-autor">{livro.autor} • {livro.nacionalidade}</p>
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
                <p className="livro-autor">{livro.autor}</p>
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
                🔖 Salvar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}