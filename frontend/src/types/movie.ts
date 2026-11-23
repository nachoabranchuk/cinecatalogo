import type { Genre } from "../lib/genres";

// Misma forma que IMovie en el backend (backend/src/models/Movie.ts). El JSON no trae tipos: los declaramos a mano.
export interface Movie {
  _id: string;
  title: string;
  director: string;
  genre: Genre;
  releaseDate: string; // ISO
  durationMinutes: number;
  rating: number;
  inTheaters: boolean;
  synopsis?: string;
  posterUrl?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Envelope de los listados paginados del backend: { data, meta }.
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Query string de GET /api/movies.
export interface MovieListParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: Genre;
  inTheaters?: boolean;
  mine?: boolean;
  sortBy?: "createdAt" | "title" | "releaseDate" | "rating" | "durationMinutes";
  sortOrder?: "asc" | "desc";
}
