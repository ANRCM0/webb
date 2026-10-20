#!/usr/bin/env node
const fs = require('fs');
const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');

function findStart(name) {
  for (const p of [`function ${name}(`, `function ${name} (`, `const ${name}=`, `let ${name}=`, `var ${name}=`]) {
    const i = src.indexOf(p);
    if (i >= 0) return i;
  }
  const re = new RegExp(`[,;{]\\s*${name.replace(/\$/g, '\\$')}\\s*=`);
  const m = re.exec(src);
  return m ? m.index + 1 : -1;
}
// index of matching close for opener at i
function match(src, i) {
  const open = src[i];
  const close = open === '(' ? ')' : open === '{' ? '}' : ']';
  let depth = 0, inStr = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (c === '\\') { j++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (!depth) return j; }
  }
  return -1;
}
for (const name of process.argv.slice(3)) {
  const s = findStart(name);
  if (s < 0) { console.log(`=== ${name} :: NOT FOUND ===\n`); continue; }
  let bodyStart;
  if (src.startsWith('function', s)) {
    const p = src.indexOf('(', s);
    const pEnd = match(src, p);
    bodyStart = src.indexOf('{', pEnd);
  } else {
    bodyStart = src.indexOf('{', s);
  }
  const e = match(src, bodyStart);
  console.log(`=== ${name} @ offset ${s} (len ${e - s + 1}) ===`);
  console.log(src.slice(s, e + 1));
  console.log('');
}
