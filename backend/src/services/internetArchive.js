/**
 * internetArchive.js (backend)
 *
 * Mesma lógica do serviço equivalente do frontend
 * (frontend/src/services/internetArchiveApi.js), só que rodando em
 * Node — usado no seed do banco (init.js) para já deixar os livros
 * de exemplo prontos para leitura, quando existir versão livre.
 *
 * Só aceita itens que sejam:
 *  - de leitura livre (access-restricted-item = false, sem precisar
 *    de "empréstimo"/login no archive.org);
 *  - em português (evita pegar, por engano, uma versão em espanhol,
 *    inglês etc. só porque bateu o título).
 * Se não encontrar nenhuma versão em português nessas condições,
 * retorna null — melhor não linkar nada do que linkar no idioma errado.
 */

const IA_SEARCH = "https://archive.org/advancedsearch.php";

function escaparValor(valor) {
  return String(valor).replace(/"/g, '\\"');
}

function ehPortugues(idiomaRaw) {
  if (!idiomaRaw) return false;
  const idiomas = Array.isArray(idiomaRaw) ? idiomaRaw : [idiomaRaw];
  return idiomas.some((i) => {
    const v = String(i).toLowerCase();
    return v.includes("por") || v === "pt" || v.includes("portugu");
  });
}

/**
 * Busca na Internet Archive um item de texto, em português, de
 * leitura livre, correspondente ao título (e autor, se informado).
 * Retorna o "identifier" ou null se não encontrar nada nessas condições.
 */
export async function buscarNaInternetArchive(titulo, autor = "") {
  if (!titulo || !titulo.trim()) return null;

  const partesQuery = [`title:"${escaparValor(titulo.trim())}"`];
  if (autor && autor.trim()) {
    partesQuery.push(`creator:"${escaparValor(autor.trim())}"`);
  }
  partesQuery.push("mediatype:texts");

  const params = new URLSearchParams();
  params.set("q", partesQuery.join(" AND "));
  params.append("fl[]", "identifier");
  params.append("fl[]", "title");
  params.append("fl[]", "access-restricted-item");
  params.append("fl[]", "language");
  params.set("rows", "15");
  params.set("output", "json");

  try {
    const res = await fetch(`${IA_SEARCH}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const docs = data?.response?.docs || [];

    const livre = docs.find(
      (doc) =>
        String(doc["access-restricted-item"]) !== "true" &&
        doc.identifier &&
        ehPortugues(doc.language)
    );

    return livre ? livre.identifier : null;
  } catch {
    return null;
  }
}