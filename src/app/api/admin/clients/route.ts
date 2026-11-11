import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured,requireOwner} from "@/lib/supabase";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!isConfigured)return NextResponse.json({error:"Banco indisponível"},{status:503});if(!await requireOwner(req.headers.get("authorization")))return NextResponse.json({error:"Acesso negado"},{status:401});
 const q=(req.nextUrl.searchParams.get("q")||"").trim().slice(0,80);
 let query=adminClient().from("clients").select("id,name,email,phone,created_at").order("created_at",{ascending:false}).limit(200);
 if(q){const safe=q.replace(/[%_,()]/g,"");query=query.or("name.ilike.%"+safe+"%,email.ilike.%"+safe+"%")}
 const {data,error}=await query;if(error)return NextResponse.json({error:"Erro ao carregar clientes"},{status:500});
 return NextResponse.json({clients:data},{headers:{"Cache-Control":"no-store"}});
}
