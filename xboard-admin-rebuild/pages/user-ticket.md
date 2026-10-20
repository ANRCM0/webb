# `/user/ticket`

- **页面组件**：`x9t`（offset 6500641，828B）
- **i18n 命名空间**：`ticket`
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `y9t`（2140B）
- `U8t`（28B）
- `K8t`（12928B）

## 源码（去最小化）

### `y9t`

```js
function y9t(){
  const{
    t:e
  }=jy(["ticket","common"]),t=lC(),[n,i]=H.useState({
  }),[r,s]=H.useState({
  }),[o,a]=H.useState([{
    id:"status",value:"0"
  }]),[l,c]=H.useState([]),[d,u]=H.useState({
    pageIndex:0,pageSize:20
  }),[h,g]=H.useState(null),[p,m]=H.useState(aqt.OPENING),[f,_]=H.useState(!1),{
    refetch:v,data:b,isLoading:y
  }=pC({
    queryKey:["ticketList",d,o,l],queryFn:()=>bT({
      pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l
    })
  }),x=H.useCallback(e=>{
    g(e.id),m(e.status),_(!0)
  },[]),w=NGt({
    data:b?.data??[],columns:i9t(v,e,t,x),getRowId:e=>String(e.id),state:{
      sorting:l,columnVisibility:r,rowSelection:n,columnFilters:o,pagination:d
    },rowCount:b?.total??0,manualPagination:!0,manualFiltering:!0,manualSorting:!0,enableRowSelection:!0,
    onRowSelectionChange:i,onSortingChange:c,onColumnFiltersChange:a,onColumnVisibilityChange:s,
    getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),onPaginationChange:u,
    getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{
      columnPinning:{
        right:["actions"]
      }
    }
  });
  return Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsx(Q8t,{
      table:w,refetch:v
    }),Q.jsx(HGt,{
      table:w,showPagination:!0,isLoading:y,mobilePrimaryField:"subject",mobileSecondaryFields:["id",
      "status"],mobileGridFields:["level","updated_at"],onMobileRowClick:e=>{
        x(e.original)
      },mobileActionSlot:n=>{
        const i=n.original;
        return i.status===aqt.CLOSED?null:Q.jsx(hQt,{
          title:e("actions.close_confirm_title"),description:e("actions.close_confirm_description"),confirmText:e("actions.close_confirm_button"),
          cancelText:e("common:cancel"),variant:"destructive",onConfirm:async()=>{
            await(async n=>{
              await wT(n),gE.success(e("actions.close_success")),await Promise.all([v(),t.invalidateQueries({
                queryKey:["ticketSidebarList"]
              }),t.invalidateQueries({
                queryKey:["ticketDetail"]
              })])
            })(i.id)
          },children:Q.jsx(xtt,{
            variant:"ghost",size:"icon",className:"h-8 w-8",title:e("actions.close_ticket"),onClick:e=>{
              e.stopPropagation()
            },children:Q.jsx(e9t,{
              className:"h-4 w-4 text-muted-foreground hover:text-destructive"
            })
          })
        })
      }
    }),null!=h?Q.jsx(b9t,{
      ticketId:h,statusFilter:p,open:f,onOpenChange:_,dialogTrigger:null
    }):null]
  })
}
```

#### ↳ `xtt` — Button

```js
H.forwardRef(({
  className:e,variant:t,size:n,asChild:i=!1,...r
},s)=>{
  const o=i?Dp:"button";
  return Q.jsx(o,{
    className:Im(ytt({
      variant:t,size:n,className:e
    })),ref:s,...r
  })
})
```

#### ↳ `hQt`

```js
function hQt({
  onConfirm:e,children:t,title:n="确认操作",description:i="确定要执行此操作吗？",cancelText:r="取消",confirmText:s="确认",
  variant:o="default",className:a
}
```

#### ↳ `e9t`

```js
e=>Q.jsx("svg",{
  className:"inline-block",viewBox:"0 0 24 24",width:"1.2em",height:"1.2em",...e,children:Q.jsx("path",
  {
    fill:"currentColor",d:"m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"
  })
})
```

