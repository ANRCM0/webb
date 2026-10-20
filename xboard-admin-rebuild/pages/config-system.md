# `/config/system/`

- **页面组件**：`dZt`（offset 5761946，403B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`site.description`, `site.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `cZt`（6409B）
- `$f`（218B）

## 源码（去最小化）

### `cZt`

```js
function cZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),{
    data:r
  }=pC({
    queryKey:["settings","site"],queryFn:()=>kT.getSettings("site")
  }),{
    data:s
  }=pC({
    queryKey:["plans"],queryFn:()=>RD()
  }),o=Nv({
    resolver:Mv(lZt),defaultValues:{
    },mode:"onBlur"
  }),{
    mutateAsync:a
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(r?.data?.site){
      const e=r?.data?.site;
      Object.entries(e).forEach(([e,t])=>{
        o.setValue(e,t)
      }),i.current=e
    }
  },[r,o]);
  const l=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,i.current)){
      n(!0);
      try{
        const t=Object.entries(e).reduce((e,[t,n])=>(e[t]=null===n?"":n,e),{
        });
        await a(t),i.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[a]),c=H.useCallback(e=>{
    l(e)
  },[l]);
  return H.useEffect(()=>()=>l.cancel(),[l]),H.useEffect(()=>{
    const e=o.watch(e=>{
      c(e)
    });
    return()=>e.unsubscribe()
  },[o,c]),Q.jsx(zy,{
    ...o,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:o.control,name:"app_name",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.siteName.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("site.form.siteName.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.siteName.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"app_description",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.siteDescription.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("site.form.siteDescription.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.siteDescription.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"app_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.siteUrl.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("site.form.siteUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.siteUrl.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"force_https",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("site.form.forceHttps.label")
            }),Q.jsx(Xy,{
              children:e("site.form.forceHttps.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:Boolean(t.value),onCheckedChange:e=>{
                t.onChange(Number(e)),c(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"logo",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.logo.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("site.form.logo.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.logo.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"subscribe_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.subscribeUrl.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(aZt,{
              placeholder:e("site.form.subscribeUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.subscribeUrl.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"tos_url",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.tosUrl.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("site.form.tosUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),c(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("site.form.tosUrl.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"stop_register",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("site.form.stopRegister.label")
            }),Q.jsx(Xy,{
              children:e("site.form.stopRegister.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:Boolean(t.value),onCheckedChange:e=>{
                t.onChange(Number(e)),c(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"ticket_must_wait_reply",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("site.form.ticketMustWaitReply.label")
            }),Q.jsx(Xy,{
              children:e("site.form.ticketMustWaitReply.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:Boolean(t.value),onCheckedChange:e=>{
                t.onChange(Number(e)),c(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"try_out_plan_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.tryOut.label")
          }),Q.jsx(Yy,{
            children:Q.jsxs(yzt,{
              value:t.value?.toString(),onValueChange:e=>{
                t.onChange(Number(e)),c(o.getValues())
              },children:[Q.jsx
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

#### ↳ `wzt`

```js
xHt,Czt=H.forwardRef(({
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
ta?.site;
Object.entries(e).forEach(([e,t])=>{
  o.setValue(e,t)
}),i.current=e
}
},[r,o]);
const l=H.useMemo(()=>FT.debounce(async e=>{
  if(!FT.isEqual(e,i.current)){
    n(!0);
    try{
      const t=Object.entries(e).reduce((e,[t,n])=>(e[t]=null===n?"":n,e),{
      });
      await a(t),i.current=e
    }finally{
      n(!1)
    }
  }
},1e3),[a]),c=H.useCallback(e=>{
  l(e)
},[l]);
return H.useEffect(()=>()=>l.cancel(),[l]),H.useEffect(()=>{
  const e=o.watch(e=>{
    c(e)
  });
  return()=>e.unsubscribe()
},[o,c]),Q.jsx(zy,{
  ...o,children:Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsx($y,{
      control:o.control,name:"app_name",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.siteName.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("site.form.siteName.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.siteName.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"app_description",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.siteDescription.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("site.form.siteDescription.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.siteDescription.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"app_url",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.siteUrl.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("site.form.siteUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.siteUrl.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"force_https",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.forceHttps.label")
          }),Q.jsx(Xy,{
            children:e("site.form.forceHttps.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:Boolean(t.value),onCheckedChange:e=>{
              t.onChange(Number(e)),c(o.getValues())
            }
          })
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"logo",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.logo.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("site.form.logo.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.logo.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"subscribe_url",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.subscribeUrl.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(aZt,{
            placeholder:e("site.form.subscribeUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.subscribeUrl.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"tos_url",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("site.form.tosUrl.label")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("site.form.tosUrl.placeholder"),...t,value:t.value||"",onChange:e=>{
              t.onChange(e),c(o.getValues())
            }
          })
        }),Q.jsx(Xy,{
          children:e("site.form.tosUrl.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"stop_register",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("site.form.stopRegister.label")
          }),Q.jsx(Xy,{
            children:e("site.form.stopRegister.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:Boolean(t.value),onCheckedChange:e=>{
              t.onChange(Number(e
```
