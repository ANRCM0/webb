# `/config/system/email`

- **页面组件**：`xYt`（offset 5818567，747B）
- **i18n 命名空间**：`settings`
- **直引文案键**：`email.description`, `email.tab_settings`, `email.tab_templates`, `email.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `bYt`（4737B）
- `MZt`（4273B）
- `rw`（174B）
- `ow`（461B）

## 源码（去最小化）

### `bYt`

```js
function bYt(){
  const{
    t:e
  }=jy("settings"),t=lC(),[n,i]=H.useState(""),[r,s]=H.useState({
  }),[o,a]=H.useState(null),[l,c]=H.useState(!1),[d,u]=H.useState(!1),[h,g]=H.useState(!1),[p,m]=H.useState(!1),
  [f,_]=H.useState(!1),[v,b]=H.useState(""),y=H.useRef(new Set),x=H.useRef(null),{
    data:w,isLoading:C
  }=pC({
    queryKey:["mail-template","list"],queryFn:()=>ST.list()
  }),{
    data:S
  }=pC({
    queryKey:["settings","site"],queryFn:()=>kT.getSettings("site")
  }),k=S?.data?.site?.app_url||"",N=H.useMemo(()=>function(e){
    const t=e||"https://example.com";
    return{
      name:{
        desc:"站点名称",sample:"XBoard"
      },url:{
        desc:"站点网址",sample:t
      },code:{
        desc:"验证码",sample:"123456"
      },content:{
        desc:"通知正文",sample:"这是一封测试通知邮件。"
      },link:{
        desc:"登录链接",sample:`${t}/login?token=test`
      }
    }
  }(k),[k]),E=w?.data??[];
  H.useEffect(()=>{
    E.length>0&&!n&&i(E[0].name)
  },[E,n]);
  const{
    data:L,isLoading:D
  }=pC({
    queryKey:["mail-template","detail",n],queryFn:()=>ST.get(n),enabled:!!n
  }),T=L?.data;
  H.useEffect(()=>{
    T&&!y.current.has(T.name)&&(y.current.add(T.name),s(e=>({
      ...e,[T.name]:{
        subject:T.subject,content:T.content,dirty:!1
      }
    })))
  },[T]);
  const I=r[n],R=I?.dirty??!1,{
    mutateAsync:O
  }=mC({
    mutationFn:ST.save
  }),{
    mutateAsync:M
  }=mC({
    mutationFn:ST.reset
  }),{
    mutateAsync:A
  }=mC({
    mutationFn:({
      name:e,email:t
    })=>ST.test(e,t)
  }),P=H.useCallback((e,t)=>{
    s(i=>({
      ...i,[n]:{
        ...i[n],[e]:t,dirty:!0
      }
    }))
  },[n]),j=H.useCallback(e=>{
    R?(a(e),c(!0)):i(e)
  },[R]),F=H.useCallback(()=>{
    o&&(y.current.delete(n),s(e=>{
      const t={
        ...e
      };
      return delete t[n],t
    }),i(o),a(null)),c(!1)
  },[o,n]),B=H.useCallback(async()=>{
    if(I&&n){
      g(!0);
      try{
        await O({
          name:n,subject:I.subject,content:I.content
        }),s(e=>({
          ...e,[n]:{
            ...e[n],dirty:!1
          }
        })),t.invalidateQueries({
          queryKey:["mail-template","list"]
        }),t.invalidateQueries({
          queryKey:["mail-template","detail",n]
        }),y.current.delete(n),gE.success(e("email_template.save_success"))
      }catch{
      }finally{
        g(!1)
      }
    }
  },[I,n,O,t,e]),V=H.useCallback(async()=>{
    if(n){
      try{
        await M(n),y.current.delete(n),s(e=>{
          const t={
            ...e
          };
          return delete t[n],t
        }),t.invalidateQueries({
          queryKey:["mail-template","list"]
        }),t.invalidateQueries({
          queryKey:["mail-template","detail",n]
        }),gE.success(e("email_template.reset_success"))
      }catch{
      }u(!1)
    }
  },[n,M,t,e]),W=H.useCallback(async()=>{
    if(n){
      m(!0);
      try{
        await A({
          name:n,email:v||void 0
        }),gE.success(e("email_template.test_success")),_(!1)
      }catch{
      }finally{
        m(!1)
      }
    }
  },[n,A,v,e]),z=H.useCallback(e=>{
    const t=`{{${e}}}`,n=x.current;
    if(n){
      const e=n.getSelection();
      if(e)return n.executeEdits("insert-placeholder",[{
        range:e,text:t,forceMoveMarkers:!0
      }]),n.focus(),void P("content",n.getValue())
    }P("content",(I?.content??"")+t)
  },[I,P]);
  if(C)return Q.jsx("div",{
    className:"flex items-center justify-center h-64",children:Q.jsx("div",{
      className:"text-sm text-muted-foreground",children:e("common.loading")
    })
  });
  const U=E.find(e=>e.name===n);
  return Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsxs(rw,{
      value:n,onValueChange:j,className:"w-full",children:[Q.jsx(sw,{
        children:E.map(t=>Q.jsxs(ow,{
          value:t.name,className:"text-xs gap-1.5",children:[t.label,t.customized&&Q.jsx(nKt,{
            variant:"secondary",className:"text-[10px] px-1 py-0",children:e("email_template.customized")
          })]
        },t.name))
      }),E.map(t=>Q.jsx(aw,{
        value:t.name,className:"mt-4",children:n===t.name&&Q.jsx(yYt,{
          detail:T,draft:I,isLoading:D&&!I,isDirty:R,isSaving:h,isTesting:p,isCustomized:U?.customized??!1,
          editorRef:x,varMeta:N,onSubjectChange:e=>P("subject",e),onContentChange:e=>P("content",e),onSave:B,
          onReset:()=>u(!0),onTest:()=>_(!0),onInsertPlaceholder:z,t:e
        })
      },t.name))]
    }),Q.jsx(lYt,{
      open:l,onOpenChange:c,children:Q.jsxs(hYt,{
        children:[Q.jsxs(gYt,{
          children:[Q.jsx(mYt,{
            children:e("email_template.discard_title")
          }),Q.jsx(fYt,{
            children:e("email_template.discard_description")
          })]
        }),Q.jsxs(pYt,{
          children:[Q.jsx(vYt,{
            onClick:()=>{
              a(null),c(!1)
            },children:e("email_template.cancel")
          }),Q.jsx(_Yt,{
            onClick:F,children:e("email_template.discard_confirm")
          })]
        })]
      })
    }),Q.jsx(lYt,{
      open:d,onOpenChange:u,children:Q.jsxs(hYt,{
        children:[Q.jsxs(gYt,{
          children:[Q.jsx(mYt,{
            children:e("email_template.reset_title")
          }),Q.jsx(fYt,{
            children:e("email_template.reset_description")
          })]
        }),Q.jsxs(pYt,{
          children:[Q.jsx(vYt,{
            children:e("email_template.cancel")
          }),Q.jsx(_Yt,{
            onClick:V,children:e("email_template.reset_confirm")
          })]
        })]
      })
    }),Q.jsx(lYt,{
      open:f,onOpenChange:_,children:Q.jsxs(hYt,{
        children:[Q.jsxs(gYt,{
          children:[Q.jsx(mYt,{
            children:e("email_template.test_dialog_title")
          }),Q.jsx(fYt,{
            children:e("email_template.test_dialog_description")
          })]
        }),Q.jsx("div",{
          className:"py-2",children:Q.jsx(u8e,{
            type:"email",value:v,onChange:e=>b(e.target.value),placeholder:e("email_template.test_email_placeholder")
          })
        }),Q.jsxs(pYt,{
          children:[Q.jsx(vYt,{
            children:e("email_template.cancel")
          }),Q.jsx(_Yt,{
            onClick:W,disabled:p,children:e(p?"email_template.sending":"email_template.send_test")
          })]
        })]
      })
    })]
  })
}
```

#### ↳ `yYt`

```js
function yYt({
  detail:e,draft:t,isLoading:n,isDirty:i,isSaving:r,isTesting:s,isCustomized:o,editorRef:a,varMeta:l,
  onSubjectChange:c,onContentChange:d,onSave:u,onReset:h,onTest:g,onInsertPlaceholder:p,t:m
}
```

#### ↳ `vYt`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(sYt,{
  ref:n,className:Im(ytt({
    variant:"outline"
  }),"mt-2 sm:mt-0",e),...t
}))
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

### `MZt`

```js
function MZt(){
  const{
    t:e
  }=jy("settings"),[t,n]=H.useState(null),[i,r]=H.useState(!1),s=H.useRef(null),[o,a]=H.useState(!1),
  l=Nv({
    resolver:Mv(OZt),defaultValues:{
    },mode:"onBlur"
  }),{
    data:c
  }=pC({
    queryKey:["settings","email"],queryFn:()=>kT.getSettings("email")
  }),{
    mutateAsync:d
  }=mC({
    mutationFn:kT.saveSettings,onSuccess:t=>{
      t.data&&gE.success(e("common.autoSaved"))
    }
  }),{
    mutate:u,isPending:h
  }=mC({
    mutationFn:kT.sendTestMail,onMutate:()=>{
      n(null),r(!1)
    },onSuccess:t=>{
      n(t.data),r(!0),t.data.error?gE.error(e("email.test.error")):gE.success(e("email.test.success"))
    }
  });
  H.useEffect(()=>{
    if(c?.data.email){
      const e=c.data.email;
      Object.entries(e).forEach(([e,t])=>{
        l.setValue(e,t)
      }),s.current=e
    }
  },[c,l]);
  const g=H.useMemo(()=>FT.debounce(async e=>{
    if(!FT.isEqual(e,s.current)){
      a(!0);
      try{
        await d(e),s.current=e
      }finally{
        a(!1)
      }
    }
  },1e3),[d]),p=H.useCallback(e=>{
    g(e)
  },[g]);
  return H.useEffect(()=>()=>g.cancel(),[g]),H.useEffect(()=>{
    const e=l.watch(e=>{
      p(e)
    });
    return()=>e.unsubscribe()
  },[l,p]),Q.jsxs(Q.Fragment,{
    children:[Q.jsx(zy,{
      ...l,children:Q.jsxs("div",{
        className:"space-y-4",children:[Q.jsx($y,{
          control:l.control,name:"email_host",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_host.title")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                placeholder:e("common.placeholder"),...t,value:t.value||""
              })
            }),Q.jsx(Xy,{
              children:e("email.email_host.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"email_port",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_port.title")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                type:"number",placeholder:e("common.placeholder"),...t,value:t.value||"",onChange:e=>{
                  const n=e.target.value?Number(e.target.value):null;
                  t.onChange(n)
                }
              })
            }),Q.jsx(Xy,{
              children:e("email.email_port.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"email_encryption",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_encryption.title")
            }),Q.jsxs(yzt,{
              onValueChange:e=>{
                const n="none"===e?"":e;
                t.onChange(n)
              },value:""===t.value||null===t.value||void 0===t.value?"none":t.value,children:[Q.jsx(Yy,{
                children:Q.jsx(Czt,{
                  children:Q.jsx(wzt,{
                    placeholder:"请选择加密方式"
                  })
                })
              }),Q.jsxs(Nzt,{
                children:[Q.jsx(Lzt,{
                  value:"none",children:e("email.email_encryption.none")
                }),Q.jsx(Lzt,{
                  value:"ssl",children:e("email.email_encryption.ssl")
                }),Q.jsx(Lzt,{
                  value:"tls",children:e("email.email_encryption.tls")
                })]
              })]
            }),Q.jsx(Xy,{
              children:e("email.email_encryption.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"email_username",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_username.title")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                placeholder:e("common.placeholder"),autoComplete:"off",...t,value:t.value||""
              })
            }),Q.jsx(Xy,{
              children:e("email.email_username.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"email_password",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_password.title")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                type:"password",placeholder:e("common.placeholder"),autoComplete:"off",...t,value:t.value||""
              })
            }),Q.jsx(Xy,{
              children:e("email.email_password.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"email_from_address",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              className:"text-base",children:e("email.email_from.title")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                placeholder:e("common.placeholder"),...t,value:t.value||""
              })
            }),Q.jsx(Xy,{
              children:e("email.email_from.description")
            }),Q.jsx(Qy,{
            })]
          })
        }),Q.jsx($y,{
          control:l.control,name:"remind_mail_enable",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsxs("div",{
              className:"space-y-0.5",children:[Q.jsx(Zy,{
                className:"text-base",children:e("email.remind_mail.title")
              }),Q.jsx(Xy,{
                children:e("email.remind_mail.description")
              })]
            }),Q.jsx(Yy,{
              children:Q.jsx(oZt,{
                checked:t.value||!1,onCheckedChange:e=>{
                  t.onChange(e),p(l.getValues())
                }
              })
            })]
          })
        }),Q.jsx("div",{
          className:"flex items-center justify-between",children:Q.jsx(Lf,{
            onClick:()=>u(),loading:h,disabled:h,children:e(h?"email.test.sending":"email.test.title")
          })
        })]
      })
    }),o&&Q.jsx("div",{
      className:"text-sm text-muted-foreground",children:e("saving")
    }),t&&Q.jsx(RZt,{
      open:i,onOpenChange:r,result:t
    })]
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

