"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {CalendarDays,Users,Wallet,CheckCheck,RefreshCw,LogOut} from "lucide-react";
import {createClient} from "@supabase/supabase-js";
import {SiteNav} from "@/components/SiteNav";
import {formatMoney} from "@/lib/catalog";
type BookingRow={id:string;starts_at:string;ends_at:string;status:string;price_cents_snapshot:number;clients:{name:string,email:string,phone:string}|null;services:{name:string}|null;staff:{name:string}|null};
const labels:Record<string,string>={pending:"Pendente",confirmed:"Confirmado",completed:"Concluído",cancelled:"Cancelado",no_show:"Não compareceu"};
function browserClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?createClient(url,key):null}
export function ManagementDashboard(){
 const [sb]=useState(browserClient);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [token,setToken]=useState("");
 const [rows,setRows]=useState<BookingRow[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [ready,setReady]=useState(false);
 const load=async(t=token)=>{if(!t)return;setBusy(true);setError("");try{const res=await fetch("/api/admin/bookings",{headers:{Authorization:"Bearer "+t}});const data=await res.json();if(!res.ok)throw new Error(data.error||"Acesso negado");setRows(data.bookings||[])}catch(e){setError(e instanceof Error?e.message:"Erro ao carregar agenda")}finally{setBusy(false)}};
 useEffect(()=>{if(!sb){setReady(true);return}sb.auth.getSession().then(({data})=>{const t=data.session?.access_token||"";setToken(t);setReady(true);if(t)load(t)});const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>setToken(session?.access_token||""));return()=>subscription.unsubscribe()},[sb]);
 const login=async(e:React.FormEvent)=>{e.preventDefault();if(!sb){setError("Supabase ainda não configurado.");return}setBusy(true);setError("");const {data,error}=await sb.auth.signInWithPassword({email,password});setBusy(false);if(error){setError("Credenciais inválidas.");return}setToken(data.session?.access_token||"");setPassword("");if(data.session?.access_token)load(data.session.access_token)};
 const changeStatus=async(id:string,status:string)=>{if(!token)return;setBusy(true);const res=await fetch("/api/admin/bookings",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({id,status})});if(!res.ok){const data=await res.json();setError(data.error||"Erro ao atualizar status")}else await load();setBusy(false)};
 const signOut=async()=>{await sb?.auth.signOut();setToken("");setRows([])};
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Boa_Vista",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const todays=rows.filter(r=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Boa_Vista",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(r.starts_at))===today&&r.status!=="cancelled");
 const confirmed=rows.filter(r=>r.status==="confirmed");
 const revenue=rows.filter(r=>r.status==="completed").reduce((n,r)=>n+r.price_cents_snapshot,0);
 return <div className="dashboard"><SiteNav/><div className="dash-wrap"><div className="dash-heading"><div><span className="section-count">ATELIER / BACK OFFICE</span><h1>Gestão do salão.</h1><p>Uma agenda conectada a clientes, profissionais e serviços.</p></div>{token&&<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><Link className="btn btn-dark" href="/admin/configuracao">Configuração ↗</Link><Link className="btn btn-ghost" href="/admin/clientes">Clientes ↗</Link><Link className="btn btn-ghost" href="/admin/relatorios">Relatórios ↗</Link><button className="btn btn-ghost" onClick={signOut}>Sair <LogOut size={16}/></button></div>}</div>
 {!ready?<p>Verificando sessão...</p>:!token?<div className="admin-login"><span className="section-count">ACESSO RESTRITO</span><h2>Entre na sua conta.</h2><form onSubmit={login}><label className="form-field">E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="form-field">Senha<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" className="notice error">{error}</p>}<button className="btn btn-dark" disabled={busy}>{busy?"Entrando...":"Entrar no painel"}</button></form><p style={{fontSize:12,lineHeight:1.7,color:"#79695d"}}>Apenas usuários vinculados como proprietário ou gerente podem visualizar informações da agenda.</p></div>:<>
 <div className="dash-cards"><div className="metric"><CalendarDays size={18}/><span>Hoje</span><strong>{todays.length}</strong></div><div className="metric"><Users size={18}/><span>Agendamentos confirmados</span><strong>{confirmed.length}</strong></div><div className="metric"><CheckCheck size={18}/><span>Atendimentos concluídos</span><strong>{rows.filter(r=>r.status==="completed").length}</strong></div><div className="metric"><Wallet size={18}/><span>Receita concluída*</span><strong>{formatMoney(revenue)}</strong></div></div>
 <div className="dash-heading" style={{margin:"50px 0 22px"}}><h2 style={{fontFamily:"var(--serif)",fontWeight:500,fontSize:45,margin:0}}>Agenda & atendimentos</h2><button className="btn btn-ghost" onClick={()=>load()} disabled={busy}><RefreshCw size={17}/> Atualizar</button></div>{error&&<p className="notice error" role="alert">{error}</p>}
 <table className="dash-table"><thead><tr><th>Data / Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{new Date(r.starts_at).toLocaleString("pt-BR",{timeZone:"America/Boa_Vista",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</td><td><strong>{r.clients?.name||"—"}</strong><br/><small>{r.clients?.email}</small></td><td>{r.services?.name}</td><td>{r.staff?.name}</td><td>{formatMoney(r.price_cents_snapshot)}</td><td><select aria-label={"Status de "+(r.clients?.name||"reserva")} value={r.status} onChange={e=>changeStatus(r.id,e.target.value)} disabled={busy}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td></tr>)}</tbody></table>
 {rows.length===0&&!busy&&<p className="notice">Nenhum atendimento registrado no período disponível.</p>}
 <p style={{fontSize:12,color:"#8c7b6d",marginTop:25}}>* Soma dos serviços concluídos, não representa pagamento recebido. Dados da agenda exibidos são limitados aos últimos 30 dias e próximos 90 dias.</p>
 </>}
 </div></div>
}
