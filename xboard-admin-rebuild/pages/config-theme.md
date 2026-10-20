# `/config/theme`

- **页面组件**：`E1t`（offset 5990402，6703B）
- **i18n 命名空间**：`theme`
- **直引文案键**：`card.activateTheme`, `card.currentTheme`, `card.delete.button`, `card.delete.description`, `card.delete.error.active`, `card.delete.title`, `card.version`, `preview.imageCount`, `preview.title`, `upload.button`
- **直接调用的 API 辅助函数**：`BL()` → `/theme/getThemes`; `HL()` → `/theme/upload`; `zL()` → `/theme/delete`
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `xat`（63B）
- `wat`（63B）
- `vtt` = **ResponsiveDialogDescription**（109B）
- `s8e` = **Card**（135B）

## 源码（去最小化）

### `xat`

```js
aat("ChevronLeft",[["path",{
  d:"m15 18-6-6 6-6",key:"1wnfg3"
}]])
```

### `wat`

```js
aat("ChevronRight",[["path",{
  d:"m9 18 6-6-6-6",key:"mthhwq"
}]])
```

### `vtt` — ResponsiveDialogDescription

```js
H.forwardRef(({
  className:e,...t
},n)=>utt()?Q.jsx(ctt,{
  className:e,...t
}):Q.jsx(vet,{
  ref:n,className:e,...t
}))
```

#### ↳ `vet`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(x7e,{
  ref:n,className:Im("text-sm text-muted-foreground",e),...t
}))
```

#### ↳ `ctt`

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx(Jet.Description,{
  ref:n,className:Im("text-sm text-muted-foreground",e),...t
}))
```

### `s8e` — Card

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("rounded-xl border bg-card text-card-foreground shadow",e),...t
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
Symbol.toStringTag,{
  value:"Module"
})),S1t=(e,t)=>{
  let n=null;
  switch(e.field_type){
    case"input":n=Q.jsx(u8e,{
      placeholder:e.placeholder,...t
    });
    break;
    case"textarea":n=Q.jsx(aZt,{
      placeholder:e.placeholder,...t
    });
    break;
    case"select":n=Q.jsx("select",{
      className:Im(ytt({
        variant:"outline"
      }),"w-full appearance-none font-normal"),...t,children:e.select_options&&Object.keys(e.select_options).map(t=>Q.jsx("option",
      {
        value:t,children:e.select_options?.[t]
      },t))
    });
    break;
    default:n=null
  }return n
};
function k1t({
  themeKey:e,themeInfo:t
}){
  const{
    t:n
  }=jy("theme"),[i,r]=H.useState(!1),[s,o]=H.useState(!1),[a,l]=H.useState(!1),c=Nv({
    defaultValues:t.configs.reduce((e,t)=>(e[t.field_name]="",e),{
    })
  });
  return Q.jsxs(htt,{
    open:i,onOpenChange:t=>{
      r(t),t?(async()=>{
        o(!0),VL(e).then(({
          data:e
        })=>{
          Object.entries(e).forEach(([e,t])=>{
            c.setValue(e,t)
          })
        }).finally(()=>{
          o(!1)
        })
      })():c.reset()
    },children:[Q.jsx(gtt,{
      asChild:!0,children:Q.jsx(Lf,{
        variant:"outline",children:n("card.configureTheme")
      })
    }),Q.jsxs(ptt,{
      className:"max-h-[90vh] overflow-auto sm:max-w-[425px]",children:[Q.jsxs(mtt,{
        children:[Q.jsx(_tt,{
          children:n("config.title",{
            name:t.name
          })
        }),Q.jsx(vtt,{
          children:n("config.description")
        })]
      }),s?Q.jsx("div",{
        className:"flex h-40 items-center justify-center",children:Q.jsx(elt,{
          className:"h-6 w-6 animate-spin"
        })
      }):Q.jsx(zy,{
        ...c,children:Q.jsxs("form",{
          onSubmit:c.handleSubmit(async t=>{
            l(!0),WL(e,t).then(()=>{
              gE.success(n("config.success")),r(!1)
            }).finally(()=>{
              l(!1)
            })
          }),className:"space-y-4",children:[t.configs.map(e=>Q.jsx($y,{
            control:c.control,name:e.field_name,render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e.label
              }),Q.jsx(Yy,{
                children:S1t(e,t)
              }),Q.jsx(Qy,{
              })]
            })
          },e.field_name)),Q.jsxs(ftt,{
            className:"mt-6 gap-2",children:[Q.jsx(Lf,{
              type:"button",variant:"secondary",onClick:()=>r(!1),children:n("config.cancel")
            }),Q.jsx(Lf,{
              type:"submit",loading:a,children:n("config.save")
            })]
          })]
        })
      })]
    })]
  })
}function N1t(){
  return Q.jsxs(s8e,{
    children:[Q.jsxs(o8e,{
      children:[Q.jsx(q$t,{
        className:"h-6 w-[200px]"
      }),Q.jsx(q$t,{
        className:"h-4 w-[300px]"
      })]
    }),Q.jsxs(c8e,{
      className:"flex items-center justify-end space-x-3",children:[Q.jsx(q$t,{
        className:"h-10 w-[100px]"
      }),Q.jsx(q$t,{
        className:"h-10 w-[100px]"
      })]
    })]
  })
}const E1t=
```
