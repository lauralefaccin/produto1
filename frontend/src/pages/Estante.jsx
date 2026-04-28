import { useState, useEffect, useMemo } from "react";
import { getGeneroColor, useGeneros } from "../data/generos";
import { useAcervo } from "../data/acervo";
import "./Livros.css"; // Reaproveitando os estilos
import lixeiraIcon from "../imagens/icons/lixeira.png";

function loadEstanteIds() {
  if (typeof window === "undefined") return [];
  const saved = JSON.parse(localStorage.getItem("minhaEstante") || "[]");
  if (!Array.isArray(saved)) return [];
  return saved
    .map((item) => (typeof item === "number" ? item : item?.id))
    .filter(Boolean);
}

export default function Estante() {
  const [estanteIds, setEstanteIds] = useState(() => loadEstanteIds());
  const acervo = useAcervo();
  const generos = useGeneros();

  const livrosEstante = useMemo(
    () => acervo.filter((livro) => estanteIds.includes(livro.id)),
    [acervo, estanteIds]
  );

  useEffect(() => {
    setEstanteIds(loadEstanteIds());
  }, [acervo]);

  const getCorGenero = (generoNome) => {
    const generoCustomizado = generos.find(g => g.nome === generoNome);
    if (generoCustomizado?.cor) {
      return generoCustomizado.cor;
    }
    return getGeneroColor(generoNome);
  };

  const removerDaEstante = (id) => {
    if (!window.confirm("Tem certeza de que deseja remover este livro da estante? Esta ação não pode ser desfeita.")) {
      return;
    }
    const novaIds = estanteIds.filter((livroId) => livroId !== id);
    setEstanteIds(novaIds);
    localStorage.setItem("minhaEstante", JSON.stringify(novaIds));
    window.dispatchEvent(new CustomEvent("estante:changed"));
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