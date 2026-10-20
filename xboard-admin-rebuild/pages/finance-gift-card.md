# `/finance/gift-card`

- **页面组件**：`s8t`（offset 6401831，2563B）
- **i18n 命名空间**：`giftCard`
- **直引文案键**：`code.description`, `code.title`, `statistics.description`, `statistics.title`, `tabs.codes`, `tabs.statistics`, `tabs.templates`, `tabs.usages`, `template.description`, `template.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `t8t`（1022B）
- `Y6t`（1058B）
- `i8t`（1018B）
- `r8t`（837B）

## 源码（去最小化）

### `t8t`

```js
function t8t(){
  const{
    t:e
  }=jy("giftCard"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  }),{
    refetch:u,data:h,isLoading:g
  }=pC({
    queryKey:["giftCardCodes",c,s,a],queryFn:()=>ZD({
      per_page:c.pageSize,page:c.pageIndex+1,filter:s,sort:a
    })
  }),p=NGt({
    data:h?.data??[],columns:e8t(u,e),state:{
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
  return Q.jsx("div",{
    className:"space-y-4",children:Q.jsx(HGt,{
      table:p,toolbar:Q.jsx(J6t,{
        table:p,refetch:u
      }),isLoading:g
    })
  })
}
```

#### ↳ `J6t`

```js
function J6t({
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

### `Y6t`

```js
function Y6t(){
  const{
    t:e
  }=jy("giftCard"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  }),{
    refetch:u,data:h,isLoading:g
  }=pC({
    queryKey:["giftCardTemplates",c,s,a],queryFn:()=>$D({
      per_page:c.pageSize,page:c.pageIndex+1,filter:s,sort:a
    })
  }),p=NGt({
    data:h?.data??[],columns:U6t(u,e),state:{
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
  return Q.jsx(K6t,{
    refetch:u,children:Q.jsx("div",{
      className:"space-y-4",children:Q.jsx(HGt,{
        table:p,toolbar:Q.jsx(Z6t,{
          table:p,refetch:u
        }),isLoading:g
      })
    })
  })
}
```

#### ↳ `Z6t`

```js
function Z6t({
  table:e,refetch:t
}
```

#### ↳ `K6t`

```js
function K6t({
  children:e,refetch:t
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

### `i8t`

```js
function i8t(){
  const{
    t:e
  }=jy("giftCard"),[t,n]=H.useState([]),[i,r]=H.useState([]),[s,o]=H.useState({
    pageIndex:0,pageSize:20
  }),{
    data:a,isLoading:l
  }=pC({
    queryKey:["giftCardUsages",s,t,i],queryFn:()=>QD({
      per_page:s.pageSize,page:s.pageIndex+1,filter:t,sort:i
    })
  }),c=NGt({
    data:a?.data??[],columns:n8t(e),state:{
      sorting:i,columnFilters:t,pagination:s
    },pageCount:Math.ceil((a?.total??0)/s.pageSize),rowCount:a?.total??0,manualPagination:!0,manualFiltering:!0,
    manualSorting:!0,onSortingChange:r,onColumnFiltersChange:n,onPaginationChange:o,getCoreRowModel:vGt(),
    getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt()
  });
  return Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsx("div",{
      className:"flex items-center justify-between",children:Q.jsx(u8e,{
        placeholder:"搜索用户邮箱...",value:c.getColumn("user_email")?.getFilterValue()??"",onChange:e=>c.getColumn("user_email")?.setFilterValue(e.target.value),
        className:"h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
      })
    }),Q.jsx(HGt,{
      table:c,isLoading:l
    })]
  })
}
```

#### ↳ `u8e` — Input

```js
H.forwardRef(({
  className:e,type:t,...n
},i)=>Q.jsx("input",{
  type:t,className:Im("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  e),ref:i,...n
}))
```

#### ↳ `HGt`

```js
function HGt({
  table:e,toolbar:t,draggable:n=!1,onDragStart:i,onDragEnd:r,onDragOver:s,onDragLeave:o,onDrop:a,
  showPagination:l=!0,isLoading:c=!1,mobilePrimaryField:d,mobileSecondaryFields:u,mobileGridFields:h,
  mobileActionSlot:g,onMobileRowClick:p
}
```

### `r8t`

```js
function r8t(){
  const{
    t:e
  }=jy("giftCard"),{
    data:t,isLoading:n
  }=pC({
    queryKey:["giftCardStats"],queryFn:()=>JD({
    })
  }),i=t?.data?.total_stats,r=[{
    title:e("statistics.total.templates_count"),value:i?.templates_count
  },{
    title:e("statistics.total.active_templates_count"),value:i?.active_templates_count
  },{
    title:e("statistics.total.codes_count"),value:i?.codes_count
  },{
    title:e("statistics.total.used_codes_count"),value:i?.used_codes_count
  }];
  return Q.jsx("div",{
    className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:r.map((e,t)=>Q.jsxs(s8e,{
      children:[Q.jsx(o8e,{
        className:"flex flex-row items-center justify-between space-y-0 pb-2",children:Q.jsx(a8e,{
          className:"text-sm font-medium",children:e.title
        })
      }),Q.jsx(c8e,{
        children:n?Q.jsx(q$t,{
          className:"h-8 w-1/2"
        }):Q.jsx("div",{
          className:"text-2xl font-bold",children:e.value??0
        })
      })]
    },t))
  })
}
```

#### ↳ `s8e` — Card

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("rounded-xl border bg-card text-card-foreground shadow",e),...t
}))
```

#### ↳ `q$t`

```js
function q$t({
  className:e,...t
}
```

#### ↳ `o8e` — CardHeader

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("flex flex-col space-y-1.5 p-6",e),...t
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
",disabled:!0,children:[Q.jsx(jat,{className:"mr-2 h-4 w-4"}),n("common.export")]}),Q.jsx(G6t,{table:e})]}),Q.jsx(Q6t,{refetch:t,open:i,onOpenChange:r})]})}const e8t=(e,t)=>[{accessorKey:"id",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.id")}),cell:({row:e})=>Q.jsx(nKt,{children:e.original.id})},{accessorKey:"code",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.code")}),cell:({row:e})=>Q.jsxs("div",{className:"flex items-center space-x-2",children:[Q.jsx(nKt,{variant:"secondary",children:e.original.code}),Q.jsx(Lf,{variant:"ghost",size:"icon",className:"h-6 w-6",onClick:()=>IS(e.original.code).then(()=>{gE.success(t("common:copy.success"))}),children:Q.jsx(Mat,{className:"h-4 w-4"})})]})},{accessorKey:"template_name",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.template_name")})},{accessorKey:"status",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.status")}),cell:({row:n})=>{const i=n.original.status,r=3===i,s=0===i||3===i;return Q.jsxs("div",{className:"flex items-center space-x-2",children:[Q.jsx(nKt,{variant:1===i?"secondary":2===i||3===i?"destructive":"default",children:t(`code.status.${i}`)}),s&&Q.jsx(oZt,{checked:!r,onCheckedChange:async i=>{const r=i?"enable":"disable";try{const{data:i}=await XD({id:n.original.id,action:r});i?(gE.success(t("messages.codeStatusUpdated")),e()):gE.error(t("messages.updateCodeStatusFailed"))}catch(K0t){gE.error(t("messages.updateCodeStatusFailed"))}}})]})}},{accessorKey:"expires_at",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.expires_at")}),cell:({row:e})=>Q.jsx("div",{className:"text-sm text-muted-foreground",children:SS(e.original.expires_at)})},{accessorKey:"usage_count",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.usage_count")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.original.usage_count})},{accessorKey:"max_usage",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.max_usage")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.original.max_usage})},{accessorKey:"created_at",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("code.table.columns.created_at")}),cell:({row:e})=>Q.jsx("div",{className:"text-sm text-muted-foreground",children:SS(e.original.created_at)})}];function t8t(){const{t:e}=jy("giftCard"),[t,n]=H.useState({}),[i,r]=H.useState({}),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({pageIndex:0,pageSize:20}),{refetch:u,data:h,isLoading:g}=pC({queryKey:["giftCardCodes",c,s,a],queryFn:()=>ZD({per_page:c.pageSize,page:c.pageIndex+1,filter:s,sort:a})}),p=NGt({data:h?.data??[],columns:e8t(u,e),state:{sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s,pagination:c},pageCount:Math.ceil((h?.total??0)/c.pageSize),rowCount:h?.total??0,manualPagination:!0,manualFiltering:!0,manualSorting:!0,enableRowSelection:!0,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,onColumnVisibilityChange:r,onPaginationChange:d,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{columnPinning:{right:["actions"]}}});return Q.jsx("div",{className:"space-y-4",children:Q.jsx(HGt,{table:p,toolbar:Q.jsx(J6t,{table:p,refetch:u}),isLoading:g})})}const n8t=e=>[{accessorKey:"id",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("usage.table.columns.id")}),cell:({row:e})=>Q.jsx(nKt,{children:e.original.id})},{accessorKey:"code",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("usage.table.columns.code")}),cell:({row:e})=>Q.jsx(nKt,{variant:"secondary",children:e.original.code})},{accessorKey:"user_email",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("usage.table.columns.user_email")})},{accessorKey:"template_name",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("usage.table.columns.template_name")})},{accessorKey:"created_at",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("usage.table.columns.created_at")}),cell:({row:e})=>Q.jsx("div",{className:"text-sm text-muted-foreground",children:SS(e.original.created_at)})}];function i8t(){const{t:e}=jy("giftCard"),[t,n]=H.useState([]),[i,r]=H.useState([]),[s,o]=H.useState({pageIndex:0,pageSize:20}),{data:a,isLoading:l}=pC({queryKey:["giftCardUsages",s,t,i],queryFn:()=>QD({per_page:s.pageSize,page:s.pageIndex+1,filter:t,sort:i})}),c=NGt({data:a?.data??[],columns:n8t(e),state:{sorting:i,columnFilters:t,pagination:s},pageCount:Math.ceil((a?.total??0)/s.pageSize),rowCount:a?.total??0,manualPagination:!0,manualFiltering:!0,manualSorting:!0,onSortingChange:r,onColumnFiltersChange:n,onPaginationChange:o,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt()});return Q.jsxs("div",{className:"space-y-4",children:[Q.jsx("div",{className:"flex items-center justify-between",children:Q.jsx(u8e,{placeholder:"搜索用户邮箱...",value:c.getColumn("user_email")?.getFilterValue()??"",onChange:e=>c.getCol
```
