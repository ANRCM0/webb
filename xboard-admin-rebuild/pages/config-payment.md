# `/config/payment`

- **页面组件**：`_Qt`（offset 5866421，811B）
- **i18n 命名空间**：`payment`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `fQt`（1679B）

## 源码（去最小化）

### `fQt`

```js
function fQt(){
  const{
    t:e
  }=jy("payment"),[t,n]=H.useState([]),[i,r]=H.useState([]),[s,o]=H.useState(!1),[a,l]=H.useState([]),
  [c,d]=H.useState({
    "drag-handle":!1
  }),[u,h]=H.useState({
    pageSize:20,pageIndex:0
  }),{
    refetch:g,data:p,isLoading:m
  }=pC({
    queryKey:["paymentList"],queryFn:async()=>{
      const{
        data:e
      }=await uD();
      return e
    }
  });
  H.useEffect(()=>{
    p&&l(p.map(e=>({
      ...e,enable:Boolean(e.enable)
    })))
  },[p]),H.useEffect(()=>{
    d({
      "drag-handle":s,actions:!s
    }),h({
      pageSize:s?99999:10,pageIndex:0
    })
  },[s]);
  const f=async()=>{
    s?_D({
      ids:a.map(e=>e.id)
    }).then(()=>{
      g(),o(!1),gE.success("排序保存成功")
    }):o(!0)
  },_=NGt({
    data:a,columns:pQt({
      refetch:g,isSortMode:s,t:e
    }),state:{
      sorting:i,columnFilters:t,columnVisibility:c,pagination:u
    },onSortingChange:r,onColumnFiltersChange:n,onColumnVisibilityChange:d,getCoreRowModel:vGt(),
    getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    },pageCount:s?1:void 0
  });
  return Q.jsx(HGt,{
    table:_,toolbar:e=>Q.jsx(mQt,{
      table:e,refetch:g,saveOrder:f,isSortMode:s
    }),draggable:s,onDragStart:(e,t)=>{
      s&&(e.dataTransfer.setData("text/plain",t.toString()),e.currentTarget.classList.add("opacity-50"))
    },onDragEnd:e=>e.currentTarget.classList.remove("opacity-50"),onDragOver:e=>{
      e.preventDefault(),e.currentTarget.classList.add("bg-muted")
    },onDragLeave:e=>e.currentTarget.classList.remove("bg-muted"),onDrop:(e,t)=>{
      if(!s)return;
      e.preventDefault(),e.currentTarget.classList.remove("bg-muted");
      const n=parseInt(e.dataTransfer.getData("text/plain"));
      if(n===t)return;
      const i=[...a],[r]=i.splice(n,1);
      i.splice(t,0,r),l(i)
    },showPagination:!s,isLoading:m,mobilePrimaryField:"name",mobileGridFields:["payment","enable"]
  })
}
```

#### ↳ `mQt`

