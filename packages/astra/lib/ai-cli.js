/**
 * astra ai — AI-powered CLI helpers (Phase 7).
 *
 *   astra ai chat "prompt"                    one-shot completion
 *   astra ai translate <locale> <catalog>     translate a JSON i18n catalog
 *
 * Provider configuration comes from `astra.config.json` (`ai` section)
 * plus the standard environment variables (ASTRA_AI_PROVIDER, ...).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { colors, paint } from './colors.js';

/** Reads the `ai` section of astra.config.json (if present). */
function readAiConfig(root) {
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, 'astra.config.json'), 'utf-8')
    );
    return typeof raw?.ai === 'object' && raw.ai !== null ? raw.ai : {};
  } catch {
    return {};
  }
}

/** Loads @astrajs/ai (project install → root node_modules). */
async function loadAi() {
  try {
    return await import('@astrajs/ai');
  } catch {
    throw new Error(
      '@astrajs/ai is not installed. Run: npm install @astrajs/ai'
    );
  }
}

/** Applies astra.config.json + env into the AI runtime. */
function applyConfig(ai, cfg) {
  ai.configureAi({
    ...(cfg.provider ? { provider: cfg.provider } : {}),
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    ...(cfg.apiKeyEnv ? { apiKey: process.env[cfg.apiKeyEnv] ?? undefined } : {}),
    ...(cfg.model ? { model: cfg.model } : {}),
    ...(cfg.embedModel ? { embedModel: cfg.embedModel } : {}),
  });
}

function help() {
  console.log(`
  ${paint('astra ai', colors.bold)} — AI helpers

  ${paint('Usage', colors.purple)}
    astra ai chat <prompt>                 one-shot completion
    astra ai translate <locale> <file>     translate a JSON catalog

  ${paint('Translate', colors.purple)}
    Reads a JSON i18n catalog (flat keys → strings) and writes
    <file>.<locale>.json with the values translated by the model.

      astra ai translate fr src/i18n-en.json   → src/i18n-en.json.fr.json

  ${paint('Configuration', colors.purple)}
    astra.config.json:
      { "ai": { "provider": "ollama", "model": "qwen2.5-coder:7b",
                "apiKeyEnv": "OLLAMA_API_KEY" } }

    Environment: ASTRA_AI_PROVIDER, ASTRA_AI_BASE_URL, ASTRA_AI_API_KEY,
                 ASTRA_AI_MODEL
`);
}

/**
 * Entry point for `astra ai ...`. Returns true when handled.
 */
export async function runAiCommand(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    help();
    return true;
  }

  if (sub === 'chat') {
    const prompt = rest.join(' ');
    if (!prompt) {
      console.error(`${paint('✖', colors.red)} Usage: astra ai chat "prompt"`);
      process.exitCode = 1;
      return true;
    }
    try {
      const ai = await loadAi();
      applyConfig(ai, readAiConfig(process.cwd()));
      process.stdout.write(`${paint('◇', colors.purple)} ${ai.getAiRuntime().provider} / ${ai.getAiRuntime().model}\n\n`);
      const text = await ai.complete(prompt);
      console.log(text);
    } catch (err) {
      console.error(`${paint('✖', colors.red)} ${err?.message ?? err}`);
      process.exitCode = 1;
    }
    return true;
  }

  if (sub === 'translate') {
    const [locale, file] = rest;
    if (!locale || !file) {
      console.error(
        `${paint('✖', colors.red)} Usage: astra ai translate <locale> <catalog.json>`
      );
      process.exitCode = 1;
      return true;
    }
    try {
      const abs = path.resolve(process.cwd(), file);
      const catalog = JSON.parse(fs.readFileSync(abs, 'utf-8'));
      const entries = Object.entries(catalog);
      if (entries.length === 0) {
        console.error(`${paint('✖', colors.red)} Catalog is empty: ${file}`);
        process.exitCode = 1;
        return true;
      }

      const ai = await loadAi();
      applyConfig(ai, readAiConfig(process.cwd()));
      console.log(
        `${paint('◇', colors.purple)} translating ${entries.length} keys → ${locale} (${ai.getAiRuntime().provider})…`
      );

      const prompt =
        `Translate the values of this JSON object into "${locale}". ` +
        `Preserve the keys EXACTLY, keep {name}-style placeholders and ` +
        `<br/> markers intact, and respond with ONLY a valid JSON object:\n` +
        JSON.stringify(catalog, null, 2);

      const text = await ai.complete(prompt);
      const parsed = JSON.parse(extractJson(text));
      const outPath = `${abs}.${locale}.json`;
      fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2) + '\n');
      console.log(`${paint('✓', colors.green)} wrote ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      console.error(`${paint('✖', colors.red)} ${err?.message ?? err}`);
      process.exitCode = 1;
    }
    return true;
  }

  console.error(
    `${paint('✖', colors.red)} Unknown astra ai command: ${sub}\n` +
      `Run ${paint('astra ai --help', colors.bold)} for usage.`
  );
  process.exitCode = 1;
  return true;
}

/** Extracts the first {...} JSON object from a model response. */
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('The model did not return a JSON object.');
  }
  return text.slice(start, end + 1);
}
