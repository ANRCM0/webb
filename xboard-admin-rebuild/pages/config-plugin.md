# `/config/plugin`

- **页面组件**：`g1t`（offset 5966018，7729B）
- **i18n 命名空间**：`plugin`
- **直引文案键**：`button.crudDemo`, `button.menuDemo`, `config.description`, `config.title`, `messages.deleteError`, `messages.deleteSuccess`, `messages.installError`, `messages.installSuccess`, `messages.uninstallError`, `messages.uninstallSuccess`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，5 个）：`eot`, `tot`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `yzt`（517B）
- `wzt`（501B）
- `vtt` = **ResponsiveDialogDescription**（109B）
- `u8e` = **Input**（423B）

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

### `u8e` — Input

```js
H.forwardRef(({
  className:e,type:t,...n
},i)=>Q.jsx("input",{
  type:t,className:Im("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  e),ref:i,...n
}))
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
",{className:"flex flex-shrink-0 items-center gap-1.5",children:[e.is_protected&&Q.jsx(Zot,{children:Q.jsxs(Yot,{children:[Q.jsx(Xot,{asChild:!0,children:Q.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",children:Q.jsx(xlt,{className:"h-3 w-3"})})}),Q.jsx(Qot,{children:Q.jsx("p",{children:d("status.protected")})})]})}),e.readme&&Q.jsx("button",{type:"button",onClick:l,className:"flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary",title:d("button.readme"),children:Q.jsx(Hat,{className:"h-3 w-3"})})]})]}),Q.jsxs("div",{className:"mb-2 flex items-center gap-3 text-xs text-muted-foreground",children:[Q.jsxs("div",{className:"flex items-center gap-1",children:[Q.jsx(rlt,{className:"h-3 w-3"}),Q.jsx("code",{className:"rounded bg-muted px-1 py-0.5 text-xs",children:e.code})]}),Q.jsxs("span",{children:["v",e.version]}),Q.jsxs("span",{children:[d("author"),": ",e.author]})]}),Q.jsx("p",{className:"mb-3 overflow-hidden text-ellipsis text-sm text-muted-foreground",style:{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"},children:e.description}),Q.jsx("div",{className:"flex items-center justify-end gap-2",children:e.is_installed?Q.jsxs(Q.Fragment,{children:[e.need_upgrade&&Q.jsx(hQt,{title:d("upgrade.title"),description:d("upgrade.description"),cancelText:d("common:cancel"),confirmText:d("upgrade.button"),variant:"default",onConfirm:async()=>n(e.code),children:Q.jsxs(Lf,{variant:"destructive",size:"sm",disabled:a,className:"h-7 bg-red-600 px-2 text-xs text-white hover:bg-red-700",children:[Q.jsx(kat,{className:"mr-1 h-3 w-3"}),d("button.upgrade")]})}),e.config&&Object.keys(e.config).length>0&&Q.jsxs(Lf,{variant:"outline",size:"sm",onClick:()=>s(e.code),disabled:!e.is_enabled||a,className:"h-7 px-2 text-xs",children:[Q.jsx(_lt,{className:"mr-1 h-3 w-3"}),d("button.config")]}),Q.jsxs(Lf,{variant:e.is_enabled?"destructive":"default",size:"sm",onClick:()=>r(e.code,e.is_enabled),disabled:a,className:"h-7 px-2 text-xs",children:[Q.jsx(clt,{className:"mr-1 h-3 w-3"}),e.is_enabled?d("button.disable"):d("button.enable")]}),Q.jsx(hQt,{title:d("uninstall.title"),description:d("uninstall.description"),cancelText:d("common:cancel"),confirmText:d("uninstall.button"),variant:"destructive",onConfirm:async()=>i(e.code),children:Q.jsxs(Lf,{variant:"outline",size:"sm",className:"h-7 px-2 text-xs text-muted-foreground hover:text-destructive",disabled:a||e.is_enabled,children:[Q.jsx(Nlt,{className:"mr-1 h-3 w-3"}),d("button.uninstall")]})})]}):Q.jsxs(Q.Fragment,{children:[Q.jsxs(Lf,{onClick:()=>t(e.code),disabled:a,size:"sm",className:"h-7 px-3 text-xs",children:[a?Q.jsx("div",{className:"mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"}):null,d("button.install")]}),!1!==e.can_be_deleted&&Q.jsx(hQt,{title:d("delete.title"),description:d("delete.description"),cancelText:d("common:cancel"),confirmText:d("delete.button"),variant:"destructive",onConfirm:async()=>o(e.code),children:Q.jsx(Lf,{variant:"ghost",size:"sm",className:"h-7 w-7 p-0 text-muted-foreground hover:text-destructive",disabled:a,children:Q.jsx(Nlt,{className:"h-3 w-3"})})})]})})]})})}function h1t(){return Q.jsxs(s8e,{children:[Q.jsxs(o8e,{children:[Q.jsx("div",{className:"flex items-center justify-between",children:Q.jsxs("div",{className:"space-y-2",children:[Q.jsxs("div",{className:"flex items-center gap-2",children:[Q.jsx(q$t,{className:"h-6 w-[200px]"}),Q.jsx(q$t,{className:"h-6 w-[80px]"})]}),Q.jsxs("div",{className:"flex items-center gap-4",children:[Q.jsx(q$t,{className:"h-5 w-[120px]"}),Q.jsx(q$t,{className:"h-5 w-[60px]"})]})]})}),Q.jsxs("div",{className:"space-y-2 pt-2",children:[Q.jsx(q$t,{className:"h-4 w-[300px]"}),Q.jsx(q$t,{className:"h-4 w-[150px]"})]})]}),Q.jsx(c8e,{children:Q.jsxs("div",{className:"flex justify-end space-x-2",children:[Q.jsx(q$t,{className:"h-9 w-[100px]"}),Q.jsx(q$t,{className:"h-9 w-[100px]"}),Q.jsx(q$t,{className:"h-8 w-8"})]})})]})}d1t.prototype.set=function(e){return dJt(this.options,e),this},d1t.prototype.configure=function(e){const t=this;if(lJt(e)){const t=e;if(!(e=i1t[t]))throw new Error('Wrong `markdown-it` preset "'+t+'", check name')}if(!e)throw new Error("Wrong `markdown-it` preset, can't be empty");return e.options&&t.set(e.options),e.components&&Object.keys(e.components).forEach(function(n){e.components[n].rules&&t[n].ruler.enableOnly(e.components[n].rules),e.components[n].rules2&&t[n].ruler2.enableOnly(e.components[n].rules2)}),this},d1t.prototype.enable=function(e,t){let n=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(t){n=n.concat(this[t].ruler.enable(e,!0))},this),n=n.concat(this.inline.ruler2.enable(e,!0));const i=e.filter(function(e){return n.indexOf(e)<0});if(i.length&&!t)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+i);return this},d1t.prototype.disable=
```
