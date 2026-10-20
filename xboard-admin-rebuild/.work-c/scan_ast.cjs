// AST-based extraction of TanStack column definitions from the minified original bundle.
// Uses the TypeScript parser (already installed in the scaffold) — read-only on the bundle.
const fs = require("fs");
const ts = require("/workspace/reconstruction/scaffold/node_modules/typescript/lib/typescript.js");

const P = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const s = fs.readFileSync(P, "utf8");
const sf = ts.createSourceFile("bundle.js", s, ts.ScriptTarget.ES2022, false, ts.ScriptKind.JS);

const numOf = (n) => {
  if (!n) return null;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(n.operand)) return -Number(n.operand.text);
  if (ts.isIdentifier(n)) return n.text;       // e.g. g?2e3:200 handled separately
  return "<expr>";
};
function prop(obj, name) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) {
      const k = p.name;
      const key = ts.isIdentifier(k) ? k.text : ts.isStringLiteral(k) ? k.text : null;
      if (key === name) return p;
    }
  }
  return null;
}
function keyOf(p) { return ts.isIdentifier(p.name) ? p.name.text : ts.isStringLiteral(p.name) ? p.name.text : null; }
// find i18n title inside header: e=>jsx(... title:t("x"))
function titleOf(obj) {
  const h = prop(obj, "header");
  if (!h) return null;
  const txt = s.slice(h.getStart(sf), h.end);
  const m = txt.match(/title:t\("([^"]+)"\)/);
  return m ? m[1] : null;
}

const cols = [];
function walk(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const hasColShape = prop(node, "header") || prop(node, "cell");
    const idp = prop(node, "accessorKey") || prop(node, "id");
    if (hasColShape && idp && ts.isStringLiteral(idp.initializer)) {
      const sizeP = prop(node, "size"), minP = prop(node, "minSize"), maxP = prop(node, "maxSize");
      cols.push({
        start: node.getStart(sf), end: node.end,
        id: idp.initializer.text,
        size: sizeP ? numOf(sizeP.initializer) : null,
        min: minP ? numOf(minP.initializer) : null,
        max: maxP ? numOf(maxP.initializer) : null,
        title: titleOf(node),
      });
    }
  }
  ts.forEachChild(node, walk);
}
walk(sf);
console.log("column-shaped objects:", cols.length, "with size:", cols.filter((c) => c.size != null).length);

// owning function / variable for an arbitrary position
function ownerOf(pos) {
  let best = null;
  function visit(n) {
    if (pos < n.getStart(sf) || pos > n.end) return;
    if (ts.isFunctionDeclaration(n) && n.name) best = { name: n.name.text, kind: "function", start: n.getStart(sf) };
    else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) best = { name: n.name.text, kind: "const", start: n.getStart(sf) };
    ts.forEachChild(n, visit);
  }
  visit(sf);
  return best;
}

// containing array literal (nearest, size>=2 columns inside)
const arrays = [];
function walk2(node) {
  if (ts.isArrayLiteralExpression(node)) arrays.push(node);
  ts.forEachChild(node, walk2);
}
walk2(sf);
const containing = (pos) => {
  let best = null;
  for (const a of arrays) if (a.getStart(sf) < pos && pos < a.end) if (!best || a.getStart(sf) > best.getStart(sf)) best = a;
  return best;
};

const groups = new Map();
for (const c of cols) {
  const a = containing(c.start);
  const key = a ? a.getStart(sf) : c.start;
  if (!groups.has(key)) groups.set(key, { arr: a, cols: [] });
  groups.get(key).cols.push(c);
}
const out = [];
for (const [k, g] of [...groups.entries()].sort((x, y) => x[0] - y[0])) {
  const own = ownerOf(g.arr ? g.arr.getStart(sf) : k);
  out.push({
    arrStart: g.arr ? g.arr.getStart(sf) : k,
    arrEnd: g.arr ? g.arr.end : null,
    owner: own,
    cols: g.cols.sort((a, b) => a.start - b.start).map((c) => ({ id: c.id, size: c.size, min: c.min, max: c.max, title: c.title, off: c.start })),
  });
}
fs.writeFileSync("/workspace/reconstruction/.work-c/cols_ast.json", JSON.stringify(out, null, 1));
for (const g of out) {
  if (g.cols.length < 2) continue;
  console.log(`\n### @${g.arrStart} owner=${g.owner ? g.owner.name : "?"} cols=${g.cols.length}`);
  console.log("   " + g.cols.map((c) => `${c.id}[${c.size ?? "-"}${c.min ? "/min" + c.min : ""}${c.max ? "/max" + c.max : ""}]`).join("  "));
}
