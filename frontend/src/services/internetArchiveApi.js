/**
 * internetArchiveApi.js
 *
 * Busca, na Internet Archive (archive.org), um item de texto que
 * corresponda ao livro selecionado, para permitir leitura direta
 * dentro do site via o leitor embutido (BookReader) da própria IA.
 *
 * Importante:
 *  - Nem todo livro catalogado na Open Library existe digitalizado
 *    e de leitura livre na Internet Archive.
 *  - Muitos itens da IA são "controlled digital lending" (empréstimo
 *    controlado): access-restricted-item = true. Esses só podem ser
 *    lidos por quem faz login e "empresta" o livro no próprio
 *    archive.org — não é possível embutir a leitura no nosso site.
 *    Por isso filtramos e só aceitamos itens com
 *    access-restricted-item = false (livre / domínio público).
 *  - Também só aceitamos itens marcados como português: sem esse
 *    filtro, um título em comum pode casar com uma edição em outro
 *    idioma (ex: "1984" em espanhol, ou "Steve Jobs" no inglês
 *    original) e a leitura ficaria no idioma errado.
 */

const IA_SEARCH = "https://archive.org/advancedsearch.php";
const IA_EMBED_BASE = "https://archive.org/embed";
const IA_DETAILS_BASE = "https://archive.org/details";

function escaparValor(valor) {
  // Escapa aspas para não quebrar a query do Solr usado pela IA
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
 * Procura na Internet Archive um item de texto, em português, de
 * leitura livre que corresponda ao título (e, se disponível, autor)
 * informados.
 *
 * Retorna o "identifier" da IA (usado para montar a URL do leitor)
 * ou null se nada de leitura livre em português for encontrado.
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

    // Só aceita itens de leitura livre (não restritos por empréstimo)
    // e que estejam marcados como português.
    const livre = docs.find(
      (doc) =>
        String(doc["access-restricted-item"]) !== "true" &&
        doc.identifier &&
        ehPortugues(doc.language)
    );

    return livre ? livre.identifier : null;
  } catch {
    // Falha de rede, CORS, ou resposta inesperada — não bloqueia o resto do fluxo
    return null;
  }
}

/** URL do leitor embutido (iframe) da Internet Archive para um identifier. */
export function getLeituraEmbedUrl(identifier) {
  if (!identifier) return null;
  return `${IA_EMBED_BASE}/${encodeURIComponent(identifier)}`;
}

/** URL da página pública do item na Internet Archive (fallback / abrir em nova aba). */
export function getLeituraDetailsUrl(identifier) {
  if (!identifier) return null;
  return `${IA_DETAILS_BASE}/${encodeURIComponent(identifier)}`;
}