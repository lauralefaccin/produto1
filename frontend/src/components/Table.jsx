import { useMemo } from "react";
import { useAcervo } from "../data/acervo";

export default function Table() {
  const acervo = useAcervo();
  const ultimosLivros = useMemo(
    () => [...acervo].slice(-5).reverse(),
    [acervo]
  );

  return (
    <div className="table">
      <h2>Últimos livros adicionados</h2>

      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Gênero</th>
            <th>Ano</th>
          </tr>
        </thead>

        <tbody>
          {ultimosLivros.length > 0 ? (
            ultimosLivros.map((livro) => (
              <tr key={livro.id}>
                <td>{livro.titulo}</td>
                <td>{livro.autor}</td>
                <td>{livro.genero}</td>
                <td>{livro.ano || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                Adicione um livro para aparecer aqui.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}