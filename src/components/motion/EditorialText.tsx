"use client";
import {useEffect,useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
/* React Bits ScrollFloat art direction: masked word reveal, accessible text preserved. */
export function EditorialText({text,className=""}:{text:string;className?:string}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const pieces=el.querySelectorAll(".word-motion");const ctx=gsap.context(()=>{gsap.fromTo(pieces,{yPercent:110,rotate:3,opacity:0},{yPercent:0,rotate:0,opacity:1,stagger:.09,duration:1.1,ease:"power4.out",scrollTrigger:{trigger:el,start:"top 85%",once:true}})},el);return()=>ctx.revert()},[text]);
 return <span aria-label={text} ref={ref} className={className}>{text.split(" ").map((w,i)=><span key={i} aria-hidden="true" className="word-wrap"><span className="word-motion">{w}</span></span>)}</span>
}
