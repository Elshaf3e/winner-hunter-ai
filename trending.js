/* Deterministic Telegram discovery core. No network calls or inference APIs. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TelegramDiscovery=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DAY=86400000;
const digits=s=>String(s??'').replace(/[٠-٩۰-۹]/g,c=>'٠١٢٣٤٥٦٧٨٩'.includes(c)?'٠١٢٣٤٥٦٧٨٩'.indexOf(c):'۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
const normalize=s=>digits(s).toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670ـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}.]+/gu,' ').trim().replace(/\s+/g,' ');
const textOf=value=>typeof value==='string'?value:Array.isArray(value)?value.map(textOf).join(''):value&&typeof value.text==='string'?value.text:'';
const categories=['المنزل والمطبخ','إكسسوارات السيارات','الجمال والعناية','أجهزة ذكية وإلكترونيات','منتجات يومية وحلول عملية','غير مصنف'];
function category(text){const n=normalize(text);if(/سيار|عربيه|قياده/.test(n))return categories[1];if(/شعر|حلاق|بشر|تجميل|تدليك|تدفئه/.test(n))return categories[2];if(/مطبخ|خضار|منزل|بخار|تنظيف|مواعين|طعام/.test(n))return categories[0];if(/هاتف|موبايل|شاحن|سماع|الكترون|ذكي|led|usb/.test(n))return categories[3];if(/حامل|منظم|شنطه|حقيبه|مصباح|تمرين/.test(n))return categories[4];return categories[5]}
function priceOf(text){const d=digits(text).replace(/٬/g,',').replace(/٫/g,'.');const values=[];const re=/(?:السعر|سعر(?:\s+الجمل[ةه])?|بسعر|price)\s*[:：=\-]?\s*([0-9][0-9,.]*)\s*(جنيه|ج\.م|ج\b|ج(?=\s|$)|egp|le)?|([0-9][0-9,.]*)\s*(جنيه|ج\.م|ج(?=\s|$)|egp|le)/gi;
 // Currency must be explicit: a bare labelled number could be foreign currency.
 const currency=/جنيه|ج\.م|(?:^|\s)ج(?:\s|$)|egp|\ble\b/i;
 if(!currency.test(d))return null;
 // Do not interpret old/new prices, ranges or foreign currency as one exact offer.
 if(/دولار|ريال|درهم|\$|usd|sar|aed|بدلا|بدلاً|من\s+\d+\s*(?:جنيه|ج|egp)?\s*(?:إلى|الى|لحد)|\d+\s*[-–]\s*\d+/.test(d))return null;
 let m;while((m=re.exec(d))){const raw=m[1]||m[3];const number=Number(raw.replace(/,(?=\d{3}(?:\D|$))/g,'').replace(',','.'));if(Number.isFinite(number)&&number>0)values.push(number)}
 const unique=[...new Set(values)];return unique.length===1?unique[0]:null;
}
function titleOf(text){const lines=text.split(/\n/).map(s=>s.trim()).filter(Boolean);const line=lines.find(s=>!/(?:السعر|للتواصل|واتس|whatsapp|https?:|t\.me|اقل كميه|أقل كمية|حد أدنى|الحد الادنى|متاح شحن|جملة فقط)/i.test(s)&&/[\p{L}]/u.test(s));return line?line.replace(/^[^\p{L}\p{N}]+/u,'').slice(0,180):''}
function variantSignature(title){const n=normalize(title);const latin=n.match(/\b[a-z]+[a-z0-9.]*\b/g)||[];const numeric=n.match(/\b[\p{L}]*\d+[\p{L}\d.]*\b/gu)||[];const units=n.match(/\d+(?:\.\d+)?\s*(?:سم|مل|لتر|وات|فولت|كيلو|كجم|جيجا|gb|ml|cm|w|v)\b/g)||[];const words=n.split(' ').filter(t=>/^(?:صغير|كبير|وسط|ميني|mini|pro|max|plus|احمر|ازرق|اسود|ابيض|اخضر|وردي|بنفسجي|ذهبي|فضي|pink|black|white|red|blue|xl|xxl)$/.test(t));return [...new Set([...numeric,...units,...words,...latin])].sort().join('|')}
const synonyms={'محموله':'محمول','لاسلكيه':'لاسلكي','كهربيه':'كهربائي','كهربائيه':'كهربائي','شفاط':'مكنسه'};
function tokens(title){return [...new Set(normalize(title).split(' ').filter(t=>!['المنتج','جديد','جديده','تريند','ترندي','عرض','حصري','الاصلي','اصلي'].includes(t)).map(t=>synonyms[t]||t))]}
function similar(a,b){if(variantSignature(a)!==variantSignature(b))return false;const x=tokens(a),y=tokens(b);if(x.join(' ')===y.join(' '))return true;if(x.length<3||y.length<3)return false;const overlap=x.filter(t=>y.includes(t)).length;return overlap/new Set([...x,...y]).size>=.85}
function safeMediaPath(path){if(typeof path!=='string')return null;const p=path.replace(/\\/g,'/').replace(/^\.\//,'');return p&&!p.startsWith('/')&&!p.split('/').includes('..')&&!/^[a-z]+:/i.test(p)?p:null}
function importExport(data,options={}){
 if(!options.authorized)throw Error('أكد إنك مصرح لك تستخدم تصدير القنوات أو الجروبات.');
 const chats=data?.chats?.list||(Array.isArray(data?.messages)?[data]:null);if(!Array.isArray(chats))throw Error('اختار ملف Telegram Desktop JSON فيه messages أو chats.list.');
 const offers=[],coverage=[],warnings=[];let skipped=0,privateSkipped=0;
 const accepted=new Set(['public_channel','private_channel','public_supergroup','private_supergroup','private_group','public_group','channel','supergroup','group']);
 for(const chat of chats){if(!accepted.has(chat.type)){privateSkipped++;continue}const supplier=String(chat.name||'قناة بدون اسم');const sid=String(chat.id??'name:'+normalize(supplier));const supplierId=chat.type.replace(/^(public|private)_/,'')+':'+sid;const username=String(chat.username||options.username||'').replace(/^@/,'');const safeUser=/^[a-zA-Z][a-zA-Z0-9_]{3,}$/.test(username)?username:null;const dates=[];
 for(const m of chat.messages||[]){if(m.type!=='message')continue;const ts=m.date_unixtime?Number(m.date_unixtime)*1000:Date.parse(m.date);if(!Number.isFinite(ts))continue;dates.push(ts);const text=textOf(m.text);const title=titleOf(text);const price=priceOf(text);if(!title||text.length<8||(!price&&!m.photo&&!/(?:منتج|مكنسه|حامل|منظم|فرشاه|جهاز|مصباح|مطبخ|سيار|شاحن|سماعه|ماكينه|شنطه)/.test(normalize(text)))){skipped++;continue}
 const explicit=typeof m.link==='string'&&/^https:\/\/t\.me\/[A-Za-z0-9_]+\/\d+$/.test(m.link)&&Number(m.link.split('/').at(-1))===Number(m.id)?m.link:null;const source=safeUser&&Number.isInteger(Number(m.id))?'https://t.me/'+safeUser+'/'+Number(m.id):explicit||null;
 const moq=text.match(/(?:الحد\s*الأدنى|الحد\s*الادنى|أقل\s*كمية|اقل\s*كميه|من\s*أول|من\s*اول|MOQ)\s*[:：]?\s*([^\n]{1,60})/i);const qty=text.match(/(?:الكمية\s*المتاحة|الكميه\s*المتاحه|متاح\s*عدد)\s*[:：]?\s*([^\n]{1,60})/i);
 const contacts=[...new Set([...(digits(text).match(/(?:\+?20)?01[0125]\d{8}\b/g)||[]),...(text.match(/https:\/\/wa\.me\/[0-9]+|@[A-Za-z][A-Za-z0-9_]{3,}/g)||[])])];
 offers.push({id:supplierId+':'+m.id,supplierId,supplier,title,description:text.slice(0,12000),price,currency:price!==null?'EGP':null,date:new Date(ts).toISOString(),source,category:category(title),mediaPath:safeMediaPath(m.photo||m.thumbnail),quantity:qty?qty[1].trim():null,moq:moq?moq[1].trim():null,contacts});}
 if(dates.length&&options.complete)coverage.push({supplierId,start:Math.min(...dates),end:Math.max(...dates),complete:true});
 }
 if(privateSkipped)warnings.push('تم تجاهل '+privateSkipped+' محادثة شخصية أو نوع غير مدعوم.');return {offers,coverage,skipped,warnings};
}
function groupOffers(offers,overrides={}){const groups=[];for(const o of [...offers].sort((a,b)=>a.id.localeCompare(b.id))){const manual=overrides[o.id];let p=groups.find(p=>manual?p.manualKey===manual:!p.manualKey&&p.offers.every(x=>similar(x.title,o.title)));if(!p){p={id:manual||o.id,manualKey:manual||null,title:o.title,category:o.category,offers:[]};groups.push(p)}p.offers.push(o)}return groups.map(p=>{const dates=p.offers.map(o=>o.date).sort();const prices=p.offers.map(o=>o.price).filter(n=>n!==null);return {...p,lowest:prices.length?Math.min(...prices):null,suppliers:new Set(p.offers.map(o=>o.supplierId)).size,first:dates[0],last:dates.at(-1)}})}
function trend(p,coverage=[],now=Date.now()){
 const count=(start,end)=>p.offers.filter(o=>Date.parse(o.date)>=start&&Date.parse(o.date)<end).length;
 const signals={};for(const days of [7,14,30]){const start=now-2*days*DAY,mid=now-days*DAY;const relevant=[...new Set(p.offers.filter(o=>Date.parse(o.date)>=start&&Date.parse(o.date)<=now).map(o=>o.supplierId))];const historical=relevant.length>0&&relevant.every(s=>coverage.some(c=>c.supplierId===s&&c.complete&&c.start<=start&&c.end>=now-DAY));const current=count(mid,now+1),previous=count(start,mid);signals[days]={current,previous:historical?previous:null,growth:historical&&previous>=2?Math.round((current-previous)/previous*100):null,complete:historical}}
 const s=signals[7],recentSuppliers=new Set(p.offers.filter(o=>Date.parse(o.date)>=now-7*DAY&&Date.parse(o.date)<=now).map(o=>o.supplierId)).size;
 const rising=s.growth!==null&&s.growth>=50&&s.current>=4&&recentSuppliers>=2;
 const labels=[];if(Date.parse(p.first)>=now-7*DAY&&Date.parse(p.first)<=now)labels.push('جديد في البيانات');if(p.suppliers>=3&&signals[30].current>=6)labels.push('متكرر عند موردين');if(rising)labels.push('نشاط نشر صاعد');if(!s.complete||s.previous<2)labels.push('بيانات غير كافية');
 if(!labels.length)labels.push('نشاط مستقر / غير صاعد');return {labels,signals,rising,confidence:s.complete&&p.suppliers>=2&&s.previous>=2?'متوسطة — تغطية مُعلنة من المستورد':'محدودة',recentSuppliers};
}
function filterProducts(products,f={},coverage=[],now=Date.now()){let rows=products.filter(p=>{const q=normalize(f.search||'');return (!q||normalize(p.title+' '+p.offers.map(o=>o.description).join(' ')).includes(q))&&(!f.category||p.category===f.category)&&(!f.minPrice||(p.lowest!==null&&p.lowest>=Number(f.minPrice)))&&(!f.maxPrice||(p.lowest!==null&&p.lowest<=Number(f.maxPrice)))&&(!f.minSuppliers||p.suppliers>=Number(f.minSuppliers))&&(!f.from||p.offers.some(o=>o.date.slice(0,10)>=f.from&&(!f.to||o.date.slice(0,10)<=f.to)))&&(!f.to||p.offers.some(o=>o.date.slice(0,10)<=f.to&&(!f.from||o.date.slice(0,10)>=f.from)))&&(!f.favorites||p.offers.some(o=>(f.favoriteIds||[]).includes(o.id)))&&(!f.rising||trend(p,coverage,now).rising)});return rows.sort((a,b)=>f.sort==='price'?(a.lowest??Infinity)-(b.lowest??Infinity):f.sort==='rising'?Number(trend(b,coverage,now).rising)-Number(trend(a,coverage,now).rising)||b.last.localeCompare(a.last):f.sort==='recent'?b.first.localeCompare(a.first):b.last.localeCompare(a.last))}
return {normalize,textOf,priceOf,titleOf,category,categories,variantSignature,similar,safeMediaPath,importExport,groupOffers,trend,filterProducts};
});
