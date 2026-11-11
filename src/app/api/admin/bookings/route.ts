import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured,requireOwner} from "@/lib/supabase";
export const dynamic="force-dynamic";
async function authenticate(req:NextRequest){if(!isConfigured)return null;return requireOwner(req.headers.get("Authorization"))}
export async function GET(req:NextRequest){
 const owner=await authenticate(req);if(!owner)return NextResponse.json({error:"Acesso não autorizado"},{status:401});
 const db=adminClient();const from=new Date(Date.now()-30*86400000).toISOString(),to=new Date(Date.now()+90*86400000).toISOString();
 const {data,error}=await db.from("bookings").select("id,starts_at,ends_at,status,price_cents_snapshot,clients(name,email,phone),services(name),staff(name)").gte("starts_at",from).lte("starts_at",to).order("starts_at",{ascending:true}).limit(700);
 if(error)return NextResponse.json({error:"Erro ao carregar agendamentos"},{status:500});
 return NextResponse.json({bookings:data},{headers:{"Cache-Control":"no-store"}});
}
export async function PATCH(req:NextRequest){
 const owner=await authenticate(req);if(!owner)return NextResponse.json({error:"Acesso não autorizado"},{status:401});
 let body:{id?:string;status?:string};try{body=await req.json()}catch{return NextResponse.json({error:"Dados inválidos"},{status:400})}
 if(!body?.id||!/^[0-9a-f-]{36}$/i.test(body.id)||!["pending","confirmed","completed","cancelled","no_show"].includes(body.status||""))return NextResponse.json({error:"Atualização inválida"},{status:400});
 const {error}=await adminClient().from("bookings").update({status:body.status}).eq("id",body.id);
 if(error)return NextResponse.json({error:"Não foi possível atualizar a reserva"},{status:409});
 return NextResponse.json({ok:true});
}
