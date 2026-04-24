import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../imagens/logo.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const menu = [
    { path: "/", label: "Início", icon: "🏠" },
    { path: "/livros", label: "Livros", icon: "📚" },
    // Leitores só aparece para bibliotecários
    ...(user?.tipo === "bibliotecario"
      ? [{ path: "/leitores", label: "Leitores", icon: "👤" }]
      : []),
    { path: "/estante", label: "Estante", icon: "🔖" },
    { path: "/generos", label: "Gêneros", icon: "🏷️" },
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
            <span className="menu-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* USER INFO + LOGOUT */}
      <div style={{ marginTop: "auto" }}>
        {!collapsed && user && (
          <div style={{
            background: "#2b170a",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "10px",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#c8922a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              {user.tipo === "bibliotecario" ? "🏛️ Bibliotecário" : "📖 Leitor"}
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
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,146,42,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <span>🚪</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

    </div>
  );
}