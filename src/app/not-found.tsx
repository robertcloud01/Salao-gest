import Link from "next/link";
export default function NotFound(){return <main style={{minHeight:"100svh",display:"grid",placeContent:"center",textAlign:"center",background:"#211c1a",color:"#f2eee8",gap:"24px"}}><h1 style={{fontSize:"min(18vw,120px)",fontFamily:"serif"}}>404</h1><p>Não encontramos esta página.</p><Link href="/" style={{color:"#d2b79b"}}>Voltar ao início ↗</Link></main>}
