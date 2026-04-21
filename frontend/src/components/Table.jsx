export default function Table() {
  return (
    <div className="table">
      <h2>Empréstimos Recentes</h2>

      <table>
        <thead>
          <tr>
            <th>Leitor</th>
            <th>Livro</th>
            <th>Empréstimo</th>
            <th>Prev. Dev.</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Juliana Ferreira</td>
            <td>O Cortiço</td>
            <td>28/02/2025</td>
            <td>14/03/2025</td>
            <td className="ok">Devolvido</td>
          </tr>

          <tr>
            <td>Ana Luiza Pereira</td>
            <td>Harry Potter</td>
            <td>10/03/2025</td>
            <td>24/03/2025</td>
            <td className="late">Atrasado</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}