### `U8t`

```js
({
  children:e,refreshData:t
})
```

### `K8t`

```js
function K8t(){
  const{
    t:e
  }=jy("user"),{
    isOpen:t,setIsOpen:n,editingUser:i,refreshData:r
  }=$8t(),[s,o]=H.useState(!1),[a,l]=H.useState([]),c=i?.phone_auth_countries||[],d=!!i?.phone_auth_enabled,
  u=Nv({
    resolver:Mv(q8t)
  });
  return H.useEffect(()=>{
    t&&RD().then(({
      data:e
    })=>{
      l(e)
    })
  },[t]),H.useEffect(()=>{
    if(i){
      const e=i.invite_user?.email,{
        ...t
      }=i;
      u.reset({
        ...t,invite_user_email:e||null,country_code:t.phone_country_code||t.phone_default_country_code||"CN",
        phone:t.phone_national_number||t.phone||null,password:null,u:t.u?(t.u/1024/1024/1024).toFixed(3):"",
        d:t.d?(t.d/1024/1024/1024).toFixed(3):""
      })
    }
  },[i,u]),Q.jsx(g3t,{
    open:t,onOpenChange:n,children:Q.jsxs(v3t,{
      className:"max-w-[90%] space-y-4",children:[Q.jsxs(b3t,{
        children:[Q.jsx(x3t,{
          children:e("edit.title")
        }),Q.jsx(w3t,{
        })]
      }),Q.jsxs(zy,{
        ...u,children:[Q.jsx($y,{
          control:u.control,name:"email",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.email")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                ...t,placeholder:e("edit.form.email_placeholder"),autoComplete:"username"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),Q.jsx($y,{
          control:u.control,name:"invite_user_email",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.inviter_email")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                value:t.value||"",onChange:e=>t.onChange(e.target.value?e.target.value:null),placeholder:e("edit.form.inviter_email_placeholder"),
                autoComplete:"off",name:"invite_user_email"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),d&&Q.jsxs("div",{
          className:"grid gap-2 md:grid-cols-[10rem_1fr]",children:[Q.jsx($y,{
            control:u.control,name:"country_code",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.phone_country")
              }),Q.jsx(Yy,{
                children:Q.jsxs(yzt,{
                  value:t.value||i?.phone_default_country_code||"CN",onValueChange:t.onChange,disabled:c.length<=1,
                  children:[Q.jsx(Czt,{
                    children:Q.jsx(wzt,{
                    })
                  }),Q.jsx(Nzt,{
                    children:c.map(e=>Q.jsxs(Lzt,{
                      value:e.code,children:[e.name," +",e.dial_code]
                    },e.code))
                  })]
                })
              }),Q.jsx(Qy,{
              })]
            })
          }),Q.jsx($y,{
            control:u.control,name:"phone",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.phone")
              }),Q.jsx(Yy,{
                children:Q.jsx(u8e,{
                  value:t.value||"",onChange:e=>t.onChange(e.target.value||null),placeholder:e("edit.form.phone_placeholder"),
                  autoComplete:"tel-national"
                })
              }),Q.jsx(Qy,{
              })]
            })
          })]
        }),Q.jsx($y,{
          control:u.control,name:"password",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.password")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                type:"password",value:t.value||"",onChange:t.onChange,placeholder:e("edit.form.password_placeholder"),
                autoComplete:"new-password"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),Q.jsxs("div",{
          className:"grid gap-2 md:grid-cols-2",children:[Q.jsx($y,{
            control:u.control,name:"balance",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.balance")
              }),Q.jsx(Yy,{
                children:Q.jsxs("div",{
                  className:"flex",children:[Q.jsx(u8e,{
                    type:"number",value:t.value||"",onChange:t.onChange,placeholder:e("edit.form.balance_placeholder"),
                    className:"rounded-r-none"
                  }),Q.jsx("div",{
                    className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
                    children:"¥"
                  })]
                })
              }),Q.jsx(Qy,{
                ...t
              })]
            })
          }),Q.jsx($y,{
            control:u.control,name:"commission_balance",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.commission_balance")
              }),Q.jsx(Yy,{
                children:Q.jsxs("div",{
                  className:"flex",children:[Q.jsx(u8e,{
                    type:"number",value:t.value||"",onChange:t.onChange,placeholder:e("edit.form.commission_balance_placeholder"),
                    className:"rounded-r-none"
                  }),Q.jsx("div",{
                    className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
                    children:"¥"
                  })]
                })
              }),Q.jsx(Qy,{
                ...t
              })]
            })
          }),Q.jsx($y,{
            control:u.control,name:"u",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.upload")
              }),Q.jsx(Yy,{
                children:Q.jsxs("div",{
                  className:"flex",children:[Q.jsx(u8e,{
                    type:"number",step:"any",value:t.value??"",onChange:e=>t.onChange(e.target.value),placeholder:e("edit.form.upload_placeholder"),
                    className:"rounded-r-none"
                  }),Q.jsx("div",{
                    className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
                    children:"GB"
                  })]
                })
              }),Q.jsx(Qy,{
                ...t
              })]
            })
          }),Q.jsx($y,{
            control:u.control,name:"d",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.download")
              }),Q.jsx(Yy,{
                children:Q.jsxs("div",{
                  className:"flex",children:[Q.jsx(u8e,{
                    type:"number",step:"any",value:t.value??"",onChange:e=>t.onChange(e.target.value),placeholder:e("edit.form.download_placeholder"),
   
```

