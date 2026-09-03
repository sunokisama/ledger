"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, Boxes, ChevronRight, CircleDollarSign, CreditCard, LayoutDashboard, LogOut, PackageOpen, Plus, Repeat2, Trash2, WalletCards, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Page = "home" | "transactions" | "proxy" | "accounts" | "reports";
type Tx = { id:number; title:string; amountMinor:number; currency:"JPY"|"CNY"; direction:"income"|"expense"; module:"daily"|"proxy"; account:string; note:string; occurredAt:string };

const examples: Tx[] = [
  { id:-1,title:"友都八喜 · 相机镜头",amountMinor:8480000,currency:"JPY",direction:"expense",module:"proxy",account:"三井住友卡",note:"代购买入",occurredAt:"2026-09-03T09:42:00Z" },
  { id:-2,title:"闲鱼 · Switch Lite",amountMinor:126000,currency:"CNY",direction:"income",module:"proxy",account:"支付宝",note:"售出 1 / 3",occurredAt:"2026-09-03T05:20:00Z" },
  { id:-3,title:"换汇批次 CNY-008",amountMinor:487200,currency:"CNY",direction:"income",module:"daily",account:"支付宝",note:"JPY → CNY · 汇率 0.04872",occurredAt:"2026-09-02T07:10:00Z" },
];
const nav = [["home","概览",LayoutDashboard],["transactions","流水",ArrowLeftRight],["proxy","代购",PackageOpen],["accounts","账户",WalletCards],["reports","报表",BarChart3]] as const;
const stock = [
  {name:"Switch Lite 日版",sold:1,total:3,cost:"JPY 64,800",profit:"预计 CNY 420"},
  {name:"限定版游戏套装",sold:2,total:6,cost:"JPY 118,000",profit:"预计 CNY 760"},
  {name:"真力 F1 音箱",sold:1,total:1,cost:"JPY 73,500",profit:"利润 JPY 8,240"},
];
const accounts = [
  {name:"PayPay",currency:"JPY",balance:"¥ 126,420",icon:WalletCards},
  {name:"三井住友卡",currency:"JPY",balance:"− ¥ 84,800",icon:CreditCard},
  {name:"支付宝",currency:"CNY",balance:"¥ 14,380",icon:WalletCards},
  {name:"微信",currency:"CNY",balance:"¥ 2,450",icon:WalletCards},
];

function amount(tx:Tx){return `${tx.currency==="JPY"?"¥":"CNY "}${(tx.amountMinor/100).toLocaleString("zh-CN",{maximumFractionDigits:2})}`}

