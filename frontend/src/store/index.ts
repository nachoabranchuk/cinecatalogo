// El store: un unico objeto con todo el estado global.
// La sesion no vive aca: la maneja useSession() de Better Auth (ver lib/auth-client.ts).
import { configureStore } from "@reduxjs/toolkit";
import { moviesApi } from "./api";

export const store = configureStore({
  reducer: {
    [moviesApi.reducerPath]: moviesApi.reducer, // state.moviesApi -> cache de RTK Query
  },
  // El middleware de RTK Query maneja la cache, el refetch y la invalidacion por tags.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(moviesApi.middleware),
});
