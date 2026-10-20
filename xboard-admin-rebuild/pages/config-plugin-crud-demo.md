# `/config/plugin/crud-demo`

- **页面组件**：`C1t`（offset 5986621，1606B）
- **i18n 命名空间**：继承（jy() 无参）
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `v1t`（129B）
- `s8e` = **Card**（135B）
- `o8e` = **CardHeader**（111B）
- `nKt`（41B）

## 源码（去最小化）

### `v1t`

```js
function v1t({
  schema:e,data:t,total:n,isLoading:i=!1,onSave:r,onDelete:s,onPaginationChange:o,onSortingChange:a,
  onSearchChange:l
}
```

### `s8e` — Card

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("rounded-xl border bg-card text-card-foreground shadow",e),...t
}))
```

### `o8e` — CardHeader

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("flex flex-col space-y-1.5 p-6",e),...t
}))
```

### `nKt`

```js
function nKt({
  className:e,variant:t,...n
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
:"Yes"
}):c("runtime.booleanFalse",{
  defaultValue:"No"
})
});
case"tag":{
  const t=e.options?.find(e=>e.value===String(n));
  return Q.jsx(nKt,{
    variant:t?.variant??"outline",children:t?.label??String(n??"-")
  })
}case"number":return Q.jsx("span",{
  className:"tabular-nums",children:String(n??"-")
});
default:return Q.jsx("span",{
  children:String(n??"-")
})
}
}
}));
return(e.actions.edit||e.actions.delete)&&t.push({
  id:"actions",header:()=>null,size:100,cell:({
    row:t
  })=>Q.jsxs("div",{
    className:"flex items-center justify-end gap-1",children:[e.actions.edit&&Q.jsx(Lf,{
      variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>function(t){
        const n={
        };
        for(const i of Object.keys(e.form))n[i]=t[i]??e.form[i].value??"";
        D.reset({
          fields:n
        }),b(t),_(!0)
      }(t.original),children:Q.jsx(olt,{
        className:"h-3.5 w-3.5"
      })
    }),e.actions.delete&&Q.jsx(hQt,{
      title:c("runtime.deleteRecordTitle",{
        defaultValue:"Delete record"
      }),description:c("runtime.deleteRecordDescription",{
        defaultValue:"Are you sure you want to delete this record? This action cannot be undone."
      }),confirmText:c("runtime.delete",{
        defaultValue:"Delete"
      }),cancelText:c("runtime.cancel",{
        defaultValue:"Cancel"
      }),variant:"destructive",onConfirm:()=>async function(t){
        await s(t[e.id_field]),gE.success(c("runtime.deleteSuccess",{
          defaultValue:"Deleted successfully"
        }))
      }(t.original),children:Q.jsx(Lf,{
        variant:"ghost",size:"icon",className:"h-8 w-8",children:Q.jsx(Nlt,{
          className:"h-3.5 w-3.5 text-destructive"
        })
      })
    })]
  })
}),t
},[e,c]),E=NGt({
  data:k,columns:N,state:{
    sorting:d,pagination:h
  },rowCount:n??k.length,manualPagination:w,manualSorting:C,getCoreRowModel:vGt(),getFilteredRowModel:wGt(),
  getPaginationRowModel:CGt(),getSortedRowModel:SGt(),onSortingChange:e=>{
    const t="function"==typeof e?e(d):e;
    u(t),a?.(t)
  },onPaginationChange:e=>{
    const t="function"==typeof e?e(h):e;
    g(t),o?.(t)
  },initialState:{
    columnPinning:{
      right:["actions"]
    }
  }
}),L=py({
  fields:fy(hy())
}),D=Nv({
  resolver:Mv(L),defaultValues:{
    fields:{
    }
  }
});
const T=Q.jsxs("div",{
  className:"flex items-center justify-between gap-4",children:[S.length>0&&Q.jsx(u8e,{
    placeholder:c("runtime.searchPlaceholder",{
      defaultValue:"Search..."
    }),className:"max-w-sm",value:p,onChange:e=>{
      m(e.target.value),l?.(e.target.value)
    }
  }),Q.jsx("div",{
    className:"flex items-center gap-2",children:e.actions.create&&Q.jsxs(Lf,{
      size:"sm",onClick:function(){
        const t=RYt(e.form);
        D.reset({
          fields:t
        }),b(null),_(!0)
      },children:[Q.jsx(alt,{
        className:"mr-1 h-4 w-4"
      }),c("runtime.create",{
        defaultValue:"Create"
      })]
    })
  })]
});
return Q.jsxs(Q.Fragment,{
  children:[Q.jsxs("div",{
    className:"space-y-4",children:[T,Q.jsx(HGt,{
      table:E,showPagination:!0,isLoading:i,mobilePrimaryField:e.columns[0]?.key,mobileSecondaryFields:e.columns.slice(1,
      3).map(e=>e.key),mobileGridFields:e.columns.slice(3,5).map(e=>e.key)
    })]
  }),Q.jsx(htt,{
    open:f,onOpenChange:_,children:Q.jsxs(ptt,{
      className:"sm:max-w-[520px]",children:[Q.jsxs(mtt,{
        children:[Q.jsx(_tt,{
          children:v?c("runtime.edit",{
            defaultValue:"Edit"
          }):c("runtime.create",{
            defaultValue:"Create"
          })
        }),Q.jsx(vtt,{
          children:v?c("runtime.editDescription",{
            defaultValue:"Modify the fields below and save."
          }):c("runtime.createDescription",{
            defaultValue:"Fill in the fields below to create a new record."
          })
        })]
      }),Q.jsx(zy,{
        ...D,children:Q.jsxs("form",{
          onSubmit:D.handleSubmit(async function(t){
            x(!0);
            try{
              const n=null==v,i=n?{
                ...t.fields
              }:{
                [e.id_field]:v[e.id_field],...t.fields
              };
              await r(i),gE.success(n?c("runtime.createSuccess",{
                defaultValue:"Created successfully"
              }):c("runtime.updateSuccess",{
                defaultValue:"Updated successfully"
              })),_(!1)
            }catch{
              gE.error(c("runtime.saveFailed",{
                defaultValue:"Save failed"
              }))
            }finally{
              x(!1)
            }
          }),className:"flex flex-col overflow-hidden",children:[Q.jsx(Gqt,{
            className:"max-h-[60vh] flex-1",children:Q.jsx("div",{
              className:"space-y-6 px-1 py-1",children:Q.jsx(IYt,{
                form:D,config:e.form,namePrefix:"fields"
              })
            })
          }),Q.jsxs(ftt,{
            className:"mt-6 border-t pt-4",children:[Q.jsx(Lf,{
              typ
```
