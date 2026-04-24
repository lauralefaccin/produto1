import { useMemo, useState } from "react";
import "./Leitores.css";

// ── Helpers ───────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

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
  { id: 1, nome: "Ana Luiza Pereira",    cpf: "123.456.789-00", login: "ana",    senha: "ana123",    data_registro: "2024-02-10" },
  { id: 2, nome: "Carlos Eduardo Souza", cpf: "987.654.321-11", login: "carlos", senha: "carlos123", data_registro: "2024-03-01" },
  { id: 3, nome: "Juliana Ferreira",     cpf: "456.789.123-22", login: "juli",   senha: "juli123",   data_registro: "2024-01-15" },
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
  const [leitores, setLeitores] = useState(() => readLeitores());
  const [search,   setSearch]   = useState("");

  // ── Modal: Cadastrar ──
  const [modalAdd,  setModalAdd]  = useState(false);
  const [formAdd,   setFormAdd]   = useState({ nome: "", cpf: "", data_registro: today(), login: "", senha: "" });
  const [erroAdd,   setErroAdd]   = useState("");

  // ── Modal: Editar login/senha ──
  const [modalEdit, setModalEdit] = useState(false);
  const [editando,  setEditando]  = useState(null); // leitor sendo editado
  const [formEdit,  setFormEdit]  = useState({ login: "", senha: "", confirmar: "" });
  const [erroEdit,  setErroEdit]  = useState("");
  const [sucessoEdit, setSucessoEdit] = useState("");

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
          (l.cpf && l.cpf.includes(search))
      ),
    [leitores, search]
  );

  // ── Helpers de campo ──
  const inpAdd  = (k) => ({
    value: formAdd[k],
    onChange: (e) => setFormAdd((f) => ({ ...f, [k]: e.target.value })),
  });
  const inpEdit = (k) => ({
    value: formEdit[k],
    onChange: (e) => setFormEdit((f) => ({ ...f, [k]: e.target.value })),
  });

  // ── CRUD: Create ──
  function handleAdd() {
    if (!formAdd.nome.trim())  { setErroAdd("⚠️ Informe o nome completo."); return; }
    if (!formAdd.login.trim()) { setErroAdd("⚠️ Informe o login."); return; }
    if (!formAdd.senha.trim()) { setErroAdd("⚠️ Informe a senha."); return; }
    if (leitores.find((l) => l.login === formAdd.login)) {
      setErroAdd("⚠️ Login já cadastrado."); return;
    }
    const novo = {
      id: nextId,
      nome: formAdd.nome.trim(),
      cpf: formAdd.cpf.trim(),
      login: formAdd.login.trim(),
      senha: formAdd.senha,
      data_registro: formAdd.data_registro || today(),
    };
    const novaLista = [...leitores, novo];
    setLeitores(novaLista);
    saveLeitores(novaLista);
    setFormAdd({ nome: "", cpf: "", data_registro: today(), login: "", senha: "" });
    setErroAdd("");
    setModalAdd(false);
  }

  // ── CRUD: Update ──
  function abrirEdit(leitor) {
    setEditando(leitor);
    setFormEdit({ login: leitor.login, senha: leitor.senha ?? "", confirmar: "" });
    setErroEdit("");
    setSucessoEdit("");
    setModalEdit(true);
  }

  function handleUpdate() {
    setErroEdit(""); setSucessoEdit("");
    if (!formEdit.login.trim()) { setErroEdit("⚠️ Informe o login."); return; }
    if (!formEdit.senha.trim()) { setErroEdit("⚠️ Informe a senha."); return; }
    if (formEdit.confirmar && formEdit.senha !== formEdit.confirmar) {
      setErroEdit("⚠️ As senhas não coincidem."); return;
    }
    // Verifica duplicidade de login (exceto o próprio leitor)
    if (
      leitores.find(
        (l) => l.login === formEdit.login.trim() && l.id !== editando.id
      )
    ) {
      setErroEdit("⚠️ Login já usado por outro leitor."); return;
    }

    const novaLista = leitores.map((l) =>
      l.id === editando.id
        ? { ...l, login: formEdit.login.trim(), senha: formEdit.senha }
        : l
    );
    setLeitores(novaLista);
    saveLeitores(novaLista);
    setSucessoEdit("✅ Dados atualizados com sucesso!");
    setErroEdit("");
  }

  // ── CRUD: Delete ──
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
          onClick={() => { setErroAdd(""); setModalAdd(true); }}
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
                  <td data-label="Ações" className="leitores-actions-cell">
                    <button className="btn-action" onClick={() => abrirEdit(l)}>
                      ✏️ Editar
                    </button>
                    <button className="btn-action btn-action-danger" onClick={() => handleRemove(l.id)}>
                      🗑️ Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Cadastrar ── */}
      <Modal open={modalAdd} onClose={() => { setModalAdd(false); setErroAdd(""); }} title="Cadastrar Leitor">
        <div className="leitores-form-grid">
          <FormField label="Nome completo" full>
            <input {...inpAdd("nome")} placeholder="Nome" />
          </FormField>
          <FormField label="CPF">
            <input {...inpAdd("cpf")} placeholder="000.000.000-00" />
          </FormField>
          <FormField label="Data de Registro">
            <input type="date" {...inpAdd("data_registro")} />
          </FormField>
          <FormField label="Login de acesso">
            <input {...inpAdd("login")} placeholder="Ex: joao.silva" />
          </FormField>
          <FormField label="Senha de acesso">
            <input type="password" {...inpAdd("senha")} placeholder="Senha" />
          </FormField>
        </div>

        {erroAdd && (
          <p className="leitores-modal-hint" style={{ color: "#8b2020", background: "#fde8e8", borderColor: "#f7c1c1" }}>
            {erroAdd}
          </p>
        )}

        <p className="leitores-modal-hint">
          O leitor usará esse login e senha para acessar o sistema.
        </p>

        <div className="leitores-modal-actions">
          <button className="btn-secondary" onClick={() => { setModalAdd(false); setErroAdd(""); }}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            Salvar
          </button>
        </div>
      </Modal>

      {/* ── Modal: Editar login/senha ── */}
      <Modal open={modalEdit} onClose={() => setModalEdit(false)} title={`Editar acesso — ${editando?.nome}`}>
        <div className="leitores-form-grid">
          <FormField label="Login de acesso" full>
            <input {...inpEdit("login")} placeholder="Login" />
          </FormField>
          <FormField label="Nova senha">
            <input type="password" {...inpEdit("senha")} placeholder="Nova senha" />
          </FormField>
          <FormField label="Confirmar senha">
            <input type="password" {...inpEdit("confirmar")} placeholder="Repita a senha" />
          </FormField>
        </div>

        {erroEdit   && (
          <p className="leitores-modal-hint" style={{ color: "#8b2020", background: "#fde8e8", borderColor: "#f7c1c1" }}>
            {erroEdit}
          </p>
        )}
        {sucessoEdit && (
          <p className="leitores-modal-hint" style={{ color: "#1a5c2a", background: "#d4edda", borderColor: "#a3d3b0" }}>
            {sucessoEdit}
          </p>
        )}

        <p className="leitores-modal-hint">
          Deixe a confirmação em branco se não quiser alterar a senha.
        </p>

        <div className="leitores-modal-actions">
          <button className="btn-secondary" onClick={() => setModalEdit(false)}>
            Fechar
          </button>
          <button className="btn-primary" onClick={handleUpdate}>
            Salvar alterações
          </button>
        </div>
      </Modal>

    </section>
  );
}