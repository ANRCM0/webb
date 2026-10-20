# `/config/plugin/menu-demo`

- **页面组件**：`f1t`（offset 5974393，4985B）
- **i18n 命名空间**：`plugin`
- **直引文案键**：`runtime.addMenu`, `runtime.menuCrudDescription`, `runtime.menuCrudTitle`, `runtime.menuIcon`, `runtime.menuLabel`, `runtime.menuPath`, `runtime.menuTitle`, `runtime.noDeclaredMenus`, `runtime.previewEmpty`, `runtime.sidebarPreviewDescription`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `yzt`（517B）
- `wzt`（501B）
- `u8e` = **Input**（423B）
- `s8e` = **Card**（135B）

## 源码（去最小化）

### `yzt`

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

#### ↳ `D7e`

```js
H.forwardRef(function(e,t){
  var n=e.color,i=void 0===n?"currentColor":n,r=C7e(e,L7e);
  return H.createElement("svg",Object.assign({
    width:"15",height:"15",viewBox:"0 0 15 15",fill:"none",xmlns:"http://www.w3.org/2000/svg"
  },r,{
    ref:t
  }),H.createElement("path",{
    d:"M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
    fill:i,fillRule:"evenodd",clipRule:"evenodd"
  }))
})
```

### `wzt`

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

#### ↳ `D7e`

```js
H.forwardRef(function(e,t){
  var n=e.color,i=void 0===n?"currentColor":n,r=C7e(e,L7e);
  return H.createElement("svg",Object.assign({
    width:"15",height:"15",viewBox:"0 0 15 15",fill:"none",xmlns:"http://www.w3.org/2000/svg"
  },r,{
    ref:t
  }),H.createElement("path",{
    d:"M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
    fill:i,fillRule:"evenodd",clipRule:"evenodd"
  }))
})
```

### `u8e` — Input

```js
H.forwardRef(({
  className:e,type:t,...n
},i)=>Q.jsx("input",{
  type:t,className:Im("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  e),ref:i,...n
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
})),p1t={
  code:"traffic-analytics",name:"Traffic Analytics",version:"1.2.0",description:"Demonstrates opt-in plugin menu contributions.",
  author:"XBoard Labs",type:"feature",is_installed:!0,is_enabled:!0,config:{
    refresh_interval:15
  },readme:"# Traffic Analytics\n\nThis is a local demo for plugin admin menus.",admin_menus:[{
    id:"overview",title:"Overview",path:"overview",icon:"dashboard",label:"default",description:"Plugin landing page"
  },{
    id:"reports",title:"Reports",path:"reports",icon:"bar-chart-3",description:"Traffic reporting center"
  }]
};
function m1t(e){
  return{
    id:`menu-${e}`,title:"",path:"",icon:"settings",label:"",description:""
  }
}const f1t=
```
