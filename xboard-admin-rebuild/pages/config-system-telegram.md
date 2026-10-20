# `/config/system/telegram`

- **页面组件**：`kYt`（offset 5823426，411B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`telegram.description`, `telegram.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `SYt`（3845B）
- `$f`（218B）

## 源码（去最小化）

### `SYt`

```js
function SYt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(wYt),defaultValues:CYt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","telegram"],queryFn:()=>kT.getSettings("telegram")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  }),{
    mutate:a,isPending:l
  }=mC({
    mutationFn:kT.setTelegramWebhook,onSuccess:t=>{
      const n=t.data;
      if(n){
        const t=[{
          label:e("telegram.webhook.debug.url"),value:n.webhook_url
        },{
          label:e("telegram.webhook.debug.baseUrl"),value:n.webhook_base_url
        }];
        gE.success(e("telegram.webhook.success"),{
          description:Q.jsx("div",{
            className:"mt-2 grid gap-2",children:t.map(e=>Q.jsxs("div",{
              className:"rounded-md border border-border/60 bg-background/60 px-3 py-2.5",children:[Q.jsx("div",
              {
                className:"text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",children:e.label
              }),Q.jsx("div",{
                className:"mt-1 break-all font-mono text-[11px] leading-5 text-foreground/90",children:e.value
              })]
            },e.label))
          }),duration:6e3
        })
      }
    }
  });
  H.useEffect(()=>{
    if(s?.data.telegram){
      const e=s.data.telegram;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),i.current=e
    }
  },[s,r]);
  const c=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await o(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[o]),d=H.useCallback(e=>{
    c(e)
  },[c]);
  H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
    const e=r.watch(e=>{
      d(e)
    });
    return()=>e.unsubscribe()
  },[r,d]);
  const u=Boolean(r.watch("telegram_bot_token")),h=r.watch("telegram_webhook_url")?.trim(),g=h?e("telegram.webhook.target_custom",
  {
    url:h
  }):e("telegram.webhook.target_default");
  return Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"telegram_bot_token",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.bot_token.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("telegram.bot_token.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("telegram.bot_token.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),u&&Q.jsx($y,{
        control:r.control,name:"telegram_webhook_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.webhook_url.title")
          }),Q.jsxs("div",{
            className:"flex flex-col gap-3 sm:flex-row sm:items-start",children:[Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                className:"sm:flex-1",placeholder:e("telegram.webhook_url.placeholder"),...t,value:t.value||""
              })
            }),Q.jsx(Lf,{
              type:"button",className:"sm:shrink-0",loading:l,disabled:l,onClick:()=>a(),children:e(l?"telegram.webhook.setting":"telegram.webhook.button")
            })]
          }),Q.jsx(Xy,{
            children:Q.jsxs("div",{
              className:"space-y-1.5",children:[Q.jsxs("div",{
                children:[e("telegram.webhook_url.description")," ",g]
              }),Q.jsxs("a",{
                href:"https://core.telegram.org/bots/webhooks",target:"_blank",rel:"noreferrer",className:"inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline",
                children:[e("telegram.webhook_url.docs"),Q.jsx(Bat,{
                  className:"h-3.5 w-3.5"
                })]
              })]
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"telegram_bot_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.bot_enable.title")
          }),Q.jsx(Xy,{
            children:e("telegram.bot_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"telegram_discuss_link",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.discuss_link.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("telegram.discuss_link.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("telegram.discuss_link.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),t&&Q.jsx("div",{
        className:"text-sm text-muted-foreground",children:e("common.saving")
      })]
    })
  })
}
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

#### ↳ `u8e` — Input

```js
H.forwardRef(({
  className:e,type:t,...n
},i)=>Q.jsx("input",{
  type:t,className:Im("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  e),ref:i,...n
}))
```

