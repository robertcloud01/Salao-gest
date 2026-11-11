import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured,requireOwner} from "@/lib/supabase";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 if(!isConfigured)return NextResponse.json({error:"Banco indisponível"},{status:503});
 if(!await requireOwner(req.headers.get("authorization")))return NextResponse.json({error:"Não autorizado"},{status:401});
 const month=req.nextUrl.searchParams.get("month")||new Date().toISOString().slice(0,7);
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:"Mês inválido"},{status:400});
 const from=month+"-01T00:00:00.000Z",to=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),1)).toISOString();
 const db=adminClient();const {data,error}=await db.from("bookings").select("id,status,starts_at,price_cents_snapshot,service_id,staff_id,clients(id,name,email,phone),services(name),staff(name)").gte("starts_at",from).lt("starts_at",to).limit(5000);
 if(error)return NextResponse.json({error:"Não foi possível gerar o relatório"},{status:500});
 const items=data||[];const totals={appointments:items.length,completed:0,cancelled:0,noShow:0,expectedRevenueCents:0,completedValueCents:0,distinctClients:0};
 const seen=new Set<string>();const serviceTotals:Record<string,{name:string,count:number,valueCents:number}>={};const professionalTotals:Record<string,{name:string,count:number,valueCents:number}>={};
 for(const row of items){if(row.status==="cancelled")totals.cancelled++;if(row.status==="no_show")totals.noShow++;if(row.status==="completed"){totals.completed++;totals.completedValueCents+=row.price_cents_snapshot}if(row.status==="confirmed"||row.status==="completed")totals.expectedRevenueCents+=row.price_cents_snapshot;
 const client=Array.isArray(row.clients)?row.clients[0]:row.clients;if(client)seen.add(client.id);
 const svc=Array.isArray(row.services)?row.services[0]:row.services;const pro=Array.isArray(row.staff)?row.staff[0]:row.staff;
 if(row.status!=="cancelled"){const s=serviceTotals[row.service_id]??={name:svc?.name||"Serviço",count:0,valueCents:0};s.count++;if(row.status==="completed")s.valueCents+=row.price_cents_snapshot;
 const p=professionalTotals[row.staff_id]??={name:pro?.name||"Profissional",count:0,valueCents:0};p.count++;if(row.status==="completed")p.valueCents+=row.price_cents_snapshot}}
 totals.distinctClients=seen.size;
 return NextResponse.json({month,totals,services:Object.values(serviceTotals).sort((a,b)=>b.count-a.count),professionals:Object.values(professionalTotals).sort((a,b)=>b.count-a.count)},{headers:{"Cache-Control":"no-store"}});
}
