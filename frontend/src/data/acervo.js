import { useEffect, useState } from "react";
import { loadAutores } from "./autores";

const STORAGE_KEY = "acervo_livros";
const ACERVO_CHANGED_EVENT = "acervo:changed";

function normalizeLivro(livro, autores) {
  const autorId = livro.autorId || autores.find((autor) => autor.nome === livro.autor)?.id || null;
  return {
    ...livro,
    autorId,
    autor: livro.autor || "",
  };
}

const ACERVO_INICIAL = [
  {
    id: 1,
    genero: "Clássico",
    titulo: "Dom Quixote",
    autor: "Miguel de Cervantes",
    nacionalidade: "Espanhol",
    editora: "Penguin",
    ano: 1605,
  },
  {
    id: 2,
    genero: "Realismo",
    titulo: "O Cortiço",
    autor: "Aluísio Azevedo",
    nacionalidade: "Brasileiro",
    editora: "Ática",
    ano: 1890,
  },
  {
    id: 3,
    genero: "Distopia",
    titulo: "1984",
    autor: "George Orwell",
    nacionalidade: "Britânico",
    editora: "Companhia das Letras",
    ano: 1949,
  },
  {
    id: 4,
    genero: "Ficção",
    titulo: "Grande Sertão: Veredas",
    autor: "João Guimarães Rosa",
    nacionalidade: "Brasileiro",
    editora: "Nova Fronteira",
    ano: 1956,
  },
  {
    id: 5,
    genero: "Fantasia",
    titulo: "Harry Potter e a Pedra Filosofal",
    autor: "J.K. Rowling",
    nacionalidade: "Britânico",
    editora: "Rocco",
    ano: 1997,
  },
];

function readAcervo() {
  if (typeof window === "undefined") {
    return ACERVO_INICIAL;
  }

  const autores = loadAutores();
  const salvo = window.localStorage.getItem(STORAGE_KEY);

  if (!salvo) {
    return ACERVO_INICIAL.map((livro) => normalizeLivro(livro, autores));
  }

  try {
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed)
      ? parsed.map((livro) => normalizeLivro(livro, autores))
      : ACERVO_INICIAL.map((livro) => normalizeLivro(livro, autores));
  } catch {
    return ACERVO_INICIAL.map((livro) => normalizeLivro(livro, autores));
  }
}

export function saveAcervo(livros) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(livros));
  window.dispatchEvent(new CustomEvent(ACERVO_CHANGED_EVENT));
}

export function useAcervo() {
  const [livros, setLivros] = useState(() => readAcervo());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (!window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ACERVO_INICIAL));
    }

    const syncAcervo = () => setLivros(readAcervo());

    window.addEventListener(ACERVO_CHANGED_EVENT, syncAcervo);
    window.addEventListener("storage", syncAcervo);

    return () => {
      window.removeEventListener(ACERVO_CHANGED_EVENT, syncAcervo);
      window.removeEventListener("storage", syncAcervo);
    };
  }, []);

  return livros;
}
