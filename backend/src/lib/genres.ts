// Lista cerrada de generos: la comparten el modelo, los schemas de Zod y las tools del agente.
export const GENRES = [
  "Accion",
  "Aventura",
  "Animacion",
  "Comedia",
  "Crimen",
  "Documental",
  "Drama",
  "Fantasia",
  "Terror",
  "Romance",
  "Ciencia ficcion",
  "Suspenso",
] as const;

export type Genre = (typeof GENRES)[number];
