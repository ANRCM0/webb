# `/server/machine`

- **页面组件**：`B3t`（offset 6286633，771B）
- **i18n 命名空间**：`machine`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `F3t`（1477B）

## 源码（去最小化）

### `F3t`

```js
function F3t(){
  const{
    t:e
  }=jy("machine"),[t,n]=Hg(),[i,r]=H.useState({
  }),[s,o]=H.useState({
    node_state:!1
  }),[a,l]=H.useState([]),[c,d]=H.useState([]),[u,h]=H.useState(null),[g,p]=H.useState(!1),{
    data:m,refetch:f,isLoading:_
  }=pC({
    queryKey:["machineList"],queryFn:async()=>{
      const{
        data:e
      }=await DT();
      return e??[]
    },staleTime:3e4,refetchInterval:6e4,refetchOnMount:"always",refetchOnWindowFocus:"always"
  }),v=m??[],b=H.useCallback(e=>{
    h(e),p(!0),n(t=>{
      const n=new URLSearchParams(t);
      return n.set("machine_id",String(e.id)),n
    })
  },[n]);
  H.useEffect(()=>{
    const e=t.get("machine_id");
    if(!e||!v.length)return;
    const n=v.find(t=>String(t.id)===e);
    n&&(h(n),p(!0))
  },[t,v]);
  const y=NGt({
    data:v,columns:h3t(f,e,b),state:{
      sorting:c,columnVisibility:s,rowSelection:i,columnFilters:a
    },enableRowSelection:!0,onRowSelectionChange:r,onSortingChange:d,onColumnFiltersChange:l,onColumnVisibilityChange:o,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),
    getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsxs(C3t,{
    children:[Q.jsxs("div",{
      className:"space-y-3",children:[Q.jsx(j3t,{
        machines:v,t:e
      }),Q.jsx(HGt,{
        table:y,toolbar:e=>Q.jsx(r3t,{
          table:e,refetch:f,machines:v
        }),isLoading:_,mobilePrimaryField:"name",mobileGridFields:["load","relation","last_seen"]
      })]
    }),Q.jsx(A3t,{
      machine:u,open:g,onOpenChange:e=>{
        p(e),e||n(e=>{
          const t=new URLSearchParams(e);
          return t.delete("machine_id"),t
        })
      }
    })]
  })
}
```

#### ↳ `r3t`

```js
function r3t({
  table:e,refetch:t,machines:n
}
```

#### ↳ `j3t`

```js
function j3t({
  machines:e,t:t
}
```

#### ↳ `HGt`

