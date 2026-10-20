# `/config/system/APP`

- **页面组件**：`DYt`（offset 5827105，401B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`app.description`, `app.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `LYt`（2913B）
- `$f`（218B）

## 源码（去最小化）

### `LYt`

```js
function LYt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(NYt),defaultValues:EYt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","app"],queryFn:()=>kT.getSettings("app")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("app.save_success"))
    }
  });
  H.useEffect(()=>{
    if(s?.data.app){
      const e=s.data.app;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),i.current=e
    }
  },[s,r]);
  const a=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await o(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[o]),l=H.useCallback(e=>{
    a(e)
  },[a]);
  return H.useEffect(()=>()=>a.cancel(),[a]),H.useEffect(()=>{
    const e=r.watch(e=>{
      l(e)
    });
    return()=>e.unsubscribe()
  },[r,l]),Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"windows_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.windows.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.windows.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"windows_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.windows.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.windows.download.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"macos_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.macos.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.macos.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"macos_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.macos.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.macos.download.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"android_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.android.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.android.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"android_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.android.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.android.download.description")
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

#### ↳ `Zy` — FormLabel

```js
H.forwardRef(({
  className:e,...t
},n)=>{
  const{
    error:i,formItemId:r
  }=qy();
  return Q.jsx(Hy,{
    ref:n,className:Im(i&&"text-destructive",e),htmlFor:r,...t
  })
})
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
})),NYt=py({
  windows_version:cy().nullable(),windows_download_url:cy().nullable(),macos_version:cy().nullable(),
  macos_download_url:cy().nullable(),android_version:cy().nullable(),android_download_url:cy().nullable()
}),EYt={
  windows_version:"",windows_download_url:"",macos_version:"",macos_download_url:"",android_version:"",
  android_download_url:""
};
function LYt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(NYt),defaultValues:EYt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","app"],queryFn:()=>kT.getSettings("app")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("app.save_success"))
    }
  });
  H.useEffect(()=>{
    if(s?.data.app){
      const e=s.data.app;
      Object.entries(e).forEach(([e,t])=>{
        r.setValue(e,t)
      }),i.current=e
    }
  },[s,r]);
  const a=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        await o(e),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[o]),l=H.useCallback(e=>{
    a(e)
  },[a]);
  return H.useEffect(()=>()=>a.cancel(),[a]),H.useEffect(()=>{
    const e=r.watch(e=>{
      l(e)
    });
    return()=>e.unsubscribe()
  },[r,l]),Q.jsx(zy,{
    ...r,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:r.control,name:"windows_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.windows.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.windows.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"windows_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.windows.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.windows.download.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"macos_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.macos.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.macos.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"macos_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.macos.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.macos.download.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"android_version",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.android.version.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.android.version.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"android_download_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("app.android.download.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("common.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("app.android.download.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),t&&Q.jsx("div",{
        className:"text-sm text-muted-foreground",children:e("common.saving")
      })]
    })
  })
}const DYt=
```
