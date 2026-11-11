"use client";
import AnimatedContent from "@/components/react-bits/AnimatedContent";
// The official React Bits AnimatedContent powers all editorial entrance reveals.
export function Reveal({children,className="",delay=0,from=35}:{children:React.ReactNode;className?:string;delay?:number;from?:number}){
 return <AnimatedContent className={className} distance={from} duration={1} delay={delay} threshold={0.08} once>{children}</AnimatedContent>;
}
