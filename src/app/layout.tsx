import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
const sans=DM_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
const serif=Cormorant_Garamond({subsets:["latin"],weight:["400","500","600"],style:["normal","italic"],variable:"--font-serif",display:"swap"});
export const metadata: Metadata = {title:{default:"ATELIER — Salão & Beauty Studio",template:"%s | ATELIER"},description:"Uma experiência de beleza feita com tempo, técnica e sensibilidade. Conheça nossos rituais e agende seu horário.",robots:{index:false,follow:false},openGraph:{title:"ATELIER — Salão & Beauty Studio",description:"Beleza com assinatura. Um ritual só seu.",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" data-type="place"><body className={sans.variable+" "+serif.variable}>{children}</body></html>}
