# `/config/system/server`

- **页面组件**：`IZt`（offset 5797649，407B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`server.description`, `server.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `TZt`（4181B）
- `$f`（218B）

## 源码（去最小化）

### `TZt`

```js
function TZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(LZt),defaultValues:DZt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","server"],queryFn:()=>kT.getSettings("server")
  }),{
    data:o
  }=pC({
    queryKey:["settings","site"],queryFn:()=>kT.getSettings("site")
  }),a=o?.data?.site?.site_url||"",{
    mutateAsync:l
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(s?.data.server){
      const e=s.data.server;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),!e.server_ws_url&&a&&r.setValue("server_ws_url",a),i.current=r.getValues()
    }
  },[s,a,r]);
  const c=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await l(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[l]),d=H.useCallback(e=>{
    c(e)
  },[c]);
  H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
    const e=r.watch(e=>{
      d(e)
    });
    return()=>e.unsubscribe()
  },[r,d]);
  return Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"server_token",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_token.title")
          }),Q.jsx(Yy,{
            children:Q.jsxs("div",{
              className:"relative",children:[Q.jsx(u8e,{
                placeholder:e("server.server_token.placeholder"),...t,value:t.value||"",className:"pr-10"
              }),Q.jsx(Zot,{
                children:Q.jsxs(Yot,{
                  children:[Q.jsx(Xot,{
                    asChild:!0,children:Q.jsx(xtt,{
                      type:"button",variant:"ghost",size:"icon",className:"absolute right-0 top-0 h-full px-3 py-2",
                      onClick:e=>{
                        e.preventDefault(),(()=>{
                          const e=Math.floor(17*Math.random())+16,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                          let n="";
                          for(let i=0;
                          i<e;
                          i++)n+=t.charAt(Math.floor(62*Math.random()));
                          r.setValue("server_token",n)
                        })()
                      },children:Q.jsx(dlt,{
                        className:"h-4 w-4 text-muted-foreground hover:text-foreground"
                      })
                    })
                  }),Q.jsx(Qot,{
                    children:Q.jsx("p",{
                      children:e("server.server_token.generate_tooltip")
                    })
                  })]
                })
              })]
            })
          }),Q.jsx(Xy,{
            children:e("server.server_token.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"server_pull_interval",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_pull_interval.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              type:"number",placeholder:e("server.server_pull_interval.placeholder"),...t,value:t.value||"",
              onChange:e=>{
                const n=e.target.value?Number(e.target.value):null;
                t.onChange(n)
              }
            })
          }),Q.jsx(Xy,{
            children:e("server.server_pull_interval.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"server_push_interval",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_push_interval.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              type:"number",placeholder:e("server.server_push_interval.placeholder"),...t,value:t.value||"",
              onChange:e=>{
                const n=e.target.value?Number(e.target.value):null;
                t.onChange(n)
              }
            })
          }),Q.jsx(Xy,{
            children:e("server.server_push_interval.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"server_ws_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          className:"flex flex-row items-center justify-between rounded-lg border p-4",children:[Q.jsxs("div",
          {
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("server.server_ws_enable.title")
            }),Q.jsx(Xy,{
              children:e("server.server_ws_enable.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value??!1,onCheckedChange:t.onChange
            })
          })]
        })
      }),r.watch("server_ws_enable")&&Q.jsx($y,{
        control:r.control,name:"server_ws_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_ws_url.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:a||e("server.server_ws_url.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("server.server_ws_url.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsxs("div",{
        className:"flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
        children:[Q.jsx(EZt,{
          className:"mt-0.5 h-4 w-4 shrink-0"
        }),Q.jsx("span",{
          children:e("server.server_ws_enable.supported_clients")
        })]
      }),t&&Q.jsx("div",{
        className:"text-sm text-muted-foreground",children:e("server.saving")
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

#### ↳ `u8e` — Input

```js
H.forwardRef(({
  className:e,type:t,...n
},i)=>Q.jsx("input",{
  type:t,className:Im("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  e),ref:i,...n
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
})),EZt=e=>Q.jsx("svg",{
  className:"inline-block",viewBox:"0 0 24 24",width:"1.2em",height:"1.2em",...e,children:Q.jsx("path",
  {
    fill:"currentColor",d:"M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8.01 8.01 0 0 1-8 8m0-8.5a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m0-4a1.25 1.25 0 1 0 1.25 1.25A1.25 1.25 0 0 0 12 7.5"
  })
}),LZt=py({
  server_pull_interval:yy().nullable(),server_push_interval:yy().nullable(),server_token:cy().nullable(),
  device_limit_mode:yy().nullable(),server_ws_enable:uy().nullable(),server_ws_url:cy().nullable()
}),DZt={
  server_pull_interval:0,server_push_interval:0,server_token:"",device_limit_mode:0,server_ws_enable:!1,
  server_ws_url:""
};
function TZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(LZt),defaultValues:DZt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","server"],queryFn:()=>kT.getSettings("server")
  }),{
    data:o
  }=pC({
    queryKey:["settings","site"],queryFn:()=>kT.getSettings("site")
  }),a=o?.data?.site?.site_url||"",{
    mutateAsync:l
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(s?.data.server){
      const e=s.data.server;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),!e.server_ws_url&&a&&r.setValue("server_ws_url",a),i.current=r.getValues()
    }
  },[s,a,r]);
  const c=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await l(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[l]),d=H.useCallback(e=>{
    c(e)
  },[c]);
  H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
    const e=r.watch(e=>{
      d(e)
    });
    return()=>e.unsubscribe()
  },[r,d]);
  return Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"server_token",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_token.title")
          }),Q.jsx(Yy,{
            children:Q.jsxs("div",{
              className:"relative",children:[Q.jsx(u8e,{
                placeholder:e("server.server_token.placeholder"),...t,value:t.value||"",className:"pr-10"
              }),Q.jsx(Zot,{
                children:Q.jsxs(Yot,{
                  children:[Q.jsx(Xot,{
                    asChild:!0,children:Q.jsx(xtt,{
                      type:"button",variant:"ghost",size:"icon",className:"absolute right-0 top-0 h-full px-3 py-2",
                      onClick:e=>{
                        e.preventDefault(),(()=>{
                          const e=Math.floor(17*Math.random())+16,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                          let n="";
                          for(let i=0;
                          i<e;
                          i++)n+=t.charAt(Math.floor(62*Math.random()));
                          r.setValue("server_token",n)
                        })()
                      },children:Q.jsx(dlt,{
                        className:"h-4 w-4 text-muted-foreground hover:text-foreground"
                      })
                    })
                  }),Q.jsx(Qot,{
                    children:Q.jsx("p",{
                      children:e("server.server_token.generate_tooltip")
                    })
                  })]
                })
              })]
            })
          }),Q.jsx(Xy,{
            children:e("server.server_token.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"server_pull_interval",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_pull_interval.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              type:"number",placeholder:e("server.server_pull_interval.placeholder"),...t,value:t.value||"",
              onChange:e=>{
                const n=e.target.value?Number(e.target.value):null;
                t.onChange(n)
              }
            })
          }),Q.jsx(Xy,{
            children:e("server.server_pull_interval.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"server_push_interval",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("server.server_push_interval.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              type:"number",placeholder:e("server.server_push_interval.placeholder"),...t,value:t.value||"",
              onChange:e=>{
                const n=e.target.value?Number(e.target.value):null;
                t.onChange(n)
              }
            })
          })
```
