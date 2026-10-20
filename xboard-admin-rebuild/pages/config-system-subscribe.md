# `/config/system/subscribe`

- **页面组件**：`vZt`（offset 5781886，413B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`subscribe.description`, `subscribe.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `_Zt`（5923B）
- `$f`（218B）

## 源码（去最小化）

### `_Zt`

```js
function _Zt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(mZt),defaultValues:fZt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","subscribe"],queryFn:()=>kT.getSettings("subscribe")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(s?.data?.subscribe){
      const e=s?.data?.subscribe;
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
        control:r.control,name:"plan_change_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.plan_change_enable.title")
          }),Q.jsx(Xy,{
            children:e("subscribe.plan_change_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),l(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"reset_traffic_method",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.reset_traffic_method.title")
          }),Q.jsxs(yzt,{
            onValueChange:t.onChange,value:t.value?.toString()||"0",children:[Q.jsx(Yy,{
              children:Q.jsx(Czt,{
                children:Q.jsx(wzt,{
                  placeholder:"请选择重置方式"
                })
              })
            }),Q.jsxs(Nzt,{
              children:[Q.jsx(Lzt,{
                value:"0",children:e("subscribe.reset_traffic_method.options.monthly_first")
              }),Q.jsx(Lzt,{
                value:"1",children:e("subscribe.reset_traffic_method.options.monthly_reset")
              }),Q.jsx(Lzt,{
                value:"2",children:e("subscribe.reset_traffic_method.options.no_reset")
              }),Q.jsx(Lzt,{
                value:"3",children:e("subscribe.reset_traffic_method.options.yearly_first")
              }),Q.jsx(Lzt,{
                value:"4",children:e("subscribe.reset_traffic_method.options.yearly_reset")
              })]
            })]
          }),Q.jsx(Xy,{
            children:e("subscribe.reset_traffic_method.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"surplus_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.surplus_enable.title")
          }),Q.jsx(Xy,{
            children:e("subscribe.surplus_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),l(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"new_order_event_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.new_order_event.title")
          }),Q.jsx("div",{
            className:"relative w-max",children:Q.jsx(Yy,{
              children:Q.jsxs(yzt,{
                onValueChange:t.onChange,value:t.value?.toString(),children:[Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:"请选择"
                  })
                }),Q.jsxs(Nzt,{
                  children:[Q.jsx(Lzt,{
                    value:"0",children:e("subscribe.new_order_event.options.no_action")
                  }),Q.jsx(Lzt,{
                    value:"1",children:e("subscribe.new_order_event.options.reset_traffic")
                  })]
                })]
              })
            })
          }),Q.jsx(Xy,{
            children:e("subscribe.new_order_event.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"renew_order_event_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.renew_order_event.title")
          }),Q.jsx("div",{
            className:"relative w-max",children:Q.jsx(Yy,{
              children:Q.jsxs(yzt,{
                onValueChange:t.onChange,value:t.value?.toString(),children:[Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:"请选择"
                  })
                }),Q.jsxs(Nzt,{
                  children:[Q.jsx(Lzt,{
                    value:"0",children:e("subscribe.renew_order_event.options.no_action")
                  }),Q.jsx(Lzt,{
                    value:"1",children:e("subscribe.renew_order_event.options.reset_traffic")
                  })]
                })]
              })
            })
          }),Q.jsx(Xy,{
            children:e("subscribe.renew_order_event.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"change_order_event_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.change_order_event.title")
          }),Q.jsx("div",{
            className:"relative w-max",children:Q.jsx(Yy,{
              children:Q.jsxs(yzt,{
                onValueChange:t.onChange,value:t.value?.toString(),children:[Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:"请选择"
                  })
                }),Q.jsxs(Nzt,{
                  children:[Q.jsx(Lzt,{
                    value:"0",children:e("subscribe.change_order_event.options.no_action")
                  }),Q.jsx(Lzt,{
                    value:"1",children:e("subscribe.change_order_event.options.reset_traffic")
                  })]
                })]
              })
            })
          }),Q.jsx(Xy,{
            children:e("subscribe.change_order_event.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"subscribe_path",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.subscribe_path.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:"subscribe",...t,value:t.value||"",onChange:e=>{
            
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
ult_remind_expire:!1,default_remind_traffic:!1,subscribe_path:"s"
};
function _Zt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),i=H.useRef(null),r=Nv({
    resolver:Mv(mZt),defaultValues:fZt,mode:"onBlur"
  }),{
    data:s
  }=pC({
    queryKey:["settings","subscribe"],queryFn:()=>kT.getSettings("subscribe")
  }),{
    mutateAsync:o
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(s?.data?.subscribe){
      const e=s?.data?.subscribe;
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
        control:r.control,name:"plan_change_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.plan_change_enable.title")
          }),Q.jsx(Xy,{
            children:e("subscribe.plan_change_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),l(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"reset_traffic_method",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.reset_traffic_method.title")
          }),Q.jsxs(yzt,{
            onValueChange:t.onChange,value:t.value?.toString()||"0",children:[Q.jsx(Yy,{
              children:Q.jsx(Czt,{
                children:Q.jsx(wzt,{
                  placeholder:"请选择重置方式"
                })
              })
            }),Q.jsxs(Nzt,{
              children:[Q.jsx(Lzt,{
                value:"0",children:e("subscribe.reset_traffic_method.options.monthly_first")
              }),Q.jsx(Lzt,{
                value:"1",children:e("subscribe.reset_traffic_method.options.monthly_reset")
              }),Q.jsx(Lzt,{
                value:"2",children:e("subscribe.reset_traffic_method.options.no_reset")
              }),Q.jsx(Lzt,{
                value:"3",children:e("subscribe.reset_traffic_method.options.yearly_first")
              }),Q.jsx(Lzt,{
                value:"4",children:e("subscribe.reset_traffic_method.options.yearly_reset")
              })]
            })]
          }),Q.jsx(Xy,{
            children:e("subscribe.reset_traffic_method.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"surplus_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.surplus_enable.title")
          }),Q.jsx(Xy,{
            children:e("subscribe.surplus_enable.description")
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),l(r.getValues())
              }
            })
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"new_order_event_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.new_order_event.title")
          }),Q.jsx("div",{
            className:"relative w-max",children:Q.jsx(Yy,{
              children:Q.jsxs(yzt,{
                onValueChange:t.onChange,value:t.value?.toString(),children:[Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:"请选择"
                  })
                }),Q.jsxs(Nzt,{
                  children:[Q.jsx(Lzt,{
                    value:"0",children:e("subscribe.new_order_event.options.no_action")
                  }),Q.jsx(Lzt,{
                    value:"1",children:e("subscribe.new_order_event.options.reset_traffic")
                  })]
                })]
              })
            })
          }),Q.jsx(Xy,{
            children:e("subscribe.new_order_event.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:r.control,name:"renew_order_event_id",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("subscribe.renew_order_event.title")
          }),Q.jsx("div",{
            className:"relative w-max",children:Q.jsx(Yy,{
              children:Q.jsxs(yzt,{
                onValueChange:t.onChange,value:t.
```
