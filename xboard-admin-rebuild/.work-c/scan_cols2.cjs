// Refined: find TanStack column-definition objects (those carrying header:/cell: plus a
// column identity) and every column array. Read-only.
const fs = require("fs");
const P = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const s = fs.readFileSync(P, "utf8");

const stack = [], objs = [], arrs = [];
let instr = null;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (instr) { if (ch === "\\") { i++; continue; } if (ch === instr) instr = null; continue; }
  if (ch === '"' || ch === "'" || ch === "`") { instr = ch; continue; }
  if (ch === "{" || ch === "[" || ch === "(") { stack.push({ ch, i }); continue; }
  if (ch === "}" || ch === "]" || ch === ")") {
    const top = stack.pop();
    if (!top) continue;
    if (ch === "}") objs.push({ start: top.i, end: i });
    if (ch === "]") arrs.push({ start: top.i, end: i });
  }
}
const innermost = (list, pos) => { let b = null; for (const o of list) if (o.start < pos && pos < o.end && (!b || o.start > b.start)) b = o; return b; };

// candidate column objects: top-level keys include header/cell/accessorKey/id AND a size-ish or accessorKey
const cols = [];
for (const o of objs) {
  const body = s.slice(o.start, o.end + 1);
  if (body.length > 4000) continue;
  const hasHeader = /[,{]header:/.test(body);
  const hasCell = /[,{]cell:/.test(body);
  if (!hasHeader && !hasCell) continue;
  const idm = body.match(/[,{]accessorKey:"([^"]+)"/) || body.match(/[,{]id:"([^"]+)"/);
  if (!idm) continue;
  const sz = body.match(/[,{]size:(\d+)/);
  const mn = body.match(/[,{]minSize:(\d+)/);
  const mx = body.match(/[,{]maxSize:(\d+)/);
  const ttl = body.match(/title:t\("([^"]+)"\)/);
  cols.push({ start: o.start, end: o.end, id: idm[1], size: sz ? +sz[1] : null, min: mn ? +mn[1] : null, max: mx ? +mx[1] : null, title: ttl ? ttl[1] : null });
}

// owner factory for an array
function ownerOf(pos) {
  const back = s.slice(Math.max(0, pos - 20000), pos);
  const cands = [...back.matchAll(/function ([A-Za-z0-9_$]+)\(/g)].map((x) => ({ n: x[1], i: pos - 20000 + x.index }));
  cands.push(...[...back.matchAll(/([A-Za-z0-9_$]+)=\(\{?[^)]*\)=>\[/g)].map((x) => ({ n: x[1], i: pos - 20000 + x.index })));
  cands.push(...[...back.matchAll(/([A-Za-z0-9_$]+)=\(([^)]*)\)=>\{/g)].map((x) => ({ n: x[1], i: pos - 20000 + x.index })));
  cands.sort((a, b) => b.i - a.i);
  return cands.length ? cands[0] : null;
}

// group column objects by the smallest array containing them that also contains >=2 cols
const groups = new Map();
for (const c of cols) {
  let arr = null;
  for (const a of arrs) if (a.start < c.start && c.end < a.end) if (!arr || a.start > arr.start) arr = a;
  const key = arr ? arr.start : c.start;
  if (!groups.has(key)) groups.set(key, { arr, cols: [] });
  groups.get(key).cols.push(c);
}

const out = [];
for (const [k, g] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
  if (g.cols.length < 1) continue;
  const own = ownerOf(g.arr ? g.arr.start : k);
  out.push({ arrStart: g.arr ? g.arr.start : k, arrEnd: g.arr ? g.arr.end : null, n: g.cols.length, owner: own,
    cols: g.cols.sort((a, b) => a.start - b.start).map((c) => ({ id: c.id, size: c.size, min: c.min, max: c.max, title: c.title, off: c.start })) });
}
fs.writeFileSync("/workspace/reconstruction/.work-c/cols.json", JSON.stringify(out, null, 1));
for (const g of out) {
  console.log(`\n### @${g.arrStart} owner=${g.owner ? g.owner.n : "?"} cols=${g.n}`);
  console.log("   " + g.cols.map((c) => `${c.id}[${c.size ?? "-"}${c.min ? "/min" + c.min : ""}${c.max ? "/max" + c.max : ""}]`).join("  "));
}
