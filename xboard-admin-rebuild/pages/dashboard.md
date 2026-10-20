# `/`

- **页面组件**：`$Gt`（offset 5748402，630B）
- **i18n 命名空间**：继承（jy() 无参）
- **直引文案键**：（无，全部下沉到子组件）
- **直接调用的 API 辅助函数**：（无）
- **外壳组件**（跨页面共享，6 个）：`eot`, `tot`, `Eut`, `Lut`, `sht`, `not`

## 页面专属组件（按数据密度排序）
- `UGt`（10251B）
- `$$t`（5342B）
- `uqt`（26B）
- `eKt`（26B）

## 源码（去最小化）

### `UGt`

```js
function UGt(){
  const{
    t:e
  }=jy(),[t,n]=H.useState(0),[i,r]=H.useState(!1),[s,o]=H.useState(1),[a]=H.useState(10),[l,c]=H.useState(null),
  [d,u]=H.useState(!1),{
    data:h,isLoading:g,isRefetching:p
  }=pC({
    queryKey:["queueStats",t],queryFn:async()=>(await kT.getQueueStats()).data,refetchInterval:3e4
  }),{
    data:m,isLoading:f,refetch:_
  }=pC({
    queryKey:["failedJobs",s,a],queryFn:async()=>{
      const e=await kT.getHorizonFailedJobs({
        current:s,page_size:a
      });
      return{
        data:e.data,total:e.total||0
      }
    },enabled:i
  }),v=m?.data||[],b=m?.total||0,y=H.useMemo(()=>[zGt.display({
    id:"failed_at",header:()=>e("dashboard:queue.details.time"),cell:({
      row:e
    })=>(e=>{
      if(!e)return"";
      let t;
      if("string"==typeof e){
        if(t=parseInt(e),isNaN(t))return e
      }else t=e;
      return(10===t.toString().length?new Date(1e3*t):new Date(t)).toLocaleString("zh-CN",{
        year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"
      })
    })(e.original.failed_at)
  }),zGt.display({
    id:"queue",header:()=>e("dashboard:queue.details.queue"),cell:({
      row:e
    })=>e.original.queue
  }),zGt.display({
    id:"name",header:()=>e("dashboard:queue.details.name"),cell:({
      row:e
    })=>Q.jsx(Zot,{
      children:Q.jsxs(Yot,{
        children:[Q.jsx(Xot,{
          asChild:!0,children:Q.jsx("span",{
            className:"inline-block max-w-[150px] truncate",children:e.original.name
          })
        }),Q.jsx(Qot,{
          children:Q.jsx("span",{
            children:e.original.name
          })
        })]
      })
    })
  }),zGt.display({
    id:"exception",header:()=>e("dashboard:queue.details.exception"),cell:({
      row:e
    })=>Q.jsx(Zot,{
      children:Q.jsxs(Yot,{
        children:[Q.jsx(Xot,{
          asChild:!0,children:Q.jsx("span",{
            className:"inline-block max-w-[200px] truncate",children:e.original.exception.split("\n")[0]
          })
        }),Q.jsx(Qot,{
          className:"max-w-[300px] whitespace-pre-wrap",children:Q.jsx("span",{
            children:e.original.exception
          })
        })]
      })
    })
  }),zGt.display({
    id:"actions",header:()=>e("dashboard:queue.details.action"),size:80,cell:({
      row:t
    })=>Q.jsx(xtt,{
      variant:"ghost",size:"sm",onClick:()=>C(t.original),"aria-label":e("dashboard:queue.details.viewDetail"),
      children:Q.jsx(Wat,{
        className:"h-4 w-4"
      })
    })
  })],[e]),x=NGt({
    data:v,columns:y,getCoreRowModel:vGt(),getPaginationRowModel:CGt(),pageCount:Math.ceil(b/a),
    manualPagination:!0,state:{
      pagination:{
        pageIndex:s-1,pageSize:a
      }
    },onPaginationChange:e=>{
      if("function"==typeof e){
        const t=e({
          pageIndex:s-1,pageSize:a
        });
        w(t.pageIndex+1)
      }else w(e.pageIndex+1)
    }
  }),w=e=>{
    o(e)
  },C=e=>{
    c(e),u(!0)
  };
  if(g)return Q.jsx("div",{
    className:"flex items-center justify-center p-6",children:Q.jsx(elt,{
      className:"h-6 w-6 animate-spin"
    })
  });
  return Q.jsxs("div",{
    className:"space-y-4",children:[Q.jsxs("div",{
      className:"grid gap-4 md:grid-cols-2",children:[Q.jsxs(s8e,{
        children:[Q.jsxs(o8e,{
          className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[Q.jsxs("div",
          {
            className:"space-y-1",children:[Q.jsxs(a8e,{
              className:"flex items-center gap-2",children:[Q.jsx(klt,{
                className:"h-5 w-5"
              }),e("dashboard:queue.title")]
            }),Q.jsx(l8e,{
              children:e("dashboard:queue.status.description")
            })]
          }),Q.jsx(xtt,{
            variant:"outline",size:"icon",onClick:()=>{
              n(e=>e+1)
            },disabled:p,children:Q.jsx(hlt,{
              className:Im("h-4 w-4",p&&"animate-spin")
            })
          })]
        }),Q.jsx(c8e,{
          children:Q.jsxs("div",{
            className:"space-y-4",children:[Q.jsxs("div",{
              className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsxs("div",{
                className:"flex items-center justify-between",children:[Q.jsxs("div",{
                  className:"flex items-center gap-2",children:[(e=>e?Q.jsx(Eat,{
                    className:"h-5 w-5 text-green-500"
                  }):Q.jsx(Sat,{
                    className:"h-5 w-5 text-red-500"
                  }))(h?.status||!1),Q.jsx("span",{
                    className:"font-medium",children:e("dashboard:queue.status.running")
                  })]
                }),Q.jsx(nKt,{
                  variant:h?.status?"secondary":"destructive",children:e(h?.status?"dashboard:queue.status.normal":"dashboard:queue.status.abnormal")
                })]
              }),Q.jsx("div",{
                className:"text-sm text-muted-foreground",children:e("dashboard:queue.status.waitTime",{
                  seconds:h?.wait?.default||0
                })
              })]
            }),Q.jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[Q.jsx(Zot,{
                children:Q.jsxs(Yot,{
                  children:[Q.jsx(Xot,{
                    asChild:!0,children:Q.jsxs("div",{
                      className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsx("p",{
                        className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.recentJobs")
                      }),Q.jsx("p",{
                        className:"text-2xl font-bold",children:h?.recentJobs||0
                      }),Q.jsx(bKt,{
                        value:(h?.recentJobs||0)/(h?.periods?.recentJobs||1)*100,className:"h-1"
                      })]
                    })
                  }),Q.jsx(Qot,{
                    children:Q.jsx("p",{
                      children:e("dashboard:queue.details.statisticsPeriod",{
                        hours:h?.periods?.recentJobs||0
                      })
                    })
                  })]
                })
              }),Q.jsx(Zot,{
                children:Q.jsxs(Yot,{
                  children:[Q.jsx(Xot,{
                    asChild:!0,children:Q.jsxs("div",{
                      className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsx("p",{
                        className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.jobsPerMinute")
                      }),Q.jsx("p",{
                        className:"text-2xl font-bold",children:h?.jobsPerMinute||0
                      }),Q.jsx(bKt,{
                        value:(h?.jobsPerMinute||0)/(h?.queueWithMaxThroughput?.throughput||1)*100,className:"h-1"
                      })]
                    })
                  }),Q.jsx(Qot,{
                    children:Q.jsx("p",{
                      children:e("dashboard:queue.details.maxThroughput",{
                        value:h?.queueWithMaxThrou
```

