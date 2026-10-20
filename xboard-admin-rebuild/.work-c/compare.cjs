// Compare our scaffold column arrays against the original bundle's column arrays.
const fs = require("fs");
const path = require("path");
const ts = require("/workspace/reconstruction/scaffold/node_modules/typescript/lib/typescript.js");

const ORIG = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const SRC = "/workspace/reconstruction/scaffold/src/pages";

const PAGES = [
  ["config/notice", "q2t"], ["config/knowledge", "e4t"], ["config/payment", "pQt"],
  ["server/manage", "Z5t"], ["server/machine", "h3t"], ["server/group", "H3t"], ["server/route", "Z3t"],
  ["finance/plan", "n6t"], ["finance/order", "N6t"], ["finance/coupon", "P6t"],
  ["user/manage", "H8t"], ["user/traffic-reset-logs", "C9t"],
];

function parse(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.ES2022, true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}
const num = (n) => {
  if (!n) return null;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (ts.isStringLiteral(n) && /^\d+$/.test(n.text)) return Number(n.text);
  if (ts.isPrefixUnaryExpression(n)) return -Number(n.operand.text);
  return "<expr:" + n.getText().slice(0, 24) + ">";
};
const prop = (obj, name) => {
  for (const p of obj.properties) if (ts.isPropertyAssignment(p)) {
    const k = p.name;
    const key = ts.isIdentifier(k) ? k.text : ts.isStringLiteral(k) ? k.text : null;
    if (key === name) return p;
  }
  return null;
};

// --- our side -------------------------------------------------------------
function ourCols(file) {
  const sf = parse(file);
  const s = sf.text;
  const cands = [];
  function walk(n) {
    if (ts.isArrayLiteralExpression(n)) {
      const objs = n.elements.filter(ts.isObjectLiteralExpression);
      const cols = objs.filter((o) => (prop(o, "accessorKey") || prop(o, "id")) && (prop(o, "header") || prop(o, "cell")));
      if (cols.length >= 2 && cols.length === objs.length) cands.push({ node: n, cols: cols.map((o) => ({ o, start: o.getStart(sf) })) });
    }
    ts.forEachChild(n, walk);
  }
  walk(sf);
  if (!cands.length) return null;
  cands.sort((a, b) => b.cols.length - a.cols.length);
  const { cols } = cands[0];
  return cols.sort((a, b) => a.start - b.start).map(({ o }) => {
    const idp = prop(o, "accessorKey") || prop(o, "id");
    const sp = prop(o, "size"), mnp = prop(o, "minSize"), mxp = prop(o, "maxSize");
    return {
      id: idp.initializer.getText().replace(/^["']|["']$/g, ""),
      size: sp ? num(sp.initializer) : null,
      min: mnp ? num(mnp.initializer) : null,
      max: mxp ? num(mxp.initializer) : null,
      line: sf.getLineAndCharacterOfPosition(o.getStart(sf)).line + 1,
      text: o.getText(),
    };
  });
}

// --- original side --------------------------------------------------------
const osf = parse(ORIG);
const osrc = osf.text;
const origByOwner = new Map();
(function () {
  const cols = [];
  function walk(n) {
    if (ts.isObjectLiteralExpression(n)) {
      const idp = prop(n, "accessorKey") || prop(n, "id");
      if (idp && ts.isStringLiteral(idp.initializer) && (prop(n, "header") || prop(n, "cell"))) {
        const sp = prop(n, "size"), mnp = prop(n, "minSize"), mxp = prop(n, "maxSize");
        cols.push({ start: n.getStart(osf), id: idp.initializer.text, size: sp ? num(sp.initializer) : null,
          min: mnp ? num(mnp.initializer) : null, max: mxp ? num(mxp.initializer) : null });
      }
    }
    ts.forEachChild(n, walk);
  }
  walk(osf);
  for (const c of cols) {
    let owner = null;
    (function visit(x) {
      if (c.start < x.getStart(osf) || c.start > x.end) return;
      if (ts.isFunctionDeclaration(x) && x.name) owner = x.name.text;
      else if (ts.isVariableDeclaration(x) && ts.isIdentifier(x.name)) owner = x.name.text;
      ts.forEachChild(x, visit);
    })(osf);
    if (!owner) continue;
    if (!origByOwner.has(owner)) origByOwner.set(owner, []);
    origByOwner.get(owner).push(c);
  }
  for (const v of origByOwner.values()) v.sort((a, b) => a.start - b.start);
})();

// --- report ---------------------------------------------------------------
let bad = 0;
for (const [page, owner] of PAGES) {
  const file = path.join(SRC, page + ".tsx");
  const mine = fs.existsSync(file) ? ourCols(file) : null;
  const orig = origByOwner.get(owner) || [];
  console.log(`\n================ ${page}   (orig=${owner} @${orig[0] ? orig[0].start : "?"})  ${file}`);
  if (!mine) { console.log("  !! no columns array parsed"); continue; }
  console.log(`  orig(${orig.length}): ` + orig.map((c) => `${c.id}=${c.size ?? 150}`).join(" "));
  console.log(`  ours(${mine.length}): ` + mine.map((c) => `${c.id}=${c.size ?? 150}${c.size === null ? "*" : ""}`).join(" "));
  const oid = orig.map((c) => c.id), mid = mine.map((c) => c.id);
  const missing = oid.filter((x) => !mid.includes(x));
  const extra = mid.filter((x) => !oid.includes(x));
  const orderSame = JSON.stringify(oid) === JSON.stringify(mid);
  if (missing.length) console.log("  MISSING columns: " + missing.join(", "));
  if (extra.length) console.log("  EXTRA columns:   " + extra.join(", "));
  if (!orderSame && !missing.length && !extra.length) console.log("  ORDER differs");
  for (const oc of orig) {
    const mc = mine.find((m) => m.id === oc.id);
    if (!mc) continue;
    const os2 = oc.size ?? 150, ms2 = mc.size ?? 150;
    if (os2 !== ms2) { console.log(`  SIZE ${oc.id}: orig=${oc.size ?? "default(150)"} ours=${mc.size ?? "default(150)"}  [${file}:${mc.line}]`); bad++; }
  }
}
console.log(`\nsize mismatches: ${bad}`);
