import {NextRequest,NextResponse} from "next/server";
import {adminClient,isConfigured} from "@/lib/supabase";
import type {BookingPayload} from "@/lib/catalog";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isConfigured)return NextResponse.json({error:"Agendamento ainda não está ativado."},{status:503});
 let p:BookingPayload;try{p=await req.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 if(!p||!uuid.test(p.serviceId)||!uuid.test(p.professionalId)||!/^(20\d\d)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(p.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)||typeof p.name!=="string"||typeof p.email!=="string"||typeof p.phone!=="string"||typeof p.notes!=="undefined"&&typeof p.notes!=="string")return NextResponse.json({error:"Verifique os dados preenchidos."},{status:400});
 if(p.name.length>120||p.email.length>254||p.phone.length>24||(p.notes||"").length>500)return NextResponse.json({error:"Dados muito longos."},{status:400});
 const {data,error}=await adminClient().rpc("create_booking",{p_service:p.serviceId,p_staff:p.professionalId,p_date:p.date,p_time:p.time,p_name:p.name,p_email:p.email,p_phone:p.phone,p_notes:p.notes||null});
 if(error){const conflict=/Horário indisponível|conflict|exclusion/i.test(error.message);return NextResponse.json({error:conflict?"Este horário não está mais disponível. Escolha outro.":"Não foi possível concluir a reserva."},{status:conflict?409:422})}
 return NextResponse.json({id:data,status:"confirmed"},{status:201,headers:{"Cache-Control":"no-store"}});
}
