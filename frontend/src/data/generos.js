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