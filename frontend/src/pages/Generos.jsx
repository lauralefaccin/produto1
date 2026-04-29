import { useMemo, useState } from "react";
import { useAutores } from "../data/autores";
import "./Livros.css";
import {
  GENEROS,
  getGeneroColor,
  loadGeneros,
  saveGeneros,
  normalizarGenero,
} from "../data/generos";
import { saveAcervo, useAcervo } from "../data/acervo";
import { useAuth } from "../context/AuthContext";

const initialGeneroForm = {
  nome: "",
  descricao: "",
  cor: "",
};

export default function Generos() {
  const acervo = useAcervo();
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState("cards");
  const [generos, setGeneros] = useState(() => loadGeneros());
  const [formAberto, setFormAberto] = useState(false);
  const [editandoGenero, setEditandoGenero] = useState(null);
  const [formGenero, setFormGenero] = useState(initialGeneroForm);
  const [selectedGenero, setSelectedGenero] = useState(null);

  const autores = useAutores();
  const autoresMap = useMemo(
    () => Object.fromEntries(autores.map((autor) => [autor.id, autor.nome])),
    [autores]
  );

  const livrosDoGenero = useMemo(() => {
    if (!selectedGenero) return [];
    return acervo.filter((livro) => livro.genero === selectedGenero.nome);
  }, [acervo, selectedGenero]);

  const livrosFiltradosPorBusca = useMemo(() => {
    if (!selectedGenero) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return livrosDoGenero;
    return livrosDoGenero.filter((livro) => {
      const autorNome = autoresMap[livro.autorId] || livro.autor || "";
      const alvo = `${livro.titulo} ${autorNome} ${livro.genero}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [selectedGenero, livrosDoGenero, busca, autoresMap]);

  const livrosPorGenero = useMemo(() => {
    return acervo.reduce((acc, livro) => {
      const generoNormalizado = normalizarGenero(livro.genero);
      acc[generoNormalizado] = (acc[generoNormalizado] || 0) + 1;
      return acc;
    }, {});
  }, [acervo]);

  const { user } = useAuth();
  const isBibliotecario = user?.tipo === "bibliotecario";

  const generosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return generos;
    }

    return generos.filter((item) => {
      const alvo = `${item.nome} ${item.descricao}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [busca, generos]);

  const abrirAdicionarGenero = () => {
    setFormGenero(initialGeneroForm);
    setEditandoGenero(null);
    setFormAberto(true);
  };

  const abrirEditarGenero = (item) => {
    setFormGenero({
      nome: item.nome,
      descricao: item.descricao,
      cor: item.cor || "",
    });
    setEditandoGenero(item.nome);
    setFormAberto(true);
  };

  const cancelarFormulario = () => {
    setFormGenero(initialGeneroForm);
    setEditandoGenero(null);
    setFormAberto(false);
  };

  const salvarGenero = () => {
    const nome = formGenero.nome.trim();
    const descricao = formGenero.descricao.trim();
    const cor = formGenero.cor.trim();

    if (!nome || !descricao) {
      alert("Preencha nome e descrição do gênero.");
      return;
    }

    const existeOutro = generos.some(
      (item) => item.nome.toLowerCase() === nome.toLowerCase() && item.nome !== editandoGenero
    );

    if (existeOutro) {
      alert("Já existe um gênero com esse nome.");
      return;
    }

    const novoGenero = { nome, descricao, cor };
    const generosAtualizados = editandoGenero
      ? generos.map((item) => (item.nome === editandoGenero ? novoGenero : item))
      : [...generos, novoGenero];

    setGeneros(generosAtualizados);
    saveGeneros(generosAtualizados);

    if (editandoGenero && editandoGenero !== nome) {
      saveAcervo(
        acervo.map((livro) =>
          livro.genero === editandoGenero ? { ...livro, genero: nome } : livro
        )
      );
    }

    cancelarFormulario();
  };

  const excluirGenero = (item) => {
    if (!window.confirm(`Deseja excluir o gênero "${item.nome}"?`)) {
      return;
    }

    const generosAtuais = generos.filter((genero) => genero.nome !== item.nome);
    setGeneros(generosAtuais);
    saveGeneros(generosAtuais);

    if (editandoGenero === item.nome) {
      cancelarFormulario();
    }
  };

  return (
    <section className="livros-page">
      <header className="livros-header">
        <div>
          <p className="livros-kicker">Catálogo</p>
          <h1>Gêneros</h1>
        </div>

        {isBibliotecario && !selectedGenero && (
          <button type="button" className="livros-add-btn" onClick={abrirAdicionarGenero}>
            + Adicionar Gênero
          </button>
        )}
      </header>

      <div className="livros-filters">
        <label htmlFor="busca-generos" className="livros-search">
          <span aria-hidden="true">🔎</span>
          <input
            id="busca-generos"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder={selectedGenero ? "Pesquisar livros ou nome do autor" : "Pesquisar gênero..."}
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

      {formAberto && (
        <>
          <div className="modal-backdrop" onClick={cancelarFormulario} />
          <section className="livros-form-panel modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="livros-form-grid">
              <label>
                Nome
                <input
                  value={formGenero.nome}
                  onChange={(event) => setFormGenero((prev) => ({ ...prev, nome: event.target.value }))}
                  placeholder="Nome do gênero"
                />
              </label>
              <label>
                Cor
                <input
                  type="color"
                  value={formGenero.cor}
                  onChange={(event) => setFormGenero((prev) => ({ ...prev, cor: event.target.value }))}
                  placeholder="Cor (hex)"
                />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Descrição
                <input
                  value={formGenero.descricao}
                  onChange={(event) => setFormGenero((prev) => ({ ...prev, descricao: event.target.value }))}
                  placeholder="Descrição do gênero"
                />
              </label>
            </div>
            <div className="livros-form-actions">
              <button type="button" className="btn-add-estante-list" onClick={salvarGenero}>
                {editandoGenero ? "Salvar alterações" : "Salvar gênero"}
              </button>
              <button type="button" className="btn-delete" onClick={cancelarFormulario}>
                Cancelar
              </button>
            </div>
          </section>
        </>
      )}

      {selectedGenero ? (
        <>
          <div className="livros-header" style={{ marginTop: 0 }}>
            <div>
              <p className="livros-kicker">Gênero selecionado</p>
              <h1>{selectedGenero.nome}</h1>
            </div>
            <button type="button" className="livros-add-btn" onClick={() => setSelectedGenero(null)}>
              Voltar para gêneros
            </button>
          </div>

          <div className="livros-filters" style={{ marginBottom: 10, borderBottom: "none" }}>
            <p style={{ margin: 0, color: "#6f5f49" }}>{livrosFiltradosPorBusca.length} livro(s) encontrado(s) para este gênero.</p>
          </div>

          {livrosFiltradosPorBusca.length > 0 ? (
            <div className="livros-grid">
              {livrosFiltradosPorBusca.map((livro) => (
                <article key={livro.id} className="livro-card" style={{ "--livro-accent": getGeneroColor(livro.genero) }}>
                  <div className="livro-card-header">
                    <p className="livro-genero">{livro.genero}</p>
                  </div>
                  <h3>{livro.titulo}</h3>
                  <p className="livro-autor">{autoresMap[livro.autorId] || livro.autor || "Autor não informado"} • {livro.nacionalidade}</p>
                  <div className="livro-meta">
                    <p>{livro.editora} • {livro.ano}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="livros-vazio">Nenhum livro encontrado para este gênero.</div>
          )}
        </>
      ) : (
        modo === "cards" && (
          <div className="livros-grid">
            {generosFiltrados.map((item) => (
              <article
                key={item.nome}
                className="livro-card"
                style={{ "--livro-accent": item.cor || getGeneroColor(item.nome) }}
                onClick={() => setSelectedGenero(item)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedGenero(item)}
              >
                <h3>{item.nome}</h3>
                <p className="livro-autor">{item.descricao}</p>

                <div className="livro-meta">
                  <p>Livros no acervo</p>
                  <p>{livrosPorGenero[item.nome] || 0}</p>
                </div>

                {isBibliotecario && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button type="button" className="btn-add-estante-list" onClick={(e) => { e.stopPropagation(); abrirEditarGenero(item); }}>
                      Editar
                    </button>
                    <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); excluirGenero(item); }}>
                      Excluir
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )
      )}

      {modo === "lista" && (
        <div className="livros-lista">
          {generosFiltrados.map((item) => (
            <article
              key={item.nome}
              className="livro-row"
              style={{ "--livro-accent": item.cor || getGeneroColor(item.nome) }}
            >
              <div>
                <h3>{item.nome}</h3>
                <p className="livro-autor">{item.descricao}</p>
                {isBibliotecario && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button type="button" className="btn-add-estante-list" onClick={(e) => { e.stopPropagation(); abrirEditarGenero(item); }}>
                      Editar
                    </button>
                    <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); excluirGenero(item); }}>
                      Excluir
                    </button>
                  </div>
                )}
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