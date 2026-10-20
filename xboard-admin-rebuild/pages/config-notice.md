# `/config/notice`

- **页面组件**：`G2t`（offset 6052168，844B）
- **i18n 命名空间**：`notice`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `K2t`（1824B）

## 源码（去最小化）

### `K2t`

```js
function K2t(){
  const{
    t:e
  }=jy("notice"),[t,n]=H.useState({
  }),[i,r]=H.useState({
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState(!1),[u,h]=H.useState({
  }),[g,p]=H.useState({
    pageSize:50,pageIndex:0
  }),[m,f]=H.useState([]),{
    refetch:_,data:v,isLoading:b
  }=pC({
    queryKey:["notices"],queryFn:async()=>(await bD()).data??[]
  });
  H.useEffect(()=>{
    v&&f(v)
  },[v]),H.useEffect(()=>{
    r({
      "drag-handle":c,content:!c,created_at:!c,actions:!c
    }),p({
      pageSize:c?99999:50,pageIndex:0
    })
  },[c]);
  const y=async()=>{
    c?CD(m.map(e=>e.id)).then(()=>{
      gE.success("排序保存成功"),d(!1),_()
    }).finally(()=>{
      d(!1)
    }):d(!0)
  },x=NGt({
    data:m??[],columns:q2t(_,e),state:{
      sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s,columnSizing:u,pagination:g
    },enableRowSelection:!0,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,onColumnVisibilityChange:r,
    onColumnSizingChange:h,onPaginationChange:p,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),
    getPaginationRowModel:CGt(),getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),
    initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx("div",{
    className:"space-y-4",children:Q.jsx(HGt,{
      table:x,toolbar:e=>Q.jsx($2t,{
        table:e,refetch:_,saveOrder:y,isSortMode:c
      }),draggable:c,onDragStart:(e,t)=>{
        c&&(e.dataTransfer.setData("text/plain",t.toString()),e.currentTarget.classList.add("opacity-50"))
      },onDragEnd:e=>e.currentTarget.classList.remove("opacity-50"),onDragOver:e=>{
        e.preventDefault(),e.currentTarget.classList.add("bg-muted")
      },onDragLeave:e=>e.currentTarget.classList.remove("bg-muted"),onDrop:(e,t)=>{
        if(!c)return;
        e.preventDefault(),e.currentTarget.classList.remove("bg-muted");
        const n=parseInt(e.dataTransfer.getData("text/plain"));
        if(n===t)return;
        const i=[...m],[r]=i.splice(n,1);
        i.splice(t,0,r),f(i)
      },showPagination:!c,isLoading:b,mobilePrimaryField:"title"
    })
  })
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

#### ↳ `$2t`

```js
function $2t({
  table:e,refetch:t,saveOrder:n,isSortMode:i
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
),className:"w-full font-mono text-xs"
})
}),Q.jsx(Qy,{
  className:"text-[10px]"
})]
})
}),Q.jsx($y,{
  control:a.control,name:"show",render:({
    field:e
  })=>Q.jsxs(Gy,{
    className:"flex flex-col",children:[Q.jsx(Zy,{
      className:"text-[11px] uppercase tracking-wider text-muted-foreground",children:r("form.fields.show.label")
    }),Q.jsx("div",{
      className:"flex h-9 items-center",children:Q.jsx(Yy,{
        children:Q.jsx(oZt,{
          checked:e.value,onCheckedChange:e.onChange
        })
      })
    }),Q.jsx(Qy,{
      className:"text-[10px]"
    })]
  })
})]
})]
}),Q.jsx(ftt,{
  className:"border-t bg-muted/20 px-6 py-4",children:Q.jsxs("div",{
    className:"flex w-full items-center justify-end gap-3",children:[Q.jsx(btt,{
      asChild:!0,children:Q.jsx(Lf,{
        type:"button",variant:"ghost",className:"h-8 px-4 font-mono text-xs font-bold",children:r("form.buttons.cancel")
      })
    }),Q.jsx(Lf,{
      type:"submit",className:"h-8 px-8 font-mono text-xs font-bold",onClick:t=>{
        t.preventDefault(),a.handleSubmit(async t=>{
          yD(t).then(({
            data:t
          })=>{
            t&&(gE.success(r("form.buttons.success")),e(),o(!1))
          })
        })()
      },children:r("form.buttons.submit")
    })]
  })
})]
})]
})
})
}function $2t({
  table:e,refetch:t,saveOrder:n,isSortMode:i
}){
  const{
    t:r
  }=jy("notice"),s=e.getState().columnFilters.length>0;
  return Q.jsxs("div",{
    className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[Q.jsxs("div",
    {
      className:"flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap",children:[!i&&Q.jsx(U2t,
      {
        refetch:t
      }),!i&&Q.jsx(u8e,{
        placeholder:r("table.toolbar.search"),value:e.getColumn("title")?.getFilterValue()??"",onChange:t=>e.getColumn("title")?.setFilterValue(t.target.value),
        className:"h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
      }),s&&!i&&Q.jsxs(Lf,{
        variant:"ghost",onClick:()=>e.resetColumnFilters(),className:"h-9 px-2 lg:px-3",children:[r("table.toolbar.reset"),
        Q.jsx(B7e,{
          className:"ml-2 h-4 w-4"
        })]
      })]
    }),e.getRowCount()>0&&Q.jsx("div",{
      className:"hidden items-center space-x-2 md:flex",children:Q.jsx(Lf,{
        variant:i?"default":"outline",onClick:n,className:"h-8",size:"sm",children:r(i?"table.toolbar.sort.save":"table.toolbar.sort.edit")
      })
    })]
  })
}const q2t=(e,t)=>[{
  id:"drag-handle",header:"",cell:()=>Q.jsx("div",{
    className:"flex items-center justify-center",children:Q.jsx(Kat,{
      className:"h-4 w-4 cursor-move text-muted-foreground"
    })
  }),size:40,enableSorting:!1
},{
  accessorKey:"id",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.id")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex items-center space-x-2",children:Q.jsx(nKt,{
      variant:"outline",className:"font-mono",children:e.getValue("id")
    })
  }),enableSorting:!0,size:60
},{
  accessorKey:"show",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.show")
  }),cell:({
    row:t
  })=>Q.jsx("div",{
    className:"flex items-center",children:Q.jsx(oZt,{
      defaultChecked:t.getValue("show"),onCheckedChange:async()=>{
        const{
          data:n
        }=await wD(t.original.id);
        n||e()
      }
    })
  }),enableSorting:!1,size:100
},{
  accessorKey:"title",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.title")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex max-w-[500px] items-center",children:Q.jsx("span",{
      className:"truncate font-medium",children:e.getValue("title")
    })
  }),enableSorting:!1,size:6e3
},{
  id:"actions",header:({
    column:e
  })=>Q.jsx(eQt,{
    className:"justify-end",column:e,title:t("table.columns.actions")
  }),cell:({
    row:n
  })=>Q.jsxs("div",{
    className:"flex items-center justify-end space-x-2",children:[Q.jsx(U2t,{
      refetch:e,dialogTrigger:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-muted",children:[Q.jsx(tet,{
          className:"h-4 w-4 text-muted-foreground hover:text-foreground"
        }),Q.jsx("span",{
          className:"sr-only",children:t("table.actions.edit")
        })]
      }),type:"edit",defaultFormValues:n.original
    }),Q.jsx(hQt,{
      title:t("table.actions.delete.title"),description:t("table.actions.delete.description"),onConfirm:async()=>{
        xD(n.original.id).then(()=>{
          gE.success(t("table.actions.delete.success")),e()
        })
      },children:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900",children:[Q.jsx(Nlt,
        {
          className:"h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
        }),Q.jsx("span",{
          className:"sr-only",children:t("table.actions.delete.title")
        })]
      })
    })]
  }),size:100

```