export default function LedgerApp({displayName}:{displayName:string}){
  const [page,setPage]=useState<Page>("home");
  const [currency,setCurrency]=useState<"JPY"|"CNY">("JPY");
  const [rows,setRows]=useState<Tx[]>([]);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const shown=rows.length?rows:examples;

  useEffect(()=>{fetch("/api/transactions").then(r=>r.ok?r.json():Promise.reject()).then(d=>setRows(d.transactions??[])).catch(()=>setError("在线账本暂时不可用，当前显示示例数据")).finally(()=>setLoading(false))},[]);
  const totals=useMemo(()=>rows.reduce((a,t)=>{a[t.currency]+=(t.direction==="income"?1:-1)*t.amountMinor/100;return a},{JPY:982400,CNY:14380}),[rows]);

  async function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setSaving(true);setError("");
    const payload=Object.fromEntries(new FormData(e.currentTarget).entries());
    try{const r=await fetch("/api/transactions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error);setRows(old=>[data.transaction,...old]);setOpen(false)}catch(e){setError(e instanceof Error?e.message:"保存失败")}finally{setSaving(false)}
  }
  async function remove(id:number){if(id<0)return;const before=rows;setRows(v=>v.filter(x=>x.id!==id));const r=await fetch(`/api/transactions?id=${id}`,{method:"DELETE"});if(!r.ok){setRows(before);setError("删除失败，请重试")}}

  const title={home:"晚上好",transactions:"流水",proxy:"代购",accounts:"账户",reports:"报表"}[page];
  return <div className="ledger-shell">
    <aside className="ledger-sidebar">
      <div className="ledger-brand"><span><Waves/></span>流转账本</div>
      <nav>{nav.map(([key,label,Icon])=><button key={key} className={page===key?"active":""} onClick={()=>setPage(key)}><Icon/>{label}</button>)}</nav>
      <div className="ledger-user"><b>{displayName.slice(0,1).toUpperCase()}</b><div><strong>{displayName}</strong><small>已安全同步</small></div><a href="/signout-with-chatgpt?return_to=/" aria-label="退出"><LogOut/></a></div>
    </aside>
    <main className="ledger-main">
      <header><div><h1>{title}</h1><p>{page==="home"?"查看资金与代购周转情况":"原币记录，统一管理"}</p></div><div className="ledger-actions"><Button variant="outline" onClick={()=>setCurrency(currency==="JPY"?"CNY":"JPY")}>{currency}</Button><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus/>记一笔</Button></DialogTrigger><DialogContent onPointerDownOutside={e=>e.preventDefault()}><form onSubmit={add}><DialogHeader><DialogTitle>新增交易</DialogTitle><DialogDescription>金额按实际支付或收到的原币保存。</DialogDescription></DialogHeader><div className="ledger-form"><label>名称<Input name="title" placeholder="例如：Switch Lite" required/></label><label>金额<Input name="amount" type="number" min="0.01" step="0.01" placeholder="0" required/></label><label>币种<Select name="currency" defaultValue="JPY"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="JPY">JPY 日元</SelectItem><SelectItem value="CNY">CNY 人民币</SelectItem></SelectContent></Select></label><label>收支<Select name="direction" defaultValue="expense"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="expense">支出</SelectItem><SelectItem value="income">收入</SelectItem></SelectContent></Select></label><label>类型<Select name="module" defaultValue="proxy"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="proxy">代购</SelectItem><SelectItem value="daily">日常</SelectItem></SelectContent></Select></label><label>账户<Input name="account" placeholder="PayPay / 支付宝" required/></label><label className="wide">备注<Input name="note" placeholder="可选"/></label></div><DialogFooter><Button type="submit" disabled={saving}>{saving?"保存中…":"保存交易"}</Button></DialogFooter></form></DialogContent></Dialog></div></header>
      {error&&<div className="ledger-alert" role="alert">{error}<button onClick={()=>setError("")}>关闭</button></div>}

      {page==="home"&&<><section className="ledger-summary"><article className="ledger-card balance"><span>可用资金（折算）</span><strong>{currency==="JPY"?"¥ 1,284,560":"CNY 61,234"}</strong><small>{currency==="JPY"?"约 CNY 61,234":"约 JPY 1,284,560"} · 原币始终保留</small><div className="money-pools"><div><em>日本资金池</em><b>JPY {totals.JPY.toLocaleString()}</b></div><div><em>中国资金池</em><b>CNY {totals.CNY.toLocaleString()}</b></div></div></article><article className="ledger-card metric"><i><CircleDollarSign/></i><span>本月代购净利润</span><strong>¥ 42,680</strong><small>商品毛利 46,120 · 汇兑 −3,440</small></article><article className="ledger-card metric"><i><Boxes/></i><span>当前库存</span><strong>19 件</strong><small>7 种商品 · 4 件等待带回</small></article></section><section className="ledger-home-grid"><TransactionCard rows={shown.slice(0,4)} loading={loading} more={()=>setPage("transactions")}/><StockCard more={()=>setPage("proxy")}/></section></>}
      {page==="transactions"&&<section className="ledger-card content"><Title title="全部流水" subtitle={rows.length?`${rows.length} 条真实记录`:"当前为示例数据，新增后开始正式记账"}/><div className="tx-list"><TxRows rows={shown} remove={remove}/></div></section>}
      {page==="proxy"&&<section className="ledger-card content"><Title title="代购库存" subtitle="部分售出不会结束整个商品批次" action="新增商品"/><div className="inventory-grid">{stock.map(x=><article className="inventory" key={x.name}><div><PackageOpen/><span>{x.sold===x.total?"已售罄":"在售"}</span></div><h3>{x.name}</h3><p>买入成本 {x.cost}</p><div className="track"><i style={{width:`${x.sold/x.total*100}%`}}/></div><footer><span>已售 {x.sold} / {x.total}</span><strong>{x.profit}</strong></footer></article>)}</div></section>}
      {page==="accounts"&&<section className="ledger-card content"><Title title="资金账户" subtitle="余额不跨币种硬加" action="新增账户"/><div className="account-grid">{accounts.map(({name,currency:cur,balance,icon:Icon})=><article className="account" key={name}><i><Icon/></i><div><small>{cur} 账户</small><h3>{name}</h3><strong>{balance}</strong></div><ChevronRight/></article>)}</div></section>}
      {page==="reports"&&<section className="report-grid"><article className="ledger-card content"><Title title="利润构成" subtitle="本月 · JPY 折算"/><div className="bars">{[["商品毛利","82%","+46,120",""],["运费与手续费","31%","−12,460","cost"],["信用卡返点","18%","+9,020",""],["汇兑损益","10%","−3,440","cost"]].map(([n,w,v,c])=><div key={n}><span>{n}</span><i className={c} style={{width:w}}/><b>{v}</b></div>)}</div></article><article className="ledger-card content"><Title title="换汇批次" subtitle="人民币资金 FIFO"/><div className="batch"><Repeat2/><div><strong>CNY-008</strong><span>剩余 CNY 3,612</span></div><b>@ 0.04872</b></div><div className="batch"><Repeat2/><div><strong>CNY-007</strong><span>已使用完毕</span></div><b>@ 0.04795</b></div></article></section>}
    </main>
    <nav className="mobile-nav">{nav.map(([key,label,Icon])=><button key={key} className={page===key?"active":""} onClick={()=>setPage(key)}><Icon/><span>{label}</span></button>)}</nav>
  </div>
}

function Title({title,subtitle,action}:{title:string;subtitle:string;action?:string}){return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div>{action&&<Button><Plus/>{action}</Button>}</div>}
function TransactionCard({rows,loading,more}:{rows:Tx[];loading:boolean;more:()=>void}){return <section className="ledger-card content"><div className="section-title"><div><h2>最近流水</h2><p>{loading?"正在同步…":"原币金额与业务类型"}</p></div><button className="more" onClick={more}>查看全部 <ChevronRight/></button></div><div className="tx-list"><TxRows rows={rows}/></div></section>}
function TxRows({rows,remove}:{rows:Tx[];remove?:(id:number)=>void}){return <>{rows.map(t=><div className="tx" key={t.id}><i className={t.direction}>{t.direction==="income"?<ArrowDownLeft/>:<ArrowUpRight/>}</i><div><strong>{t.title}</strong><span>{t.module==="proxy"?"代购":"日常"} · {t.account} · {t.note}</span></div><div className={`tx-amount ${t.direction}`}><strong>{t.direction==="income"?"+":"−"} {amount(t)}</strong><span>{new Date(t.occurredAt).toLocaleDateString("zh-CN")}</span></div>{remove&&t.id>0?<Button variant="ghost" size="icon" aria-label="删除交易" onClick={()=>remove(t.id)}><Trash2/></Button>:null}</div>)}</>}
function StockCard({more}:{more:()=>void}){return <section className="ledger-card content"><div className="section-title"><div><h2>库存进度</h2><p>按商品批次管理</p></div><button className="more" onClick={more}>管理 <ChevronRight/></button></div>{stock.map(x=><div className="stock" key={x.name}><div><strong>{x.name}</strong><span>已售 {x.sold} / {x.total}</span></div><div className="track"><i style={{width:`${x.sold/x.total*100}%`}}/></div><footer><span>剩余 {x.total-x.sold} 件</span><b>{x.profit}</b></footer></div>)}</section>}
