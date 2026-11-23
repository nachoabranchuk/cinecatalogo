// Misma lista cerrada que backend/src/lib/genres.ts: el backend rechaza cualquier otro valor.
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
