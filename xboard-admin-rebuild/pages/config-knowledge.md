# `/config/knowledge`

- **页面组件**：`n4t`（offset 6064439，773B）
- **i18n 命名空间**：`knowledge`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `t4t`（1641B）

## 源码（去最小化）

### `t4t`

```js
function t4t(){
  const{
    t:e
  }=jy("knowledge"),[t,n]=H.useState([]),[i,r]=H.useState([]),[s,o]=H.useState(!1),[a,l]=H.useState([]),
  [c,d]=H.useState({
    "drag-handle":!1
  }),[u,h]=H.useState({
    pageSize:20,pageIndex:0
  }),{
    refetch:g,data:p,isLoading:m
  }=pC({
    queryKey:["knowledge"],queryFn:async()=>{
      const{
        data:e
      }=await kD();
      return e
    }
  });
  H.useEffect(()=>{
    p&&l(p||[])
  },[p]),H.useEffect(()=>{
    d({
      "drag-handle":s,actions:!s
    }),h({
      pageSize:s?99999:10,pageIndex:0
    })
  },[s]);
  const f=async()=>{
    s?TD({
      ids:a.map(e=>e.id)
    }).then(()=>{
      g(),o(!1),gE.success("排序保存成功")
    }):o(!0)
  },_=NGt({
    data:a,columns:e4t({
      refetch:g,isSortMode:s,t:e
    }),state:{
      sorting:i,columnFilters:t,columnVisibility:c,pagination:u
    },onSortingChange:r,onColumnFiltersChange:n,onColumnVisibilityChange:d,onPaginationChange:h,getCoreRowModel:vGt(),
    getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSortedRowModel:SGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(HGt,{
    table:_,toolbar:e=>Q.jsx(J2t,{
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
    },showPagination:!s,isLoading:m,mobilePrimaryField:"title",mobileGridFields:["category","show"]
  })
}
```

#### ↳ `J2t`

```js
function J2t({
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
dd(t.value);
const i=Array.from(r);
e?.setFilterValue(i.length?i:void 0)
},children:[Q.jsx("div",{
  className:Im("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
  n?"bg-primary text-primary-foreground":"opacity-50 [&_svg]:invisible"),children:Q.jsx(k7e,{
    className:Im("h-4 w-4")
  })
}),t.icon&&Q.jsx(t.icon,{
  className:"mr-2 h-4 w-4 text-muted-foreground"
}),Q.jsx("span",{
  children:t.label
}),i?.get(t.value)&&Q.jsx("span",{
  className:"ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs",children:i.get(t.value)
})]
},t.value)
})
}),r.size>0&&Q.jsxs(Q.Fragment,{
  children:[Q.jsx(kut,{
  }),Q.jsx(Sut,{
    children:Q.jsx(Nut,{
      onSelect:()=>e?.setFilterValue(void 0),className:"justify-center text-center",children:"Clear filters"
    })
  })]
})]
})]
})
})]
})
}function J2t({
  table:e,refetch:t,saveOrder:n,isSortMode:i
}){
  const r=e.getState().columnFilters.length>0,{
    t:s
  }=jy("knowledge");
  return Q.jsxs("div",{
    className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[i?Q.jsx("p",
    {
      className:"text-sm text-muted-foreground",children:s("toolbar.sortModeHint")
    }):Q.jsxs("div",{
      className:"flex flex-wrap items-center gap-2 sm:flex-nowrap",children:[Q.jsx(X2t,{
        refreshData:t
      }),Q.jsx(u8e,{
        placeholder:s("toolbar.searchPlaceholder"),value:e.getColumn("title")?.getFilterValue()??"",
        onChange:t=>e.getColumn("title")?.setFilterValue(t.target.value),className:"h-8 w-full sm:w-[150px] lg:w-[250px]"
      }),e.getColumn("category")&&Q.jsx(Q2t,{
        column:e.getColumn("category"),title:s("columns.category"),options:Array.from(new Set(e.getCoreRowModel().rows.map(e=>e.getValue("category")))).map(e=>({
          label:e,value:e
        }))
      }),r&&Q.jsxs(Lf,{
        variant:"ghost",onClick:()=>e.resetColumnFilters(),children:[s("toolbar.reset"),Q.jsx(B7e,{
          className:"ml-2 h-4 w-4"
        })]
      })]
    }),e.getRowCount()>0&&Q.jsx("div",{
      className:"hidden items-center gap-2 md:flex",children:Q.jsx(Lf,{
        variant:i?"default":"outline",onClick:n,size:"sm",children:s(i?"toolbar.saveSort":"toolbar.editSort")
      })
    })]
  })
}const e4t=({
  refetch:e,isSortMode:t=!1,t:n
})=>[{
  id:"drag-handle",header:()=>null,cell:()=>Q.jsx("div",{
    className:t?"cursor-move":"opacity-0",children:Q.jsx(Z7e,{
      className:"size-4"
    })
  }),size:40,enableSorting:!1
},{
  accessorKey:"id",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:n("columns.id")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex items-center space-x-2",children:Q.jsx(nKt,{
      variant:"outline",className:"font-mono",children:e.getValue("id")
    })
  }),enableSorting:!0,size:70
},{
  accessorKey:"show",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:n("columns.status")
  }),cell:({
    row:t
  })=>Q.jsx("div",{
    className:"flex items-center",children:Q.jsx(oZt,{
      defaultChecked:t.getValue("show"),onCheckedChange:async()=>{
        DD({
          id:t.original.id
        }).then(({
          data:t
        })=>{
          t||e()
        })
      }
    })
  }),enableSorting:!1,size:100
},{
  accessorKey:"title",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:n("columns.title")
  }),cell:({
    row:e
  })=>Q.jsx("div",{
    className:"flex space-x-2",children:Q.jsx("span",{
      className:"line-clamp-2 font-medium",children:e.getValue("title")
    })
  }),enableSorting:!0,size:600
},{
  accessorKey:"category",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:n("columns.category")
  }),cell:({
    row:e
  })=>Q.jsx(nKt,{
    variant:"secondary",className:"max-w-[180px] truncate",children:e.getValue("category")
  }),enableSorting:!0,size:1800
},{
  id:"actions",header:({
    column:e
  })=>Q.jsx(eQt,{
    className:"justify-end",column:e,title:n("columns.actions")
  }),cell:({
    row:t
  })=>Q.jsxs("div",{
    className:"flex items-center justify-end space-x-1",children:[Q.jsx(X2t,{
      refreshData:e,dialogTrigger:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-muted",children:[Q.jsx(tet,{
          className:"h-4 w-4 text-muted-foreground hover:text-foreground"
        }),Q.jsx("span",{
          className:"sr-only",children:n("form.edit")
        })]
      }),type:"edit",defaultFormValues:t.original
    }),Q.jsx(hQt,{
      title:n("messages.deleteConfirm"),description:n("messages.deleteDescription"),confirmText:n("messages.deleteButton"),
      variant:"destructive",onConfirm:async()=>{
        LD({
          id:t.original.id
        }).then(({
          data:t
        })=>{
          t&&(gE.success(n("messages.operationSuccess")),e())
        })
      },children:Q.jsxs(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900",children:[Q.jsx(Nlt,
        {
          className:"h-4 w-4 text-muted-foreground hover:text-red-600 dark
```
