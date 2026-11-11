"use client";
import {useEffect,useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
/* React Bits AnimatedContent-inspired composition; original local adapter, without external runtime packages. */
export function Reveal({children,className="",delay=0,from=35}:{children:React.ReactNode;className?:string;delay?:number;from?:number}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduce)return;const ctx=gsap.context(()=>{gsap.fromTo(el,{autoAlpha:0,y:from},{autoAlpha:1,y:0,duration:1,ease:"power3.out",delay,scrollTrigger:{trigger:el,start:"top 92%",once:true}})},el);return()=>ctx.revert()},[delay,from]);
 return <div ref={ref} className={className}>{children}</div>
}
