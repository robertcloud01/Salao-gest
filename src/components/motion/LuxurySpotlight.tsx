"use client";
import {useState} from "react";
import type {CSSProperties,MouseEvent,ReactNode} from "react";
/* React Bits SpotlightCard pattern, tuned for photography-led service cards. */
export function LuxurySpotlight({children,className=""}:{children:ReactNode;className?:string}){
 const [pos,setPos]=useState({x:50,y:50});
 const move=(event:MouseEvent<HTMLDivElement>)=>{const r=event.currentTarget.getBoundingClientRect();setPos({x:(event.clientX-r.left)/r.width*100,y:(event.clientY-r.top)/r.height*100})};
 return <div onMouseMove={move} className={"luxury-spotlight "+className} style={{"--spot-x":pos.x+"%","--spot-y":pos.y+"%"} as CSSProperties}>{children}</div>
}