#### ↳ `xtt` — Button

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

#### ↳ `s8e` — Card

```js
H.forwardRef(({
  className:e,...t
},n)=>Q.jsx("div",{
  ref:n,className:Im("rounded-xl border bg-card text-card-foreground shadow",e),...t
}))
```

#### ↳ `ptt` — ResponsiveDialogContent

```js
H.forwardRef(({
  className:e,drawerClassName:t,children:n,...i
},r)=>utt()?Q.jsx(stt,{
  className:Im("flex max-h-[90vh] flex-col",t),children:n
}):Q.jsx(pet,{
  ref:r,className:e,...i,children:n
}))
```

### `$$t`

```js
function $$t(){
  const[e,t]=H.useState("amount"),[n,i]=H.useState("30d"),[r,s]=H.useState({
    from:bS(new Date,7),to:new Date
  }),{
    t:o
  }=jy(),{
    startDate:a,endDate:l
  }=((e,t)=>{
    const n=ES(new Date);
    if("custom"===e&&t){
      const e=new Date(t.from.getFullYear(),t.from.getMonth(),t.from.getDate()),n=new Date(t.to.getFullYear(),
      t.to.getMonth(),t.to.getDate());
      return{
        startDate:LS(e),endDate:LS(n)
      }
    }let i;
    switch(e){
      case"7d":i=bS(n,7);
      break;
      case"30d":default:i=bS(n,30);
      break;
      case"90d":i=bS(n,90);
      break;
      case"180d":i=bS(n,180);
      break;
      case"365d":i=bS(n,365)
    }return{
      startDate:LS(i),endDate:LS(n)
    }
  })(n,r),c=e=>_S(ES(e),"yyyy-MM-dd"),{
    data:d
  }=pC({
    queryKey:["orderStat",{
      start_date:c(a),end_date:c(l)
    }],queryFn:async()=>{
      const{
        data:e
      }=await AL({
        start_date:c(a),end_date:c(l)
      });
      return e
    },refetchInterval:3e4
  });
  return Q.jsxs(s8e,{
    children:[Q.jsx(o8e,{
      children:Q.jsxs("div",{
        className:"flex items-center justify-between",children:[Q.jsxs("div",{
          children:[Q.jsx(a8e,{
            children:o("dashboard:overview.title")
          }),Q.jsxs(l8e,{
            children:[d?.summary.start_date," ",o("dashboard:overview.to")," ",d?.summary.end_date]
          })]
        }),Q.jsxs("div",{
          className:"flex items-center gap-2",children:[Q.jsxs("div",{
            className:"flex min-w-0 items-center gap-1",children:[Q.jsxs(yzt,{
              value:n,onValueChange:e=>i(e),children:[Q.jsx(Czt,{
                className:"w-[120px]",children:Q.jsx(wzt,{
                  placeholder:o("dashboard:overview.selectTimeRange")
                })
              }),Q.jsx(Nzt,{
                children:U$t.map(e=>Q.jsx(Lzt,{
                  value:e.value,children:o(e.label)
                },e.value))
              })]
            }),"custom"===n&&Q.jsxs(P$t,{
              children:[Q.jsx(j$t,{
                asChild:!0,children:Q.jsxs(xtt,{
                  variant:"outline",className:Im("min-w-0 justify-start text-left font-normal",!r&&"text-muted-foreground"),
                  children:[Q.jsx(vat,{
                    className:"mr-2 h-4 w-4 flex-shrink-0"
                  }),Q.jsx("span",{
                    className:"truncate",children:r?.from?r.to?Q.jsxs(Q.Fragment,{
                      children:[_S(r.from,"yyyy-MM-dd")," -"," ",_S(r.to,"yyyy-MM-dd")]
                    }):_S(r.from,"yyyy-MM-dd"):o("dashboard:overview.selectDate")
                  })]
                })
              }),Q.jsx(B$t,{
                className:"w-auto p-0",align:"end",children:Q.jsx(o$t,{
                  mode:"range",defaultMonth:r?.from,selected:{
                    from:r?.from,to:r?.to
                  },onSelect:e=>{
                    e?.from&&e?.to&&s({
                      from:e.from,to:e.to
                    })
                  },captionLayout:"dropdown",numberOfMonths:2
                })
              })]
            })]
          }),Q.jsx(rw,{
            value:e,onValueChange:e=>t(e),children:Q.jsxs(sw,{
              children:[Q.jsx(ow,{
                value:"amount",children:o("dashboard:overview.amount")
              }),Q.jsx(ow,{
                value:"count",children:o("dashboard:overview.count")
              })]
            })
          })]
        })]
      })
    }),Q.jsxs(c8e,{
      children:[Q.jsxs("div",{
        className:"grid grid-cols-2 gap-4",children:[Q.jsxs("div",{
          className:"space-y-1",children:[Q.jsx("div",{
            className:"text-sm text-muted-foreground",children:o("dashboard:overview.totalIncome")
          }),Q.jsxs("div",{
            className:"text-2xl font-bold",children:["¥",H$t(d?.summary?.paid_total||0)]
          }),Q.jsx("div",{
            className:"text-xs text-muted-foreground",children:o("dashboard:overview.totalTransactions",
            {
              count:d?.summary?.paid_count||0
            })
          }),Q.jsxs("div",{
            className:"text-xs text-muted-foreground",children:[o("dashboard:overview.avgOrderAmount")," ¥",
            H$t(d?.summary?.avg_paid_amount||0)]
          })]
        }),Q.jsxs("div",{
          className:"space-y-1",children:[Q.jsx("div",{
            className:"text-sm text-muted-foreground",children:o("dashboard:overview.totalCommission")
          }),Q.jsxs("div",{
            className:"text-2xl font-bold",children:["¥",H$t(d?.summary?.commission_total||0)]
          }),Q.jsx("div",{
            className:"text-xs text-muted-foreground",children:o("dashboard:overview.totalTransactions",
            {
              count:d?.summary?.commission_count||0
            })
          }),Q.jsxs("div",{
            className:"text-xs text-muted-foreground",children:[o("dashboard:overview.commissionRate")," ",
            d?.summary?.commission_rate.toFixed(2)||0,"%"]
          })]
        })]
      }),Q.jsx("div",{
        className:"h-[400px] w-full",children:Q.jsx(LSt,{
          width:"100%",height:"100%",children:Q.jsxs(QWt,{
            data:d?.list||[],margin:{
              top:20,right:20,left:0,bottom:0
            },children:[Q.jsxs("defs",{
              children:[Q.jsxs("linearGradient",{
                id:"incomeGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[Q.jsx("stop",{
                  offset:"0%",stopColor:V$t.gradient.start,stopOpacity:.2
                }),Q.jsx("stop",{
                  offset:"100%",stopColor:V$t.gradient.end,stopOpacity:.1
                })]
              }),Q.jsxs("linearGradient",{
                id:"commissionGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[Q.jsx("stop",{
                  offset:"0%",stopColor:W$t.gradient.start,stopOpacity:.2
                }),Q.jsx("stop",{
                  offset:"100%",stopColor:W$t.gradient.end,stopOpacity:.1
                })]
              })]
            }),Q.jsx(WVt,{
              dataKey:"date",axisLine:!1,tickLine:!1,tick:{
                fill:"hsl(var(--muted-foreground))",fontSize:12
              },tickFormatter:e=>_S(new Date(e),"MM-dd",{
                locale:Pzt
              })
            }),Q.jsx(QVt,{
              axisLine:!1,tickLine:!1,tick:{
                fill:"hsl(var(--muted-foreground))",fontSize:12
              },tickFormatter:t=>"amount"===e?`¥${H$t(t)}`:o("dashboard:overview.transactions",{
                count:t
              })
            }),Q.jsx(NBt,{
              strokeDasharray:"3 3",vertical:!1,stroke:"hsl(var(--border))",opacity:.3
            }),Q.jsx(XCt,{
              content:Q.jsx(z$t,{
              })
            }),"amount"===e?Q.jsxs(Q.Fragment,{
              children:[Q.jsx(sVt,{
                type:"monotone",dataKey:"paid_total",name:o("dashboard:overview.orderAmount"),stroke:V$t.main,
                fill:"url(#incomeGradient)",strokeWidth:2
              }),Q.jsx(sVt,{
                type:"m
```

