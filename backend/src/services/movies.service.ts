// Capa de servicio: logica de negocio y acceso a datos de peliculas, en UN solo lugar.
// No sabe nada de HTTP (req/res) ni de LLMs. La consumen:
//   - controllers/movies.controller.ts  (API REST)
//   - agent/tools/movies.tools.ts       (agente)
import { QueryFilter } from "mongoose";
import Movie, { IMovieDocument } from "../models/Movie.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateMovieInput, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { Paginated } from "../types/pagination.types.js";

export interface Actor {
  id: string;
  name: string;
  role: string;
}

// Regla de permisos de escritura: el admin toca cualquiera; el user solo las suyas.
// La usan el controller (403) y las tools del agente.
export function canModify(actor: Pick<Actor, "id" | "role">, movie: Pick<IMovieDocument, "createdBy">): boolean {
  return actor.role === "admin" || movie.createdBy === actor.id;
}

// El filtro se arma campo por campo desde input ya validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiria inyectar operadores como { "$gt": "" }).
function buildFilter({ genre, inTheaters, search, mine }: ListMoviesInput, userId?: string): QueryFilter<IMovieDocument> {
  const filter: QueryFilter<IMovieDocument> = {};
  if (genre) filter.genre = genre;
  if (inTheaters !== undefined) filter.inTheaters = inTheaters;
  if (mine && userId) filter.createdBy = userId;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { director: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
}

export async function listMovies(input: ListMoviesInput, userId?: string): Promise<Paginated<IMovieDocument>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input, userId);
  const direction = sortOrder === "asc" ? 1 : -1;

  const [data, total] = await Promise.all([
    // _id como desempate: sin un orden total, la paginacion puede repetir o saltear registros.
    Movie.find(filter)
      .sort({ [sortBy]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    Movie.countDocuments(filter),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export function findMovieById(id: string): Promise<IMovieDocument | null> {
  return Movie.findById(id);
}

// El dueño sale SIEMPRE de la sesion (actor), nunca del body.
export function createMovie(input: CreateMovieInput, owner: Pick<Actor, "id" | "name">): Promise<IMovieDocument> {
  return Movie.create({
    ...input,
    releaseDate: new Date(input.releaseDate),
    createdBy: owner.id,
    createdByName: owner.name,
  });
}

export function updateMovie(id: string, input: UpdateMovieInput): Promise<IMovieDocument | null> {
  const { releaseDate, ...rest } = input;
  const changes = { ...rest, ...(releaseDate !== undefined && { releaseDate: new Date(releaseDate) }) };
  return Movie.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
}

export function deleteMovie(id: string): Promise<IMovieDocument | null> {
  return Movie.findByIdAndDelete(id);
}
