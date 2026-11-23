// PASO 1 — El modelo (el "cerebro").
// ChatGroq habla con la API de Groq. Lee GROQ_API_KEY del entorno.
// temperature 0: respuestas deterministas, lo que queremos para elegir tools.
// streaming: true → Groq manda la respuesta token por token en vez de toda junta al final.
import { ChatGroq } from "@langchain/groq";

// Modelo barato de Groq con tool calling y disponible en el plan gratuito. Se cambia con GROQ_MODEL.
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

export const llm = new ChatGroq({ model: MODEL, temperature: 0, streaming: true });

console.log(`[llm] Groq listo: model=${MODEL} streaming=true`);