#### ↳ `LSt`

```js
H.forwardRef(function(e,t){
  var n=e.aspect,i=e.initialDimension,r=void 0===i?{
    width:-1,height:-1
  }:i,s=e.width,o=void 0===s?"100%":s,a=e.height,l=void 0===a?"100%":a,c=e.minWidth,d=void 0===c?0:c,
  u=e.minHeight,h=e.maxHeight,g=e.children,p=e.debounce,m=void 0===p?0:p,f=e.id,_=e.className,
  v=e.onResize,b=e.style,y=void 0===b?{
  }:b,x=H.useRef(null),w=H.useRef();
  w.current=v,H.useImperativeHandle(t,function(){
    return Object.defineProperty(x.current,"current",{
      get:function(){
        return x.current
      },configurable:!0
    })
  });
  var C=NSt(H.useState({
    containerWidth:r.width,containerHeight:r.height
  }),2),S=C[0],k=C[1],N=H.useCallback(function(e,t){
    k(function(n){
      var i=Math.round(e),r=Math.round(t);
      return n.containerWidth===i&&n.containerHeight===r?n:{
        containerWidth:i,containerHeight:r
      }
    })
  },[]);
  H.useEffect(function(){
    var e=function(e){
      var t,n=e[0].contentRect,i=n.width,r=n.height;
      N(i,r),null===(t=w.current)||void 0===t||t.call(w,i,r)
    };
    m>0&&(e=xSt(e,m,{
      trailing:!0,leading:!1
    }));
    var t=new ResizeObserver(e),n=x.current.getBoundingClientRect(),i=n.width,r=n.height;
    return N(i,r),t.observe(x.current),function(){
      t.disconnect()
    }
  },[N,m]);
  var E=H.useMemo(function(){
    var e=S.containerWidth,t=S.containerHeight;
    if(e<0||t<0)return null;
    ift(gmt(o)||gmt(l),"The width(%s) and height(%s) are both fixed numbers,\n       maybe you don't need to use a ResponsiveContainer.",
    o,l),ift(!n||n>0,"The aspect(%s) must be greater than zero.",n);
    var i=gmt(o)?e:o,r=gmt(l)?t:l;
    n&&n>0&&(i?r=i/n:r&&(i=r*n),h&&r>h&&(r=h)),ift(i>0||r>0,"The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.",
    i,r,o,l,d,u,n);
    var s=!Array.isArray(g)&&Pmt(g.type).endsWith("Chart");
    return z.Children.map(g,function(e){
      return z.isValidElement(e)?H.cloneElement(e,SSt({
        width:i,height:r
      },s?{
        style:SSt({
          height:"100%",width:"100%",maxHeight:r,maxWidth:i
        },e.props.style)
      }:{
      })):e
    })
  },[n,g,l,h,u,d,S,o]);
  return z.createElement("div",{
    id:f?"".concat(f):void 0,className:Mp("recharts-responsive-container",_),style:SSt(SSt({
    },y),{
    },{
      width:o,height:l,minWidth:d,minHeight:u,maxHeight:h
    }),ref:x
  },E)
})
```

