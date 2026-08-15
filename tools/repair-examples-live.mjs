// Dev tool: repair commentsKey insertions in examples-live.tsx.
import fs from 'node:fs';

const file = 'astra-site/src/pages/docs/examples-live.tsx';
let src = fs.readFileSync(file, 'utf-8');

// Pattern A: ` },    commentsKey: 'exNN',  →  `,\n    commentsKey: 'exNN' },
src = src.replace(/` },    commentsKey: '(\w+)',  /g, "`,\n    commentsKey: '$1' },\n  ");

// Pattern B (array end): ` },    commentsKey: 'exNN',];  →  `,\n    commentsKey: 'exNN' },\n];
src = src.replace(/` },    commentsKey: '(\w+)',\];/g, "`,\n    commentsKey: '$1' },\n];");

// Pattern C (ex08/ex16): missing ` }` after the backtick before the comma.
src = src.replace("});`,\n    commentsKey: 'ex08',", "});` },\n    commentsKey: 'ex08',");
src = src.replace("  }\n}`,\n    commentsKey: 'ex16',", "  }\n}` },\n    commentsKey: 'ex16',");

fs.writeFileSync(file, src);
console.log('repaired examples-live.tsx');
