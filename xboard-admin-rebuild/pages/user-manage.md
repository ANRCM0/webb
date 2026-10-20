# `/user/manage`

- **页面组件**：`Y8t`（offset 6476931，825B）
- **i18n 命名空间**：`user`
- **直引文案键**：`manage.description`, `manage.title`
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `G8t`（939B）

## 源码（去最小化）

### `G8t`

```js
function G8t(){
  const[e]=Hg(),[t,n]=H.useState({
  }),[i,r]=H.useState({
    is_admin:!1,is_staff:!1
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  });
  H.useEffect(()=>{
    const t=e.get("email");
    t&&o(e=>e.some(e=>"email"===e.id)?e:[...e,{
      id:"email",value:t
    }])
  },[e]);
  const{
    refetch:u,data:h,isLoading:g
  }=pC({
    queryKey:["userList",c,s,a],queryFn:()=>oT({
      pageSize:c.pageSize,current:c.pageIndex+1,filter:s,sort:a
    })
  }),[p,m]=H.useState([]),[f,_]=H.useState([]);
  H.useEffect(()=>{
    iD().then(({
      data:e
    })=>{
      m(e)
    }),RD().then(({
      data:e
    })=>{
      _(e)
    })
  },[]);
  const v=f.map(e=>({
    label:e.name,value:e.id
  }));
  return Q.jsxs(U8t,{
    refreshData:u,children:[Q.jsx(Z8t,{
      data:h?.data||[],rowCount:h?.total??0,sorting:a,setSorting:l,columnVisibility:i,setColumnVisibility:r,
      rowSelection:t,setRowSelection:n,columnFilters:s,setColumnFilters:o,pagination:c,setPagination:d,
      refetch:u,serverGroupList:p,subscriptionPlans:v,isLoading:g
    }),Q.jsx(K8t,{
    })]
  })
}
```

#### ↳ `Z8t`

```js
function Z8t({
  data:e,rowCount:t,sorting:n,setSorting:i,columnVisibility:r,setColumnVisibility:s,rowSelection:o,
  setRowSelection:a,columnFilters:l,setColumnFilters:c,pagination:d,setPagination:u,refetch:h,
  serverGroupList:g,subscriptionPlans:p,isLoading:m
}
```

#### ↳ `U8t`

```js
({
  children:e,refreshData:t
})
```

#### ↳ `K8t`

