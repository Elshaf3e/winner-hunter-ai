/* Ad research helpers: local records, explicit dates, conservative supplier matches. */
(function(root,factory){const api=factory(root.TelegramDiscovery||(typeof require==='function'?require('./trending'):null));if(typeof module==='object'&&module.exports)module.exports=api;else root.AdSpy=api})(typeof globalThis!=='undefined'?globalThis:this,function(TG){
'use strict';
const DAY=86400000;
const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v||'')))return '';const d=new Date(v+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v?v:''};
const duration=a=>{const first=date(a.first_seen),last=date(a.last_seen);if(!first||!last||last<first)return null;return Math.floor((Date.parse(last)-Date.parse(first))/DAY)+1};
const level=a=>{const n=duration(a);return n===null?'unverified':n>=200?'super':n>=50?'winner':'good'};
function filter(ads,f={}){const q=TG.normalize(f.search||''),adv=TG.normalize(f.advertiser||'');return ads.filter(a=>{
 const n=duration(a),col=date(a.collection_date);
 return (!q||TG.normalize([a.title,a.advertiser,a.ad_text,a.category].join(' ')).includes(q))&&(!adv||TG.normalize(a.advertiser).includes(adv))&&(!f.platform||f.platform==='all'||a.platform===f.platform)&&(!f.country||TG.normalize(a.country)===TG.normalize(f.country))&&(!f.status||f.status==='all'||(a.status||'unknown')===f.status)&&(!f.from||col&&col>=f.from)&&(!f.to||col&&col<=f.to)&&(!f.minDays||n!==null&&n>=Number(f.minDays))&&(!f.level||f.level==='all'||level(a)===f.level)&&(!f.destination||f.destination==='all'||a.destination_type===f.destination)&&(!f.collection||f.collection==='all'||(a.collections||[]).includes(f.collection));
 }).sort((a,b)=>f.sort==='copies'?Number(b.copies||0)-Number(a.copies||0):f.sort==='duration'?(duration(b)??-1)-(duration(a)??-1):String(b.collection_date||'').localeCompare(String(a.collection_date||''))||Number(b.id)-Number(a.id))}
function matches(title,products){return products.filter(p=>p.offers.every(o=>TG.similar(title,o.title)))}
const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const csv=(rows,fields)=>'\uFEFF'+fields.join(',')+'\r\n'+rows.map(row=>fields.map(k=>csvCell(Array.isArray(row[k])?row[k].join(' | '):row[k])).join(',')).join('\r\n');
function zip(files){const chunks=[],central=[];let offset=0;const enc=new TextEncoder();const u16=n=>[n&255,n>>>8&255],u32=n=>[n&255,n>>>8&255,n>>>16&255,n>>>24&255];
 const crc=bytes=>{let c=-1;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=c&1?(c>>>1)^0xedb88320:c>>>1}return(c^-1)>>>0};
 for(const f of files){const name=enc.encode(String(f.name).replace(/[\\/\x00-\x1f]/g,'_').slice(0,180)),data=f.data instanceof Uint8Array?f.data:new Uint8Array(f.data),sum=crc(data),size=data.length;const header=new Uint8Array([80,75,3,4,20,0,0,0,0,0,0,0,0,0,...u32(sum),...u32(size),...u32(size),...u16(name.length),0,0]);chunks.push(header,name,data);central.push(new Uint8Array([80,75,1,2,20,0,20,0,0,0,0,0,0,0,0,0,...u32(sum),...u32(size),...u32(size),...u16(name.length),0,0,0,0,0,0,0,0,0,0,0,0,...u32(offset)]),name);offset+=header.length+name.length+size}
 const start=offset;for(const c of central)offset+=c.length;chunks.push(...central,new Uint8Array([80,75,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(offset-start),...u32(start),0,0]));return new Blob(chunks,{type:'application/zip'})}
return {date,duration,level,filter,matches,csv,zip};
});
