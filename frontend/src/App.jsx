import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Livros from "./pages/Livros";
import Leitores from "./pages/Leitores";
import Emprestimos from "./pages/Emprestimos";
import Reservas from "./pages/Reservas";
import Multas from "./pages/Multas";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className={`content ${collapsed ? "expanded" : ""}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/livros" element={<Livros />} />
            <Route path="/leitores" element={<Leitores />} />
            <Route path="/emprestimos" element={<Emprestimos />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/multas" element={<Multas />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;