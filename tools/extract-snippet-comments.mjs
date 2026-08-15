// Dev tool: extracts ordered // and /* */ comments from CodeBlock literals.
// Usage: node tools/extract-snippet-comments.mjs <file.tsx>...
import fs from 'node:fs';

const OPEN = 'code={`';
const CLOSE = '`';

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf-8');
  const blocks = [];
  let pos = 0;
  for (;;) {
    const start = src.indexOf(OPEN, pos);
    if (start === -1) break;
    const contentStart = start + OPEN.length;
    let i = contentStart;
    let esc = false;
    for (; i < src.length; i++) {
      const c = src[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === CLOSE) break;
    }
    const raw = src.slice(contentStart, i);
    const code = raw.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    const comments = [...code.matchAll(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g)].map((x) => x[0]);
    blocks.push(comments);
    pos = i + 1;
  }
  console.log('==== ' + file);
  blocks.forEach((b, bi) => console.log('  [' + bi + '] ' + JSON.stringify(b)));
}
