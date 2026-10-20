# `/finance/plan`

- **页面组件**：`d6t`（offset 6320121，788B）
- **i18n 命名空间**：`subscribe`
- **直引文案键**：`plan.page.description`, `plan.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `c6t`（1912B）

## 源码（去最小化）

### `c6t`

```js
function c6t(){
  const{
    t:e
  }=jy("subscribe"),[t,n]=H.useState({
  }),[i,r]=H.useState({
    "drag-handle":!1
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState(!1),[u,h]=H.useState({
    pageSize:20,pageIndex:0
  }),[g,p]=H.useState([]),{
    refetch:m,data:f,isLoading:_
  }=pC({
    queryKey:["planList"],queryFn:async()=>{
      const{
        data:e
      }=await RD();
      return e
    }
  });
  H.useEffect(()=>{
    f&&p(f)
  },[f]),H.useEffect(()=>{
    r({
      "drag-handle":c
    }),h({
      pageSize:c?99999:10,pageIndex:0
    })
  },[c]);
  const v=async()=>{
    if(!c)return void d(!0);
    const e=g.map(e=>e.id);
    PD(e).then(()=>{
      gE.success("排序保存成功"),d(!1),m()
    }).finally(()=>{
      d(!1)
    })
  },b=NGt({
    data:g||[],columns:n6t(m,e),state:{
      sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s,pagination:u
    },enableRowSelection:!0,onPaginationChange:h,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,
    onColumnVisibilityChange:r,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),
    getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    },pageCount:c?1:void 0
  });
  return Q.jsx(i6t,{
    refreshData:m,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx(HGt,{
        table:b,toolbar:e=>Q.jsx(J3t,{
          table:e,refetch:m,saveOrder:v,isSortMode:c
        }),draggable:c,onDragStart:(e,t)=>{
          c&&(e.dataTransfer.setData("text/plain",t.toString()),e.currentTarget.classList.add("opacity-50"))
        },onDragEnd:e=>e.currentTarget.classList.remove("opacity-50"),onDragOver:e=>{
          e.preventDefault(),e.currentTarget.classList.add("bg-muted")
        },onDragLeave:e=>e.currentTarget.classList.remove("bg-muted"),onDrop:(e,t)=>{
          if(!c)return;
          e.preventDefault(),e.currentTarget.classList.remove("bg-muted");
          const n=parseInt(e.dataTransfer.getData("text/plain"));
          if(n===t)return;
          const i=[...g],[r]=i.splice(n,1);
          i.splice(t,0,r),p(i)
        },showPagination:!c,isLoading:_,mobilePrimaryField:"name",mobileGridFields:["prices","users_count",
        "group"]
      }),Q.jsx(l6t,{
      })]
    })
  })
}
```

#### ↳ `l6t`

```js
function l6t(){
  const{
    isOpen:e,setIsOpen:t,editingPlan:n,setEditingPlan:i,refreshData:r
  }=Q3t(),[s,o]=H.useState(!1),[a,l]=H.useState(!1),{
    t:c
  }=jy("subscribe"),d=Nv({
    resolver:Mv(r6t),defaultValues:{
      ...s6t,...n||{
      }
    },mode:"onChange"
  });
  H.useEffect(()=>{
    n?d.reset({
      ...s6t,...n
    }):d.reset(s6t)
  },[n,d]);
  const u=new d1t({
    html:!0
  }),[h,g]=H.useState();
  async function p(){
    iD().then(({
      data:e
    })=>{
      g(e)
    })
  }H.useEffect(()=>{
    e&&p()
  },[e]);
  const m=()=>{
    t(!1),i(null),d.reset(s6t)
  };
  return Q.jsx(htt,{
    open:e,onOpenChange:m,children:Q.jsx(XXt,{
      title:c(n?"plan.form.edit_title":"plan.form.add_title"),isSubmitting:s,onCancel:m,onSubmit:d.handleSubmit(async e=>{
        o(!0),OD(e).then(({
          data:e
        })=>{
          e&&(gE.success(c(n?"plan.form.submit.success.update":"plan.form.submit.success.add")),m(),r())
        }).finally(()=>{
          o(!1)
        })
      },e=>{
        const t=Object.values(e).map(e=>e?.message).filter(Boolean);
        gE.error(t.join("\n")||c("plan.form.submit.error.validation","表单校验失败"))
      }),submitLabel:c("plan.form.submit.submit"),cancelLabel:c("plan.form.submit.cancel"),extraButtons:n?Q.jsx(zy,
      {
        ...d,children:Q.jsx($y,{
          control:d.control,name:"force_update",render:({
            field:e
          })=>Q.jsxs(Gy,{
            className:"flex flex-row items-center space-x-2 space-y-0",children:[Q.jsx(Yy,{
              children:Q.jsx(j5t,{
                checked:e.value,onCheckedChange:e.onChange
              })
            }),Q.jsx(Zy,{
              className:"cursor-pointer select-none text-xs font-normal",children:c("plan.form.force_update.label")
            })]
          })
        })
      }):null,children:Q.jsx(zy,{
        ...d,children:Q.jsxs("form",{
          className:"space-y-6",children:[Q.jsxs("div",{
            className:"grid grid-cols-1 gap-4 md:grid-cols-2",children:[Q.jsx(TYt,{
              control:d.control,name:"name",label:c("plan.form.name.label"),placeholder:c("plan.form.name.placeholder")
            }),Q.jsx($y,{
              control:d.control,name:"tags",render:({
                field:e
              })=>Q.jsxs(Gy,{
                children:[Q.jsx(Zy,{
                  children:c("plan.form.tags.label","标签")
                }),Q.jsx(Yy,{
                  children:Q.jsx(W2t,{
                    value:e.value||[],onChange:e.onChange,placeholder:c("plan.form.tags.placeholder","输入标签后按回车确认"),
                    className:"w-full"
                  })
                }),Q.jsx(Qy,{
                })]
              })
            })]
          }),Q.jsxs("div",{
            className:"grid grid-cols-1 gap-4 md:grid-cols-2",children:[Q.jsx($y,{
              control:d.control,name:"group_id",render:({
                field:e
              })=>Q.jsxs(Gy,{
                children:[Q.jsxs(Zy,{
                  className:"flex items-center justify-between",children:[c("plan.form.group.label"),Q.jsx(c4t,
                  {
                    dialogTrigger:Q.jsx(Lf,{
                      variant:"link",size:"sm",className:"h-auto p-0 text-xs",children:c("plan.form.group.add")
                    }),refetch:p
                  })]
                }),Q.jsxs(yzt,{
                  value:e.value?.toString()??"",onValueChange:t=>e.onChange(t?Number(t):null),children:[Q.jsx(Yy,
                  {
                    children:Q.jsx(Czt,{
                      children:Q.jsx(wzt,{
                        placeholder:c("plan.form.group.placeholder")
                      })
                    })
                  }),Q.jsx(Nzt,{
                    children:h?.map(e=>Q.jsx(Lzt,{
                      value:e.id.toString(),children:e.name
                    },e.id))
                  })]
                }),Q.jsx(Qy,{
                })]
              })
            }),Q.jsx(TYt,{
              control:d.control,name:"transfer_enable",label:c("plan.form.transfer.label"),type:"number",min:0,
              unit:c("plan.form.transfer.unit"),placeholder:c("plan.form.transfer.placeholder")
            })]
          }),Q.jsxs("div",{
            className:"grid grid-cols-1 gap-4 md:grid-cols-2",children:[Q.jsx(TYt,{
              control:d.control,name:"speed_limit",label:c("plan.form.speed.label"),type:"number",min:0,unit:c("plan.form.speed.unit"),
              placeholder:c("plan.form.speed.placeholder")
        
```

#### ↳ `i6t`

```js
function i6t({
  children:e,refreshData:t
}
```

#### ↳ `J3t`

```js
function J3t({
  table:e,saveOrder:t,isSortMode:n
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
number",min:0,unit:c("plan.form.device.unit"),placeholder:c("plan.form.device.placeholder")})]}),Q.jsxs("div",{className:"grid grid-cols-1 gap-4 md:grid-cols-2",children:[Q.jsx(TYt,{control:d.control,name:"capacity_limit",label:c("plan.form.capacity.label"),type:"number",min:0,unit:c("plan.form.capacity.unit"),placeholder:c("plan.form.capacity.placeholder")}),Q.jsx($y,{control:d.control,name:"reset_traffic_method",render:({field:e})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{children:c("plan.form.reset_method.label")}),Q.jsxs(yzt,{value:e.value?.toString()??"null",onValueChange:t=>e.onChange("null"==t?null:Number(t)),children:[Q.jsx(Yy,{children:Q.jsx(Czt,{children:Q.jsx(wzt,{placeholder:c("plan.form.reset_method.placeholder")})})}),Q.jsx(Nzt,{children:a6t.map(e=>Q.jsx(Lzt,{value:e.value?.toString()??"null",children:c(`plan.form.reset_method.options.${e.label}`)},e.value??"null"))})]}),Q.jsx(Qy,{})]})})]}),Q.jsxs("div",{className:"space-y-4 rounded-lg border border-dashed p-4",children:[Q.jsxs("div",{className:"flex items-center justify-between",children:[Q.jsx("h3",{className:"text-sm font-medium",children:c("plan.form.price.title")}),Q.jsxs("div",{className:"flex items-center gap-2",children:[Q.jsxs("div",{className:"relative",children:[Q.jsx(u8e,{type:"number",step:"0.01",placeholder:c("plan.form.price.base_price"),className:"h-8 w-24 pl-5 text-xs",onChange:e=>(e=>{if(isNaN(e))return;const t=Object.entries(o6t).reduce((t,[n,i])=>{const r=e*i.months*i.discount;return{...t,[n]:r.toFixed(2)}},{});d.setValue("prices",t,{shouldDirty:!0})})(parseFloat(e.target.value))}),Q.jsx("span",{className:"absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground",children:"¥"})]}),Q.jsx(Lf,{variant:"outline",size:"sm",className:"h-8 px-2",type:"button",onClick:()=>{const e=Object.keys(o6t).reduce((e,t)=>({...e,[t]:""}),{});d.setValue("prices",e,{shouldDirty:!0})},children:Q.jsx(Nlt,{className:"h-3.5 w-3.5"})})]})]}),Q.jsx("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",children:Object.entries(o6t).filter(([e])=>!["onetime","reset_traffic"].includes(e)).map(([e])=>Q.jsx(TYt,{control:d.control,name:`prices.${e}`,label:c(`plan.columns.price_period.${e}`),type:"number",step:"0.01",prefix:"¥",className:"text-xs"},e))}),Q.jsx($f,{}),Q.jsx("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:["onetime","reset_traffic"].map(e=>Q.jsx(TYt,{control:d.control,name:`prices.${e}`,label:c(`plan.columns.price_period.${e}`),description:c("onetime"===e?"plan.form.price.onetime_desc":"plan.form.price.reset_desc"),type:"number",step:"0.01",prefix:"¥"},e))})]}),Q.jsx($y,{control:d.control,name:"content",render:({field:e})=>Q.jsxs(Gy,{className:"space-y-3",children:[Q.jsxs("div",{className:"flex items-center justify-between",children:[Q.jsx(Zy,{children:c("plan.form.content.label")}),Q.jsxs("div",{className:"flex items-center gap-2",children:[Q.jsxs(Lf,{variant:"outline",size:"sm",className:"h-8",type:"button",onClick:()=>e.onChange(c("plan.form.content.template.content")),children:[Q.jsx(Alt,{className:"mr-2 h-3.5 w-3.5"}),c("plan.form.content.template.button")]}),Q.jsxs(Lf,{variant:"outline",size:"sm",className:"h-8",type:"button",onClick:()=>l(!a),children:[a?Q.jsx(Vat,{className:"mr-2 h-3.5 w-3.5"}):Q.jsx(Wat,{className:"mr-2 h-3.5 w-3.5"}),c(a?"plan.form.content.preview_button.hide":"plan.form.content.preview_button.show")]})]})]}),Q.jsxs("div",{className:"grid gap-4 "+(a?"grid-cols-1 lg:grid-cols-2":"grid-cols-1"),children:[Q.jsx(Yy,{children:Q.jsx(f2t,{style:{height:"300px"},value:e.value||"",renderHTML:e=>u.render(e),onChange:({text:t})=>e.onChange(t),config:{view:{menu:!0,md:!0,html:!1},canView:{menu:!0,md:!0,html:!1,fullScreen:!1,hideMenu:!1}},className:"rounded-md border"})}),a&&Q.jsx("div",{className:"prose prose-sm dark:prose-invert h-[300px] max-w-none overflow-y-auto rounded-md border bg-muted/20 p-4",children:Q.jsx("div",{dangerouslySetInnerHTML:{__html:u.render(e.value||"")}})})]}),Q.jsx(Xy,{className:"text-xs",children:c("plan.form.content.description")}),Q.jsx(Qy,{})]})})]})})})})}function c6t(){const{t:e}=jy("subscribe"),[t,n]=H.useState({}),[i,r]=H.useState({"drag-handle":!1}),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState(!1),[u,h]=H.useState({pageSize:20,pageIndex:0}),[g,p]=H.useState([]),{refetch:m,data:f,isLoading:_}=pC({queryKey:["planList"],queryFn:async()=>{const{data:e}=await RD();return e}});H.useEffect(()=>{f&&p(f)},[f]),H.useEffect(()=>{r({"drag-handle":c}),h({pageSize:c?99999:10,pageIndex:0})},[c]);const v=async()=>{if(!c)return void d(!0);const e=g.map(e=>e.id);PD(e).then(()=>{gE.success("排序保存成功"),d(!1),m()}).finally(()=>{d(!1)})},b=NGt({data:g||[],columns:n6t(m,e),state:{sorting:a,columnVisibility:i,rowSelection:t,columnFilters:s,pagination:u},enableRowSelection:!0,onPaginationChange:h,onRowSelectionChange:n,onSortingChange:l,onColumnFiltersChange:o,onColumnVisibilityChange:r,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),getSort
```
