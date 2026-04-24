import { useState, useEffect } from "react";

export const GENEROS = [
  {
    nome: "Clássico",
    cor: "#c7922d",
    descricao: "Obras atemporais que marcaram gerações e estilos literários.",
  },
  {
    nome: "Romance",
    cor: "#2d5c4e",
    descricao: "Histórias centradas em relações humanas, sentimentos e conflitos.",
  },
  {
    nome: "Ficção",
    cor: "#486ca5",
    descricao: "Narrativas inventivas que exploram ideias, cenários e personagens.",
  },
  {
    nome: "Fantasia",
    cor: "#7a5a92",
    descricao: "Mundos imaginários com elementos mágicos.",
  },
];

const GENERO_ALIAS_MAP = {
  Realismo: "Romance",
  Distopia: "Ficção",
};

export function normalizarGenero(genero) {
  return GENERO_ALIAS_MAP[genero] || genero;
}

export const GENERO_COR_MAP = {
  ...Object.fromEntries(GENEROS.map((item) => [item.nome, item.cor])),
  Realismo: "#2d5c4e",
  Distopia: "#486ca5",
};

export function getGeneroColor(genero) {
  return GENERO_COR_MAP[normalizarGenero(genero)] || "#c08928";
}

const STORAGE_KEY = "acervo_generos";
const GENEROS_CHANGED_EVENT = "generos:changed";

export function loadGeneros() {
  if (typeof window === "undefined") {
    return GENEROS;
  }

  const salvo = window.localStorage.getItem(STORAGE_KEY);
  if (!salvo) {
    return GENEROS;
  }

  try {
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed) ? parsed : GENEROS;
  } catch {
    return GENEROS;
  }
}

export function saveGeneros(generos) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(generos));
  window.dispatchEvent(new CustomEvent(GENEROS_CHANGED_EVENT));
}

export function useGeneros() {
  const [generos, setGeneros] = useState(() => loadGeneros());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncGeneros = () => setGeneros(loadGeneros());

    window.addEventListener(GENEROS_CHANGED_EVENT, syncGeneros);

    return () => {
      window.removeEventListener(GENEROS_CHANGED_EVENT, syncGeneros);
    };
  }, []);

  return generos;
}
