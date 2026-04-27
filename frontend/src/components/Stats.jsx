import { useState, useEffect, useMemo } from "react";
import { useAcervo } from "../data/acervo";
import { useGeneros } from "../data/generos";
import tituloIcon from "../imagens/icons/livro.png";
import estrelasIcon from "../imagens/icons/estrela.png";
import coracaoIcon from "../imagens/icons/coracao.png";
import estanteIcon from "../imagens/icons/estante (2).png";
import autoresIcon from "../imagens/icons/autores.png";

export default function Stats() {
  const acervo = useAcervo();
  const generos = useGeneros();
  const [estanteCount, setEstanteCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return JSON.parse(window.localStorage.getItem("minhaEstante") || "[]").length;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateEstanteCount = () => {
      setEstanteCount(
        JSON.parse(window.localStorage.getItem("minhaEstante") || "[]").length
      );
    };

    window.addEventListener("estante:changed", updateEstanteCount);
    window.addEventListener("storage", updateEstanteCount);

    return () => {
      window.removeEventListener("estante:changed", updateEstanteCount);
      window.removeEventListener("storage", updateEstanteCount);
    };
  }, []);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(acervo.map((livro) => livro.autor))).length,
    [acervo]
  );

  const statsData = [
    {
      title: "Títulos",
      value: acervo.length,
      iconUrl: tituloIcon,
    },
    {
      title: "Exemplares",
      value: acervo.length,
      icon: "📦",
    },
    {
      title: "Gêneros",
      value: generos.length,
      iconUrl: coracaoIcon,
    },
    {
      title: "Autores",
      value: uniqueAuthors,
      iconUrl: autoresIcon,
    },
    {
      title: "Minha Estante",
      value: estanteCount,
      iconUrl: estanteIcon,
    },
    {
      title: "Último adicionado",
      value: acervo.length > 0 ? acervo[acervo.length - 1].titulo : "Nenhum livro",
      iconUrl: estrelasIcon,
    },
  ];

  return (
    <div className="stats">
      {statsData.map((item, index) => (
        <div key={index} className="card">
          
          <div className="icon">
            {item.iconUrl ? (
              <img src={item.iconUrl} alt={`${item.title} icon`} />
            ) : (
              item.icon
            )}
          </div>

          <h2 className="value">
            {item.value}
          </h2>

          <p className="label">
            {item.title}
          </p>

        </div>
      ))}
    </div>
  );
}