```js
function HGt({
  table:e,toolbar:t,draggable:n=!1,onDragStart:i,onDragEnd:r,onDragOver:s,onDragLeave:o,onDrop:a,
  showPagination:l=!0,isLoading:c=!1,mobilePrimaryField:d,mobileSecondaryFields:u,mobileGridFields:h,
  mobileActionSlot:g,onMobileRowClick:p
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
gap-3 py-8",children:[Q.jsx("div",{className:"rounded-full bg-muted p-3",children:Q.jsx(mlt,{className:"size-6 text-muted-foreground"})}),Q.jsx("p",{className:"text-sm text-muted-foreground",children:i("detail.noNodes")}),Q.jsxs(Lf,{variant:"outline",size:"sm",className:"gap-1.5",onClick:()=>r(`/server/manage?machine_id=${e}&open_create=1`),children:[Q.jsx(gat,{className:"size-3.5"}),i("detail.addNodeToServer")]})]})}),Q.jsx(O3t,{machineId:e,machineName:t,open:l,onOpenChange:c,t:i})]})}function A3t({machine:e,open:t,onOpenChange:n}){const{t:i}=jy("machine"),r=sg(),[s,o]=H.useState(c5t[1]),a=s.hours>=12?12e4:3e4,{data:l,isLoading:c}=pC({queryKey:["machineHistory",e?.id,s.label],queryFn:async()=>{if(!e)return[];const{data:t}=await PT(e.id,s.limit,s.hours);return t??[]},enabled:t&&!!e,refetchInterval:!!t&&a}),d=e=>{n(!1),r(e)};if(!e)return null;const u=l??[],{cpu:h}=p5t(e),g=f5t(h,"cpu");return Q.jsx(g3t,{open:t,onOpenChange:n,children:Q.jsxs(v3t,{className:"w-full overflow-y-auto sm:max-w-2xl md:max-w-4xl",children:[Q.jsx(b3t,{children:Q.jsxs(x3t,{className:"flex items-center gap-2 font-mono",children:[Q.jsx(mlt,{className:"h-5 w-5"}),e.name]})}),Q.jsx(C3t,{children:Q.jsxs("div",{className:"mt-6 space-y-4",children:[Q.jsx(s8e,{children:Q.jsx(c8e,{className:"space-y-4 p-4",children:Q.jsxs("div",{className:"flex flex-wrap items-start justify-between gap-4",children:[Q.jsxs("div",{className:"space-y-2",children:[Q.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[Q.jsxs(nKt,{variant:"outline",className:"font-mono",children:["SID:",e.id]}),Q.jsx(s3t,{machine:e,t:i}),Q.jsx(a3t,{status:"danger"===g?"offline":"warn"===g?"never":"online"}),Q.jsxs("span",{className:"font-mono text-xs text-muted-foreground",children:["CPU ",h.toFixed(0),"%"]})]}),Q.jsxs("div",{className:"flex items-center gap-3 text-xs text-muted-foreground",children:[Q.jsxs("span",{children:[i("columns.lastSeen"),": ",h5t(e.last_seen_at)]}),Q.jsx("span",{children:"•"}),Q.jsxs("span",{children:[i("columns.nodes"),": ",e.servers_count]})]}),e.notes?Q.jsx("p",{className:"max-w-[520px] text-sm text-muted-foreground",children:e.notes}):null]}),Q.jsxs("div",{className:"flex flex-wrap gap-2",children:[Q.jsxs(Lf,{size:"sm",className:"gap-1.5",onClick:()=>d(`/server/manage?machine_id=${e.id}&open_create=1`),"aria-label":i("detail.addNodeToServer"),children:[i("detail.addNodeToServer"),Q.jsx(gat,{className:"size-4"})]}),Q.jsxs(Lf,{variant:"outline",size:"sm",className:"gap-1.5",onClick:()=>d(`/server/manage?machine_id=${e.id}`),"aria-label":i("detail.openNodeManage"),children:[i("detail.openNodeManage"),Q.jsx(Bat,{className:"size-4"})]})]})]})})}),Q.jsxs("div",{className:"grid gap-4 xl:grid-cols-[1.3fr_0.7fr]",children:[c?Q.jsx(s8e,{children:Q.jsx(c8e,{className:"p-4",children:Q.jsx(q$t,{className:"h-52 w-full"})})}):Q.jsx(E3t,{history:u,t:i,selectedRange:s,onRangeChange:o}),Q.jsx(L3t,{machine:e,t:i})]}),Q.jsx(I3t,{machineId:e.id,t:i}),Q.jsx(R3t,{machineId:e.id,open:t,t:i}),Q.jsx(M3t,{machineId:e.id,machineName:e.name,open:t,t:i,onNavigate:d})]})})]})})}function P3t(e){return u5t[e].card}function j3t({machines:e,t:t}){const n=e.length,i=e.filter(e=>"online"===g5t(e)).length,r=e.filter(e=>{const t=g5t(e);return"offline"===t||"never"===t}).length,s=e.filter(m5t).length,o=e.reduce((e,t)=>e+(t.servers_count??0),0),a=[{key:"total",label:t("overview.total"),value:n,icon:mlt,tone:"bg-primary/10 text-primary"},{key:"online",label:t("overview.online"),value:i,icon:Nat,tone:P3t("online")},{key:"offline",label:t("overview.offline"),value:r,icon:Dat,tone:P3t(r>0?"offline":"online")},{key:"highLoad",label:t("overview.high_load"),value:s,icon:Dlt,tone:s>0?"bg-amber-500/10 text-amber-600 dark:text-amber-400":"bg-muted text-muted-foreground"},{key:"hostedNodes",label:t("columns.nodes"),value:o,icon:Xat,tone:"bg-muted text-muted-foreground"}];return Q.jsx("div",{className:"flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2.5 shadow-sm",children:a.map(e=>{const t=e.icon;return Q.jsxs("div",{className:"flex min-w-[130px] flex-1 items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2",children:[Q.jsxs("div",{className:"min-w-0",children:[Q.jsx("p",{className:"text-[11px] uppercase tracking-wide text-muted-foreground",children:e.label}),Q.jsx("div",{className:"mt-1 text-xl font-semibold leading-none",children:e.value})]}),Q.jsx(nKt,{variant:"secondary",className:Im("border-0 px-2 py-1",e.tone),children:Q.jsx(t,{className:"size-3.5"})})]},e.key)})})}function F3t(){const{t:e}=jy("machine"),[t,n]=Hg(),[i,r]=H.useState({}),[s,o]=H.useState({node_state:!1}),[a,l]=H.useState([]),[c,d]=H.useState([]),[u,h]=H.useState(null),[g,p]=H.useState(!1),{data:m,refetch:f,isLoading:_}=pC({queryKey:["machineList"],queryFn:async()=>{const{data:e}=await DT();return e??[]},staleTime:3e4,refetchInterval:6e4,refetchOnMount:"always",refetchOnWindowFocus:"always"}),v=m??[],b=H.useCallback(e=>{h(e),p(!0),n(t=>{const n=new URLSearchParams(t);return n.set
```
