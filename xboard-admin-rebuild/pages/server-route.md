# `/server/route`

- **页面组件**：`Y3t`（offset 6299974，952B）
- **i18n 命名空间**：`route`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：`aD()` → `/server/route/fetch`
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `G3t`（56B）

## 源码（去最小化）

### `G3t`

```js
function G3t({
  columns:e,data:t,refetch:n,isLoading:i=!1
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
ren:Q.jsx(aZt,{
  className:"min-h-[120px] font-mono text-xs",placeholder:r("form.matchPlaceholder"),value:Array.isArray(c.watch("match"))?c.watch("match").join("\n"):"",
  onChange:e=>{
    const t=e.target.value.split("\n");
    c.setValue("match",t)
  }
})
})
}),Q.jsx(TYt,{
  control:c.control,name:"action",label:r("form.action"),required:!0,extra:Q.jsxs(yzt,{
    onValueChange:e=>c.setValue("action",e),value:c.watch("action"),children:[Q.jsx(Yy,{
      children:Q.jsx(Czt,{
        className:"h-9 font-mono text-xs",children:Q.jsx(wzt,{
          placeholder:r("form.actionPlaceholder")
        })
      })
    }),Q.jsxs(Nzt,{
      children:[Q.jsx(Lzt,{
        value:"block",children:r("actions.block")
      }),Q.jsx(Lzt,{
        value:"dns",children:r("actions.dns")
      }),Q.jsx(Lzt,{
        value:"direct",children:r("actions.direct")
      }),Q.jsx(Lzt,{
        value:"proxy",children:r("actions.proxy")
      })]
    })]
  })
}),"dns"===c.watch("action")&&Q.jsx(TYt,{
  control:c.control,name:"action_value",label:r("form.dns"),placeholder:r("form.dnsPlaceholder"),
  required:!0
}),"proxy"===c.watch("action")&&Q.jsx(TYt,{
  control:c.control,name:"action_value",label:r("form.proxy"),placeholder:r("form.proxyPlaceholder"),
  required:!0
})]
})
})
})]
})
}function K3t({
  table:e,refetch:t
}){
  const n=e.getState().columnFilters.length>0,{
    t:i
  }=jy("route");
  return Q.jsx("div",{
    className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:Q.jsxs("div",
    {
      className:"flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2",
      children:[Q.jsx(q3t,{
        refetch:t
      }),Q.jsx(u8e,{
        placeholder:i("toolbar.searchPlaceholder"),value:e.getColumn("remarks")?.getFilterValue()??"",
        onChange:t=>e.getColumn("remarks")?.setFilterValue(t.target.value),className:"h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
      }),n&&Q.jsxs(Lf,{
        variant:"ghost",onClick:()=>e.resetColumnFilters(),className:"h-8 px-2 lg:px-3",children:[i("toolbar.reset"),
        Q.jsx(B7e,{
          className:"ml-2 h-4 w-4"
        })]
      })]
    })
  })
}function G3t({
  columns:e,data:t,refetch:n,isLoading:i=!1
}){
  const[r,s]=H.useState({
  }),[o,a]=H.useState({
  }),[l,c]=H.useState([]),[d,u]=H.useState([]),h=NGt({
    data:t,columns:e,state:{
      sorting:d,columnVisibility:o,rowSelection:r,columnFilters:l
    },enableRowSelection:!0,onRowSelectionChange:s,onSortingChange:u,onColumnFiltersChange:c,onColumnVisibilityChange:a,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),
    getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(HGt,{
    table:h,toolbar:e=>Q.jsx(K3t,{
      table:e,refetch:n
    }),isLoading:i,mobilePrimaryField:"remarks",mobileGridFields:["action","action_value"]
  })
}const Z3t=(e,t)=>{
  const n={
    block:{
      icon:blt,variant:"destructive",className:"bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
    },dns:{
      icon:qat,variant:"secondary",className:"bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800"
    },direct:{
      icon:Blt,variant:"secondary",className:"bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
    },proxy:{
      icon:hat,variant:"default",className:"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800"
    }
  };
  return[{
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
    }),enableSorting:!0,enableHiding:!1
  },{
    accessorKey:"remarks",header:({
      column:e
    })=>Q.jsx(eQt,{
      column:e,title:t("columns.remarks")
    }),cell:({
      row:e
    })=>Q.jsx("div",{
      className:"flex space-x-2",children:Q.jsx("span",{
        className:"max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]",children:e.original.remarks
      })
    }),enableHiding:!1,enableSorting:!1
  },{
    accessorKey:"action_value",header:({
      column:e
    })=>Q.jsx(eQt,{
      column:e,title:t("columns.action_value.title")
    }),cell:({
      row:e
    })=>{
      const n=e.original.action,i=e.original.action_value,r=e.original.match?.length||0;
      return Q.jsxs("div",{
        className:"flex flex-col space-y-1",children:[Q.jsx("span",{
          className:"text-sm font-medium",children:"dns"===n&&i?t("columns.action_value.dns",{
            value:i
          }):"proxy"===n&&i?t("columns.action_value.proxy",{
            value:i
          }):"block"===n?Q.jsx("span",{
     
```