#### ↳ `z$t`

```js
({
  active:e,payload:t,label:n
})
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

### `uqt`

```js
function uqt({
  className:e
}
```

### `eKt`

```js
function eKt({
  className:e
}
```


## 同模块上下文（schema / 列工厂 / 常量）

```js
s||1)*100,className:"h-1"
})]
})
}),Q.jsx(Qot,{
  children:Q.jsx("p",{
    children:e("dashboard:queue.details.statisticsPeriod",{
      hours:h?.periods?.recentJobs||0
    })
  })
})]
})
}),Q.jsx(Zot,{
  children:Q.jsxs(Yot,{
    children:[Q.jsx(Xot,{
      asChild:!0,children:Q.jsxs("div",{
        className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsx("p",{
          className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.jobsPerMinute")
        }),Q.jsx("p",{
          className:"text-2xl font-bold",children:h?.jobsPerMinute||0
        }),Q.jsx(bKt,{
          value:(h?.jobsPerMinute||0)/(h?.queueWithMaxThroughput?.throughput||1)*100,className:"h-1"
        })]
      })
    }),Q.jsx(Qot,{
      children:Q.jsx("p",{
        children:e("dashboard:queue.details.maxThroughput",{
          value:h?.queueWithMaxThroughput?.throughput||0
        })
      })
    })]
  })
})]
})]
})
})]
}),Q.jsxs(s8e,{
  children:[Q.jsxs(o8e,{
    children:[Q.jsxs(a8e,{
      className:"flex items-center gap-2",children:[Q.jsx(Aat,{
        className:"h-5 w-5"
      }),e("dashboard:queue.jobDetails")]
    }),Q.jsx(l8e,{
      children:e("dashboard:queue.details.description")
    })]
  }),Q.jsx(c8e,{
    children:Q.jsxs("div",{
      className:"space-y-4",children:[Q.jsxs("div",{
        className:"grid grid-cols-2 gap-4",children:[Q.jsxs("div",{
          className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsx("p",{
            className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.failedJobs7Days")
          }),Q.jsxs("div",{
            className:"flex items-center gap-2",children:[Q.jsx("span",{
              className:"cursor-pointer text-2xl font-bold text-destructive hover:underline",title:e("dashboard:queue.details.viewFailedJobs"),
              onClick:()=>r(!0),style:{
                userSelect:"none"
              },children:h?.failedJobs||0
            }),Q.jsx(Wat,{
              className:"h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive",onClick:()=>r(!0),
              "aria-label":e("dashboard:queue.details.viewFailedJobs")
            })]
          }),Q.jsx("div",{
            className:"text-xs text-muted-foreground",children:e("dashboard:queue.details.retentionPeriod",
            {
              hours:h?.periods?.failedJobs||0
            })
          })]
        }),Q.jsxs("div",{
          className:"space-y-2 rounded-lg bg-muted/50 p-3",children:[Q.jsx("p",{
            className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.longestRunningQueue")
          }),Q.jsxs("p",{
            className:"text-2xl font-bold",children:[h?.queueWithMaxRuntime?.runtime||0,"s"]
          }),Q.jsx("div",{
            className:"truncate text-xs text-muted-foreground",children:h?.queueWithMaxRuntime?.name||"N/A"
          })]
        })]
      }),Q.jsxs("div",{
        className:"rounded-lg bg-muted/50 p-3",children:[Q.jsxs("div",{
          className:"flex items-center justify-between",children:[Q.jsx("span",{
            className:"text-sm text-muted-foreground",children:e("dashboard:queue.details.activeProcesses")
          }),Q.jsxs("span",{
            className:"font-medium",children:[h?.processes||0," /"," ",(h?.processes||0)+(h?.pausedMasters||0)]
          })]
        }),Q.jsx(bKt,{
          value:(h?.processes||0)/((h?.processes||0)+(h?.pausedMasters||0))*100,className:"mt-2 h-1"
        })]
      })]
    })
  })]
})]
}),Q.jsx(htt,{
  open:i,onOpenChange:r,children:Q.jsxs(ptt,{
    className:"max-h-[90vh] max-w-4xl overflow-y-auto",children:[Q.jsx(mtt,{
      children:Q.jsx(_tt,{
        children:e("dashboard:queue.details.failedJobsDetailTitle")
      })
    }),Q.jsxs("div",{
      className:"overflow-x-auto",children:[Q.jsx(HGt,{
        table:x,showPagination:!1,isLoading:f
      }),Q.jsx(AGt,{
        table:x
      }),0===v.length&&Q.jsx("div",{
        className:"py-8 text-center text-muted-foreground",children:e("dashboard:queue.details.noFailedJobs")
      })]
    }),Q.jsxs(ftt,{
      children:[Q.jsxs(xtt,{
        variant:"outline",onClick:()=>_(),children:[Q.jsx(hlt,{
          className:"mr-2 h-4 w-4"
        }),e("dashboard:common.refresh")]
      }),Q.jsx(btt,{
        asChild:!0,children:Q.jsx(xtt,{
          variant:"outline",children:e("common:close")
        })
      })]
    })]
  })
}),Q.jsx(htt,{
  open:d,onOpenChange:u,children:Q.jsxs(ptt,{
    className:"max-h-[90vh] max-w-4xl overflow-y-auto",children:[Q.jsx(mtt,{
      children:Q.jsx(_tt,{
        children:e("dashboard:queue.details.jobDetailTitle")
      })
    }),l&&Q.jsxs("div",{
      className:"space-y-5",children:[Q.jsxs("div",{
        className:"grid grid-cols-2 gap-4",children:[Q.jsxs("div",{
          className:"space-y-2",children:[Q.jsx("h3",{
            className:"text-sm font-medium text-muted-foreground",children:e("dashboard:queue.details.id")
          }),Q.jsx("p",{
            className:"break-all rounded-md bg-mute
```
