// Scan the original bundle for every column-object `size`/`minSize`/`maxSize` and
// report the enclosing object literal, its column identity and the enclosing array.
// Read-only: the bundle is never modified.
const fs = require("fs");
const P = "/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js";
const s = fs.readFileSync(P, "utf8");

// --- single pass bracket scan with string awareness -------------------------
const stack = [];           // {ch, i}
const objs = [];            // {start, end}
const arrs = [];            // {start, end}
let instr = null;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (instr) {
    if (ch === "\\") { i++; continue; }
    if (ch === instr) instr = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === "`") { instr = ch; continue; }
  if (ch === "{" || ch === "[" || ch === "(") { stack.push({ ch, i }); continue; }
  if (ch === "}" || ch === "]" || ch === ")") {
    const top = stack.pop();
    if (!top) continue;
    const open = top.ch === "{" ? "{" : top.ch === "[" ? "[" : "(";
    if (open !== (ch === "}" ? "{" : ch === "]" ? "[" : "(")) continue;
    if (ch === "}") objs.push({ start: top.i, end: i });
    if (ch === "]") arrs.push({ start: top.i, end: i });
  }
}

// index for containment lookups
function innermost(list, pos) {
  let best = null;
  for (const o of list) if (o.start < pos && pos < o.end) { if (!best || o.start > best.start) best = o; }
  return best;
}

const sizes = [];
const re = /(?:^|[,{])(size|minSize|maxSize):(\d+)/g;
let m;
while ((m = re.exec(s))) {
  const pos = m.index + 1;
  const obj = innermost(objs, pos);
  if (!obj) continue;
  const body = s.slice(obj.start, obj.end + 1);
  const idm = body.match(/(?:^|[,{])(?:id|accessorKey):"([^"]+)"/);
  const headm = body.match(/title:t\("([^"]+)"\)/);
  const arr = innermost(arrs, pos);
  sizes.push({
    prop: m[1], val: +m[2], off: pos,
    objStart: obj.start, objEnd: obj.end,
    id: idm ? idm[1] : null,
    title: headm ? headm[1] : null,
    arrStart: arr ? arr.start : null, arrEnd: arr ? arr.end : null,
    objLen: obj.end - obj.start,
  });
}

// group by enclosing array -> a column list
const groups = new Map();
for (const e of sizes) {
  const k = e.arrStart;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(e);
}

// find the factory that owns an array: nearest preceding `function NAME(` or `NAME=(`
function ownerOf(pos) {
  const back = s.slice(Math.max(0, pos - 6000), pos);
  const cands = [...back.matchAll(/function ([A-Za-z0-9_$]+)\(/g)].map((x) => ({ n: x[1], i: pos - 6000 + x.index }));
  const cands2 = [...back.matchAll(/([A-Za-z0-9_$]+)=(?:\(|function)/g)].map((x) => ({ n: x[1], i: pos - 6000 + x.index }));
  const all = cands.concat(cands2).sort((a, b) => b.i - a.i);
  return all.length ? { name: all[0].n, off: all[0].i } : null;
}

const out = [];
for (const [arrStart, list] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
  const own = ownerOf(arrStart);
  out.push({
    arrStart, arrEnd: list[0].arrEnd,
    owner: own,
    cols: list.map((e) => ({ id: e.id, title: e.title, prop: e.prop, val: e.val, off: e.off })),
  });
}

fs.writeFileSync("/workspace/reconstruction/.work-c/cols.json", JSON.stringify(out, null, 1));
console.log("column-bearing arrays:", out.length, "size hits:", sizes.length);
for (const g of out) {
  const ids = g.cols.map((c) => `${c.id || "?"}:${c.val}`).join(" ");
  console.log(`@${g.arrStart} owner=${g.owner ? g.owner.name : "?"} len=${g.arrEnd - g.arrStart} :: ${ids}`);
}