#### ↳ `zy`

```js
e=>{
  const{
    children:t,...n
  }=e;
  return z.createElement(C_.Provider,{
    value:n
  },t)
}
```

#### ↳ `yzt`

```js
_Ht,xzt=VHt,wzt=xHt,Czt=H.forwardRef(({
  className:e,children:t,...n
},i)=>Q.jsxs(lzt,{
  ref:i,className:Im("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  e),...n,children:[t,Q.jsx(czt,{
    asChild:!0,children:Q.jsx(D7e,{
      className:"h-4 w-4 opacity-50"
    })
  })]
}))
```

#### ↳ `y3t` — SheetFooter

```js
({
  className:e,...t
})
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
t.expand":"list.collapse"),children:Q.jsx(g9t,{className:Im("h-4 w-4 transition-transform duration-200",x&&"rotate-180")})}),Q.jsxs("div",{className:"min-w-0 space-y-1.5",children:[Q.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[Q.jsx("h2",{className:"truncate text-xl font-semibold leading-tight",children:O?.subject}),Q.jsx(nKt,{variant:W?.variant??"secondary",children:W?.label??s("status.processing")}),V?null:Q.jsx(hQt,{title:s("actions.close_confirm_title"),description:s("actions.close_confirm_description"),confirmText:s("actions.close_confirm_button"),cancelText:s("common:cancel"),variant:"destructive",onConfirm:async()=>{await wT(_),gE.success(s("actions.close_success")),await F()},children:Q.jsxs(xtt,{variant:"ghost",size:"sm",className:"h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive",children:[Q.jsx(e9t,{className:"h-3.5 w-3.5"}),s("actions.close_ticket")]})})]}),Q.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-xs text-muted-foreground",children:[Q.jsxs("div",{className:"flex items-center gap-1",children:[Q.jsx(W3t,{className:"h-3.5 w-3.5"}),Q.jsx("span",{children:O?.user?.email})]}),Q.jsx($f,{orientation:"vertical",className:"hidden h-3 sm:block"}),Q.jsxs("div",{className:"flex items-center gap-1",children:[Q.jsx(J8t,{className:"h-3.5 w-3.5"}),Q.jsxs("span",{children:[s("detail.created_at")," ",SS(O?.created_at)]})]}),Q.jsx($f,{orientation:"vertical",className:"hidden h-3 sm:block"}),Q.jsx(nKt,{variant:"outline",className:"text-xs",children:null!=O?.level&&s("level."+(O.level===lqt.LOW?"low":O.level===lqt.MIDDLE?"medium":"high"))})]})]})]}),O?.user?Q.jsxs("div",{className:"flex flex-wrap items-center gap-1.5 md:justify-end",children:[Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-8 w-8",title:s("detail.user_info"),onClick:()=>{S(O.user),C(!0)},children:Q.jsx(W3t,{className:"h-4 w-4"})}),Q.jsx(E8t,{user_id:O.user.id,dialogTrigger:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-8 w-8",title:s("detail.traffic_records"),children:Q.jsx(u9t,{className:"h-4 w-4"})})}),Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-8 w-8",title:s("detail.order_records"),onClick:()=>{O?.user&&o("/finance/order?user_id="+O.user.id)},children:Q.jsx(p9t,{className:"h-4 w-4"})})]}):null]})}),Q.jsx("div",{className:"flex-1 overflow-hidden",children:Q.jsx("div",{ref:l,className:"h-full space-y-4 overflow-y-auto p-4 md:p-6",children:0===O?.messages?.length?Q.jsx("div",{className:"flex h-full items-center justify-center text-muted-foreground",children:s("detail.no_messages")}):O?.messages?.map(e=>{const t=e.is_from_admin??!e.is_me;return Q.jsx(o9t,{variant:t?"sent":"received",className:t?"ml-auto":"mr-auto",children:Q.jsx(l9t,{children:Q.jsxs("div",{className:"space-y-1",children:[Q.jsx("div",{className:"text-[10px] font-medium text-muted-foreground",children:s(t?"detail.sender_admin":"detail.sender_user")}),Q.jsx("div",{className:"whitespace-pre-wrap break-words",children:e.message}),Q.jsx("div",{className:"text-right",children:Q.jsx("time",{className:"text-[10px] text-muted-foreground",children:SS(e.created_at)})})]})})},e.id)})})}),Q.jsxs("div",{className:"border-t p-4",children:[V?Q.jsx("p",{className:"mb-2 text-xs text-muted-foreground",children:s("detail.input.closed_hint")}):null,Q.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center",children:[Q.jsx(d9t,{ref:c,disabled:m,placeholder:s(V?"detail.input.closed_reply_placeholder":"detail.input.reply_placeholder"),className:"flex-1 resize-none rounded-lg border bg-background p-3 focus-visible:ring-1",value:g,onChange:e=>p(e.target.value),onKeyDown:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),B())}}),Q.jsx(xtt,{className:"w-full sm:w-auto",disabled:m||!g.trim(),onClick:()=>{B()},children:s(m?"detail.input.sending":"detail.input.send")})]})]})]})]})]})]})]})}function y9t(){const{t:e}=jy(["ticket","common"]),t=lC(),[n,i]=H.useState({}),[r,s]=H.useState({}),[o,a]=H.useState([{id:"status",value:"0"}]),[l,c]=H.useState([]),[d,u]=H.useState({pageIndex:0,pageSize:20}),[h,g]=H.useState(null),[p,m]=H.useState(aqt.OPENING),[f,_]=H.useState(!1),{refetch:v,data:b,isLoading:y}=pC({queryKey:["ticketList",d,o,l],queryFn:()=>bT({pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l})}),x=H.useCallback(e=>{g(e.id),m(e.status),_(!0)},[]),w=NGt({data:b?.data??[],columns:i9t(v,e,t,x),getRowId:e=>String(e.id),state:{sorting:l,columnVisibility:r,rowSelection:n,columnFilters:o,pagination:d},rowCount:b?.total??0,manualPagination:!0,manualFiltering:!0,manualSorting:!0,enableRowSelection:!0,onRowSelectionChange:i,onSortingChange:c,onColumnFiltersChange:a,onColumnVisibilityChange:s,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),getPaginationRowModel:CGt(),onPaginationChange:u,getSortedRowModel:SGt(),getFacetedRowModel:yGt(),getFacetedUniqueValues:xGt(),initialState:{columnPinning:{right:["actions"]}}});return Q.jsxs("div",{className:"space-y-4",children:[Q.jsx(Q8t,{table:w,refetch:v}),Q.jsx(HGt,{table:w,sho
```