```js
function K8t(){
  const{
    t:e
  }=jy("user"),{
    isOpen:t,setIsOpen:n,editingUser:i,refreshData:r
  }=$8t(),[s,o]=H.useState(!1),[a,l]=H.useState([]),c=i?.phone_auth_countries||[],d=!!i?.phone_auth_enabled,
  u=Nv({
    resolver:Mv(q8t)
  });
  return H.useEffect(()=>{
    t&&RD().then(({
      data:e
    })=>{
      l(e)
    })
  },[t]),H.useEffect(()=>{
    if(i){
      const e=i.invite_user?.email,{
        ...t
      }=i;
      u.reset({
        ...t,invite_user_email:e||null,country_code:t.phone_country_code||t.phone_default_country_code||"CN",
        phone:t.phone_national_number||t.phone||null,password:null,u:t.u?(t.u/1024/1024/1024).toFixed(3):"",
        d:t.d?(t.d/1024/1024/1024).toFixed(3):""
      })
    }
  },[i,u]),Q.jsx(g3t,{
    open:t,onOpenChange:n,children:Q.jsxs(v3t,{
      className:"max-w-[90%] space-y-4",children:[Q.jsxs(b3t,{
        children:[Q.jsx(x3t,{
          children:e("edit.title")
        }),Q.jsx(w3t,{
        })]
      }),Q.jsxs(zy,{
        ...u,children:[Q.jsx($y,{
          control:u.control,name:"email",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.email")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                ...t,placeholder:e("edit.form.email_placeholder"),autoComplete:"username"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),Q.jsx($y,{
          control:u.control,name:"invite_user_email",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.inviter_email")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                value:t.value||"",onChange:e=>t.onChange(e.target.value?e.target.value:null),placeholder:e("edit.form.inviter_email_placeholder"),
                autoComplete:"off",name:"invite_user_email"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),d&&Q.jsxs("div",{
          className:"grid gap-2 md:grid-cols-[10rem_1fr]",children:[Q.jsx($y,{
            control:u.control,name:"country_code",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.phone_country")
              }),Q.jsx(Yy,{
                children:Q.jsxs(yzt,{
                  value:t.value||i?.phone_default_country_code||"CN",onValueChange:t.onChange,disabled:c.length<=1,
                  children:[Q.jsx(Czt,{
                    children:Q.jsx(wzt,{
                    })
                  }),Q.jsx(Nzt,{
                    children:c.map(e=>Q.jsxs(Lzt,{
                      value:e.code,children:[e.name," +",e.dial_code]
                    },e.code))
                  })]
                })
              }),Q.jsx(Qy,{
              })]
            })
          }),Q.jsx($y,{
            control:u.control,name:"phone",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.phone")
              }),Q.jsx(Yy,{
                children:Q.jsx(u8e,{
                  value:t.value||"",onChange:e=>t.onChange(e.target.value||null),placeholder:e("edit.form.phone_placeholder"),
                  autoComplete:"tel-national"
                })
              }),Q.jsx(Qy,{
              })]
            })
          })]
        }),Q.jsx($y,{
          control:u.control,name:"password",render:({
            field:t
          })=>Q.jsxs(Gy,{
            children:[Q.jsx(Zy,{
              children:e("edit.form.password")
            }),Q.jsx(Yy,{
              children:Q.jsx(u8e,{
                type:"password",value:t.value||"",onChange:t.onChange,placeholder:e("edit.form.password_placeholder"),
                autoComplete:"new-password"
              })
            }),Q.jsx(Qy,{
              ...t
            })]
          })
        }),Q.jsxs("div",{
          className:"grid gap-2 md:grid-cols-2",children:[Q.jsx($y,{
            control:u.control,name:"balance",render:({
              field:t
            })=>Q.jsxs(Gy,{
              children:[Q.jsx(Zy,{
                children:e("edit.form.balance")
              }),Q.jsx(Yy,{
                children:Q.jsxs("div",{
                  className:"flex",children:[Q.jsx(u8e,{
                    type:"number",value:t.value||"",onChange:t.onChange,placeholder:e("edit.form.balance_placeholder"),
                    c
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
"edit.form.subscription_none")
})
}),Q.jsxs(Nzt,{
  children:[Q.jsx(Lzt,{
    value:"0",children:e("edit.form.commission_type_system")
  }),Q.jsx(Lzt,{
    value:"1",children:e("edit.form.commission_type_cycle")
  }),Q.jsx(Lzt,{
    value:"2",children:e("edit.form.commission_type_onetime")
  })]
})]
})
})]
})
}),Q.jsx($y,{
  control:u.control,name:"commission_rate",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.commission_rate")
    }),Q.jsx(Yy,{
      children:Q.jsxs("div",{
        className:"flex",children:[Q.jsx(u8e,{
          type:"number",value:t.value||"",onChange:e=>t.onChange(parseInt(e.currentTarget.value)||null),
          placeholder:e("edit.form.commission_rate_placeholder"),className:"rounded-r-none"
        }),Q.jsx("div",{
          className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
          children:"%"
        })]
      })
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"discount",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.discount")
    }),Q.jsx(Yy,{
      children:Q.jsxs("div",{
        className:"flex",children:[Q.jsx(u8e,{
          type:"number",value:t.value||"",onChange:e=>t.onChange(parseInt(e.currentTarget.value)||null),
          placeholder:e("edit.form.discount_placeholder"),className:"rounded-r-none"
        }),Q.jsx("div",{
          className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
          children:"%"
        })]
      })
    }),Q.jsx(Qy,{
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"speed_limit",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.speed_limit")
    }),Q.jsx(Yy,{
      children:Q.jsxs("div",{
        className:"flex",children:[Q.jsx(u8e,{
          type:"number",value:t.value||"",onChange:e=>t.onChange(parseInt(e.currentTarget.value)||null),
          placeholder:e("edit.form.speed_limit_placeholder"),className:"rounded-r-none"
        }),Q.jsx("div",{
          className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
          children:"Mbps"
        })]
      })
    }),Q.jsx(Qy,{
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"device_limit",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.device_limit")
    }),Q.jsx(Yy,{
      children:Q.jsxs("div",{
        className:"flex",children:[Q.jsx(u8e,{
          type:"number",value:t.value||"",onChange:e=>t.onChange(parseInt(e.currentTarget.value)||null),
          placeholder:e("edit.form.device_limit_placeholder"),className:"rounded-r-none"
        }),Q.jsx("div",{
          className:"z-[-1] rounded-md rounded-l-none border border-l-0 border-input px-3 py-1 shadow-sm",
          children:"台"
        })]
      })
    }),Q.jsx(Qy,{
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"is_admin",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.is_admin")
    }),Q.jsx("div",{
      className:"py-2",children:Q.jsx(Yy,{
        children:Q.jsx(oZt,{
          checked:t.value,onCheckedChange:e=>t.onChange(e)
        })
      })
    }),Q.jsx(Qy,{
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"is_staff",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.is_staff")
    }),Q.jsx("div",{
      className:"py-2",children:Q.jsx(Yy,{
        children:Q.jsx(oZt,{
          checked:t.value,onCheckedChange:e=>t.onChange(e)
        })
      })
    })]
  })
}),Q.jsx($y,{
  control:u.control,name:"remarks",render:({
    field:t
  })=>Q.jsxs(Gy,{
    children:[Q.jsx(Zy,{
      children:e("edit.form.remarks")
    }),Q.jsx(Yy,{
      children:Q.jsx(aZt,{
        className:"h-24",value:t.value||"",onChange:e=>t.onChange(e.currentTarget.value??null),placeholder:e("edit.form.remarks_placeholder")
      })
    }),Q.jsx(Qy,{
    })]
  })
}),Q.jsxs(y3t,{
  children:[Q.jsx(Lf,{
    variant:"outline",onClick:()=>n(!1),children:e("edit.form.cancel")
  }),Q.jsx(Lf,{
    type:"submit",onClick:()=>{
      u.handleSubmit(t=>{
        const i={
          id:t.id
        };
        u.formState.dirtyFields.u&&(i.u=Math.round(1024*parseFloat(t.u)*1024*1024)),u.formState.dirtyFields.d&&(i.d=Math.round(1024*parseFloat(t.d)*1024*1024));
        const s={
        };
        Object.keys(t).forEach(e=>{
          "u"!==e&&"d"!==e&&"id"!==e&&u.formState.dirtyFields[e]&&(s[e]=t[e])
        }),Object.assign(i,s),aT(i).then(({
          data:t
        })=>{
          t&&(gE.success(e("edit.form.success")),n(!1),r())
        })
      })()
    },children:e("edit.form.submit")
  })]
})]
})]
})
})
}function G8t(){
  const[e]=Hg(),[t,n]=H.useState({
  }),[i,r]=H.useState({
    is_admin:!1,is_staff:!1
  }),[s,o]=H.useState([]),[a,l]=H.useState([]),[c,d]=H.useState({
    pageIndex:0,pageSize:20
  });
  H.useEffect(()=>{
    const t=e.get("email");
  
```
