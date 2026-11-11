import { createClient } from "@supabase/supabase-js";
export const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
export function publicClient() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url || !key) throw new Error("Supabase não configurado");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function adminClient() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url || !key) throw new Error("Supabase não configurado");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function requireOwner(bearer: string|null) {
 if(!bearer?.startsWith("Bearer ")) return null;
 const sb=adminClient();
 const {data:{user},error}=await sb.auth.getUser(bearer.slice(7));
 if(error || !user) return null;
 const {data}=await sb.from("staff").select("id,role").eq("auth_user_id",user.id).in("role",["owner","manager"]).eq("active",true).maybeSingle();
 return data ? {user,staff:data} : null;
}
