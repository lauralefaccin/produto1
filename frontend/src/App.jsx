import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Livros from "./pages/Livros";
import Leitores from "./pages/Leitores";
import Emprestimos from "./pages/Emprestimos";
import Generos from "./pages/Generos";

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
            <Route path="/generos" element={<Generos />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;