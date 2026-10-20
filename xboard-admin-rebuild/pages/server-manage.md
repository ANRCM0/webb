# `/server/manage`

- **页面组件**：`J5t`（offset 6242245，784B）
- **i18n 命名空间**：`server`
- **直引文案键**：`manage.description`, `manage.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `X5t`（2431B）

## 源码（去最小化）

### `X5t`

```js
function X5t(){
  const{
    t:e
  }=jy("server"),[t,n]=Hg(),[i,r]=H.useState({
  }),[s,o]=H.useState({
    "drag-handle":!1
  }),[a,l]=H.useState([]),[c,d]=H.useState({
    pageSize:500,pageIndex:0
  }),[u,h]=H.useState([]),[g,p]=H.useState(!1),[m,f]=H.useState({
  }),[_,v]=H.useState([]),[b,y]=H.useState([]),{
    data:x,refetch:w,isLoading:C
  }=pC({
    queryKey:["nodeList"],queryFn:async()=>{
      const{
        data:e
      }=await $L();
      return e
    },refetchInterval:!g&&3e4
  });
  H.useEffect(()=>{
    !g&&Array.isArray(x)&&v(x)
  },[x,g]);
  const{
    data:S
  }=pC({
    queryKey:["groups"],queryFn:async()=>{
      const{
        data:e
      }=await iD();
      return e
    }
  }),{
    data:k
  }=pC({
    queryKey:["machineList"],queryFn:async()=>{
      const{
        data:e
      }=await DT();
      return e
    },staleTime:3e4,refetchInterval:6e4
  });
  H.useEffect(()=>{
    Array.isArray(k)&&y(k)
  },[k]),H.useEffect(()=>{
    const e=t.get("machine_id");
    e&&l(t=>[...t.filter(e=>"machine"!==e.id),{
      id:"machine",value:[e]
    }])
  },[t]),H.useEffect(()=>{
    o({
      "drag-handle":g,show:!g,host:!g,machine:!g,online:!g,rate:!g,group_ids:!g,type:!1,actions:!g
    }),f({
      name:g?2e3:200
    }),d({
      pageSize:g?99999:500,pageIndex:0
    })
  },[g]);
  const N=NGt({
    data:_||[],columns:Z5t(w,e,b),state:{
      sorting:u,columnVisibility:s,rowSelection:i,columnFilters:a,columnSizing:m,pagination:c
    },enableRowSelection:!0,onRowSelectionChange:r,onSortingChange:h,onColumnFiltersChange:l,onColumnVisibilityChange:o,
    onColumnSizingChange:f,onPaginationChange:d,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),
    getPaginationRowModel:CGt(),getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),
    initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(Zot,{
    delayDuration:100,children:Q.jsx(Y5t,{
      refetch:w,children:Q.jsx(Q5t,{
        table:N,searchParams:t,setSearchParams:n,refetch:w,saveOrder:async()=>{
          if(!g)return void p(!0);
          const t=_?.map((e,t)=>({
            id:e.id,order:t+1
          }));
          try{
            await QL(t),gE.success(e("toolbar.sort.success")),await w()
          }finally{
            p(!1)
          }
        },isSortMode:g,groups:S||[],machines:b,isLoading:C,handleDragStart:(e,t)=>{
          if(!g)return;
          const n=N.getRowModel().rows[t];
          n&&e.dataTransfer.setData("text/plain",String(n.original.id)),e.currentTarget.classList.add("opacity-50")
        },handleDrop:(e,t)=>{
          if(!g)return;
          e.preventDefault(),e.currentTarget.classList.remove("bg-muted");
          const n=parseInt(e.dataTransfer.getData("text/plain")),i=N.getRowModel().rows[t];
          if(!i||n===i.original.id)return;
          const r=[..._],s=r.findIndex(e=>e.id===n),o=r.findIndex(e=>e.id===i.original.id);
          if(-1===s||-1===o)return;
          const[a]=r.splice(s,1);
          r.splice(o,0,a),v(r)
        }
      })
    })
  })
}
```

#### ↳ `Zot`

```js
Lot,Yot=Rot,Xot=Mot,Qot=H.forwardRef(({
  className:e,sideOffset:t=4,...n
},i)=>Q.jsx(Got,{
  ref:i,sideOffset:t,className:Im("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  e),...n
}))
```

#### ↳ `Y5t`

```js
function Y5t({
  children:e,refetch:t
}
```

#### ↳ `Q5t`

```js
function Q5t({
  table:e,searchParams:t,setSearchParams:n,refetch:i,saveOrder:r,isSortMode:s,groups:o,machines:a,
  isLoading:l,handleDragStart:c,handleDrop:d
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
{
  column:e
})=>Q.jsx(eQt,{
  column:e,title:t("columns.traffic.title"),tooltip:t("columns.traffic.tooltip")
}),cell:({
  row:e
})=>{
  const n=(e.original.u||0)+(e.original.d||0),i=e.original.transfer_enable??0,r=e.original.banned??!1,
  s=RS(n),o=RS(i);
  if(i<=0)return Q.jsx("div",{
    className:"text-sm text-muted-foreground",children:s
  });
  const a=Math.min(n/i*100,100);
  return Q.jsx(Zot,{
    delayDuration:100,children:Q.jsxs(Yot,{
      children:[Q.jsx(Xot,{
        children:Q.jsxs("div",{
          className:"flex items-center gap-2",children:[Q.jsx("div",{
            className:"h-1.5 w-12 rounded-full bg-secondary",children:Q.jsx("div",{
              className:Im("h-full rounded-full transition-all",r||a>90?"bg-destructive":"bg-primary"),style:{
                width:`${a}%`
              }
            })
          }),Q.jsx("span",{
            className:Im("text-xs tabular-nums text-muted-foreground",r&&"text-destructive"),children:s
          })]
        })
      }),Q.jsx(Qot,{
        side:"bottom",children:Q.jsxs("div",{
          className:"space-y-1 text-sm",children:[Q.jsxs("p",{
            children:[t("columns.traffic.used"),": ",s]
          }),Q.jsxs("p",{
            children:[t("columns.traffic.total"),": ",o]
          }),Q.jsxs("p",{
            children:[t("columns.traffic.percentage"),": ",a.toFixed(1),"%"]
          })]
        })
      })]
    })
  })
},size:120,enableSorting:!1,enableHiding:!0
},{
  id:"actions",header:({
    column:e
  })=>Q.jsx(eQt,{
    className:"justify-end",column:e,title:t("columns.actions")
  }),cell:({
    row:n
  })=>Q.jsx(B5t,{
    node:n.original,refetch:e,t:t
  }),size:50
}];
function Y5t({
  children:e,refetch:t
}){
  const[n,i]=H.useState(!1),[r,s]=H.useState(null),[o,a]=H.useState(null),[l,c]=H.useState(null),
  d=H.useCallback(e=>{
    s(null),a(null),c(e??null),i(!0)
  },[]);
  return Q.jsx(d4t.Provider,{
    value:{
      isOpen:n,setIsOpen:i,editingServer:r,setEditingServer:s,serverType:o,setServerType:a,newNodePreset:l,
      setNewNodePreset:c,openNewNode:d,refetch:t
    },children:e
  })
}function X5t(){
  const{
    t:e
  }=jy("server"),[t,n]=Hg(),[i,r]=H.useState({
  }),[s,o]=H.useState({
    "drag-handle":!1
  }),[a,l]=H.useState([]),[c,d]=H.useState({
    pageSize:500,pageIndex:0
  }),[u,h]=H.useState([]),[g,p]=H.useState(!1),[m,f]=H.useState({
  }),[_,v]=H.useState([]),[b,y]=H.useState([]),{
    data:x,refetch:w,isLoading:C
  }=pC({
    queryKey:["nodeList"],queryFn:async()=>{
      const{
        data:e
      }=await $L();
      return e
    },refetchInterval:!g&&3e4
  });
  H.useEffect(()=>{
    !g&&Array.isArray(x)&&v(x)
  },[x,g]);
  const{
    data:S
  }=pC({
    queryKey:["groups"],queryFn:async()=>{
      const{
        data:e
      }=await iD();
      return e
    }
  }),{
    data:k
  }=pC({
    queryKey:["machineList"],queryFn:async()=>{
      const{
        data:e
      }=await DT();
      return e
    },staleTime:3e4,refetchInterval:6e4
  });
  H.useEffect(()=>{
    Array.isArray(k)&&y(k)
  },[k]),H.useEffect(()=>{
    const e=t.get("machine_id");
    e&&l(t=>[...t.filter(e=>"machine"!==e.id),{
      id:"machine",value:[e]
    }])
  },[t]),H.useEffect(()=>{
    o({
      "drag-handle":g,show:!g,host:!g,machine:!g,online:!g,rate:!g,group_ids:!g,type:!1,actions:!g
    }),f({
      name:g?2e3:200
    }),d({
      pageSize:g?99999:500,pageIndex:0
    })
  },[g]);
  const N=NGt({
    data:_||[],columns:Z5t(w,e,b),state:{
      sorting:u,columnVisibility:s,rowSelection:i,columnFilters:a,columnSizing:m,pagination:c
    },enableRowSelection:!0,onRowSelectionChange:r,onSortingChange:h,onColumnFiltersChange:l,onColumnVisibilityChange:o,
    onColumnSizingChange:f,onPaginationChange:d,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),
    getPaginationRowModel:CGt(),getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),
    initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsx(Zot,{
    delayDuration:100,children:Q.jsx(Y5t,{
      refetch:w,children:Q.jsx(Q5t,{
        table:N,searchParams:t,setSearchParams:n,refetch:w,saveOrder:async()=>{
          if(!g)return void p(!0);
          const t=_?.map((e,t)=>({
            id:e.id,order:t+1
          }));
          try{
            await QL(t),gE.success(e("toolbar.sort.success")),await w()
          }finally{
            p(!1)
          }
        },isSortMode:g,groups:S||[],machines:b,isLoading:C,handleDragStart:(e,t)=>{
          if(!g)return;
          const n=N.getRowModel().rows[t];
          n&&e.dataTransfer.setData("text/plain",String(n.original.id)),e.currentTarget.classList.add("opacity-50")
        },handleDrop:(e,t)=>{
          if(!g)return;
          e.preventDefault(),e.currentTarget.classList.remove("bg-muted");
          const n=parseInt(e.dataTransfer.getData("text/plain")),i=N.getRowModel().rows[t];
          if(!i||n===i.original.id)return;
          const r=[..._],s=r.findIndex(e=>e.id===n),o
```