#### ↳ `oZt`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(rZt,{
  className:Im("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  e),...t,ref:n,children:Q.jsx(sZt,{
    className:Im("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")
  })
}))
```

### `$f`

```js
H.forwardRef(({
  className:e,orientation:t="horizontal",decorative:n=!0,...i
},r)=>Q.jsx(Uf,{
  ref:r,decorative:n,orientation:t,className:Im("shrink-0 bg-border","horizontal"===t?"h-[1px] w-full":"h-full w-[1px]",
  e),...i
}))
```

#### ↳ `Uf`

```js
zf;
const $f=H.forwardRef(({
  className:e,orientation:t="horizontal",decorative:n=!0,...i
},r)=>Q.jsx(Uf,{
  ref:r,decorative:n,orientation:t,className:Im("shrink-0 bg-border","horizontal"===t?"h-[1px] w-full":"h-full w-[1px]",
  e),...i
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
Symbol.toStringTag,{
  value:"Module"
})),wYt=py({
  telegram_bot_enable:uy().nullable(),telegram_bot_token:cy().nullable(),telegram_webhook_url:cy().nullable(),
  telegram_discuss_link:cy().nullable()
}),CYt={
  telegram_bot_enable:!1,telegram_bot_token:"",telegram_webhook_url:"",telegram_discuss_link:""
};
function SYt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(wYt),defaultValues:CYt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","telegram"],queryFn:()=>kT.getSettings("telegram")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  }),{
    mutate:a,isPending:l
  }=mC({
    mutationFn:kT.setTelegramWebhook,onSuccess:t=>{
      const n=t.data;
      if(n){
        const t=[{
          label:e("telegram.webhook.debug.url"),value:n.webhook_url
        },{
          label:e("telegram.webhook.debug.baseUrl"),value:n.webhook_base_url
        }];
        gE.success(e("telegram.webhook.success"),{
          description:Q.jsx("div",{
            className:"mt-2 grid gap-2",children:t.map(e=>Q.jsxs("div",{
              className:"rounded-md border border-border/60 bg-background/60 px-3 py-2.5",children:[Q.jsx("div",
              {
                className:"text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",children:e.label
              }),Q.jsx("div",{
                className:"mt-1 break-all font-mono text-[11px] leading-5 text-foreground/90",children:e.value
              })]
            },e.label))
          }),duration:6e3
        })
      }
    }
  });
  H.useEffect(()=>{
    if(s?.data.telegram){
      const e=s.data.telegram;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),i.current=e
    }
  },[s,r]);
  const c=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await o(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[o]),d=H.useCallback(e=>{
    c(e)
  },[c]);
  H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
    const e=r.watch(e=>{
      d(e)
    });
    return()=>e.unsubscribe()
  },[r,d]);
  const u=Boolean(r.watch("telegram_bot_token")),h=r.watch("telegram_webhook_url")?.trim(),g=h?e("telegram.webhook.target_custom",
  {
    url:h
  }):e("telegram.webhook.target_default");
  return Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"telegram_bot_token",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.bot_token.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("telegram.bot_token.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("telegram.bot_token.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),u&&Q.jsx($y,{
        control:r.control,name:"telegram_webhook_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.webhook_url.title")
          }),Q.jsxs("div",{
            className:"flex flex-col gap-3 sm:flex-row sm:items-start",children:[Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                className:"sm:flex-1",placeholder:e("telegram.webhook_url.placeholder"),...t,value:t.value||""
              })
            }),Q.jsx(Lf,{
              type:"button",className:"sm:shrink-0",loading:l,disabled:l,onClick:()=>a(),children:e(l?"telegram.webhook.setting":"telegram.webhook.button")
            })]
          }),Q.jsx(Xy,{
            children:Q.jsxs("div",{
              className:"space-y-1.5",children:[Q.jsxs("div",{
                children:[e("telegram.webhook_url.description")," ",g]
              }),Q.jsxs("a",{
                href:"https://core.telegram.org/bots/webhooks",target:"_blank",rel:"noreferrer",className:"inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline",
                children:[e("telegram.webhook_url.docs"),Q.jsx(Bat,{
                  className:"h-3.5 w-3.5"
                })]
              })]
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"telegram_bot_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("telegram.bot_enable.title")
          }),Q.jsx(Xy,{
            children:e("telegram.bot_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"telegram_discuss_link",render:
```
