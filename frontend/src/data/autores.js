import { useState, useEffect } from "react";

const STORAGE_KEY = "acervo_autores";
const AUTORES_CHANGED_EVENT = "autores:changed";

const AUTORES_INICIAIS = [
  {
    id: 1,
    nome: "Miguel de Cervantes",
    ano_nascimento: 1547,
    nacionalidade: "Espanhol",
    descricao: "Autor de Dom Quixote, considerado um dos maiores escritores da literatura universal.",
    principais_generos: ["Clássico", "Romance"],
  },
  {
    id: 2,
    nome: "Aluísio Azevedo",
    ano_nascimento: 1857,
    nacionalidade: "Brasileiro",
    descricao: "Escritor naturalista famoso por obras como O Cortiço.",
    principais_generos: ["Romance", "Realismo"],
  },
  {
    id: 3,
    nome: "George Orwell",
    ano_nascimento: 1903,
    nacionalidade: "Britânico",
    descricao: "Autores de distopias clássicas como 1984 e A Revolução dos Bichos.",
    principais_generos: ["Ficção", "Distopia"],
  },
  {
    id: 4,
    nome: "João Guimarães Rosa",
    ano_nascimento: 1908,
    nacionalidade: "Brasileiro",
    descricao: "Autor de Grande Sertão: Veredas, reconhecido pela linguagem rica e regional.",
    principais_generos: ["Ficção", "Romance"],
  },
  {
    id: 5,
    nome: "J.K. Rowling",
    ano_nascimento: 1965,
    nacionalidade: "Britânica",
    descricao: "Criadora do universo de Harry Potter, um dos maiores fenômenos da literatura juvenil.",
    principais_generos: ["Fantasia", "Infantojuvenil"],
  },
];

export function loadAutores() {
  if (typeof window === "undefined") {
    return AUTORES_INICIAIS;
  }

  const salvo = window.localStorage.getItem(STORAGE_KEY);

  if (!salvo) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(AUTORES_INICIAIS));
    return AUTORES_INICIAIS;
  }

  try {
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed) ? parsed : AUTORES_INICIAIS;
  } catch {
    return AUTORES_INICIAIS;
  }
}

export function saveAutores(autores) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(autores));
  window.dispatchEvent(new CustomEvent(AUTORES_CHANGED_EVENT));
}

export function useAutores() {
  const [autores, setAutores] = useState(() => loadAutores());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncAutores = () => setAutores(loadAutores());

    window.addEventListener(AUTORES_CHANGED_EVENT, syncAutores);
    window.addEventListener("storage", syncAutores);

    return () => {
      window.removeEventListener(AUTORES_CHANGED_EVENT, syncAutores);
      window.removeEventListener("storage", syncAutores);
    };
  }, []);

  return autores;
}
