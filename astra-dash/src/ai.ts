/**
 * astra-dash — endpoint AI con streaming.
 *
 * aiStream compila como server(): el cliente recibe un wrapper tipado con
 * onToken por chunk; el modelo corre en el servidor y la API key nunca
 * llega al navegador.
 */
import { aiStream } from 'astrajs.dev/ai';

export const askInsight = aiStream(
  { model: 'qwen2.5-coder:7b' },
  async (question: string) =>
    `You are the AstraDash analyst. Answer briefly and actionably, in the same language as the question, using these live metrics: visits, orders, revenue, cpu.\n${question}`
);
