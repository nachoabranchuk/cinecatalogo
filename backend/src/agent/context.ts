// Contexto del agente: datos de NUESTRO backend que las tools necesitan pero el LLM no ve ni puede
// cambiar (no van en los mensajes). El controller lo arma con req.user; LangChain se lo pasa a cada
// tool en runtime.context. Es el equivalente a req.user para las tools.
import { z } from "zod";

export const agentContextSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
});

export type AgentContext = z.infer<typeof agentContextSchema>;
