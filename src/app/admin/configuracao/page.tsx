import {AdminTools} from "@/components/AdminTools";
import Link from "next/link";
export default function Settings(){return <div className="dashboard"><header style={{padding:"23px 6vw",background:"#2a231f",color:"#fff",display:"flex",justifyContent:"space-between"}}><Link style={{fontFamily:"var(--serif)",fontSize:30}} href="/">ATELIER ✳</Link><Link href="/admin">← Voltar ao painel</Link></header><AdminTools/></div>}
