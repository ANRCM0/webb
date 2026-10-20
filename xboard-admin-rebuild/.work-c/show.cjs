// Print the original source of a named function/component from the bundle, formatted lightly.
const fs = require("fs");
const ts = require("/workspace/reconstruction/scaffold/node_modules/typescript/lib/typescript.js");
const P = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const s = fs.readFileSync(P, "utf8");
const sf = ts.createSourceFile("b.js", s, ts.ScriptTarget.ES2022, false, ts.ScriptKind.JS);
const names = process.argv.slice(2);

const found = new Map();
function walk(n) {
  if (ts.isFunctionDeclaration(n) && n.name && names.includes(n.name.text)) found.set(n.name.text, n);
  if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && names.includes(n.name.text) && n.initializer) found.set(n.name.text, n);
  ts.forEachChild(n, walk);
}
walk(sf);
for (const name of names) {
  const n = found.get(name);
  if (!n) { console.log(`\n### ${name}: NOT FOUND`); continue; }
  const start = n.getStart(sf);
  console.log(`\n### ${name} @${start} (${n.end - start}B)`);
  console.log(s.slice(start, Math.min(n.end, start + 3000)));
}
