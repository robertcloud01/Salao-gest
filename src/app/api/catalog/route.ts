import {NextResponse} from "next/server";
import {adminClient,isConfigured} from "@/lib/supabase";
import {demoServices,demoProfessionals} from "@/lib/catalog";
export const dynamic="force-dynamic";
export async function GET(){
 if(!isConfigured)return NextResponse.json({configured:false,services:demoServices,professionals:demoProfessionals,offerings:{}});
 try{const db=adminClient();const [{data:services,error:a},{data:professionals,error:b},{data:relations,error:c}]=await Promise.all([db.from("services").select("id,name,category,description,duration_minutes,price_cents,image_url").eq("active",true).order("sort_order"),db.from("staff").select("id,name,title,photo_url").eq("active",true).order("sort_order"),db.from("staff_services").select("staff_id,service_id")]);if(a||b||c)throw a||b||c;const offerings:Record<string,string[]>={};for(const row of relations||[]){offerings[row.staff_id]??=[];offerings[row.staff_id].push(row.service_id)}return NextResponse.json({configured:true,services:(services||[]).map(s=>({...s,image:s.image_url})),professionals,offerings},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({configured:false,services:demoServices,professionals:demoProfessionals,offerings:{},setupError:true},{status:503})}
}
