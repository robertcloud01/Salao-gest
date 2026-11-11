import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured,requireOwner} from "@/lib/supabase";
export const dynamic="force-dynamic";
async function auth(req:NextRequest){return isConfigured?requireOwner(req.headers.get("authorization")):null}
export async function GET(req:NextRequest){if(!await auth(req))return NextResponse.json({error:"Acesso negado"},{status:401});
const db=adminClient();const [{data:staff,error:a},{data:hours,error:b},{data:links,error:c}]=await Promise.all([db.from("staff").select("id,name,title,role,active,sort_order").order("sort_order"),db.from("staff_hours").select("id,staff_id,weekday,starts_at,ends_at"),db.from("staff_services").select("staff_id,service_id")]);
if(a||b||c)return NextResponse.json({error:"Erro ao carregar equipe"},{status:500});return NextResponse.json({staff,hours,links},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){if(!await auth(req))return NextResponse.json({error:"Acesso negado"},{status:401});let b:{name?:string;title?:string};try{b=await req.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
const name=(b.name||"").trim(),title=(b.title||"").trim();if(name.length<2||name.length>100||title.length>100)return NextResponse.json({error:"Dados inválidos"},{status:400});
const {data,error}=await adminClient().from("staff").insert({name,title,role:"professional",active:true}).select("id").single();return error?NextResponse.json({error:"Erro ao cadastrar"},{status:500}):NextResponse.json({id:data.id},{status:201});
}
export async function PATCH(req:NextRequest){if(!await auth(req))return NextResponse.json({error:"Acesso negado"},{status:401});let b:{staffId?:string;serviceIds?:string[];weekday?:number;startsAt?:string;endsAt?:string;active?:boolean};try{b=await req.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
if(!b.staffId||!/^[0-9a-f-]{36}$/i.test(b.staffId))return NextResponse.json({error:"Profissional inválido"},{status:400});
const db=adminClient();
if(typeof b.active==="boolean"){const {error}=await db.from("staff").update({active:b.active}).eq("id",b.staffId).eq("role","professional");return error?NextResponse.json({error:"Erro ao atualizar"},{status:500}):NextResponse.json({ok:true})}
if(Array.isArray(b.serviceIds)){if(b.serviceIds.length>100||b.serviceIds.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))return NextResponse.json({error:"Serviços inválidos"},{status:400});
 const {error:a}=await db.from("staff_services").delete().eq("staff_id",b.staffId);if(a)return NextResponse.json({error:"Erro na vinculação"},{status:500});
 if(b.serviceIds.length){const {error:b2}=await db.from("staff_services").insert(b.serviceIds.map(service_id=>({staff_id:b.staffId,service_id})));if(b2)return NextResponse.json({error:"Erro na vinculação; revise a equipe."},{status:500})}
 return NextResponse.json({ok:true});
}
if(typeof b.weekday==="number"&&Number.isInteger(b.weekday)&&b.weekday>=0&&b.weekday<=6&&/^([01]\d|2[0-3]):[0-5]\d$/.test(b.startsAt||"")&&/^([01]\d|2[0-3]):[0-5]\d$/.test(b.endsAt||"")&&(b.startsAt||"")<(b.endsAt||"")){
 const {error:a}=await db.from("staff_hours").delete().eq("staff_id",b.staffId).eq("weekday",b.weekday);if(a)return NextResponse.json({error:"Erro ao alterar agenda"},{status:500});
 const {error:b2}=await db.from("staff_hours").insert({staff_id:b.staffId,weekday:b.weekday,starts_at:b.startsAt,ends_at:b.endsAt});return b2?NextResponse.json({error:"Não foi possível definir horário"},{status:500}):NextResponse.json({ok:true});
}
return NextResponse.json({error:"Atualização inválida"},{status:400});
}
