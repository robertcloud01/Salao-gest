export type Service = { id: string; name: string; description: string; duration_minutes: number; price_cents: number; category: string; image?: string; active?: boolean };
export type Professional = { id: string; name: string; title: string; photo_url?: string; active?: boolean };
export type BookingPayload = { serviceId: string; professionalId: string; date: string; time: string; name: string; email: string; phone: string; notes?: string };
export const formatMoney = (cents: number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(cents/100);
export const demoServices: Service[] = [
 {id:"demo-cut",name:"Corte & Styling",category:"Cabelo",description:"Uma assinatura de corte com movimento e acabamento personalizado.",duration_minutes:60,price_cents:19000,image:"https://images.unsplash.com/photo-1560869713-bf165a9cfac8?auto=format&fit=crop&w=900&q=85"},
 {id:"demo-color",name:"Coloração Signature",category:"Cor",description:"Cor autoral, técnica de precisão e brilho em cada detalhe.",duration_minutes:150,price_cents:48000,image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85"},
 {id:"demo-treatment",name:"Ritual de Tratamento",category:"Tratamentos",description:"Cuidado sensorial dedicado à saúde e textura dos fios.",duration_minutes:90,price_cents:29000,image:"https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85"},
 {id:"demo-makeup",name:"Beauty Experience",category:"Makeup",description:"Maquiagem com expressão elegante e acabamento editorial.",duration_minutes:75,price_cents:32000,image:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=85"}
];
export const demoProfessionals: Professional[] = [
 {id:"demo-luiza",name:"Luiza Martins",title:"Hair Artist",photo_url:"https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=650&q=85"},
 {id:"demo-rafa",name:"Rafaela Costa",title:"Color Specialist",photo_url:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=650&q=85"},
 {id:"demo-ana",name:"Ana Lima",title:"Beauty Artist",photo_url:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=650&q=85"}
];
export const photo = {
 hero:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2200&q=88",
 editorial:"https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=85",
 ritual:"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=85",
 portrait:"https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=1100&q=85",
 space:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85"
};
