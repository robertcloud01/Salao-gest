import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured} from "@/lib/supabase";
export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 if(!isConfigured)return NextResponse.json({slots:[],configured:false});
 const p=req.nextUrl.searchParams;const s=p.get("serviceId")||"",staff=p.get("professionalId")||"",date=p.get("date")||"";
 if(!uuid.test(s)||!uuid.test(staff)||!/^(20\d\d)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date))return NextResponse.json({error:"Parâmetros inválidos"},{status:400});
 const {data,error}=await adminClient().rpc("available_slots",{p_service:s,p_staff:staff,p_date:date});if(error)return NextResponse.json({error:"Agenda indisponível"},{status:503});
 return NextResponse.json({slots:(data||[]).map((x:{slot:string})=>x.slot),configured:true},{headers:{"Cache-Control":"no-store"}});
}
