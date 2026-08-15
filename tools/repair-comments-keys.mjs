// Dev tool: repair misplaced commentsKey attributes.
// Pattern written: ` commentsKey="x"}   →  desired: `} commentsKey="x"
import fs from 'node:fs';

for (const file of process.argv.slice(2)) {
  let src = fs.readFileSync(file, 'utf-8');
  const re = /` commentsKey="([^"]+)"}/g;
  const fixed = src.replace(re, '`} commentsKey="$1"');
  if (fixed !== src) {
    fs.writeFileSync(file, fixed);
    console.log('repaired', file);
  } else {
    console.log('no change', file);
  }
}
