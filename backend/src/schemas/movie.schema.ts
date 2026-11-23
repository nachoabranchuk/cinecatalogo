import { z } from "zod";
import { GENRES } from "../lib/genres.js";

export const SORT_FIELDS = ["createdAt", "title", "releaseDate", "rating", "durationMinutes"] as const;

// Acepta "2024-05-30" o un ISO completo. Se deja como string (sin .transform) para que el schema
// tambien se pueda convertir a JSON Schema en las tools del agente; el service lo pasa a Date.
const dateField = z
  .string({ error: "La fecha de estreno es obligatoria" })
  .refine((value) => !Number.isNaN(Date.parse(value)), "La fecha no es valida (formato AAAA-MM-DD)");

// IMPORTANTE: sin .default() aca. updateMovieSchema = createMovieSchema.partial() y un default
// pisaria campos que el cliente no mando. Los defaults viven en el modelo de Mongoose.
export const createMovieSchema = z.object({
  title: z
    .string({ error: "El titulo es obligatorio" })
    .trim()
    .min(1, "El titulo es obligatorio")
    .max(150, "El titulo no puede superar los 150 caracteres"),
  director: z
    .string({ error: "El director es obligatorio" })
    .trim()
    .min(1, "El director es obligatorio")
    .max(100, "El director no puede superar los 100 caracteres"),
  genre: z.enum(GENRES, { error: `El genero debe ser uno de: ${GENRES.join(", ")}` }),
  releaseDate: dateField,
  durationMinutes: z
    .number({ error: "La duracion debe ser un numero" })
    .int("La duracion debe ser un numero entero")
    .min(1, "La duracion debe ser de al menos 1 minuto")
    .max(600, "La duracion no puede superar los 600 minutos"),
  rating: z
    .number({ error: "La puntuacion debe ser un numero" })
    .min(0, "La puntuacion minima es 0")
    .max(10, "La puntuacion maxima es 10"),
  inTheaters: z.boolean({ error: "inTheaters debe ser true o false" }).optional(),
  synopsis: z.string().trim().max(1000, "La sinopsis no puede superar los 1000 caracteres").optional(),
  // "" = sin poster (asi se puede borrar uno ya cargado desde el formulario).
  posterUrl: z
    .url({ error: "El poster debe ser una URL valida" })
    .max(500, "La URL del poster no puede superar los 500 caracteres")
    .or(z.literal(""))
    .optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

const booleanQuery = z.enum(["true", "false"]).transform((value) => value === "true");

// Query string de GET /api/movies. Todo llega como texto: z.coerce convierte page y limit a numero.
export const listMoviesSchema = z.object({
  page: z.coerce.number({ error: "page debe ser un numero" }).int().min(1, "page debe ser 1 o mayor").default(1),
  limit: z.coerce
    .number({ error: "limit debe ser un numero" })
    .int()
    .min(1, "limit debe ser 1 o mayor")
    .max(50, "limit no puede superar 50")
    .default(12),
  sortBy: z.enum(SORT_FIELDS, { error: `sortBy debe ser uno de: ${SORT_FIELDS.join(", ")}` }).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"], { error: "sortOrder debe ser asc o desc" }).default("desc"),
  genre: z.enum(GENRES, { error: `genre debe ser uno de: ${GENRES.join(", ")}` }).optional(),
  inTheaters: booleanQuery.optional(),
  search: z.string().trim().min(1).max(120).optional(),
  // mine=true: solo las peliculas del usuario logueado (requiere sesion).
  mine: booleanQuery.optional(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
export type ListMoviesInput = z.infer<typeof listMoviesSchema>;
