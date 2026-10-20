# `/sign-in`

- **页面组件**：`Jst`（offset 5059854，1884B）
- **i18n 命名空间**：`auth`
- **直引文案键**：`signIn.description`, `signIn.resetPassword.command`, `signIn.resetPassword.description`, `signIn.resetPassword.title`, `signIn.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，0 个）：—

## 页面专属组件（按数据密度排序）
- `xtt` = **Button**（170B）
- `vtt` = **ResponsiveDialogDescription**（109B）
- `s8e` = **Card**（135B）
- `ptt` = **ResponsiveDialogContent**（188B）

## 源码（去最小化）

### `xtt` — Button

```js
H.forwardRef(({
  className:e,variant:t,size:n,asChild:i=!1,...r
},s)=>{
  const o=i?Dp:"button";
  return Q.jsx(o,{
    className:Im(ytt({
      variant:t,size:n,className:e
    })),ref:s,...r
  })
})
```

#### ↳ `o`

```js
!1;
if(null===e)
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

### `ptt` — ResponsiveDialogContent

```js
H.forwardRef(({
  className:e,drawerClassName:t,children:n,...i
},r)=>utt()?Q.jsx(stt,{
  className:Im("flex max-h-[90vh] flex-col",t),children:n
}):Q.jsx(pet,{
  ref:r,className:e,...i,children:n
}))
```

#### ↳ `stt` — DrawerContent

```js
H.forwardRef(({
  className:e,children:t,...n
},i)=>Q.jsxs(ntt,{
  children:[Q.jsx(rtt,{
  }),Q.jsxs(Jet.Content,{
    ref:i,className:Im("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
    e),...n,children:[Q.jsx("div",{
      className:"mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"
    }),t]
  })]
}))
```

#### ↳ `pet`

```js
H.forwardRef(({
  className:e,children:t,...n
},i)=>Q.jsxs(uet,{
  children:[Q.jsx(get,{
  }),Q.jsxs(b7e,{
    ref:i,className:Im("max-h-[95%] overflow-auto fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
    e),...n,children:[t,Q.jsxs(w7e,{
      className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
      children:[Q.jsx(B7e,{
        className:"h-4 w-4"
      }),Q.jsx("span",{
        className:"sr-only",children:"Close"
      })]
    })]
  })]
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",e),...t}));zst.displayName=Bst.displayName;const Ust=H.forwardRef(({className:e,sideOffset:t=4,...n},i)=>Q.jsx(Tst,{children:Q.jsx(Ist,{ref:i,sideOffset:t,className:Im("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md","data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",e),...n})}));Ust.displayName=Ist.displayName;const $st=H.forwardRef(({className:e,inset:t,...n},i)=>Q.jsx(Ost,{ref:i,className:Im("relative flex cursor-default cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",t&&"pl-8",e),...n}));$st.displayName=Ost.displayName;const qst=H.forwardRef(({className:e,children:t,checked:n,...i},r)=>Q.jsxs(Mst,{ref:r,className:Im("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),checked:n,...i,children:[Q.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:Q.jsx(Pst,{children:Q.jsx(k7e,{className:"h-4 w-4"})})}),t]}));qst.displayName=Mst.displayName;const Kst=H.forwardRef(({className:e,children:t,...n},i)=>Q.jsxs(Ast,{ref:i,className:Im("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),...n,children:[Q.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:Q.jsx(Pst,{children:Q.jsx(z7e,{className:"h-4 w-4 fill-current"})})}),t]}));Kst.displayName=Ast.displayName;const Gst=H.forwardRef(({className:e,inset:t,...n},i)=>Q.jsx(Rst,{ref:i,className:Im("px-2 py-1.5 text-sm font-semibold",t&&"pl-8",e),...n}));Gst.displayName=Rst.displayName;const Zst=H.forwardRef(({className:e,...t},n)=>Q.jsx(jst,{ref:n,className:Im("-mx-1 my-1 h-px bg-muted",e),...t}));Zst.displayName=jst.displayName;const Yst=({className:e,...t})=>Q.jsx("span",{className:Im("ml-auto text-xs tracking-widest opacity-60",e),...t});Yst.displayName="DropdownMenuShortcut";const Xst=[{code:"en-US",name:"English",flag:function(e){var t=e.title,n=Ntt(e,Ctt);return z.createElement("svg",ktt({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 513 342"},n),t&&z.createElement("title",null,t),z.createElement("g",{fill:"#FFF"},z.createElement("path",{d:"M0 0h513v341.3H0V0z"}),z.createElement("path",{d:"M311.7 230 513 341.3v-31.5L369.3 230h-57.6zM200.3 111.3 0 0v31.5l143.7 79.8h56.6z"})),z.createElement("path",{d:"M393.8 230 513 295.7V230H393.8zm-82.1 0L513 341.3v-31.5L369.3 230h-57.6zm146.9 111.3-147-81.7v81.7h147zM90.3 230 0 280.2V230h90.3zm110 14.2v97.2H25.5l174.8-97.2zm-82.1-132.9L0 45.6v65.7h118.2zm82.1 0L0 0v31.5l143.7 79.8h56.6zM53.4 0l147 81.7V0h-147zm368.3 111.3L513 61.1v50.2h-91.3zm-110-14.2V0h174.9L311.7 97.1z",fill:"#0052B4"}),z.createElement("g",{fill:"#D80027"},z.createElement("path",{d:"M288 0h-64v138.7H0v64h224v138.7h64V202.7h224v-64H288V0z"}),z.createElement("path",{d:"M311.7 230 513 341.3v-31.5L369.3 230h-57.6zm-168 0L0 309.9v31.5L200.3 230h-56.6zm56.6-118.7L0 0v31.5l143.7 79.8h56.6zm168 0L513 31.5V0L311.7 111.3h56.6z"})))},shortName:"EN"},{code:"zh-CN",name:"中文",flag:function(e){var t=e.title,n=Ntt(e,wtt);return z.createElement("svg",ktt({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 513 342"},n),t&&z.createElement("title",null,t),z.createElement("path",{fill:"#D80027",d:"M0 0h513v342H0z"}),z.createElement("path",{d:"m226.8 239.2-9.7-15.6-17.9 4.4 11.9-14.1-9.7-15.6 17.1 6.9 11.8-14.1-1.3 18.4 17.1 6.9-17.9 4.4zM290.6 82l-10.1 15.4 11.6 14.3-17.7-4.8-10.1 15.5-1-18.4-17.7-4.8 17.2-6.6-1-18.4 11.6 14.3zm-54.4-56.6-2 18.3 16.8 7.6-18 3.8-2 18.3-9.2-16-17.9 3.8 12.3-13.7-9.2-15.9 16.8 7.5zm56.6 136.4-14.9 10.9 5.8 17.5-14.9-10.8-14.9 11 5.6-17.6-14.9-10.7 18.4-.1 5.6-17.6 5.8 17.5zM115 46.3l17.3 53.5h56.2l-45.4 32.9 17.3 53.5-45.4-33-45.5 33 17.4-53.5-45.5-32.9h56.3z",fill:"#FFDA44"}))},shortName:"CN"},{code:"ru-RU",name:"Русский",flag:function(e){var t=e.title,n=Ntt(e,Stt);return z.createElement("svg",ktt({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 85.333 512 341.333"},n),t&&z.createElement("title",null,t),z.createElement("path",{fill:"#FFF",d:"M0 85.33v341.332h512V85.33z"}),
```
