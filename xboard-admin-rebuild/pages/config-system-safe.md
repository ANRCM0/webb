# `/config/system/safe`

- **页面组件**：`pZt`（offset 5774728，403B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`safe.description`, `safe.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `gZt`（10936B）
- `$f`（218B）

## 源码（去最小化）

### `gZt`

```js
function gZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(!1),[i,r]=H.useState(!1),s=H.useRef(null),o=Nv({
    resolver:Mv(uZt),defaultValues:hZt,mode:"onBlur"
  }),{
    data:a
  }=pC({
    queryKey:["settings","safe"],queryFn:()=>kT.getSettings("safe")
  }),{
    mutateAsync:l
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  });
  H.useEffect(()=>{
    if(a?.data.safe){
      const e=a.data.safe,t={
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
        const t={
          ...e,email_whitelist_suffix:e.email_whitelist_suffix?.filter(Boolean)||[]
        };
        await l(t),s.current=e
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
        control:o.control,name:"email_verify",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.emailVerify.label")
            }),Q.jsx(Xy,{
              children:e("safe.form.emailVerify.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"email_gmail_limit_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.gmailLimit.label")
            }),Q.jsx(Xy,{
              children:e("safe.form.gmailLimit.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"safe_mode_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.safeMode.label")
            }),Q.jsx(Xy,{
              children:e("safe.form.safeMode.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"secure_path",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("safe.form.securePath.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:e("safe.form.securePath.placeholder"),...t,value:t.value||"",onChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("safe.form.securePath.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"email_whitelist_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.emailWhitelist.label")
            }),Q.jsx(Xy,{
              children:e("safe.form.emailWhitelist.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),o.watch("email_whitelist_enable")&&Q.jsx($y,{
        control:o.control,name:"email_whitelist_suffix",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            className:"text-base",children:e("safe.form.emailWhitelist.suffixes.label")
          }),Q.jsx(Yy,{
            children:Q.jsx(aZt,{
              placeholder:e("safe.form.emailWhitelist.suffixes.placeholder"),...t,value:(t.value||[]).join("\n"),
              onChange:e=>{
                const n=e.target.value.split("\n").filter(Boolean);
                t.onChange(n),d(o.getValues())
              }
            })
          }),Q.jsx(Xy,{
            children:e("safe.form.emailWhitelist.suffixes.description")
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:o.control,name:"captcha_enable",render:({
          field:t
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.captcha.enable.label")
            }),Q.jsx(Xy,{
              children:e("safe.form.captcha.enable.description")
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:t.value||!1,onCheckedChange:e=>{
                t.onChange(e),d(o.getValues())
              }
            })
          })]
        })
      }),o.watch("captcha_enable")&&Q.jsxs(Q.Fragment,{
        children:[Q.jsx($y,{
          control:o.control,name:"captcha_type",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("safe.form.captcha.type.label")
            }),Q.jsxs(yzt,{
              onValueChange:e=>{
                t.onChange(e),d(o.getValues())
              },value:t.value||"recaptcha",children:[Q.jsx(Yy,{
                children:Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:e("safe.form.captcha.type.description")
                  })
                })
              }),Q.jsxs(Nzt,{
                children:[Q.jsx(Lzt,{
                  value:"recaptcha",children:e("safe.form.captcha.type.options.recaptcha")
                }),Q.jsx(Lzt,{
                  value:"recaptcha-v3",children:e("safe.form.captcha.type.options.recaptcha-v3")
                }),Q.jsx(Lzt,{
                  value:"turnstile",children:e("safe.form.captcha.type.options.turnstile")
                })]
              })]
            }),Q.jsx(Xy,{
              children:e("safe.form.captcha.type.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),"recaptc
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
ptcha.siteKey.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.recaptcha.siteKey.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.recaptcha.siteKey.description")}),Q.jsx(Qy,{})]})}),Q.jsx($y,{control:o.control,name:"recaptcha_key",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.recaptcha.key.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.recaptcha.key.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.recaptcha.key.description")}),Q.jsx(Qy,{})]})})]}),"recaptcha-v3"===o.watch("captcha_type")&&Q.jsxs(Q.Fragment,{children:[Q.jsx($y,{control:o.control,name:"recaptcha_v3_site_key",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.recaptcha_v3.siteKey.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.recaptcha_v3.siteKey.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.recaptcha_v3.siteKey.description")}),Q.jsx(Qy,{})]})}),Q.jsx($y,{control:o.control,name:"recaptcha_v3_secret_key",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.recaptcha_v3.secretKey.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.recaptcha_v3.secretKey.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.recaptcha_v3.secretKey.description")}),Q.jsx(Qy,{})]})}),Q.jsx($y,{control:o.control,name:"recaptcha_v3_score_threshold",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.recaptcha_v3.scoreThreshold.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{type:"number",step:"0.1",min:"0",max:"1",placeholder:e("safe.form.captcha.recaptcha_v3.scoreThreshold.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.recaptcha_v3.scoreThreshold.description")}),Q.jsx(Qy,{})]})})]}),"turnstile"===o.watch("captcha_type")&&Q.jsxs(Q.Fragment,{children:[Q.jsx($y,{control:o.control,name:"turnstile_site_key",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.turnstile.siteKey.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.turnstile.siteKey.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.turnstile.siteKey.description")}),Q.jsx(Qy,{})]})}),Q.jsx($y,{control:o.control,name:"turnstile_secret_key",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.captcha.turnstile.secretKey.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.captcha.turnstile.secretKey.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.captcha.turnstile.secretKey.description")}),Q.jsx(Qy,{})]})})]})]}),Q.jsx($y,{control:o.control,name:"register_limit_by_ip_enable",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsxs("div",{className:"space-y-0.5",children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.registerLimit.enable.label")}),Q.jsx(Xy,{children:e("safe.form.registerLimit.enable.description")})]}),Q.jsx(Yy,{children:Q.jsx(oZt,{checked:t.value||!1,onCheckedChange:e=>{t.onChange(e),d(o.getValues())}})})]})}),o.watch("register_limit_by_ip_enable")&&Q.jsxs(Q.Fragment,{children:[Q.jsx($y,{control:o.control,name:"register_limit_count",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.registerLimit.count.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.registerLimit.count.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.registerLimit.count.description")}),Q.jsx(Qy,{})]})}),Q.jsx($y,{control:o.control,name:"register_limit_expire",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.registerLimit.expire.label")}),Q.jsx(Yy,{children:Q.jsx(u8e,{placeholder:e("safe.form.registerLimit.expire.placeholder"),...t,value:t.value||"",onChange:e=>{t.onChange(e),d(o.getValues())}})}),Q.jsx(Xy,{children:e("safe.form.registerLimit.expire.description")}),Q.jsx(Qy,{})]})})]}),Q.jsx($y,{control:o.control,name:"password_limit_enable",render:({field:t})=>Q.jsxs(Gy,{children:[Q.jsxs("div",{className:"space-y-0.5",children:[Q.jsx(Zy,{className:"text-base",children:e("safe.form.passwordLimit.enable.label")}),Q.jsx(Xy,{children:e("safe.form.passwordLimit.enable.description")})]}),Q.jsx(Yy,{children:Q.jsx(oZt,{checked:t.value||!1,onCheckedChange:e=>{t.onChange(e),d(o.getValues())}})})]})}),o.watch("password_limit_enable")
```
