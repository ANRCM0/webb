# `/finance/order`

- **页面组件**：`L6t`（offset 6342596，769B）
- **i18n 命名空间**：`order`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `E6t`（1331B）

## 源码（去最小化）

### `E6t`

```js
function E6t(){
  const{
    t:e
  }=jy("order"),[t]=Hg(),[n,i]=H.useState({
  }),[r,s]=H.useState({
  }),[o,a]=H.useState([]),[l,c]=H.useState([]),[d,u]=H.useState({
    pageIndex:0,pageSize:20
  });
  H.useEffect(()=>{
    const e=Object.entries({
      user_id:"string",order_id:"string",commission_status:"number",status:"number",commission_balance:"string"
    }).map(([e,n])=>{
      const i=t.get(e);
      return i?{
        id:e,value:"number"===n?parseInt(i):i
      }:null
    }).filter(Boolean);
    e.length>0&&a(e)
  },[t]);
  const{
    refetch:h,data:g,isLoading:p
  }=pC({
    queryKey:["orderList",d,o,l],queryFn:()=>FD({
      pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l
    })
  }),m=NGt({
    data:g?.data??[],columns:N6t(h,e),state:{
      sorting:l,columnVisibility:r,rowSelection:n,columnFilters:o,pagination:d
    },rowCount:g?.total??0,manualPagination:!0,manualFiltering:!0,manualSorting:!0,enableRowSelection:!0,
    onRowSelectionChange:i,onSortingChange:c,onColumnFiltersChange:a,onColumnVisibilityChange:s,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),onPaginationChange:u,
    getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(HGt,{
    table:m,toolbar:Q.jsx(_6t,{
      table:m,refetch:h
    }),showPagination:!0,isLoading:p,mobilePrimaryField:"trade_no",mobileGridFields:["plan.name",
    "total_amount","status","created_at"]
  })
}
```

#### ↳ `_6t`

```js
function _6t({
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
accessorKey:"plan.name",header:({
  column:e
})=>Q.jsx(eQt,{
  column:e,title:t("table.columns.plan")
}),cell:({
  row:e
})=>Q.jsx("div",{
  className:"flex space-x-2",children:Q.jsx("span",{
    className:"max-w-32 truncate font-medium text-foreground/90 sm:max-w-72 md:max-w-[31rem]",children:e.original.plan?.name||"-"
  })
}),enableSorting:!1,enableHiding:!1
},{
  accessorKey:"period",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.period")
  }),cell:({
    row:e
  })=>{
    const n=e.getValue("period"),i=null!=n?C6t[n]:void 0;
    return Q.jsx(nKt,{
      variant:"secondary",className:Im("font-medium transition-colors text-nowrap",i?.color,i?.bgColor,
      "hover:bg-opacity-80"),children:null!=n?t(`period.${n}`,{
        defaultValue:String(n)
      }):"-"
    })
  },enableSorting:!1,enableHiding:!1
},{
  accessorKey:"total_amount",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.amount")
  }),cell:({
    row:e
  })=>{
    const t=e.getValue("total_amount"),n="number"==typeof t?(t/100).toFixed(2):"N/A";
    return Q.jsxs("div",{
      className:"flex items-center font-mono text-foreground/90",children:["¥",n]
    })
  },enableSorting:!0,enableHiding:!1
},{
  accessorKey:"status",header:({
    column:e
  })=>Q.jsxs("div",{
    className:"flex items-center gap-1",children:[Q.jsx(eQt,{
      column:e,title:t("table.columns.status")
    }),Q.jsx(Zot,{
      delayDuration:100,children:Q.jsxs(Yot,{
        children:[Q.jsx(Xot,{
          children:Q.jsx(gQt,{
            className:"h-4 w-4 text-muted-foreground/70 transition-colors hover:text-muted-foreground"
          })
        }),Q.jsx(Qot,{
          side:"top",className:"max-w-[200px] text-sm",children:t("status.tooltip")
        })]
      })
    })]
  }),cell:({
    row:n
  })=>{
    const i=u6t.find(e=>e.value===n.getValue("status"));
    return i?Q.jsxs("div",{
      className:"flex items-center justify-between gap-2",children:[Q.jsxs("div",{
        className:"flex items-center gap-2",children:[i.icon&&Q.jsx(i.icon,{
          className:`h-4 w-4 text-${i.color}`
        }),Q.jsx("span",{
          className:"text-sm font-medium",children:t(`status.${S6t(i.value)}`)
        })]
      }),i.value===Z$t.PENDING&&Q.jsxs(Vst,{
        modal:!0,children:[Q.jsx(Wst,{
          asChild:!0,children:Q.jsxs(xtt,{
            variant:"ghost",size:"sm",className:"h-8 w-8 p-0 hover:bg-muted/60",children:[Q.jsx(Fat,{
              className:"h-4 w-4"
            }),Q.jsx("span",{
              className:"sr-only",children:t("actions.openMenu")
            })]
          })
        }),Q.jsxs(Ust,{
          align:"end",className:"w-[140px]",children:[Q.jsx($st,{
            className:"cursor-pointer",onClick:async()=>{
              await VD({
                trade_no:n.original.trade_no
              }),e()
            },children:t("actions.markAsPaid")
          }),Q.jsx($st,{
            className:"cursor-pointer text-destructive focus:text-destructive",onClick:async()=>{
              await WD({
                trade_no:n.original.trade_no
              }),e()
            },children:t("actions.cancel")
          })]
        })]
      })]
    }):Q.jsx("span",{
      className:"text-muted-foreground",children:"-"
    })
  },enableSorting:!0,enableHiding:!1
},{
  accessorKey:"commission_balance",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.commission")
  }),cell:({
    row:e
  })=>{
    const t=e.getValue("commission_balance"),n=t?(t/100).toFixed(2):"-";
    return Q.jsx("div",{
      className:"flex items-center font-mono text-foreground/90",children:t?`¥${n}`:"-"
    })
  },enableSorting:!0,enableHiding:!1
},{
  accessorKey:"commission_status",header:({
    column:e
  })=>Q.jsx(eQt,{
    column:e,title:t("table.columns.commissionStatus")
  }),cell:({
    row:n
  })=>{
    const i=n.original.status,r=n.original.commission_balance,s=h6t.find(e=>e.value===n.getValue("commission_status"));
    return 0!=r&&s?Q.jsxs("div",{
      className:"flex items-center justify-between gap-2",children:[Q.jsxs("div",{
        className:"flex items-center gap-2",children:[s.icon&&Q.jsx(s.icon,{
          className:`h-4 w-4 text-${s.color}`
        }),Q.jsx("span",{
          className:"text-sm font-medium",children:t(`commission.${k6t(s.value)}`)
        })]
      }),s.value===J$t.PENDING&&i===Z$t.COMPLETED&&Q.jsxs(Vst,{
        modal:!0,children:[Q.jsx(Wst,{
          asChild:!0,children:Q.jsxs(xtt,{
            variant:"ghost",size:"sm",className:"h-8 w-8 p-0 hover:bg-muted/60",children:[Q.jsx(Fat,{
              className:"h-4 w-4"
            }),Q.jsx("span",{
              className:"sr-only",children:t("actions.openMenu")
            })]
          })
        }),Q.jsxs(Ust,{
          align:"end",className:"w-[120px]",children:[Q.jsx($st,{
            className:"cursor-pointer",onClick:async()=>{
              await HD({
                trade_no:n.original.trade_no,commission_status:J$t.PROC
```
