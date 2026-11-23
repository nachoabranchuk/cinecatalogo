import { Response } from "express";

// Un solo formato de error para toda la API: { error: { message, details? } }.
// details (solo en 400 de validacion) es { campo: ["mensaje", ...] } para que el front marque cada input.
export function sendError(res: Response, status: number, message: string, details?: Record<string, string[]>): void {
  res.status(status).json({ error: { message, ...(details && { details }) } });
}
