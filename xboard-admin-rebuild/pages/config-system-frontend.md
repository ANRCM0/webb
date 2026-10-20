# `/config/system/frontend`

- **页面组件**：`NZt`（offset 5792395，385B）
- **i18n 命名空间**：继承（jy() 无参）
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `kZt`（1998B）
- `$f`（218B）

## 源码（去最小化）

### `kZt`

```js
function kZt(){
  const{
    data:e
  }=pC({
    queryKey:["settings","frontend"],queryFn:()=>kT.getSettings("frontend")
  }),t=Nv({
    resolver:Mv(CZt),defaultValues:SZt,mode:"onChange"
  });
  return H.useEffect(()=>{
    if(e?.data?.frontend){
      const n=e?.data?.frontend;
      Object.entries(n).forEach(([e,n])=>{
        t.setValue(e,n)
      })
    }
  },[e,t]),Q.jsx(zy,{
    ...t,children:Q.jsxs("form",{
      onSubmit:t.handleSubmit(function(e){
        kT.saveSettings(e).then(({
          data:e
        })=>{
          e&&gE.success("更新成功")
        })
      }),className:"space-y-8",children:[Q.jsx($y,{
        control:t.control,name:"frontend_theme_sidebar",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:"边栏风格"
            }),Q.jsx(Xy,{
              children:"边栏风格"
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:e.value,onCheckedChange:e.onChange
            })
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_theme_header",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:"头部风格"
            }),Q.jsx(Xy,{
              children:"边栏风格"
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:e.value,onCheckedChange:e.onChange
            })
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_theme_color",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            children:"主题色"
          }),Q.jsxs("div",{
            className:"relative w-max",children:[Q.jsx(Yy,{
              children:Q.jsxs("select",{
                className:Im(Ef({
                  variant:"outline"
                }),"w-[200px] appearance-none font-normal"),...e,children:[Q.jsx("option",{
                  value:"default",children:"默认"
                }),Q.jsx("option",{
                  value:"black",children:"黑色"
                }),Q.jsx("option",{
                  value:"blackblue",children:"暗蓝色"
                }),Q.jsx("option",{
                  value:"green",children:"奶绿色"
                })]
              })
            }),Q.jsx(D7e,{
              className:"absolute right-3 top-2.5 h-4 w-4 opacity-50"
            })]
          }),Q.jsx(Xy,{
            children:"主题色"
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_background_url",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            children:"背景"
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:"请输入图片地址",...e
            })
          }),Q.jsx(Xy,{
            children:"将会在后台登录页面进行展示。"
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx(Lf,{
        type:"submit",children:"保存设置"
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
})),CZt=py({
  frontend_theme:cy().nullable(),frontend_theme_sidebar:cy().nullable(),frontend_theme_header:cy().nullable(),
  frontend_theme_color:cy().nullable(),frontend_background_url:cy().url().nullable()
}),SZt={
  frontend_theme:"",frontend_theme_sidebar:"",frontend_theme_header:"",frontend_theme_color:"",
  frontend_background_url:""
};
function kZt(){
  const{
    data:e
  }=pC({
    queryKey:["settings","frontend"],queryFn:()=>kT.getSettings("frontend")
  }),t=Nv({
    resolver:Mv(CZt),defaultValues:SZt,mode:"onChange"
  });
  return H.useEffect(()=>{
    if(e?.data?.frontend){
      const n=e?.data?.frontend;
      Object.entries(n).forEach(([e,n])=>{
        t.setValue(e,n)
      })
    }
  },[e,t]),Q.jsx(zy,{
    ...t,children:Q.jsxs("form",{
      onSubmit:t.handleSubmit(function(e){
        kT.saveSettings(e).then(({
          data:e
        })=>{
          e&&gE.success("更新成功")
        })
      }),className:"space-y-8",children:[Q.jsx($y,{
        control:t.control,name:"frontend_theme_sidebar",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:"边栏风格"
            }),Q.jsx(Xy,{
              children:"边栏风格"
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:e.value,onCheckedChange:e.onChange
            })
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_theme_header",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsxs("div",{
            className:"space-y-0.5",children:[Q.jsx(Zy,{
              className:"text-base",children:"头部风格"
            }),Q.jsx(Xy,{
              children:"边栏风格"
            })]
          }),Q.jsx(Yy,{
            children:Q.jsx(oZt,{
              checked:e.value,onCheckedChange:e.onChange
            })
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_theme_color",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            children:"主题色"
          }),Q.jsxs("div",{
            className:"relative w-max",children:[Q.jsx(Yy,{
              children:Q.jsxs("select",{
                className:Im(Ef({
                  variant:"outline"
                }),"w-[200px] appearance-none font-normal"),...e,children:[Q.jsx("option",{
                  value:"default",children:"默认"
                }),Q.jsx("option",{
                  value:"black",children:"黑色"
                }),Q.jsx("option",{
                  value:"blackblue",children:"暗蓝色"
                }),Q.jsx("option",{
                  value:"green",children:"奶绿色"
                })]
              })
            }),Q.jsx(D7e,{
              className:"absolute right-3 top-2.5 h-4 w-4 opacity-50"
            })]
          }),Q.jsx(Xy,{
            children:"主题色"
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx($y,{
        control:t.control,name:"frontend_background_url",render:({
          field:e
        })=>Q.jsxs(Gy,{
          children:[Q.jsx(Zy,{
            children:"背景"
          }),Q.jsx(Yy,{
            children:Q.jsx(u8e,{
              placeholder:"请输入图片地址",...e
            })
          }),Q.jsx(Xy,{
            children:"将会在后台登录页面进行展示。"
          }),Q.jsx(Qy,{
          })]
        })
      }),Q.jsx(Lf,{
        type:"submit",children:"保存设置"
      })]
    })
  })
}const NZt=
```
