"use client";
import { ArrowDown, Play } from "lucide-react";
import "./pencil-reverie.css";

const asset = "/templates/pencil-reverie/";
type Props = { stage:"cover"|"envelope"; names:string; date:string; onOpen:()=>void; isWedding?:boolean; hashtag?:string|null };
export default function PencilReverieScene({stage,names,date,onOpen,isWedding=true,hashtag}:Props) {
 const people=names.split(/\s*&\s*/).filter(Boolean);
 const title=isWedding && people.length===2 ? <>{people[0]}<em>&amp;</em>{people[1]}</> : names;
 return <section className={`pr-scene pr-${stage}`} data-invitation-section={stage}>
  <span className="pr-paper-grain" aria-hidden="true"/>
  {stage==="envelope" ? <>
   <div className="pr-envelope-heading"><span>SEBUAH UNDANGAN</span><p>Untuk satu cerita yang<br/>masih terus ditulis…</p></div>
   <div className="pr-scrapbook" aria-hidden="true">
    <span className="pr-washi-tape pr-tape-one"/><span className="pr-washi-tape pr-tape-two"/>
    <img className="pr-scrapbook-city" src={asset+"streetlamp.png"} alt=""/>
    <img className="pr-scrapbook-couple" src={asset+"couplesitting.png"} alt=""/>
    <img className="pr-scrapbook-tape" src={asset+"casette.png"} alt=""/>
    <img className="pr-scrapbook-ribbon" src={asset+"ribbon.png"} alt=""/>
    <span className="pr-pencil-heart">♡</span>
   </div>
   <button className="pr-open" type="button" onClick={onOpen}><Play size={14} aria-hidden="true"/>Buka Undangan</button>
  </> : <>
   <div className="pr-cover-caption">{isWedding?"THE WEDDING OF":"SEBUAH UNDANGAN"}</div>
   <h1 className="pr-cover-names">{title}</h1>
   <p className="pr-cover-date">{date}</p>
   <span className="pr-cover-doodle" aria-hidden="true">♡</span>
   <img className="pr-cover-lamp" src={asset+"streetlamp.png"} alt="" aria-hidden="true"/>
   <img className="pr-cover-cycle" src={asset+"bycicle.png"} alt="" aria-hidden="true"/>
   <img className="pr-cover-couple" src={asset+"couplesitting.png"} alt="" aria-hidden="true"/>
   {hashtag?.trim() && <p className="pr-cover-hashtag">{hashtag}</p>}
   <button className="pr-scroll" type="button" aria-label="Ke bagian berikutnya" onClick={e=>e.currentTarget.closest("section")?.nextElementSibling?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}><ArrowDown size={18}/></button>
  </>}
 </section>;
}
