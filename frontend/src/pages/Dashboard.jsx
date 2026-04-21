import Stats from "../components/Stats";
import Table from "../components/Table";

export default function Dashboard() {
  return (
    <div className="dashboard">


      <div className="header">
        <h1>
          Bem-vindo, <span>Bibliotecário 👋</span>
        </h1>
        <p>Visão geral do acervo e circulação.</p>
      </div>


      <Stats />

 
      <Table />

    </div>
  );
}