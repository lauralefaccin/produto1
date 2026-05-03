import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../imagens/logolivro.png";
import inicioIcon from "../imagens/icons/inicio.png";
import tituloMenuIcon from "../imagens/icons/livro_branco.png";
import autoresMenuIcon from "../imagens/icons/autores_branco.png";
import leitoresMenuIcon from "../imagens/icons/leitores.png";
import estanteMenuIcon from "../imagens/icons/estante_branca (2).png";
import generosMenuIcon from "../imagens/icons/coracao_branco.png";
import sairIcon from "../imagens/icons/sair_branco.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const menu = [
    { path: "/", label: "Início", iconUrl: inicioIcon },
    { path: "/livros", label: "Livros", iconUrl: tituloMenuIcon },
    { path: "/autores", label: "Autores", iconUrl: autoresMenuIcon },
    { path: "/generos", label: "Gêneros", iconUrl: generosMenuIcon },
    // Leitores só aparece para bibliotecários
    ...(user?.tipo === "bibliotecario"
      ? [{ path: "/leitores", label: "Leitores", iconUrl: leitoresMenuIcon }]
      : []),
      { path: "/estante", label: "Estante", iconUrl: estanteMenuIcon },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER DA SIDEBAR */}
      <div className="sidebar-header">
        <h2 className="logo">
          {collapsed ? (
            <img src={logo} alt="AtlasBook" className="logo-image" />
          ) : (
            "AtlasBook"
          )}
        </h2>
        <button
          className="toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          ☰
        </button>
      </div>

      {/* MENU */}
      <nav>
        {menu.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className={location.pathname === item.path ? "active" : ""}
          >
            <span className="menu-icon">
              {item.iconUrl ? <img src={item.iconUrl} alt={item.label} /> : item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>  

      {/* USER INFO + LOGOUT */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user-card">
            <p style={{ margin: 0, fontSize: 11, color: "#c8922a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              {user.tipo === "bibliotecario" ? "Bibliotecário" : "Leitor"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#f0d080", fontWeight: 500 }}>
              {user.nome}
            </p>
            {user.cpf && (
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(240,208,128,0.5)" }}>
                CPF: {user.cpf}
              </p>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className="logout-button"
          style={{
            width: "100%",
            background: "none",
            border: "1px solid rgba(200,146,42,0.3)",
            color: "#c8922a",
            borderRadius: "6px",
            padding: collapsed ? "8px" : "8px 12px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            transition: "0.2s",
            marginBottom: "0",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,146,42,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <span><img src={sairIcon} alt="Sair" className="logout-icon" /></span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

    </div>
  );
}