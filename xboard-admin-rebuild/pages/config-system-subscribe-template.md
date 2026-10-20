# `/config/system/subscribe-template`

- **页面组件**：`WQe`（offset 4400706，336B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`subscribe_template.description`, `subscribe_template.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `VQe`（2177B）
- `$f`（218B）

## 源码（去最小化）

### `VQe`

```js
function VQe(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),[r,s]=H.useState("singbox"),o=Nv({
    resolver:Mv(jQe),defaultValues:BQe,mode:"onChange"
  }),{
    data:a,isLoading:l
  }=pC({
    queryKey:["settings","client"],queryFn:()=>kT.getSettings("subscribe_template")
  }),{
    mutateAsync:c
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:()=>{
      gE.success(e("common.autoSaved"))
    },onError:t=>{
      gE.error(e("common.saveFailed"))
    }
  });
  H.useEffect(()=>{
    if(a?.data?.subscribe_template){
      const e=a.data.subscribe_template;
      Object.entries(e).forEach(([e,t])=>{
        if(e in BQe){
          const n="string"==typeof t?t:"";
          o.setValue(e,n)
        }
      }),i.current=o.getValues()
    }
  },[a,o]);
  const d=H.useMemo(()=>FT.debounce(async e=>{
    if(!i.current||!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await c(e),i.current=e
      }catch(K0t){
      }finally{
        n(!1)
      }
    }
  },1500),[c]);
  H.useEffect(()=>()=>d.cancel(),[d]);
  const u=H.useCallback(()=>{
    const e=o.getValues();
    d(e)
  },[o,d]),h=H.useCallback((t,n)=>Q.jsx($y,{
    control:o.control,name:t,render:({
      field:i
    })=>Q.jsxs(Gy,{
      children:[Q.jsx(Zy,{
        className:"text-base",children:e(`subscribe_template.${t.replace("subscribe_template_","")}.title`)
      }),Q.jsx(Yy,{
        children:Q.jsx(RI,{
          height:"500px",defaultLanguage:n,value:i.value||"",onChange:e=>{
            i.onChange(e||""),u()
          },options:{
            minimap:{
              enabled:!1
            },fontSize:14,wordWrap:"on",scrollBeyondLastLine:!1,automaticLayout:!0
          }
        })
      }),Q.jsx(Xy,{
        children:e(`subscribe_template.${t.replace("subscribe_template_","")}.description`)
      }),Q.jsx(Qy,{
      })]
    })
  }),[o.control,e,u]);
  return l?Q.jsx("div",{
    className:"flex items-center justify-center h-64",children:Q.jsx("div",{
      className:"text-sm text-muted-foreground",children:e("common.loading")
    })
  }):Q.jsx(zy,{
    ...o,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsxs(rw,{
        value:r,onValueChange:s,className:"w-full",children:[Q.jsx(sw,{
          className:"",children:FQe.map(({
            key:e,label:t
          })=>Q.jsx(ow,{
            value:e,className:"text-xs",children:t
          },e))
        }),FQe.map(({
          key:e,language:t
        })=>Q.jsx(aw,{
          value:e,className:"mt-4",children:h(`subscribe_template_${e}`,t)
        },e))]
      }),t&&Q.jsxs("div",{
        className:"flex items-center gap-2 text-sm text-muted-foreground",children:[Q.jsx("div",{
          className:"h-2 w-2 animate-pulse rounded-full bg-blue-500"
        }),e("common.saving")]
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

#### ↳ `rw`

```js
qx,sw=H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(tw,{
  ref:n,className:Im("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  e),...t
}))
```

#### ↳ `ow`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(nw,{
  ref:n,className:Im("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
  e),...t
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
}));
fI.config({
  monaco:PQe
});
const jQe=py({
  subscribe_template_singbox:cy().optional().default(""),subscribe_template_clash:cy().optional().default(""),
  subscribe_template_clashmeta:cy().optional().default(""),subscribe_template_stash:cy().optional().default(""),
  subscribe_template_surge:cy().optional().default(""),subscribe_template_surfboard:cy().optional().default("")
}),FQe=[{
  key:"singbox",label:"Sing-box",language:"json"
},{
  key:"clash",label:"Clash",language:"yaml"
},{
  key:"clashmeta",label:"Clash Meta",language:"yaml"
},{
  key:"stash",label:"Stash",language:"yaml"
},{
  key:"surge",label:"Surge",language:"ini"
},{
  key:"surfboard",label:"Surfboard",language:"ini"
}],BQe={
  subscribe_template_singbox:"",subscribe_template_clash:"",subscribe_template_clashmeta:"",subscribe_template_stash:"",
  subscribe_template_surge:"",subscribe_template_surfboard:""
};
function VQe(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),[r,s]=H.useState("singbox"),o=Nv({
    resolver:Mv(jQe),defaultValues:BQe,mode:"onChange"
  }),{
    data:a,isLoading:l
  }=pC({
    queryKey:["settings","client"],queryFn:()=>kT.getSettings("subscribe_template")
  }),{
    mutateAsync:c
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:()=>{
      gE.success(e("common.autoSaved"))
    },onError:t=>{
      gE.error(e("common.saveFailed"))
    }
  });
  H.useEffect(()=>{
    if(a?.data?.subscribe_template){
      const e=a.data.subscribe_template;
      Object.entries(e).forEach(([e,t])=>{
        if(e in BQe){
          const n="string"==typeof t?t:"";
          o.setValue(e,n)
        }
      }),i.current=o.getValues()
    }
  },[a,o]);
  const d=H.useMemo(()=>FT.debounce(async e=>{
    if(!i.current||!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await c(e),i.current=e
      }catch(K0t){
      }finally{
        n(!1)
      }
    }
  },1500),[c]);
  H.useEffect(()=>()=>d.cancel(),[d]);
  const u=H.useCallback(()=>{
    const e=o.getValues();
    d(e)
  },[o,d]),h=H.useCallback((t,n)=>Q.jsx($y,{
    control:o.control,name:t,render:({
      field:i
    })=>Q.jsxs(Gy,{
      children:[Q.jsx(Zy,{
        className:"text-base",children:e(`subscribe_template.${t.replace("subscribe_template_","")}.title`)
      }),Q.jsx(Yy,{
        children:Q.jsx(RI,{
          height:"500px",defaultLanguage:n,value:i.value||"",onChange:e=>{
            i.onChange(e||""),u()
          },options:{
            minimap:{
              enabled:!1
            },fontSize:14,wordWrap:"on",scrollBeyondLastLine:!1,automaticLayout:!0
          }
        })
      }),Q.jsx(Xy,{
        children:e(`subscribe_template.${t.replace("subscribe_template_","")}.description`)
      }),Q.jsx(Qy,{
      })]
    })
  }),[o.control,e,u]);
  return l?Q.jsx("div",{
    className:"flex items-center justify-center h-64",children:Q.jsx("div",{
      className:"text-sm text-muted-foreground",children:e("common.loading")
    })
  }):Q.jsx(zy,{
    ...o,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsxs(rw,{
        value:r,onValueChange:s,className:"w-full",children:[Q.jsx(sw,{
          className:"",children:FQe.map(({
            key:e,label:t
          })=>Q.jsx(ow,{
            value:e,className:"text-xs",children:t
          },e))
        }),FQe.map(({
          key:e,language:t
        })=>Q.jsx(aw,{
          value:e,className:"mt-4",children:h(`subscribe_template_${e}`,t)
        },e))]
      }),t&&Q.jsxs("div",{
        className:"flex items-center gap-2 text-sm text-muted-foreground",children:[Q.jsx("div",{
          className:"h-2 w-2 animate-pulse rounded-full bg-blue-500"
        }),e("common.saving")]
      })]
    })
  })
}
```
