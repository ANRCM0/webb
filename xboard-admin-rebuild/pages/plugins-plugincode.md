# `/plugins/:pluginCode/*`

- **页面组件**：`r4t`（offset 6066007，6971B）
- **i18n 命名空间**：`plugin`
- **直引文案键**：`config.title`, `readme.title`, `runtime.backToManager`, `runtime.backToOverview`, `runtime.disabledDescription`, `runtime.disabledTitle`, `runtime.menuDeclarationTitle`, `runtime.metadataTitle`, `runtime.noReadme`, `runtime.notFoundDescription`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `s8e` = **Card**（135B）
- `rw`（174B）
- `q$t`（31B）
- `ow`（461B）

## 源码（去最小化）

### `s8e` — Card

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("rounded-xl border bg-card text-card-foreground shadow",e),...t
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

### `q$t`

```js
function q$t({
  className:e,...t
}
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
Symbol.toStringTag,{
  value:"Module"
}));
function i4t({
  schema:e,pluginCode:t
}){
  const[n,i]=H.useState({
    pageIndex:0,pageSize:20
  }),[r,s]=H.useState([]),[o,a]=H.useState(""),l=["pluginCrud",t,e.api.list,n,r,o],{
    data:c,isLoading:d,refetch:u
  }=pC({
    queryKey:l,queryFn:async()=>{
      const t={
        current:n.pageIndex+1,pageSize:n.pageSize
      };
      return o&&(t.search=o),r.length>0&&(t.sort_field=r[0].id,t.sort_order=r[0].desc?"desc":"asc"),
      ET.crudList(e.api.list,t)
    }
  }),h=H.useCallback(async t=>{
    await ET.crudSave(e.api.save,t),u()
  },[e.api.save,u]),g=H.useCallback(async t=>{
    await ET.crudDelete(e.api.delete,{
      [e.id_field]:t
    }),u()
  },[e.api.delete,e.id_field,u]);
  return Q.jsx(v1t,{
    schema:e,data:c?.data??[],total:c?.total??0,isLoading:d,onSave:h,onDelete:g,onPaginationChange:i,
    onSortingChange:e=>s(e.map(e=>({
      id:e.id,desc:e.desc
    }))),onSearchChange:a
  })
}const r4t=
```
