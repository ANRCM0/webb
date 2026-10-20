# `/user/traffic-reset-logs`

- **页面组件**：`N9t`（offset 6518366，945B）
- **i18n 命名空间**：`user`
- **直引文案键**：`traffic_reset_logs.description`, `traffic_reset_logs.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `S9t`（726B）

## 源码（去最小化）

### `S9t`

```js
function S9t(){
  const{
    t:e
  }=jy("user"),[t,n]=H.useState({
  }),[i,r]=H.useState({
    reset_time:!1
  }),[s,o]=H.useState([]),[a,l]=H.useState([{
    id:"created_at",desc:!0
  }]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  }),u={
    page:c.pageIndex+1,per_page:c.pageSize,...s.reduce((e,t)=>{
      if(t.value)if("date_range"===t.id){
        const n=t.value;
        n.start&&(e.start_date=n.start),n.end&&(e.end_date=n.end)
      }else e[t.id]=t.value;
      return e
    },{
    })
  },{
    data:h,isLoading:g
  }=pC({
    queryKey:["trafficResetLogs",c,s,a],queryFn:()=>mT(u)
  });
  return Q.jsx(k9t,{
    data:h?.data??[],rowCount:h?.total??0,sorting:a,setSorting:l,columnVisibility:i,setColumnVisibility:r,
    rowSelection:t,setRowSelection:n,columnFilters:s,setColumnFilters:o,pagination:c,setPagination:d,
    t:e,isLoading:g
  })
}
```

#### ↳ `k9t`

```js
function k9t({
  data:e,rowCount:t,sorting:n,setSorting:i,columnVisibility:r,setColumnVisibility:s,rowSelection:o,
  setRowSelection:a,columnFilters:l,setColumnFilters:c,pagination:d,setPagination:u,t:h,isLoading:g
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
flex-1",children:[Q.jsx("div",{className:"truncate text-sm font-medium",children:e.original.user_email}),Q.jsxs("div",{className:"text-xs text-muted-foreground",children:["ID: ",e.original.user_id]})]})]}),enableSorting:!1,enableHiding:!1,size:100},{accessorKey:"trigger_source",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("traffic_reset_logs.columns.trigger_source"),className:"w-[120px]"}),cell:({row:t})=>Q.jsx("div",{className:"w-[120px]",children:Q.jsx(Zot,{delayDuration:100,children:Q.jsxs(Yot,{children:[Q.jsx(Xot,{asChild:!0,children:Q.jsx("div",{className:"cursor-pointer",children:Q.jsxs(nKt,{variant:"outline",className:Im("flex items-center gap-1.5 border text-xs",n(t.original.trigger_source)),children:[i(t.original.trigger_source),Q.jsx("span",{className:"truncate",children:t.original.trigger_source_name})]})})}),Q.jsx(Qot,{side:"bottom",className:"max-w-[200px]",children:Q.jsxs("div",{className:"space-y-1",children:[Q.jsx("div",{className:"text-sm font-medium",children:t.original.trigger_source_name}),Q.jsxs("div",{className:"text-xs text-muted-foreground",children:["manual"===t.original.trigger_source&&e("traffic_reset_logs.trigger_descriptions.manual"),"cron"===t.original.trigger_source&&e("traffic_reset_logs.trigger_descriptions.cron"),"auto"===t.original.trigger_source&&e("traffic_reset_logs.trigger_descriptions.auto"),!["manual","cron","auto"].includes(t.original.trigger_source)&&e("traffic_reset_logs.trigger_descriptions.other")]})]})})]})})}),enableSorting:!0,enableHiding:!1,filterFn:(e,t,n)=>n.includes(e.getValue(t)),size:120},{accessorKey:"reset_type",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("traffic_reset_logs.columns.reset_type"),className:"w-[120px]"}),cell:({row:e})=>Q.jsx("div",{className:"w-[120px]",children:Q.jsx(nKt,{className:Im("border text-xs",t(e.original.reset_type)),children:Q.jsx("span",{className:"truncate",children:e.original.reset_type_name})})}),enableSorting:!0,enableHiding:!1,filterFn:(e,t,n)=>n.includes(e.getValue(t)),size:120},{accessorKey:"old_traffic",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("traffic_reset_logs.columns.cleared_traffic"),className:"w-[120px]"}),cell:({row:t})=>{const n=t.original.old_traffic;return Q.jsx("div",{className:"w-[120px]",children:Q.jsx(Zot,{delayDuration:100,children:Q.jsxs(Yot,{children:[Q.jsx(Xot,{asChild:!0,children:Q.jsxs("div",{className:"cursor-pointer text-center",children:[Q.jsx("div",{className:"text-sm font-medium text-destructive",children:n.formatted}),Q.jsx("div",{className:"text-xs text-muted-foreground",children:e("traffic_reset_logs.columns.cleared")})]})}),Q.jsxs(Qot,{side:"bottom",className:"space-y-1",children:[Q.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[Q.jsx(Ilt,{className:"h-3 w-3"}),Q.jsxs("span",{children:[e("traffic_reset_logs.columns.upload"),":"," ",(n.upload/1024**3).toFixed(2)," GB"]})]}),Q.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[Q.jsx(jat,{className:"h-3 w-3"}),Q.jsxs("span",{children:[e("traffic_reset_logs.columns.download"),":"," ",(n.download/1024**3).toFixed(2)," GB"]})]})]})]})})})},enableSorting:!1,enableHiding:!1,size:120},{accessorKey:"reset_time",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("traffic_reset_logs.columns.reset_time"),className:"w-[140px]"}),cell:({row:e})=>Q.jsx("div",{className:"w-[140px]",children:Q.jsxs("div",{className:"flex items-start gap-2",children:[Q.jsx(ult,{className:"mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"}),Q.jsxs("div",{className:"min-w-0 flex-1",children:[Q.jsx("div",{className:"text-sm font-medium",children:SS(e.original.reset_time,"MM-DD")}),Q.jsx("div",{className:"text-xs text-muted-foreground",children:SS(e.original.reset_time,"HH:mm")})]})]})}),enableSorting:!0,enableHiding:!0,size:140},{accessorKey:"created_at",header:({column:t})=>Q.jsx(eQt,{column:t,title:e("traffic_reset_logs.columns.log_time"),className:"w-[140px]"}),cell:({row:e})=>Q.jsx("div",{className:"w-[140px]",children:Q.jsxs("div",{className:"flex items-start gap-2",children:[Q.jsx(Rat,{className:"mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"}),Q.jsxs("div",{className:"min-w-0 flex-1",children:[Q.jsx("div",{className:"text-sm font-medium",children:SS(e.original.created_at,"YYYY-MM-DD")}),Q.jsx("div",{className:"text-xs text-muted-foreground",children:SS(e.original.created_at,"H:m:s")})]})]})}),enableSorting:!0,enableHiding:!1,size:1400}]};function S9t(){const{t:e}=jy("user"),[t,n]=H.useState({}),[i,r]=H.useState({reset_time:!1}),[s,o]=H.useState([]),[a,l]=H.useState([{id:"created_at",desc:!0}]),[c,d]=H.useState({pageIndex:0,pageSize:20}),u={page:c.pageIndex+1,per_page:c.pageSize,...s.reduce((e,t)=>{if(t.value)if("date_range"===t.id){const n=t.value;n.start&&(e.start_date=n.start),n.end&&(e.end_date=n.end)}else e[t.id]=t.value;return e},{})},{data:h,isLoading:g}=pC({queryKey:["trafficResetLogs",c,s,a],queryFn:()=>mT(u)});return Q.jsx(k9t,{data:h?.data??[],rowCount:h?.total??0,sorting:a,setSorting:l,columnVisibility
```