### `rw`

```js
qx,sw=H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(tw,{
  ref:n,className:Im("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  e),...t
}))
```

#### ↳ `tw`

```js
Gx,nw=Yx,iw=Qx;
const rw=qx,sw=H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(tw,{
  ref:n,className:Im("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  e),...t
}))
```

### `ow`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(nw,{
  ref:n,className:Im("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
  e),...t
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
:[Q.jsx(sw,{
  children:E.map(t=>Q.jsxs(ow,{
    value:t.name,className:"text-xs gap-1.5",children:[t.label,t.customized&&Q.jsx(nKt,{
      variant:"secondary",className:"text-[10px] px-1 py-0",children:e("email_template.customized")
    })]
  },t.name))
}),E.map(t=>Q.jsx(aw,{
  value:t.name,className:"mt-4",children:n===t.name&&Q.jsx(yYt,{
    detail:T,draft:I,isLoading:D&&!I,isDirty:R,isSaving:h,isTesting:p,isCustomized:U?.customized??!1,
    editorRef:x,varMeta:N,onSubjectChange:e=>P("subject",e),onContentChange:e=>P("content",e),onSave:B,
    onReset:()=>u(!0),onTest:()=>_(!0),onInsertPlaceholder:z,t:e
  })
},t.name))]
}),Q.jsx(lYt,{
  open:l,onOpenChange:c,children:Q.jsxs(hYt,{
    children:[Q.jsxs(gYt,{
      children:[Q.jsx(mYt,{
        children:e("email_template.discard_title")
      }),Q.jsx(fYt,{
        children:e("email_template.discard_description")
      })]
    }),Q.jsxs(pYt,{
      children:[Q.jsx(vYt,{
        onClick:()=>{
          a(null),c(!1)
        },children:e("email_template.cancel")
      }),Q.jsx(_Yt,{
        onClick:F,children:e("email_template.discard_confirm")
      })]
    })]
  })
}),Q.jsx(lYt,{
  open:d,onOpenChange:u,children:Q.jsxs(hYt,{
    children:[Q.jsxs(gYt,{
      children:[Q.jsx(mYt,{
        children:e("email_template.reset_title")
      }),Q.jsx(fYt,{
        children:e("email_template.reset_description")
      })]
    }),Q.jsxs(pYt,{
      children:[Q.jsx(vYt,{
        children:e("email_template.cancel")
      }),Q.jsx(_Yt,{
        onClick:V,children:e("email_template.reset_confirm")
      })]
    })]
  })
}),Q.jsx(lYt,{
  open:f,onOpenChange:_,children:Q.jsxs(hYt,{
    children:[Q.jsxs(gYt,{
      children:[Q.jsx(mYt,{
        children:e("email_template.test_dialog_title")
      }),Q.jsx(fYt,{
        children:e("email_template.test_dialog_description")
      })]
    }),Q.jsx("div",{
      className:"py-2",children:Q.jsx(u8e,{
        type:"email",value:v,onChange:e=>b(e.target.value),placeholder:e("email_template.test_email_placeholder")
      })
    }),Q.jsxs(pYt,{
      children:[Q.jsx(vYt,{
        children:e("email_template.cancel")
      }),Q.jsx(_Yt,{
        onClick:W,disabled:p,children:e(p?"email_template.sending":"email_template.send_test")
      })]
    })]
  })
})]
})
}function yYt({
  detail:e,draft:t,isLoading:n,isDirty:i,isSaving:r,isTesting:s,isCustomized:o,editorRef:a,varMeta:l,
  onSubjectChange:c,onContentChange:d,onSave:u,onReset:h,onTest:g,onInsertPlaceholder:p,t:m
}){
  const f=H.useRef(null),_=H.useMemo(()=>t?function(e,t,n){
    let i=e;
    for(const[s,o]of Object.entries(n))i=i.split(`{{${s}}}`).join(o.sample);
    let r=t;
    for(const[s,o]of Object.entries(n))r=r.split(`{{${s}}}`).join(o.sample);
    return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r}</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}</style></head><body>${i}</body></html>`
  }(t.content,t.subject,l):"",[t?.content,t?.subject,l]);
  if(H.useEffect(()=>{
    f.current&&_&&(f.current.srcdoc=_)
  },[_]),n)return Q.jsx("div",{
    className:"flex items-center justify-center h-64",children:Q.jsx("div",{
      className:"text-sm text-muted-foreground",children:m("common.loading")
    })
  });
  if(!e||!t)return null;
  const v=[...e.required_vars,...e.optional_vars];
  return Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsx("div",{
      className:"rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground",children:m("email_template.override_hint")
    }),Q.jsxs("div",{
      className:"space-y-2",children:[Q.jsx(Hy,{
        children:m("email_template.subject")
      }),Q.jsx(u8e,{
        value:t.subject,onChange:e=>c(e.target.value),placeholder:m("email_template.subject_placeholder")
      })]
    }),Q.jsxs("div",{
      className:"space-y-2",children:[Q.jsx(Hy,{
        children:m("email_template.placeholders")
      }),Q.jsx("div",{
        className:"rounded-md border",children:Q.jsxs("table",{
          className:"w-full text-sm",children:[Q.jsx("thead",{
            children:Q.jsxs("tr",{
              className:"border-b bg-muted/50",children:[Q.jsx("th",{
                className:"px-3 py-2 text-left font-medium",children:m("email_template.var_name")
              }),Q.jsx("th",{
                className:"px-3 py-2 text-left font-medium",children:m("email_template.var_desc")
              }),Q.jsx("th",{
                className:"px-3 py-2 text-left font-medium",children:m("email_template.var_sample")
              }),Q.jsx("th",{
                className:"px-3 py-2 text-left font-medium"
              })]
            })
          }),Q.jsx("tbody",{
            children:v.map(t=>{
              const n=l[t];
              return Q.jsxs("tr",{
                className:"border-b last:border-0",children:[Q.jsxs("td",{
                  className:"px-3 py-2 font-mono text-xs",children:["{{"+t+"}}",e.required_vars.includes(t)&&Q.jsx(nKt,
                  {
                    variant
```
