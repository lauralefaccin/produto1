import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  const menu = [
    { path: "/", label: "Início", icon: "🏠" },
    { path: "/livros", label: "Livros", icon: "📚" },
    { path: "/leitores", label: "Leitores", icon: "👤" },
    { path: "/emprestimos", label: "Empréstimos", icon: "📄" },
    { path: "/generos", label: "Gêneros", icon: "🏷️" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER DA SIDEBAR */}
      <div className="sidebar-header">
        <h2 className="logo">
          {collapsed ? "📚" : "AtlasBook"}
        </h2>

        <button
          className="toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➡️" : "⬅️"}
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

    </div>
  );
}