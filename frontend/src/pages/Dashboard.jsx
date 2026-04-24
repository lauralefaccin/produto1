import Stats from "../components/Stats";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.trim().split(" ")[0] || "";

  return (
    <div className="dashboard">


      <div className="header">
        <h1>
          Bem-vindo(a) {primeiroNome ? ` ${primeiroNome}` : ""}
        </h1>
        <p>Visão geral do acervo e circulação.</p>
      </div>


      <Stats />

 
      <Table />

    </div>
  );
}