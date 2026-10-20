const fs = require("fs");
const ts = require("/workspace/reconstruction/scaffold/node_modules/typescript/lib/typescript.js");
const P = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const s = fs.readFileSync(P, "utf8");
const sf = ts.createSourceFile("b.js", s, ts.ScriptTarget.ES2022, false, ts.ScriptKind.JS);

const props = ["id", "accessorKey", "accessorFn", "size", "minSize", "maxSize", "header", "cell", "enableSorting", "enableHiding", "meta", "sortingFn", "filterFn"];
function get(node, name) {
  for (const p of node.properties) if (ts.isPropertyAssignment(p)) {
    const k = p.name; const key = ts.isIdentifier(k) ? k.text : ts.isStringLiteral(k) ? k.text : null;
    if (key === name) return p;
  }
  return null;
}
const short = (t, n) => (t.length > n ? t.slice(0, n).replace(/\s+/g, " ") + `…(${t.length})` : t.replace(/\s+/g, " "));

const want = process.argv[2] ? process.argv[2].split(",").map(Number) : null;
const targets = [];
function walk(n) {
  if (ts.isObjectLiteralExpression(n)) {
    const idp = get(n, "accessorKey") || get(n, "id");
    if (idp && ts.isStringLiteral(idp.initializer) && (get(n, "header") || get(n, "cell"))) {
      targets.push(n);
    }
  }
  ts.forEachChild(n, walk);
}
walk(sf);

// locate owner names to filter
function owners() {
  const map = new Map();
  for (const n of targets) {
    let best = null;
    function visit(x) {
      if (n.getStart(sf) < x.getStart(sf) || n.getStart(sf) > x.end) return;
      if (ts.isFunctionDeclaration(x) && x.name) best = x.name.text;
      else if (ts.isVariableDeclaration(x) && ts.isIdentifier(x.name)) best = x.name.text;
      ts.forEachChild(x, visit);
    }
    visit(sf);
    map.set(n.getStart(sf), best);
  }
  return map;
}
const ow = owners();

// group columns by owner function, print arrays for the requested owners
const byOwner = new Map();
for (const n of targets) {
  const o = ow.get(n.getStart(sf));
  if (!byOwner.has(o)) byOwner.set(o, []);
  byOwner.get(o).push(n);
}
for (const [owner, list] of byOwner) {
  if (!want || !want.includes(list.length)) continue;
  console.log(`\n===== owner=${owner} n=${list.length} @${list[0].getStart(sf)}`);
  for (const n of list.sort((a, b) => a.getStart(sf) - b.getStart(sf))) {
    const out = [];
    for (const p of n.properties) {
      if (!ts.isPropertyAssignment(p)) { out.push("<" + (ts.isShorthandPropertyAssignment(p) ? "shorthand" : "spread") + ">"); continue; }
      const k = ts.isIdentifier(p.name) ? p.name.text : ts.isStringLiteral(p.name) ? p.name.text : "?";
      if (!props.includes(k)) { out.push(k + ":…"); continue; }
      const lim = k === "header" || k === "cell" || k === "accessorFn" ? 320 : 80;
      out.push(`${k}=${short(s.slice(p.initializer.getStart(sf), p.initializer.end), lim)}`);
    }
    console.log(`  @${n.getStart(sf)} {${out.join(" | ")}}`);
  }
}
