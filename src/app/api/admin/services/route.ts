import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured,requireOwner} from "@/lib/supabase";
export const dynamic="force-dynamic";
async function authorized(req:NextRequest){return isConfigured?requireOwner(req.headers.get("authorization")):null}
export async function GET(req:NextRequest){if(!await authorized(req))return NextResponse.json({error:"Acesso negado"},{status:401});const {data,error}=await adminClient().from("services").select("*").order("sort_order");return error?NextResponse.json({error:"Falha ao carregar serviços"},{status:500}):NextResponse.json({services:data},{headers:{"Cache-Control":"no-store"}})}
export async function POST(req:NextRequest){if(!await authorized(req))return NextResponse.json({error:"Acesso negado"},{status:401});let b:Record<string,unknown>;try{b=await req.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 const name=String(b.name||"").trim(),category=String(b.category||"").trim(),description=String(b.description||"").trim(),price_cents=Number(b.price_cents),duration_minutes=Number(b.duration_minutes),buffer_minutes=Number(b.buffer_minutes||0);
 if(name.length<3||name.length>90||category.length<2||category.length>60||description.length>700||!Number.isInteger(price_cents)||price_cents<0||price_cents>100000000||!Number.isInteger(duration_minutes)||duration_minutes<15||duration_minutes>480||!Number.isInteger(buffer_minutes)||buffer_minutes<0||buffer_minutes>120)return NextResponse.json({error:"Campos do serviço inválidos"},{status:400});
 const {data,error}=await adminClient().from("services").insert({name,category,description,price_cents,duration_minutes,buffer_minutes,active:true}).select("id").single();
 return error?NextResponse.json({error:"Falha ao criar serviço"},{status:500}):NextResponse.json({id:data.id},{status:201});
}
export async function PATCH(req:NextRequest){if(!await authorized(req))return NextResponse.json({error:"Acesso negado"},{status:401});let b:Record<string,unknown>;try{b=await req.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 if(typeof b.id!=="string"||!/^[0-9a-f-]{36}$/i.test(b.id))return NextResponse.json({error:"Serviço inválido"},{status:400});
 const patch:Record<string,unknown>={};
 for(const key of ["name","category","description"]){if(typeof b[key]==="string"){const v=(b[key] as string).trim();if(v.length>700)return NextResponse.json({error:"Texto muito longo"},{status:400});patch[key]=v}}
 for(const key of ["duration_minutes","buffer_minutes","price_cents","sort_order"]){if(b[key]!==undefined){const n=Number(b[key]);if(!Number.isInteger(n)||n<0||n>100000000)return NextResponse.json({error:"Número inválido"},{status:400});patch[key]=n}}
 if(typeof b.active==="boolean")patch.active=b.active;
 if(Object.keys(patch).length===0)return NextResponse.json({error:"Nenhuma alteração"},{status:400});
 const {error}=await adminClient().from("services").update(patch).eq("id",b.id);
 return error?NextResponse.json({error:"Não foi possível atualizar"},{status:500}):NextResponse.json({ok:true});
}
