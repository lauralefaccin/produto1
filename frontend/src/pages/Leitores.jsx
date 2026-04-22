import { useMemo, useState } from "react";
import { useAcervo, saveAcervo } from "../data/acervo";
import "./Leitores.css";

// ── Helpers ───────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

// ── Storage key for readers (separate from book acervo) ───
const LEITORES_KEY = "acervo_leitores";

function readLeitores() {
  try {
    const saved = localStorage.getItem(LEITORES_KEY);
    if (!saved) return LEITORES_INICIAL;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : LEITORES_INICIAL;
  } catch {
    return LEITORES_INICIAL;
  }
}

function saveLeitores(lista) {
  localStorage.setItem(LEITORES_KEY, JSON.stringify(lista));
}

const LEITORES_INICIAL = [
  { id: 1, nome: "Ana Luiza Pereira",    cpf: "123.456.789-00", login: "ana",    data_registro: "2024-02-10" },
  { id: 2, nome: "Carlos Eduardo Souza", cpf: "987.654.321-11", login: "carlos", data_registro: "2024-03-01" },
  { id: 3, nome: "Juliana Ferreira",     cpf: "456.789.123-22", login: "juli",   data_registro: "2024-01-15" },
];

// ── Sub-components ────────────────────────────────────────
function Badge({ type, children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="leitores-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="leitores-modal">
        <div className="leitores-modal-header">
          <h2>{title}</h2>
          <button className="leitores-modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, full }) {
  return (
    <div className={`leitores-form-field${full ? " full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function Leitores() {
  const acervo = useAcervo(); // livros (para contar empréstimos futuramente)

  const [leitores, setLeitores]   = useState(() => readLeitores());
  const [search,   setSearch]     = useState("");
  const [modal,    setModal]      = useState(false);
  const [form,     setForm]       = useState({
    nome: "", cpf: "", data_registro: today(), login: "", senha: "",
  });
  const [erro,     setErro]       = useState("");

  // próximo id livre
  const nextId = useMemo(
    () => leitores.reduce((max, l) => Math.max(max, l.id), 0) + 1,
    [leitores]
  );

  const filtered = useMemo(
    () =>
      leitores.filter(
        (l) =>
          !search ||
          l.nome.toLowerCase().includes(search.toLowerCase()) ||
          l.cpf.includes(search)
      ),
    [leitores, search]
  );

  const inp = (k) => ({
    value: form[k],
    onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  function handleAdd() {
    if (!form.nome.trim())  { setErro("⚠️ Informe o nome completo."); return; }
    if (!form.login.trim()) { setErro("⚠️ Informe o login."); return; }
    if (!form.senha.trim()) { setErro("⚠️ Informe a senha."); return; }
    if (leitores.find((l) => l.login === form.login)) {
      setErro("⚠️ Login já cadastrado."); return;
    }
    const novo = {
      id: nextId,
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      login: form.login.trim(),
      data_registro: form.data_registro || today(),
    };
    const novaLista = [...leitores, novo];
    setLeitores(novaLista);
    saveLeitores(novaLista);
    setForm({ nome: "", cpf: "", data_registro: today(), login: "", senha: "" });
    setErro("");
    setModal(false);
  }

  function handleRemove(id) {
    if (!window.confirm("Deseja remover este leitor?")) return;
    const novaLista = leitores.filter((l) => l.id !== id);
    setLeitores(novaLista);
    saveLeitores(novaLista);
  }

  return (
    <section className="leitores-page">
      {/* Header */}
      <header className="leitores-header">
        <div>
          <p className="leitores-kicker">Cadastro</p>
          <h1>Leitores</h1>
        </div>
        <button
          type="button"
          className="leitores-add-btn"
          onClick={() => { setErro(""); setModal(true); }}
        >
          + Novo Leitor
        </button>
      </header>

      {/* Search */}
      <div className="leitores-search-wrap">
        <label htmlFor="busca-leitores" className="leitores-search">
          <span aria-hidden="true">🔎</span>
          <input
            id="busca-leitores"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou CPF..."
          />
        </label>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="leitores-vazio">Nenhum leitor encontrado.</p>
      ) : (
        <div className="leitores-table-wrap">
          <table className="leitores-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Registro</th>
                <th>Login</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td data-label="Nome"><strong>{l.nome}</strong></td>
                  <td data-label="CPF">{l.cpf || "—"}</td>
                  <td data-label="Registro">{fmtDate(l.data_registro)}</td>
                  <td data-label="Login">
                    <code className="login-chip">{l.login ?? "—"}</code>
                  </td>
                  <td data-label="Situação">
                    <Badge type="green">Regular</Badge>
                  </td>
                  <td data-label="Ações">
                    <button
                      className="btn-action"
                      onClick={() => handleRemove(l.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setErro(""); }}
        title="Cadastrar Leitor"
      >
        <div className="leitores-form-grid">
          <FormField label="Nome completo" full>
            <input {...inp("nome")} placeholder="Nome" />
          </FormField>
          <FormField label="CPF">
            <input {...inp("cpf")} placeholder="000.000.000-00" />
          </FormField>
          <FormField label="Data de Registro">
            <input type="date" {...inp("data_registro")} />
          </FormField>
          <FormField label="Login de acesso">
            <input {...inp("login")} placeholder="Ex: joao.silva" />
          </FormField>
          <FormField label="Senha de acesso">
            <input type="password" {...inp("senha")} placeholder="Senha" />
          </FormField>
        </div>

        {erro && (
          <p className="leitores-modal-hint" style={{ color: "#8b2020", background: "#fde8e8", borderColor: "#f7c1c1" }}>
            {erro}
          </p>
        )}

        <p className="leitores-modal-hint">
          O leitor usará esse login e senha para acessar o sistema.
        </p>

        <div className="leitores-modal-actions">
          <button className="btn-secondary" onClick={() => { setModal(false); setErro(""); }}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            Salvar
          </button>
        </div>
      </Modal>
    </section>
  );
}
