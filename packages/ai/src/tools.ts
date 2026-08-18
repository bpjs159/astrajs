/**
 * astrajs.dev/ai — Tool calling + agent loop (Phase 5)
 *
 * `aiAgent()` runs a model loop where the model can call your own functions.
 * It is meant to run ON THE SERVER — either inside a `server()`/`ai()`
 * handler or in build scripts.
 *
 * The tool schemas are explicit JSON Schemas today; deriving them from
 * TypeScript types in the compiler is on the roadmap.
 */
import { getAiRuntime } from './config.js';
import { getProvider } from './provider.js';
import type { AiMessage, AiTool, CompleteOptions } from './types.js';

export interface AgentOptions {
  model?: string;
  system?: string;
  /** Maximum tool round-trips before forcing a final answer. @default 5 */
  maxSteps?: number;
  temperature?: number;
}

export interface AgentHandle {
  /** Runs the agent for `prompt`, returning the final assistant text. */
  run(prompt: string): Promise<string>;
}

/**
 * Creates a tool-calling agent.
 *
 * @example
 * ```ts
 * const shop = aiAgent({
 *   system: 'You are a shop assistant.',
 *   tools: [
 *     { schema: { name: 'getProduct', description: '...', parameters: {...} },
 *       fn: getProduct },
 *   ],
 * });
 * const answer = await shop.run('How much is p1?');
 * ```
 */
export function aiAgent(tools: AiTool[], options?: AgentOptions): AgentHandle;
export function aiAgent(options: AgentOptions & { tools: AiTool[] }): AgentHandle;
export function aiAgent(
  toolsOrOptions: AiTool[] | (AgentOptions & { tools: AiTool[] }),
  maybeOptions?: AgentOptions
): AgentHandle {
  const tools = Array.isArray(toolsOrOptions) ? toolsOrOptions : toolsOrOptions.tools;
  const options = Array.isArray(toolsOrOptions) ? (maybeOptions ?? {}) : toolsOrOptions;

  const cfg = getAiRuntime();
  const model = options.model ?? cfg.model;
  const maxSteps = options.maxSteps ?? 5;

  const toolMap = new Map(tools.map((t) => [t.schema.name, t]));

  return {
    async run(prompt: string): Promise<string> {
      const messages: AiMessage[] = [];
      if (options.system) messages.push({ role: 'system', content: options.system });
      messages.push({ role: 'user', content: prompt });

      const toolSchemas = tools.map((t) => t.schema);
      const provider = getProvider();
      const callOptions: CompleteOptions = {
        model,
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      };

      for (let step = 0; step < maxSteps; step++) {
        const result = await provider.chatWithTools(
          model,
          messages,
          toolSchemas,
          callOptions
        );

        // Direct answer → done.
        if (result.toolCalls.length === 0) return result.text || '';

        // Record the assistant's tool-call turn, then each tool result.
        messages.push({
          role: 'assistant',
          content: result.text,
          tool_calls: result.toolCalls,
        });

        for (const call of result.toolCalls) {
          const tool = toolMap.get(call.name);
          let output: unknown;
          if (!tool) {
            output = { error: `Unknown tool: ${call.name}` };
          } else {
            // SECURITY: tool arguments come from the MODEL (an untrusted
            // actor under prompt injection). Only accept plain objects and
            // pass ONLY the properties declared in the tool schema, in
            // declared order — never arbitrary shapes or keys.
            const raw = call.arguments;
            if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
              output = { error: `Invalid arguments for tool: ${call.name}` };
            } else {
              const declaredProps = tool.schema?.parameters?.properties as
                | Record<string, unknown>
                | undefined;
              const args = declaredProps
                ? Object.keys(declaredProps).map(
                    (k) => (raw as Record<string, unknown>)[k]
                  )
                : Object.values(raw as Record<string, unknown>);
              try {
                output = await tool.fn(...args);
              } catch (err) {
                // Log the real error server-side; do NOT feed internal
                // error details back to the model.
                console.error(`[AstraJS AI] Tool "${call.name}" failed:`, err);
                output = { error: `Tool execution failed: ${call.name}` };
              }
            }
          }
          messages.push({
            role: 'tool',
            content:
              typeof output === 'string' ? output : JSON.stringify(output),
            tool_call_id: call.id,
          });
        }
      }

      // Step budget exhausted — ask for a final answer from the transcript.
      return provider.chat(model, messages, callOptions);
    },
  };
}
