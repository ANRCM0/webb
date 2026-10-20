# `/finance/coupon`

- **页面组件**：`B6t`（offset 6362347，770B）
- **i18n 命名空间**：`coupon`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `F6t`（1123B）

## 源码（去最小化）

### `F6t`

```js
function F6t(){
  const{
    t:e
  }=jy("coupon"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  }),{
    refetch:u,data:h,isLoading:g
  }=pC({
    queryKey:["couponList",c,s,a],queryFn:()=>tT({
      pageSize:c.pageSize,current:c.pageIndex+1,filter:s,sort:a
    })
  }),p=NGt({
    data:h?.data??[],columns:P6t(u,e),state:{
      sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s,pagination:c
    },pageCount:Math.ceil((h?.total??0)/c.pageSize),rowCount:h?.total??0,manualPagination:!0,manualFiltering:!0,
    manualSorting:!0,enableRowSelection:!0,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,
    onColumnVisibilityChange:r,onPaginationChange:d,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),
    getPaginationRowModel:CGt(),getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),
    initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(j6t,{
    refetch:u,children:Q.jsx("div",{
      className:"space-y-4",children:Q.jsx(HGt,{
        table:p,toolbar:Q.jsx(R6t,{
          table:p,refetch:u
        }),isLoading:g,mobilePrimaryField:"name",mobileGridFields:["code","type","limit_use"]
      })
    })
  })
}
```

#### ↳ `j6t`

```js
function j6t({
  children:e,refetch:t
}
```

#### ↳ `R6t`

```js
function R6t({
  table:e,refetch:t
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
ext-green-400"};return Q.jsxs(pot,{open:n,onOpenChange:i,children:[Q.jsx(mot,{asChild:!0,children:Q.jsxs("div",{className:"group -m-0.5 flex max-w-[280px] cursor-pointer items-center gap-2 rounded-md p-0.5 transition-colors hover:bg-muted/40",children:[Q.jsxs("div",{className:"flex flex-1 items-center gap-2",children:[Q.jsx("div",{className:Im("whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium",d.color),children:d.label}),Q.jsxs("div",{className:"flex min-w-0 items-center gap-1 text-muted-foreground",children:[Q.jsx("div",{className:"truncate text-xs",children:SS(e.started_at,"MM/dd HH:mm")}),Q.jsx("div",{className:"shrink-0 opacity-30",children:"->"}),Q.jsx("div",{className:"truncate text-xs",children:SS(e.ended_at,"MM/dd HH:mm")})]})]}),Q.jsx(yat,{className:Im("h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",n&&"rotate-180")})]})}),Q.jsx(fot,{children:Q.jsx("div",{className:"px-0.5 pb-0.5 pt-1.5",children:Q.jsxs("div",{className:"space-y-1.5 border-l-2 border-muted pl-3 text-xs text-muted-foreground",children:[Q.jsxs("div",{className:"flex items-center justify-between",children:[Q.jsx("span",{children:t("table.validity.startTime")}),Q.jsx("span",{className:"font-medium text-foreground",children:SS(e.started_at,"yyyy/MM/dd HH:mm")})]}),Q.jsxs("div",{className:"flex items-center justify-between",children:[Q.jsx("span",{children:t("table.validity.endTime")}),Q.jsx("span",{className:"font-medium text-foreground",children:SS(e.ended_at,"yyyy/MM/dd HH:mm")})]})]})})})]})}function A6t({coupon:e,refetch:t,t:n}){const{openEdit:i}=function(){const e=H.useContext(O6t);if(void 0===e)throw new Error("useCouponEdit must be used within a CouponEditProvider");return e}();return Q.jsxs("div",{className:"flex items-center justify-center",children:[Q.jsxs(Lf,{variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-muted",onClick:()=>i(e),children:[Q.jsx(tet,{className:"h-4 w-4 text-muted-foreground hover:text-foreground"}),Q.jsx("span",{className:"sr-only",children:n("table.actions.edit")})]}),Q.jsx(hQt,{title:n("table.actions.deleteConfirm.title"),description:n("table.actions.deleteConfirm.description"),confirmText:n("table.actions.deleteConfirm.confirmText"),variant:"destructive",onConfirm:async()=>{iT({id:e.id}).then(({data:e})=>{e&&(gE.success("删除成功"),t())})},children:Q.jsxs(Lf,{variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900",children:[Q.jsx(Nlt,{className:"h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"}),Q.jsx("span",{className:"sr-only",children:n("table.actions.delete")})]})})]})}const P6t=(e,t)=>[{accessorKey:"id",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.id")}),cell:({row:e})=>Q.jsx(nKt,{children:e.original.id}),enableSorting:!0},{accessorKey:"show",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.show")}),cell:({row:t})=>Q.jsx(oZt,{defaultChecked:t.original.show,onCheckedChange:n=>{rT({id:t.original.id,show:n}).then(({data:t})=>!t&&e())}}),enableSorting:!1},{accessorKey:"name",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.name")}),cell:({row:e})=>Q.jsx("div",{className:"flex items-center",children:Q.jsx("span",{children:e.original.name})}),enableSorting:!1,size:800},{accessorKey:"type",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.type")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:t(`table.toolbar.types.${e.original.type}`)}),enableSorting:!0},{accessorKey:"code",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.code")}),cell:({row:e})=>Q.jsx(nKt,{variant:"secondary",children:e.original.code}),enableSorting:!0},{accessorKey:"limit_use",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.limitUse")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:null===e.original.limit_use?t("table.validity.unlimited"):e.original.limit_use}),enableSorting:!0},{accessorKey:"limit_use_with_user",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.limitUseWithUser")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:null===e.original.limit_use_with_user?t("table.validity.noLimit"):e.original.limit_use_with_user}),enableSorting:!0},{accessorKey:"#",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.validity")}),cell:({row:e})=>Q.jsx(M6t,{coupon:e.original,t:t}),enableSorting:!1,size:8e3},{id:"actions",header:({column:e})=>Q.jsx(eQt,{className:"justify-end",column:e,title:t("table.columns.actions")}),cell:({row:n})=>Q.jsx(A6t,{coupon:n.original,refetch:e,t:t})}];function j6t({children:e,refetch:t}){const[n,i]=H.useState(!1),[r,s]=H.useState(null);return Q.jsxs(O6t.Provider,{value:{isOpen:n,currentCoupon:r,openEdit:e=>{s(e),i(!0)},closeEdit:()=>{i(!1),s(null)}},children:[e,r&&Q.jsx(I6t,{defaultValues:r,refetch:t,type:"edit",open:n,onOpenChange:i})]})}function F6t(){const{t:e}=jy("coupon"),[t,n]=H.useState({}),[i,r]=H.useState({}),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.us
```
