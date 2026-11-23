import axios from "axios";

// Ruta relativa: mismo origen que el front, el navegador manda la cookie de sesion solo.
// En local la resuelve el proxy de Vite; en Render, el rewrite /api/* del Static Site.
export const api = axios.create({
  baseURL: "/api",
});

// Los errores del backend vienen como { error: { message, details? } }, donde details es
// { campo: ["mensaje"] } en los 400 de validacion. Los de RTK Query (unwrap) ya llegan como string.
export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError(err)) {
    const error = err.response?.data?.error;
    if (typeof error === "string") return error;
    if (error?.message) {
      const details = error.details as Record<string, string[]> | undefined;
      const lines = details ? Object.entries(details).map(([field, msgs]) => `${field}: ${msgs.join(", ")}`) : [];
      return lines.length ? `${error.message} (${lines.join(" · ")})` : error.message;
    }
    return err.message;
  }
  return "Error desconocido";
};
