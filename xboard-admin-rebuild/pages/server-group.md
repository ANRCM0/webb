# `/server/group`

- **页面组件**：`U3t`（offset 6291513，769B）
- **i18n 命名空间**：`group`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `z3t`（819B）

## 源码（去最小化）

### `z3t`

```js
function z3t(){
  const{
    t:e
  }=jy("group"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),{
    data:c,refetch:d,isLoading:u
  }=pC({
    queryKey:["serverGroupList"],queryFn:async()=>{
      const{
        data:e
      }=await iD();
      return e
    }
  }),h=NGt({
    data:c||[],columns:H3t(d,e),state:{
      sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s
    },enableRowSelection:!0,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,onColumnVisibilityChange:r,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),
    getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(HGt,{
    table:h,toolbar:e=>Q.jsx(V3t,{
      table:e,refetch:d
    }),isLoading:u,mobilePrimaryField:"name",mobileGridFields:["users_count","server_count"]
  })
}
```

#### ↳ `V3t`

```js
function V3t({
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
Symbol.toStringTag,{
  value:"Module"
}));
function V3t({
  table:e,refetch:t
}){
  const n=e.getState().columnFilters.length>0,{
    t:i
  }=jy("group");
  return Q.jsx("div",{
    className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:Q.jsxs("div",
    {
      className:"flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap",children:[Q.jsx(c4t,{
        refetch:t
      }),Q.jsx(u8e,{
        placeholder:i("toolbar.searchPlaceholder"),value:e.getColumn("name")?.getFilterValue()??"",onChange:t=>e.getColumn("name")?.setFilterValue(t.target.value),
        className:Im("h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]",n&&"border-primary/50 ring-primary/20")
      }),n&&Q.jsxs(Lf,{
        variant:"ghost",onClick:()=>e.resetColumnFilters(),className:"h-8 px-2 lg:px-3",children:[i("toolbar.reset"),
        Q.jsx(B7e,{
          className:"ml-2 h-4 w-4"
        })]
      })]
    })
  })
}const W3t=e=>Q.jsx("svg",{
  className:"inline-block",viewBox:"0 0 24 24",width:"1.2em",height:"1.2em",...e,children:Q.jsx("path",
  {
    fill:"currentColor",d:"M15.71 12.71a6 6 0 1 0-7.42 0a10 10 0 0 0-6.22 8.18a1 1 0 0 0 2 .22a8 8 0 0 1 15.9 0a1 1 0 0 0 1 .89h.11a1 1 0 0 0 .88-1.1a10 10 0 0 0-6.25-8.19M12 12a4 4 0 1 1 4-4a4 4 0 0 1-4 4"
  })
}),H3t=(e,t)=>[{
  accessorKey:"id",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("columns.id")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex items-center space-x-2",children:Q.jsx(nKt,{
      variant:"outline",children:e.getValue("id")
    })
  }),enableSorting:!0
},{
  accessorKey:"name",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("columns.name")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex space-x-2",children:Q.jsx("span",{
      className:"max-w-32 truncate font-medium",children:e.getValue("name")
    })
  })
},{
  accessorKey:"users_count",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("columns.usersCount")
  }),cell:({
    row:e
  })=>Q.jsxs("div",{
    className:"flex items-center space-x-2 px-4",children:[Q.jsx(W3t,{
      className:"h-4 w-4"
    }),Q.jsx("span",{
      className:"font-medium",children:e.getValue("users_count")
    })]
  }),enableSorting:!0
},{
  accessorKey:"server_count",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("columns.serverCount")
  }),cell:({
    row:e
  })=>Q.jsxs("div",{
    className:"flex items-center space-x-2 px-4",children:[Q.jsx(mlt,{
      className:"h-4 w-4"
    }),Q.jsx("span",{
      className:"font-medium",children:e.getValue("server_count")
    })]
  }),enableSorting:!0,size:8e3
},{
  id:"actions",header:({
    column:e
  })=>Q.jsx(eQt,{
    className:"justify-end",column:e,title:t("columns.actions")
  }),cell:({
    row:n
  })=>Q.jsxs("div",{
    className:"flex items-center justify-center",children:[Q.jsx(c4t,{
      defaultValues:n.original,refetch:e,type:"edit",dialogTrigger:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-muted",children:[Q.jsx(tet,{
          className:"h-4 w-4 text-muted-foreground hover:text-foreground"
        }),Q.jsx("span",{
          className:"sr-only",children:t("form.edit")
        })]
      })
    }),Q.jsx(hQt,{
      title:t("messages.deleteConfirm"),description:t("messages.deleteDescription"),confirmText:t("messages.deleteButton"),
      variant:"destructive",onConfirm:async()=>{
        sD({
          id:n.original.id
        }).then(({
          data:n
        })=>{
          n&&(gE.success(t("messages.updateSuccess")),e())
        })
      },children:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900",children:[Q.jsx(Nlt,
        {
          className:"h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
        }),Q.jsx("span",{
          className:"sr-only",children:t("messages.deleteButton")
        })]
      })
    })]
  })
}];
function z3t(){
  const{
    t:e
  }=jy("group"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),{
    data:c,refetch:d,isLoading:u
  }=pC({
    queryKey:["serverGroupList"],queryFn:async()=>{
      const{
        data:e
      }=await iD();
      return e
    }
  }),h=NGt({
    data:c||[],columns:H3t(d,e),state:{
      sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s
    },enableRowSelection:!0,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,onColumnVisibilityChange:r,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),
    getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(HGt,{
    table:h,toolbar:e=>Q.jsx(V3t,{
      table:e,refetch:d
    }),isLoading:u,mobilePrimaryField:"name",mobileGridFields:["users_count","server_count"]
  })
}const U3t=
```
