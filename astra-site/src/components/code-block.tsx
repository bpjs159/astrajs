import { component, store } from 'astrajs.dev/core';
import { i18n } from '../i18n.js';
import { localizedCode } from '../snippets.js';

/**
 * CodeBlock — code snippet with syntax highlighting in the site palette
 * (violet/blue/cyan on the dark #060b14 background).
 *
 * Usage:
 *   <CodeBlock code={`const x = store({ n: 0 });`} lang="TS" />
 *   <CodeBlock code={`...`} commentsKey="router.patterns" />  // localized comments
 *   <CodeBlock code={tabCode[state.tab]} bare />   // no frame, plain <pre>
 */

interface Tok {
  cls: string;
  text: string;
}

const KEYWORDS = new Set(
  (
    'const let var function return export import from async await if else for ' +
    'while do switch case break continue new class extends typeof true false ' +
    'null undefined default interface type public private protected readonly ' +
    'static try catch finally throw in of as'
  ).split(' ')
);

const tokenize = (code: string): Tok[] => {
  const out: Tok[] = [];
  const push = (cls: string | undefined, text: string) => {
    if (text) out.push({ cls: cls ?? 'cb-plain', text });
  };
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)|([<>=!+\-*/&|?:;.,()[\]{}@#$%^~`]|\n|\s+)/g;

  let m: RegExpExecArray | null;
  let inTag = false;
  let expectTagName = false;

  while ((m = re.exec(code))) {
    const comment = m[1];
    const str = m[2];
    const num = m[3];
    const word = m[4];
    const punct = m[5];

    if (comment) {
      push('cb-com', comment);
    } else if (str) {
      push('cb-str', str);
    } else if (num) {
      push('cb-num', num);
    } else if (word) {
      let cls: string | undefined;
      if (expectTagName) {
        cls = 'cb-tag';
        expectTagName = false;
      } else if (inTag) {
        cls = 'cb-attr';
      } else if (KEYWORDS.has(word)) {
        cls = 'cb-kw';
      } else if (/^[A-Z]/.test(word)) {
        cls = 'cb-type';
      } else if (/^\s*\(/.test(code.slice(re.lastIndex))) {
        cls = 'cb-fn';
      }
      push(cls, word);
    } else if (punct !== undefined) {
      if (punct === '<' || punct === '</') {
        inTag = true;
        expectTagName = true;
        push('cb-tag', punct);
      } else if (punct === '>' || punct === '/>') {
        inTag = false;
        push('cb-tag', punct);
      } else if (punct === '{' || punct === '}') {
        push('cb-punc', punct);
      } else {
        push(undefined, punct);
      }
    }
  }
  return out;
};

const style = `
  .code-block{position:relative;background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;margin-bottom:24px;overflow:hidden}
  .code-block.bare{background:none;border:none;border-radius:0;margin:0;padding:0;overflow:visible}
  .code-block .cb-lang{position:absolute;top:9px;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;pointer-events:none}
  .code-block .cb-pre{margin:0;padding:20px 24px;overflow-x:auto}
  .code-block.bare .cb-pre{padding:0}
  .code-block .cb-code{display:block;background:none;color:#cbd5e1;font-family:'JetBrains Mono',monospace;font-size:.76rem;line-height:1.85;white-space:pre;tab-size:2}
  .cb-kw{color:#c084fc}
  .cb-str{color:#7ce6c3}
  .cb-com{color:#94a3b8;font-style:italic}
  .cb-num{color:#fbbf24}
  .cb-fn{color:#7dd3fc}
  .cb-type{color:#67e8f9}
  .cb-tag{color:#e879f9}
  .cb-attr{color:#93c5fd}
  .cb-punc{color:#a78bfa}
  .cb-plain{color:#cbd5e1}
  .code-block .cb-copy{position:absolute;right:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;font-size:.62rem;font-weight:700;color:#94a3b8;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 10px;cursor:pointer;opacity:0;transition:opacity .15s,color .15s,border-color .15s;font-family:'Inter',sans-serif}
  .code-block:hover .cb-copy{opacity:1}
  .code-block .cb-copy:hover{color:#fff;border-color:rgba(139,77,255,.45)}
  .code-block .cb-copy.copied{color:#34d399;border-color:rgba(52,211,153,.4)}
`;

export interface CodeBlockProps {
  /** Source code to highlight. */
  code: string;
  /**
   * Snippet key in the comment catalog (`snippets.ts`). When set, the
   * // and /* *\/ comments are translated to the active locale and the
   * block re-renders reactively when the user switches language.
   */
  commentsKey?: string;
  /** Label shown on the top-right corner (e.g. "TS"). */
  lang?: string;
  /** Bare mode: no frame/background, just a plain <pre> (for embeds). */
  bare?: boolean;
}

export const CodeBlock = component((props: CodeBlockProps) => {
  const resolve = () =>
    props.commentsKey
      ? localizedCode(props.code ?? '', props.commentsKey)
      : (props.code ?? '');

  const tokens = tokenize(props.code ?? '');
  const state = store({ copied: false });
  const copy = () => {
    const text = resolve();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    state.copied = true;
    setTimeout(() => { state.copied = false; }, 1500);
  };
  return (
    <div class={props.bare ? 'code-block bare' : 'code-block'}>
      <style>{style}</style>
      {props.lang ? <span class="cb-lang">{props.lang}</span> : null}
      <pre class="cb-pre">
        <code class="cb-code">
          {props.commentsKey
            ? tokenize(resolve()).map((t) => <span class={t.cls}>{t.text}</span>)
            : tokens.map((t) => <span class={t.cls}>{t.text}</span>)}
        </code>
      </pre>
      <button
        class={`cb-copy${state.copied ? ' copied' : ''}`}
        aria-label="Copy code"
        onclick={copy}
      >
        {state.copied ? i18n.t('cb.copied') : i18n.t('cb.copy')}
      </button>
    </div>
  );
});
