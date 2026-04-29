import { useMemo, useState } from "react";
import { saveAcervo, useAcervo } from "../data/acervo";
import { saveAutores, useAutores } from "../data/autores";
import { useAuth } from "../context/AuthContext";
import { getGeneroColor, useGeneros } from "../data/generos";
import "./Livros.css";
import estanteIcon from "../imagens/icons/estante (2).png";

const initialForm = {
  nome: "",
  ano_nascimento: "",
  nacionalidade: "",
  descricao: "",
  principais_generos: [],
};

export default function Autores() {
  const autores = useAutores();
  const acervo = useAcervo();
  const generos = useGeneros();
  const { user } = useAuth();
  const isBibliotecario = user?.tipo === "bibliotecario";

  const [busca, setBusca] = useState("");
  const [selectedAutor, setSelectedAutor] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formAutor, setFormAutor] = useState(initialForm);

  const autoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return autores.filter((autor) => autor.nome.toLowerCase().includes(termo));
  }, [autores, busca]);

  const livrosDoAutor = useMemo(() => {
    if (!selectedAutor) return [];
    return acervo.filter((livro) => livro.autorId === selectedAutor.id);
  }, [acervo, selectedAutor]);

  const livrosFiltradosPorBusca = useMemo(() => {
    if (!selectedAutor) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return livrosDoAutor;
    return livrosDoAutor.filter((livro) => {
      const alvo = `${livro.titulo} ${livro.genero}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [selectedAutor, livrosDoAutor, busca]);

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

  const abrirAdicionarAutor = () => {
    setFormAutor(initialForm);
    setEditandoId(null);
    setFormAberto(true);
  };

  const normalizeGeneros = (generos) => {
    if (Array.isArray(generos)) return generos;
    if (typeof generos === "string") {
      return generos
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const abrirEditarAutor = (autor) => {
    setFormAutor({
      nome: autor.nome || "",
      ano_nascimento: autor.ano_nascimento?.toString() || "",
      nacionalidade: autor.nacionalidade || "",
      descricao: autor.descricao || "",
      principais_generos: normalizeGeneros(autor.principais_generos),
    });
    setEditandoId(autor.id);
    setFormAberto(true);
  };

  const cancelarFormulario = () => {
    setFormAutor(initialForm);
    setEditandoId(null);
    setFormAberto(false);
  };

  const salvarAutor = () => {
    if (!formAutor.nome.trim()) {
      alert("Preencha o nome do autor.");
      return;
    }

    const autorFormatado = {
      ...formAutor,
      nome: formAutor.nome.trim(),
      ano_nascimento: Number(formAutor.ano_nascimento) || undefined,
      nacionalidade: formAutor.nacionalidade.trim(),
      descricao: formAutor.descricao.trim(),
      principais_generos: normalizeGeneros(formAutor.principais_generos),
    };

    const novoAutores = editandoId
      ? autores.map((item) =>
          item.id === editandoId
            ? { ...item, ...autorFormatado, id: editandoId }
            : item
        )
      : [...autores, { ...autorFormatado, id: Date.now() }];

    saveAutores(novoAutores);
    cancelarFormulario();
  };

  const excluirAutor = (autor) => {
    if (!window.confirm(`Tem certeza de que deseja excluir o autor ${autor.nome}? Esta ação removerá todos os livros dele, inclusive da Estante.`)) {
      return;
    }
    const livrosRestantes = acervo.filter((livro) => livro.autorId !== autor.id);
    saveAcervo(livrosRestantes);

    const estanteAtual = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
    const idsRemovidos = acervo
      .filter((livro) => livro.autorId === autor.id)
      .map((livro) => livro.id);
    const novaEstante = Array.isArray(estanteAtual)
      ? estanteAtual
          .map((item) => (typeof item === "number" ? item : item?.id))
          .filter((id) => id && !idsRemovidos.includes(id))
      : [];
    localStorage.setItem("minhaEstante", JSON.stringify(novaEstante));
    window.dispatchEvent(new CustomEvent("estante:changed"));

    saveAutores(autores.filter((item) => item.id !== autor.id));
    if (selectedAutor?.id === autor.id) {
      setSelectedAutor(null);
    }
  };

  const voltarParaLista = () => setSelectedAutor(null);

  return (
    <section className="livros-page">
      {!selectedAutor && (
        <>
          <header className="livros-header">
            <div>
              <p className="livros-kicker">Catálogo</p>
              <h1>Autores</h1>
            </div>
            {isBibliotecario && (
              <button type="button" className="livros-add-btn" onClick={abrirAdicionarAutor}>
                + Adicionar Autor
              </button>
            )}
          </header>

          <div className="livros-filters">
            <label htmlFor="busca-autores" className="livros-search">
              <span aria-hidden="true">🔎</span>
              <input
                id="busca-autores"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar autores pelo nome..."
              />
            </label>
            <div />
            <div />
          </div>
        </>
      )}

      {formAberto && (
        <>
          <div className="modal-backdrop" onClick={cancelarFormulario} />
          <section className="livros-form-panel modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="livros-form-grid">
              <label>
                Nome
                <input
                  value={formAutor.nome}
                  onChange={(e) => setFormAutor((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do autor"
                />
              </label>
              <label>
                Ano de nascimento
                <input
                  type="number"
                  value={formAutor.ano_nascimento}
                  onChange={(e) => setFormAutor((prev) => ({ ...prev, ano_nascimento: e.target.value }))}
                  placeholder="Ano de nascimento"
                />
              </label>
              <label>
                Nacionalidade
                <input
                  value={formAutor.nacionalidade}
                  onChange={(e) => setFormAutor((prev) => ({ ...prev, nacionalidade: e.target.value }))}
                  placeholder="Nacionalidade"
                />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Principais gêneros
                <div className="generos-lista-selecao">
                  {generos.map((genero) => {
                    const selecionado = formAutor.principais_generos.includes(genero.nome);

                    return (
                      <button
                        key={genero.nome}
                        type="button"
                        className={`generos-lista-item${selecionado ? " is-selected" : ""}`}
                        onClick={() => {
                          setFormAutor((prev) => ({
                            ...prev,
                            principais_generos: selecionado
                              ? prev.principais_generos.filter((item) => item !== genero.nome)
                              : [...prev.principais_generos, genero.nome],
                          }));
                        }}
                      >
                        <span>{genero.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Descrição opcional
                <textarea
                  value={formAutor.descricao}
                  onChange={(e) => setFormAutor((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Breve descrição do autor"
                  rows={4}
                  style={{ resize: "vertical", minHeight: "96px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #dfd1ba" }}
                />
              </label>
            </div>
            <div className="livros-form-actions">
              <button type="button" className="btn-add-estante-list" onClick={salvarAutor}>
                {editandoId ? "Salvar alterações" : "Salvar autor"}
              </button>
              <button type="button" className="btn-delete" onClick={cancelarFormulario}>
                Cancelar
              </button>
            </div>
          </section>
        </>
      )}

      {selectedAutor ? (
        <>
          <div className="livros-header" style={{ marginTop: 0 }}>
            <div>
              <p className="livros-kicker">Autor selecionado</p>
              <h1>{selectedAutor.nome}</h1>
            </div>
            <button type="button" className="livros-add-btn" onClick={voltarParaLista}>
              Voltar para autores
            </button>
          </div>

          <div className="livros-filters" style={{ marginBottom: 10, borderBottom: "none" }}>
            <label htmlFor="busca-livros" className="livros-search">
              <span aria-hidden="true">🔎</span>
              <input
                id="busca-livros"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar livros ou gêneros do autor..."
              />
            </label>
            <p style={{ margin: 0, color: "#6f5f49" }}>
              {livrosFiltradosPorBusca.length} livro(s) encontrado(s) para este autor.
            </p>
          </div>

          {livrosFiltradosPorBusca.length > 0 ? (
            <div className="livros-grid">
              {livrosFiltradosPorBusca.map((livro) => (
                <article key={livro.id} className="livro-card" style={{ "--livro-accent": getGeneroColor(livro.genero) }}>
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
                  <p className="livro-autor">{selectedAutor.nome} • {livro.nacionalidade}</p>
                  <div className="livro-meta">
                    <p>{livro.editora || "Editora não informada"}</p>
                    <p>{livro.ano || "-"}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="livros-vazio">Nenhum livro encontrado para este autor.</div>
          )}
        </>
      ) : (
        <div className="livros-grid">
          {autoresFiltrados.map((autor) => {
            const generoPrincipal = normalizeGeneros(autor.principais_generos)[0] || "";
            const generosAutor = normalizeGeneros(autor.principais_generos);
            return (
              <article
                key={autor.id}
                className="livro-card"
                style={{
                  "--livro-accent": getGeneroColor(generoPrincipal),
                  cursor: "pointer",
                }}
                onClick={() => setSelectedAutor(autor)}
              >
                <div className="livro-card-header">
                  <p className="livro-genero">{generoPrincipal || "Autor"}</p>
                </div>
                <h3>{autor.nome}</h3>
                <p className="livro-autor">{autor.nacionalidade || "Nacionalidade não informada"}</p>
                <p className="livro-meta-row">{autor.ano_nascimento ? `Nascido em ${autor.ano_nascimento}` : "Ano de nascimento não informado"}</p>
                {autor.descricao && <p className="livro-meta-row">{autor.descricao}</p>}
                {generosAutor.length > 0 && (
                  <p className="livro-meta-row">Gêneros: {generosAutor.join(", ")}</p>
                )}
              {isBibliotecario && (
                <div className="livro-card-actions">
                  <button
                    type="button"
                    className="btn-action-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEditarAutor(autor);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-action-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      excluirAutor(autor);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </article>
          )})}

          {autoresFiltrados.length === 0 && (
            <div className="livros-vazio">Nenhum autor encontrado. Ajuste a pesquisa ou adicione um novo autor.</div>
          )}
        </div>
      )}
    </section>
  );
}