```js
function mQt({
  table:e,refetch:t,saveOrder:n,isSortMode:i
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
 0-2.6 1.5a1 1 0 1 0 1.73 1A1 1 0 0 1 12 9a1 1 0 0 1 0 2a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-.18A3 3 0 0 0 12 7"})}),pQt=({refetch:e,isSortMode:t=!1,t:n})=>[{id:"drag-handle",header:()=>null,cell:()=>Q.jsx("div",{className:t?"cursor-move":"opacity-0",children:Q.jsx(Z7e,{className:"size-4"})}),size:40,enableSorting:!1},{accessorKey:"id",header:({column:e})=>Q.jsx(eQt,{column:e,title:n("table.columns.id")}),cell:({row:e})=>Q.jsx("div",{className:"flex items-center space-x-2",children:Q.jsx(nKt,{variant:"outline",className:"font-mono",children:e.getValue("id")})}),enableSorting:!0,size:60},{accessorKey:"enable",header:({column:e})=>Q.jsx(eQt,{column:e,title:n("table.columns.enable")}),cell:({row:t})=>Q.jsx(oZt,{defaultChecked:t.getValue("enable"),onCheckedChange:async()=>{const{data:n}=await fD({id:t.original.id});n||e()}}),enableSorting:!1,size:100},{accessorKey:"name",header:({column:e})=>Q.jsx(eQt,{column:e,title:n("table.columns.name")}),cell:({row:e})=>Q.jsx("div",{className:"flex items-center",children:Q.jsx("span",{className:"max-w-[200px] truncate font-medium",children:e.getValue("name")})}),enableSorting:!1,size:200},{accessorKey:"payment",header:({column:e})=>Q.jsx(eQt,{column:e,title:n("table.columns.payment")}),cell:({row:e})=>Q.jsx("div",{className:"flex items-center",children:Q.jsx("span",{className:"max-w-[200px] truncate font-medium",children:e.getValue("payment")})}),enableSorting:!1,size:200},{accessorKey:"notify_url",header:({column:e})=>Q.jsxs("div",{className:"flex items-center",children:[Q.jsx(eQt,{column:e,title:n("table.columns.notify_url")}),Q.jsx(Zot,{delayDuration:100,children:Q.jsxs(Yot,{children:[Q.jsx(Xot,{className:"ml-1",children:Q.jsx(gQt,{className:"h-4 w-4"})}),Q.jsx(Qot,{children:n("table.columns.notify_url_tooltip")})]})})]}),cell:({row:e})=>Q.jsxs("div",{className:"group/url flex items-center gap-1",children:[Q.jsx("span",{className:"max-w-[260px] truncate font-medium",children:e.getValue("notify_url")}),Q.jsx(Lf,{variant:"ghost",size:"icon",className:"size-6 shrink-0 text-muted-foreground/40 opacity-0 transition-all duration-200 hover:text-muted-foreground group-hover/url:opacity-100",onClick:t=>{t.stopPropagation(),IS(e.getValue("notify_url")).then(()=>{gE.success(n("common:copy.success"))})},children:Q.jsx(Iat,{className:"size-3"})})]}),enableSorting:!1,size:3e3},{id:"actions",header:({column:e})=>Q.jsx(eQt,{className:"justify-end",column:e,title:n("table.columns.actions")}),cell:({row:t})=>Q.jsxs("div",{className:"flex items-center justify-end space-x-2",children:[Q.jsx(JXt,{refetch:e,dialogTrigger:Q.jsxs(Lf,{variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-muted",children:[Q.jsx(tet,{className:"h-4 w-4 text-muted-foreground hover:text-foreground"}),Q.jsx("span",{className:"sr-only",children:n("table.actions.edit")})]}),type:"edit",defaultFormValues:t.original}),Q.jsx(hQt,{title:n("table.actions.delete.title"),description:n("table.actions.delete.description"),onConfirm:async()=>{const{data:n}=await mD({id:t.original.id});n&&e()},children:Q.jsxs(Lf,{variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-destructive/10",children:[Q.jsx(Nlt,{className:"h-4 w-4 text-muted-foreground hover:text-destructive"}),Q.jsx("span",{className:"sr-only",children:n("table.actions.delete.title")})]})})]}),size:100}];function mQt({table:e,refetch:t,saveOrder:n,isSortMode:i}){const{t:r}=jy("payment"),s=e.getState().columnFilters.length>0;return Q.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[i?Q.jsx("p",{className:"text-sm text-muted-foreground",children:r("table.toolbar.sort.hint")}):Q.jsxs("div",{className:"flex flex-wrap items-center gap-2 sm:flex-nowrap",children:[Q.jsx(JXt,{refetch:t}),Q.jsx(u8e,{placeholder:r("table.toolbar.search"),value:e.getColumn("name")?.getFilterValue()??"",onChange:t=>e.getColumn("name")?.setFilterValue(t.target.value),className:"h-8 w-full sm:w-[150px] lg:w-[250px]"}),s&&Q.jsxs(Lf,{variant:"ghost",onClick:()=>e.resetColumnFilters(),children:[r("table.toolbar.reset"),Q.jsx(B7e,{className:"ml-2 h-4 w-4"})]})]}),e.getRowCount()>0&&Q.jsx("div",{className:"hidden items-center gap-2 md:flex",children:Q.jsx(Lf,{variant:i?"default":"outline",onClick:n,size:"sm",children:r(i?"table.toolbar.sort.save":"table.toolbar.sort.edit")})})]})}function fQt(){const{t:e}=jy("payment"),[t,n]=H.useState([]),[i,r]=H.useState([]),[s,o]=H.useState(!1),[a,l]=H.useState([]),[c,d]=H.useState({"drag-handle":!1}),[u,h]=H.useState({pageSize:20,pageIndex:0}),{refetch:g,data:p,isLoading:m}=pC({queryKey:["paymentList"],queryFn:async()=>{const{data:e}=await uD();return e}});H.useEffect(()=>{p&&l(p.map(e=>({...e,enable:Boolean(e.enable)})))},[p]),H.useEffect(()=>{d({"drag-handle":s,actions:!s}),h({pageSize:s?99999:10,pageIndex:0})},[s]);const f=async()=>{s?_D({ids:a.map(e=>e.id)}).then(()=>{g(),o(!1),gE.success("排序保存成功")}):o(!0)},_=NGt({data:a,columns:pQt({refetch:g,isSortMode:s,t:e}),state:{sorting:i,columnFilters:t,columnVisibility:c,p
```
