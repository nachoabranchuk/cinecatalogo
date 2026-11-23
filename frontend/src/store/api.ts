// RTK Query: estado del SERVIDOR (peliculas). Cada endpoint genera un hook con cache incluida.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { MovieFormValues } from "../schemas/movie.schema";
import type { Movie, MovieListParams, Paginated } from "../types/movie";

// Usa la misma instancia de axios (misma baseURL y cookie de sesion). El error se guarda ya como string.
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};

export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: axiosBaseQuery,
  // Las queries "proveen" el tag y las mutations lo "invalidan" -> RTK Query vuelve a pedir solo.
  tagTypes: ["Movies"],
  endpoints: (build) => ({
    // GET /api/movies?page=&search=&genre=... (publico; con mine=true requiere sesion)
    getMovies: build.query<Paginated<Movie>, MovieListParams>({
      query: (params) => ({ url: "/movies", method: "GET", params }),
      providesTags: ["Movies"],
    }),
    getMovieById: build.query<Movie, string>({
      query: (id) => ({ url: `/movies/${id}` }),
      providesTags: ["Movies"],
    }),
    createMovie: build.mutation<Movie, MovieFormValues>({
      query: (data) => ({ url: "/movies", method: "POST", data }),
      invalidatesTags: ["Movies"],
    }),
    updateMovie: build.mutation<Movie, { id: string; values: MovieFormValues }>({
      query: ({ id, values }) => ({ url: `/movies/${id}`, method: "PUT", data: values }),
      invalidatesTags: ["Movies"],
    }),
    deleteMovie: build.mutation<void, string>({
      query: (id) => ({ url: `/movies/${id}`, method: "DELETE" }),
      invalidatesTags: ["Movies"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = moviesApi;
