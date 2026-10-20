# `/config/system/invite`

- **页面组件**：`wZt`（offset 5789652，407B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`invite.description`, `invite.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `xZt`（6394B）
- `$f`（218B）

## 源码（去最小化）

### `xZt`

```js
function xZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),[i,r]=H.useState(!1),s=H.useRef(null),o=Nv({
    resolver:Mv(bZt),defaultValues:yZt,mode:"onBlur"
  }),{
    data:a
  }=pC({
    queryKey:["settings","invite"],queryFn:()=>kT.getSettings("invite")
  }),{
    mutateAsync:l
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(a?.data?.invite){
      const e=a?.data?.invite,t={
      };
      Object.entries(e).forEach(([e,n])=>{
        if("number"==typeof n){
          const i=String(n);
          o.setValue(e,i),t[e]=i
        }else o.setValue(e,n),t[e]=n
      }),s.current=t,r(!0)
    }
  },[a,o]);
  const c=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,s.current)){
      n(!0);
      try{
        await l(e),s.current=e
      }finally{
        n(!1)
      }
    }
  },1e3),[l]),d=H.useCallback(e=>{
    i&&c(e)
  },[c,i]);
  return H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
    if(!i)return;
    const e=o.watch(e=>{
      d(e)
    });
    return()=>e.unsubscribe()
  },[o,d,i]),Q.jsx(zy,{
    ...o,children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsx($y,{
        control:o.control,name:"invite_force",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.invite_force.title")
            }),Q.jsx(Xy,{
              children:e("invite.invite_force.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"invite_commission",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.invite_commission.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("invite.invite_commission.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("invite.invite_commission.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"invite_gen_limit",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.invite_gen_limit.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("invite.invite_gen_limit.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("invite.invite_gen_limit.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"invite_never_expire",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.invite_never_expire.title")
            }),Q.jsx(Xy,{
              children:e("invite.invite_never_expire.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"commission_first_time_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.commission_first_time.title")
            }),Q.jsx(Xy,{
              children:e("invite.commission_first_time.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"commission_auto_check_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.commission_auto_check.title")
            }),Q.jsx(Xy,{
              children:e("invite.commission_auto_check.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"commission_withdraw_limit",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.commission_withdraw_limit.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("invite.commission_withdraw_limit.placeholder"),...t,value:t.value||""
            })
          }),Q.jsx(Xy,{
            children:e("invite.commission_withdraw_limit.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"commission_withdraw_method",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.commission_withdraw_method.title")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("invite.commission_withdraw_method.placeholder"),...t,value:Array.isArray(t.value)?t.value.join(","):"",
              onChange:e=>{
                const n=e.target.value.split(",").filter(Boolean);
                t.onChange(n),d(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("invite.commission_withdraw_method.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"withdraw_close_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.withdraw_close.title")
            }),Q.jsx(Xy,{
              children:e("invite.withdraw_close.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"commission_distribution_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("invite.commission_distribution.title")
        
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
te,t={
};
Object.entries(e).forEach(([e,n])=>{
  if("number"==typeof n){
    const i=String(n);
    o.setValue(e,i),t[e]=i
  }else o.setValue(e,n),t[e]=n
}),s.current=t,r(!0)
}
},[a,o]);
const c=H.useMemo(()=>FT.debounce(async e=>{
  if(!FT.isEqual(e,s.current)){
    n(!0);
    try{
      await l(e),s.current=e
    }finally{
      n(!1)
    }
  }
},1e3),[l]),d=H.useCallback(e=>{
  i&&c(e)
},[c,i]);
return H.useEffect(()=>()=>c.cancel(),[c]),H.useEffect(()=>{
  if(!i)return;
  const e=o.watch(e=>{
    d(e)
  });
  return()=>e.unsubscribe()
},[o,d,i]),Q.jsx(zy,{
  ...o,children:Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsx($y,{
      control:o.control,name:"invite_force",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.invite_force.title")
          }),Q.jsx(Xy,{
            children:e("invite.invite_force.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:t.value,onCheckedChange:e=>{
              t.onChange(e),d(o.getValues())
            }
          })
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"invite_commission",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("invite.invite_commission.title")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("invite.invite_commission.placeholder"),...t,value:t.value||""
          })
        }),Q.jsx(Xy,{
          children:e("invite.invite_commission.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"invite_gen_limit",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("invite.invite_gen_limit.title")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("invite.invite_gen_limit.placeholder"),...t,value:t.value||""
          })
        }),Q.jsx(Xy,{
          children:e("invite.invite_gen_limit.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"invite_never_expire",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.invite_never_expire.title")
          }),Q.jsx(Xy,{
            children:e("invite.invite_never_expire.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:t.value,onCheckedChange:e=>{
              t.onChange(e),d(o.getValues())
            }
          })
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"commission_first_time_enable",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.commission_first_time.title")
          }),Q.jsx(Xy,{
            children:e("invite.commission_first_time.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:t.value,onCheckedChange:e=>{
              t.onChange(e),d(o.getValues())
            }
          })
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"commission_auto_check_enable",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsxs("div",{
          className:"space-y-0.5",children:[Q.jsx(Zy,{
            className:"text-base",children:e("invite.commission_auto_check.title")
          }),Q.jsx(Xy,{
            children:e("invite.commission_auto_check.description")
          })]
        }),Q.jsx(Yy,{
          children:Q.jsx(oZt,{
            checked:t.value,onCheckedChange:e=>{
              t.onChange(e),d(o.getValues())
            }
          })
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"commission_withdraw_limit",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("invite.commission_withdraw_limit.title")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("invite.commission_withdraw_limit.placeholder"),...t,value:t.value||""
          })
        }),Q.jsx(Xy,{
          children:e("invite.commission_withdraw_limit.description")
        }),Q.jsx(Qy,{
        })]
      })
    }),Q.jsx($y,{
      control:o.control,name:"commission_withdraw_method",render:({
        field:t
      })=>Q.jsxs(Gy,{
        children:[Q.jsx(Zy,{
          className:"text-base",children:e("invite.commission_withdraw_method.title")
        }),Q.jsx(Yy,{
          children:Q.jsx(u8e,{
            placeholder:e("invite.commission_withdraw_method.placeholder"),...t,value:Array.isArray(t.value)?t.value.join(","):"",
            onChange:e=>{
              const n=e.target.value.split(",").f
```
