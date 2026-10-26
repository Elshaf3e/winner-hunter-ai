'use strict';

const S = {
  page:'research', ads:[],suppliers:[],competitors:[],
  filters:{search:'',platform:'all',level:'all',sort:'days'},
  supplierSearch:'', searchSaved:false,
  calc:{selling_price:499,supplier_cost:235,shipping_cost:100,failed_delivery_cost:0,cod_fee:0,handling_per_order:0,delivery_rate:50,cpa_placed:65,target_profit_delivered:30},
  calcResults:null
};
const e = (s) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n) => Number.isFinite(Number(n)) ? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number(n))+' ج' : '—';
const int = n => new Intl.NumberFormat('en-US').format(Number(n)||0);
const normalizeAr = v => String(v||'').toLowerCase().normalize('NFD').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').trim();
const url = u=>{try{let a=new URL(u);return ['https:','http:'].includes(a.protocol)?a.href:''}catch{return ''}};
const grade=days => Number(days)>=200?'super':Number(days)>=50?'winner':'good';
const gradeTitle=days=>Number(days)>=200?'🔥 Super Winner':Number(days)>=50?'🏆 Winner':'🌱 Good';
const score=a=>Math.min(100,Math.round(Math.min(Number(a.days_active)||0,300)/300*78+Math.min(Math.max(Number(a.copies)||0,0),8)/8*22));
const scoreExplanation='مؤشر استكشافي محسوب من مدة تشغيل الإعلان (78 نقطة) وعدد النسخ المسجلة (22 نقطة). لا يثبت مبيعات أو ROAS.';
const palettes=[['#e1f7e9','#a6dbbb','💇'],['#e6efff','#bed3f6','🪒'],['#e7f1fb','#b5d5ee','🚘'],['#fff0ee','#ffc9bb','🌸'],['#e9f4ed','#bbdec3','🧽'],['#eaf5fc','#badaed','📱'],['#fff0dd','#ffd09a','🥗'],['#f9ecf9','#e3c3e8','💡']];
const coverFor=(ad)=>{
 const title=(ad.title+' '+ad.category).toLowerCase();
 if(/شعر|فرشاة/.test(title))return palettes[0];
 if(/حلاقة/.test(title))return palettes[1];
 if(/سيارة|مكنسة/.test(title))return palettes[2];
 if(/حزام|تدفئة/.test(title))return palettes[3];
 if(/بخار|تنظيف/.test(title))return palettes[4];
 if(/هاتف/.test(title))return palettes[5];
 if(/مفرمة|مطبخ/.test(title))return palettes[6];
 return palettes[7];
};
const $=sel=>document.querySelector(sel);

// Browser-only storage adapter. No server, Python, account or paid API required.
// Data stays in this browser and does not sync between devices.
const STORE_KEY='winner_hunter_web_v02';
const storeTemplate=()=>({seq:20,ads:[
 {id:1,title:'فرشاة فرد الشعر الحرارية',advertiser:'Beauty Egypt',platform:'Meta',country:'EG',category:'الجمال',days_active:296,copies:5,ad_text:'فرشاة فرد الشعر السريعة — سهولة التصفيف في البيت',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:2,title:'ماكينة حلاقة متعددة الاستخدامات',advertiser:'Smart Grooming',platform:'TikTok',country:'EG',category:'الإلكترونيات',days_active:236,copies:3,ad_text:'ماكينة متعددة الرؤوس للاستخدام اليومي',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:3,title:'مكنسة سيارة محمولة',advertiser:'Auto Essentials',platform:'Meta',country:'EG',category:'السيارات',days_active:180,copies:4,ad_text:'نظف سيارتك بسهولة مع مكنسة لاسلكية محمولة',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:4,title:'حزام تدفئة مريح',advertiser:'Comfort Store',platform:'Meta',country:'EG',category:'الصحة والراحة',days_active:82,copies:2,ad_text:'دفا وراحة في وقتك — حزام حراري سهل الاستخدام',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:5,title:'جهاز بخار لتنظيف المنزل',advertiser:'Home Lab',platform:'TikTok',country:'EG',category:'المنزل',days_active:62,copies:3,ad_text:'تنضيف أعمق بوقت أقل باستخدام البخار',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:6,title:'حامل هاتف مغناطيسي',advertiser:'Drive Store',platform:'Meta',country:'EG',category:'إكسسوارات',days_active:37,copies:2,ad_text:'ثبات للهاتف أثناء الطريق',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:7,title:'مفرمة خضار يدوية',advertiser:'Kitchen Joy',platform:'Meta',country:'EG',category:'المطبخ',days_active:19,copies:1,ad_text:'تقطيع أسرع بأقل مجهود',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1},
 {id:8,title:'مصباح LED قابل للشحن',advertiser:'Light House',platform:'TikTok',country:'EG',category:'المنزل',days_active:8,copies:1,ad_text:'إضاءة عملية مع بطارية قابلة للشحن',ad_url:'',landing_url:'',status:'unknown',saved:0,is_demo:1}
 ],suppliers:[
 {id:9,product:'فرشاة فرد الشعر الحرارية',supplier_name:'مورد تجريبي — القاهرة',phone:'',price:210,channel:'قناة تجريبية',message_url:'',notes:'بيانات وهمية للتجربة فقط',is_demo:1},
 {id:10,product:'مكنسة سيارة محمولة',supplier_name:'مورد تجريبي — الجيزة',phone:'',price:175,channel:'قناة تجريبية',message_url:'',notes:'بيانات وهمية للتجربة فقط',is_demo:1},
 {id:11,product:'حزام تدفئة مريح',supplier_name:'مورد تجريبي — الإسكندرية',phone:'',price:235,channel:'قناة تجريبية',message_url:'',notes:'بيانات وهمية للتجربة فقط',is_demo:1}
 ],competitors:[
 {id:12,name:'Beauty Egypt',platform:'Meta',page_url:'',notes:'مثال توضيحي',is_demo:1},
 {id:13,name:'Home Lab',platform:'TikTok',page_url:'',notes:'مثال توضيحي',is_demo:1}
 ]});
let _browserDB;
function dbRead(){
 if(_browserDB)return _browserDB;
 try{let raw=localStorage.getItem(STORE_KEY);_browserDB=raw?JSON.parse(raw):storeTemplate();
  if(!raw)localStorage.setItem(STORE_KEY,JSON.stringify(_browserDB));
  for(const k of ['ads','suppliers','competitors'])if(!Array.isArray(_browserDB[k]))_browserDB[k]=[];
  return _browserDB;
 }catch(err){throw new Error('المتصفح مش سامح بحفظ البيانات. فعّل Local Storage أو استخدم وضع التصفح العادي. '+err.message)}
}
function dbWrite(){try{localStorage.setItem(STORE_KEY,JSON.stringify(_browserDB))}catch(err){throw new Error('فشل حفظ البيانات بسبب إعدادات المتصفح أو امتلاء المساحة. صدّر نسخة احتياطية أولًا. '+err.message)}}
function getVal(row,names,fallback=''){
 let norm=Object.fromEntries(Object.entries(row).map(([k,v])=>[String(k).trim().toLowerCase(),v]));
 for(const n of names){let v=norm[n.toLowerCase()];if(v!==undefined&&v!==null&&v!=='')return v}
 return fallback;
}
const safeStr=(v,max=1000)=>String(v??'').trim().slice(0,max);
const safeInt=(v,def=0,max=1000000)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(Math.floor(n),max)):def};
const safeNum=(v,def=0)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(n,1e8)):def};
function insertWebRecord(kind,row){
 if(!row||typeof row!=='object'||Array.isArray(row))return null;
 const db=dbRead();let o={id:++db.seq,is_demo:0};
 if(kind==='ads'){
  o.title=safeStr(getVal(row,['title','product','product_name','اسم المنتج','المنتج','العنوان']),160);if(!o.title)return null;
  Object.assign(o,{advertiser:safeStr(getVal(row,['advertiser','page_name','competitor','اسم المعلن']),150),platform:safeStr(getVal(row,['platform','المنصة'],'Meta'),30),country:safeStr(getVal(row,['country','الدولة'],'EG'),30),category:safeStr(getVal(row,['category','التصنيف'],'عام'),80),days_active:safeInt(getVal(row,['days_active','days','أيام التشغيل']),0,10000),copies:safeInt(getVal(row,['copies','creative_count','النسخ'],1),1,10000),ad_text:safeStr(getVal(row,['ad_text','copy','text','نص الاعلان']),4000),ad_url:safeStr(getVal(row,['ad_url','url','رابط الإعلان']),1200),landing_url:safeStr(getVal(row,['landing_url','website','رابط الصفحة']),1200),status:'unknown',saved:0});
 }else if(kind==='suppliers'){
  o.product=safeStr(getVal(row,['product','product_name','المنتج','اسم المنتج']),150);o.supplier_name=safeStr(getVal(row,['supplier_name','supplier','اسم المورد','المورد']),150);
  if(!o.product||!o.supplier_name)return null;
  Object.assign(o,{phone:safeStr(getVal(row,['phone','mobile','الهاتف','رقم الهاتف']),100),price:safeNum(getVal(row,['price','cost','السعر'])),channel:safeStr(getVal(row,['channel','channel_name','القناة']),150),message_url:safeStr(getVal(row,['message_url','telegram_url','رابط الرسالة']),1200),notes:safeStr(getVal(row,['notes','ملاحظات']),1500)});
 }else if(kind==='competitors'){
  o.name=safeStr(getVal(row,['name','competitor','اسم المنافس']),150);if(!o.name||db.competitors.some(c=>c.name===o.name))return null;
  Object.assign(o,{platform:safeStr(getVal(row,['platform','المنصة'],'Meta'),30),page_url:safeStr(getVal(row,['page_url','url','الرابط']),1200),notes:safeStr(getVal(row,['notes','ملاحظات']),1500)});
 }else return null;
 db[kind].push(o);return o;
}
function calcWebProfit(d){
 let n=(k,def=0)=>safeNum(d[k],def);
 const price=n('selling_price'),cost=n('supplier_cost'),ship=n('shipping_cost'),failed=n('failed_delivery_cost'),cod=n('cod_fee'),handling=n('handling_per_order'),rate=Math.min(n('delivery_rate',50),100)/100,cpa=n('cpa_placed'),profitTarget=n('target_profit_delivered',30);
 const margin=price-cost-ship-cod,expectedRevenue=rate*price,expectedVariable=rate*(cost+ship+cod)+(1-rate)*failed+handling;
 const breakeven=expectedRevenue-expectedVariable, profit=breakeven-cpa;
 const round=v=>Math.round((v+Number.EPSILON)*100)/100;
 return {selling_price:price,delivery_rate:rate*100,delivered_contribution:round(margin),expected_revenue_per_placed:round(expectedRevenue),break_even_cpa_placed:round(breakeven),break_even_cpa_delivered:rate?round(breakeven/rate):null,effective_cpa_delivered:rate?round(cpa/rate):null,target_cpa_placed:round(breakeven-rate*profitTarget),net_profit_per_placed:round(profit),estimated_net_profit_100_orders:round(profit*100),break_even_roas:breakeven>0?round(expectedRevenue/breakeven):null,scenarios:[40,50,60,70,80].map(p=>{let r=p/100,b=r*margin-(1-r)*failed-handling;return {delivery_rate:p,break_even_cpa:round(b),net_profit_per_placed:round(b-cpa)}}),assumptions:'سعر المنتج والشحن ورسوم التحصيل محسوبة على الطلبات المستلمة فقط؛ تكلفة فشل التوصيل على الطلبات غير المستلمة، وتكلفة التشغيل على كل طلب.'};
}
async function api(path,opts={}){
 const db=dbRead(),method=String(opts.method||'GET').toUpperCase();let body={};
 if(opts.body){try{body=JSON.parse(opts.body)}catch{throw new Error('مدخلات JSON غير صحيحة')}}
 const segments=path.split('/').filter(Boolean),kind=segments[1];
 if(method==='GET'){
  if(['ads','suppliers','competitors'].includes(kind)&&segments.length===2)return {items:[...db[kind]].reverse()};
  if(kind==='export')return {ads:db.ads,suppliers:db.suppliers,competitors:db.competitors};
 }
 if(method==='POST'){
  if(kind==='profit')return calcWebProfit(body);
  if(kind==='import'){
   if(!['ads','suppliers','competitors'].includes(body.kind)||!Array.isArray(body.rows)||body.rows.length>500)throw new Error('الاستيراد بحد أقصى 500 سجل وبنوع صالح');
   let count=0;for(const row of body.rows){if(insertWebRecord(body.kind,row))count++}
   dbWrite();return {imported:count,total:body.rows.length};
  }
  if(['ads','suppliers','competitors'].includes(kind)&&segments.length===2){let row=insertWebRecord(kind,body);if(!row)throw new Error('أكمل البيانات المطلوبة أو الاسم موجود بالفعل');dbWrite();return {ok:true,id:row.id}}
 }
 if(method==='PATCH'&&kind==='ads'&&segments[2]){
  let row=db.ads.find(a=>a.id===Number(segments[2]));if(!row)throw new Error('الإعلان مش موجود');row.saved=body.saved?1:0;dbWrite();return {ok:true,saved:row.saved};
 }
 if(method==='DELETE'&&['ads','suppliers','competitors'].includes(kind)&&segments[2]){
  let i=db[kind].findIndex(r=>r.id===Number(segments[2]));if(i<0)throw new Error('السجل مش موجود');db[kind].splice(i,1);dbWrite();return {ok:true};
 }
 throw new Error('العملية المطلوبة غير مدعومة في نسخة الويب');
}
function toast(msg,err=false){let el=document.createElement('div');el.className='toast'+(err?' error':'');el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),4200)}
async function reload(){const [ads,suppliers,competitors]=await Promise.all([api('/api/ads'),api('/api/suppliers'),api('/api/competitors')]);S.ads=ads.items;S.suppliers=suppliers.items;S.competitors=competitors.items}
async function refresh(){await reload();go(S.page)}
const pageTitles={dashboard:'نظرة عامة',ads:'مكتبة الإعلانات',winners:'منتجات Winner',suppliers:'الموردين',competitors:'المنافسين',saved:'المحفوظات',calculator:'حاسبة الأرباح',settings:'الإعدادات والربط'};
function go(page){S.page=page;$('#crumb').textContent=pageTitles[page];document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('#sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}
function header(title,desc,action=''){return `<section class="heading-row"><div><div class="eyebrow">WINNER HUNTER AI / WEB MVP</div><h1 class="page-title">${title}</h1><div class="page-subtitle">${desc}</div></div>${action}</section>`}
function notice(){return '<div class="notice">⚠️ كل الإعلانات والموردين المتاحين عند أول تشغيل <b>بيانات ديمو للتجربة فقط</b>؛ لا توجد صلة مباشرة بمنصات Meta أو TikTok أو Telegram حاليًا.</div>'}
function stat(name,value,sub,color='green',symbol='◎'){return `<div class="stat-card ${color}"><div class="stat-top"><span>${name}</span><div class="stat-icon">${symbol}</div></div><div class="stat-number">${value}</div><div class="stat-foot">${sub}</div></div>`}
function empty(text,sub='ابدأ بإضافة بيانات أو استيراد CSV / JSON'){return `<div class="empty"><div class="em-icon">⌁</div><h3>${e(text)}</h3><p>${e(sub)}</p></div>`}
function adCard(a){
 const [bg, bg2, emoji]=coverFor(a); const lev=grade(a.days_active);
 return `<article class="ad-card"><div class="ad-visual" style="background:linear-gradient(130deg,${bg},${bg2})"><span class="visual-meta">${e(a.platform)}</span><div class="visual-icon">${emoji}</div></div>
 <div class="ad-content"><div class="badges"><span class="badge ${lev}">${gradeTitle(a.days_active)}</span><span class="badge platform">◷ ${int(a.days_active)} يوم</span>${a.is_demo?'<span class="badge demo">DEMO</span>':''}</div>
 <h3 class="ad-title">${e(a.title)}</h3><div class="ad-advertiser">${e(a.advertiser||'معلن غير معروف')} · ${e(a.category||'عام')}</div>
 <div class="ad-desc">${e(a.ad_text||'مفيش نص إعلان متاح؛ أضف Ad Copy لما تستورد بياناته.')}</div>
 <div class="ad-meta"><span>نسخ <strong>${int(a.copies)}</strong></span><span>Opportunity Score <strong>${score(a)}/100</strong></span><span>${a.status==='active'?'● نشط حسب الإدخال':'◌ غير مؤكد'}</span></div></div>
 <div class="ad-actions"><button class="btn outline-green" data-action="findSupplier" data-title="${e(a.title)}">➤ ابحث عن مورد</button><button class="btn" data-action="toggleSave" data-id="${a.id}">${a.saved?'♥ محفوظ':'♡ حفظ'}</button></div>
 <div class="ad-actions second"><button class="btn mini" data-action="copyAd" data-id="${a.id}">⧉ نسخ النص</button>${(!a.is_demo&&url(a.ad_url))?`<a class="btn mini" href="${e(url(a.ad_url))}" target="_blank" rel="noopener noreferrer">↗ الإعلان</a>`:''}${(!a.is_demo&&url(a.landing_url))?`<a class="btn mini" href="${e(url(a.landing_url))}" target="_blank" rel="noopener noreferrer">↗ اللاندنج</a>`:''}<button class="btn mini danger" data-action="delete" data-kind="ads" data-id="${a.id}">حذف</button></div>
 </article>`;
}
function quickNav(){return `<div class="intro-banner"><div style="position:relative;z-index:1"><div class="eyebrow" style="color:#66e6c7">YOUR PRODUCT RESEARCH WORKSPACE</div><h2>اكتشف الفرص. قيّم الأرقام. اختار صح.</h2><p>إعلانات المنافسين، الموردين، وحساب الربحية في مكان واحد. كل حاجة جاهزة لاستيراد بياناتك الحقيقية بدل الاعتماد على التخمين.</p><button class="btn primary" data-action="nav" data-page="ads">ابدأ البحث عن منتج ←</button></div><div class="intro-art"><div class="hero-orb">🏆</div><div class="hero-mini a">↑ فرصة أعلى</div><div class="hero-mini b">◉ Winner Score</div></div></div>`}
function dashboard(){
 const ads=S.ads, sup=S.suppliers;
 const levels=[['Super Winner',ads.filter(a=>grade(a.days_active)==='super').length,'#f59a46'],['Winner',ads.filter(a=>grade(a.days_active)==='winner').length,'#528de9'],['Good',ads.filter(a=>grade(a.days_active)==='good').length,'#01b991']];
 const platforms=[...new Set(ads.map(x=>x.platform))].map(p=>({name:p,count:ads.filter(a=>a.platform===p).length}));
 const max=Math.max(1,...platforms.map(x=>x.count));
 return `${header('صباح الفرص الحلوة 👋','المؤشرات دي خاصة بالبيانات اللي ضفتها أو استوردتها؛ مش إحصائيات سوق مباشرة.',`<button class="btn" data-action="import">⇧ استيراد بيانات</button>`)}${quickNav()}${notice()}
 <section class="stats-grid">
 ${stat('إجمالي الإعلانات',int(ads.length),'كل المصادر المستوردة','green','▦')}
 ${stat('Winner +50 يوم',int(ads.filter(a=>a.days_active>=50).length),'تصنيف مبني على الأيام','blue','🏆')}
 ${stat('Super Winner +200',int(ads.filter(a=>a.days_active>=200).length),'لا يعني إثبات المبيعات','orange','♛')}
 ${stat('الموردين المتاحين',int(sup.length),'بيانات محلية فقط','purple','➤')}
 </section>
 <section class="split"><div class="panel"><div class="panel-head"><div><div class="panel-title">توزيع فرص المنتجات</div><div class="panel-sub">حسب مدة التشغيل المسجلة</div></div><span class="badge platform">${ads.length} إعلان</span></div>
 ${levels.map(([n,num,c])=>`<div class="progress-row"><div class="progress-label"><span>${n}</span><b>${num} إعلان</b></div><div class="bar-track"><div class="bar-fill" style="width:${ads.length?100*num/ads.length:0}%;background:${c}"></div></div></div>`).join('')}
 <div style="margin-top:26px" class="panel-title">المصادر المسجلة</div>${platforms.map(x=>`<div class="progress-row"><div class="progress-label"><span>${e(x.name)}</span><b>${x.count}</b></div><div class="bar-track"><div class="bar-fill blue" style="width:${100*x.count/max}%"></div></div></div>`).join('')}
 </div><div class="panel"><div class="panel-head"><div class="panel-title">خطوات اختيار منتج</div></div><div class="flow-box">
 ${[['◈','اجمع إعلانات المنتجات','استيراد البيانات أو إدخال إعلان'],['♛','راجع الـWinner Score','مدة التشغيل وعدد النسخ'],['➤','قارن أسعار الموردين','استيراد أو إضافة عروض الموردين'],['⌗','احسب أقصى CPA','مع نسبة التسليم الحقيقية']].map(v=>`<div class="flow-step"><div class="flow-icon">${v[0]}</div><div><h4>${v[1]}</h4><p>${v[2]}</p></div></div>`).join('')}
 </div><button class="btn outline-green" style="margin-top:18px;width:100%" data-action="nav" data-page="calculator">افتح حاسبة الربحية ←</button></div></section>
 <section class="page-block"><div class="toolbar"><h2 class="section-title">منتجات تستحق المراجعة</h2><button class="btn mini" data-action="nav" data-page="ads">عرض كل الإعلانات ←</button></div><div class="ad-grid">${ads.length?ads.slice().sort((a,b)=>score(b)-score(a)).slice(0,3).map(adCard).join(''):empty('لسه مفيش إعلانات')}</div></section>`;
}
function filteredAds(){
 let arr=S.ads.filter(a=>!(['saved','winners'].includes(S.page))||(S.page==='saved'?a.saved:a.days_active>=50));
 if(S.filters.search){let q=S.filters.search.toLocaleLowerCase();arr=arr.filter(a=>[a.title,a.advertiser,a.ad_text,a.category].some(t=>String(t||'').toLocaleLowerCase().includes(q)))}
 if(S.filters.platform!=='all')arr=arr.filter(a=>a.platform===S.filters.platform);
 if(S.filters.level!=='all')arr=arr.filter(a=>grade(a.days_active)===S.filters.level);
 let key=S.filters.sort;arr.sort((a,b)=>key==='copies'?b.copies-a.copies:key==='score'?score(b)-score(a):b.days_active-a.days_active);
 return arr;
}
function adsPage(){const isWin=S.page==='winners',isSave=S.page==='saved';const title=isWin?'منتجات Winner':isSave?'الإعلانات المحفوظة':'مكتبة الإعلانات'; const desc=isWin?'فرص أولية ظهرت لمدة 50 يوم أو أكتر، وده مش دليل قاطع على الربحية.':isSave?'مجموعة المنتجات اللي اخترت ترجع تراجعها بعدين.':'ابحث وصفّي الإعلانات اللي أضفتها، أو ارفع ملف CSV / JSON.';
 const platforms=[...new Set(S.ads.map(a=>a.platform))].sort();const results=filteredAds();
 return `${header(title,desc,`<div style="display:flex;gap:8px"><button class="btn" data-action="import">⇧ استيراد</button><button class="btn primary" data-action="add" data-kind="ads">+ إعلان جديد</button></div>`)}${notice()}
 <div class="filters"><input class="field-input search-input" id="adSearch" placeholder="⌕  ابحث بالمنتج، المعلن، وصف الإعلان..." value="${e(S.filters.search)}"/>
 <select class="field-select" id="platformFilter"><option value="all">كل المنصات</option>${platforms.map(p=>`<option value="${e(p)}" ${S.filters.platform===p?'selected':''}>${e(p)}</option>`).join('')}</select>
 <select class="field-select" id="gradeFilter"><option value="all">كل التصنيفات</option>${['super','winner','good'].map((g,i)=>`<option value="${g}" ${S.filters.level===g?'selected':''}>${['Super Winner','Winner','Good'][i]}</option>`).join('')}</select>
 <select class="field-select" id="sortFilter"><option value="days" ${S.filters.sort==='days'?'selected':''}>الأطول تشغيلًا</option><option value="copies" ${S.filters.sort==='copies'?'selected':''}>الأكثر نسخًا</option><option value="score" ${S.filters.sort==='score'?'selected':''}>أعلى Score</option></select>
 <button class="btn primary" data-action="filterAds">تطبيق</button><button class="btn" data-action="clearFilters">مسح</button></div>
 <div class="toolbar"><div class="results-count">لقينا <b>${int(results.length)}</b> إعلان · <span title="${scoreExplanation}">⊙ معنى Winner Score</span></div><span class="badge demo">DEMO = بيانات للتجربة</span></div>
 ${results.length?`<div class="ad-grid">${results.map(adCard).join('')}</div>`:empty('مفيش نتائج مناسبة','جرّب تعديل الفلاتر أو استيراد إعلانات جديدة')}`;
}
function supplierCard(x){return `<div class="supplier-card"><div class="supplier-head"><div class="supplier-name">${e(x.supplier_name)}</div>${x.is_demo?'<span class="badge demo">DEMO</span>':'<span class="badge good">تم إضافته</span>'}</div><div class="supplier-product">📦 ${e(x.product)}</div><div class="supplier-price">${money(x.price)}</div><div class="supplier-details"><div>➤ القناة: <strong>${e(x.channel||'غير محددة')}</strong></div><div>☎ الهاتف: <strong dir="ltr">${e(x.phone||'غير متاح')}</strong></div></div><div class="text-xs muted">${e(x.notes||'')}</div><div class="supplier-actions">${x.phone?`<button class="btn mini" data-action="copyText" data-text="${e(x.phone)}">⧉ نسخ رقم المورد</button>`:''}${url(x.message_url)?`<a class="btn mini" href="${e(url(x.message_url))}" rel="noopener noreferrer" target="_blank">↗ رسالة تليجرام</a>`:''}<button class="btn mini danger" data-action="delete" data-kind="suppliers" data-id="${x.id}">حذف</button></div></div>`}
function suppliersPage(){let term=normalizeAr(S.supplierSearch);let matched=S.suppliers.filter(x=>[x.product,x.supplier_name,x.channel,x.notes].some(p=>normalizeAr(p).includes(term)));return `${header('دليل الموردين','اربط المنتج بالمورد والتكلفة، مع العلم إن بحث Telegram المباشر لسه مش متصل.',`<div style="display:flex;gap:8px"><button class="btn" data-action="importKind" data-kind="suppliers">⇧ استيراد الموردين</button><button class="btn primary" data-action="add" data-kind="suppliers">+ مورد جديد</button></div>`)}${notice()}<div class="filters"><input class="field-input search-input" id="supplierSearch" value="${e(S.supplierSearch)}" placeholder="⌕ ابحث باسم المنتج أو المورد أو القناة"/><button class="btn primary" data-action="filterSuppliers">بحث</button><button class="btn" data-action="clearSupplierSearch">مسح</button></div><div class="toolbar"><span class="results-count"><b>${matched.length}</b> مورد / عرض مناسب</span><span class="badge platform">الموردون اللي أنت ضايفهم فقط</span></div>${matched.length?`<div class="supplier-grid">${matched.map(supplierCard).join('')}</div>`:empty('ملقيناش مورد للمنتج ده','ضيف المورد يدويًا، أو استورد ملف قنوات موردين مصرح لك باستخدامه')}`}
function competitorsPage(){return `${header('متابعة المنافسين','اجمع روابط المنافسين والمعلنين في قاعدة واحدة، وشوف إعلاناتهم المسجلة عندك.',`<div style="display:flex;gap:8px"><button class="btn" data-action="importKind" data-kind="competitors">⇧ استيراد</button><button class="btn primary" data-action="add" data-kind="competitors">+ منافس جديد</button></div>`)}${notice()}<div class="panel"><div class="panel-head"><div class="panel-title">قائمة المنافسين</div><span class="badge platform">${S.competitors.length} منافس</span></div>${S.competitors.length?`<div class="table-scroll"><table class="competitor-table"><thead><tr><th>المنافس</th><th>المنصة</th><th>إعلانات مسجلة</th><th>الرابط</th><th>إدارة</th></tr></thead><tbody>${S.competitors.map(c=>`<tr><td><div class="competitor-name">${e(c.name)} ${c.is_demo?'<span class="badge demo">DEMO</span>':''}</div><div class="muted text-xs">${e(c.notes)}</div></td><td>${e(c.platform)}</td><td><b>${S.ads.filter(a=>a.advertiser===c.name).length}</b></td><td>${url(c.page_url)?`<a href="${e(url(c.page_url))}" target="_blank" rel="noopener noreferrer" style="color:#0aa685">زيارة ↗</a>`:'غير مضاف'}</td><td><button class="btn mini danger" data-action="delete" data-kind="competitors" data-id="${c.id}">حذف</button></td></tr>`).join('')}</tbody></table></div>`:empty('لسه مفيش منافسين')}
 </div><div class="notice" style="margin-top:17px">ℹ️ عدد الإعلانات في الجدول بيتحسب من <b>اسم المعلن المطابق</b> داخل البيانات المستوردة، مش عدد إعلانات حساب المنافس الحقيقي.</div>`}
function calcField(key,title,help='',step='1'){return `<label><span class="field-label">${title}</span><input class="field-input" type="number" min="0" step="${step}" data-calc="${key}" value="${e(S.calc[key])}" required /><span class="field-help">${help}</span></label>`}
function calcPanel(){let r=S.calcResults;return `<div class="panel" id="calcOutput"><div class="panel-head"><div><div class="panel-title">نتيجة دراسة الربحية</div><div class="panel-sub">الحساب لكل طلب متسجل قبل التسليم</div></div><span class="badge good">محسوبة بالأرقام</span></div>${r?`<div class="calc-results">
 <div class="calc-tile primary-tile"><div class="tile-label">أقصى CPA للطلب المتسجل</div><div class="tile-number">${money(r.break_even_cpa_placed)}</div></div>
 <div class="calc-tile"><div class="tile-label">الـTarget CPA المطلوب</div><div class="tile-number">${money(r.target_cpa_placed)}</div></div>
 <div class="calc-tile"><div class="tile-label">صافي ربح/خسارة لكل طلب</div><div class="tile-number ${r.net_profit_per_placed<0?'neg':'pos'}">${money(r.net_profit_per_placed)}</div></div>
 <div class="calc-tile"><div class="tile-label">ربح/خسارة متوقعة لـ100 طلب</div><div class="tile-number ${r.estimated_net_profit_100_orders<0?'neg':'pos'}">${money(r.estimated_net_profit_100_orders)}</div></div>
 <div class="calc-tile"><div class="tile-label">الـCPA الفعلي لكل طلب مستلم</div><div class="tile-number">${r.effective_cpa_delivered===null?'—':money(r.effective_cpa_delivered)}</div></div>
 <div class="calc-tile"><div class="tile-label">Break-even ROAS</div><div class="tile-number">${r.break_even_roas===null?'—':r.break_even_roas+'x'}</div></div></div>
 <div class="panel-title" style="margin:23px 0 10px">لو نسبة التسليم اتغيرت</div><table class="mini-table"><thead><tr><th>تسليم</th><th>Break-even CPA</th><th>ربح/خسارة لكل طلب</th></tr></thead><tbody>${r.scenarios.map(x=>`<tr><td>${x.delivery_rate}%</td><td>${money(x.break_even_cpa)}</td><td class="${x.net_profit_per_placed<0?'neg':'pos'}">${money(x.net_profit_per_placed)}</td></tr>`).join('')}</tbody></table>
 <div class="calc-note">⚠️ ${e(r.assumptions)} القيم السالبة معناها إنك بتخسر حتى قبل تكلفة الإعلانات في بعض السيناريوهات.</div>`:'<div class="empty">دخل الأرقام واضغط «احسب الربحية» عشان تشوف الـBreak-even CPA والسيناريوهات.</div>'}</div>`}
function calculatorPage(){return `${header('حاسبة الأرباح والـCPA','اعرف أقصى تكلفة طلب تقدر تتحملها قبل إطلاق إعلانك، مع حساب نسب التسليم.',`<button class="btn" data-action="copyCalc">⧉ نسخ الأرقام</button>`)}<div class="calculator-layout"><div class="panel"><div class="panel-head"><div><div class="panel-title">تفاصيل المنتج والطلب</div><div class="panel-sub">جميع الأسعار بالجنيه المصري</div></div><span class="badge platform">EGP</span></div><form id="calculatorForm"><div class="field-grid">
 ${calcField('selling_price','سعر البيع','المبلغ اللي العميل بيدفعه عند التسليم')}
 ${calcField('supplier_cost','سعر المورد','تكلفة المنتج للطلب المستلم')}
 ${calcField('shipping_cost','شحن الطلب المستلم','الشحن المدفوع على الطلب الناجح')}
 ${calcField('failed_delivery_cost','تكلفة رفض الطلب','لو مفيش تكلفة للمرتجع اكتب صفر')}
 ${calcField('cod_fee','رسوم التحصيل COD','لكل طلب مستلم')}
 ${calcField('handling_per_order','التجهيز/التشغيل لكل طلب','تتحسب حتى لو العميل رفض')}
 ${calcField('delivery_rate','نسبة التسليم %','من 0 إلى 100', '1')}
 ${calcField('cpa_placed','CPA الطلب المتسجل','تكلفة الإعلان على كل طلب مش كل مستلم')}
 <div class="full-row">${calcField('target_profit_delivered','الربح المستهدف لكل طلب مستلم','يتحول تلقائيًا لهدف CPA لكل طلب متسجل')}</div>
 </div><div style="margin-top:20px"><button class="btn primary" style="width:100%;height:45px" type="submit">⌗ احسب الربحية دلوقتي</button></div></form></div>${calcPanel()}</div>`}
function settingsPage(){return `${header('الإعدادات ومصادر البيانات','اعرف إيه المتاح في النسخة دي وإيه اللي محتاج ربط رسمي بعد كده.')}
 <div class="settings-grid"><div class="setting-card"><span class="status-note status-ready">● شغال دلوقتي</span><h3>البيانات المحلية وCSV</h3><p>إضافة واستيراد وتصدير الإعلانات والموردين والمنافسين، مع حفظ كل حاجة في مساحة المتصفح (Local Storage) على جهازك، مش على سيرفر.</p><button class="btn outline-green" data-action="export">↓ تصدير النسخة JSON</button></div>
 <div class="setting-card"><span class="status-note status-ready">● شغال دلوقتي</span><h3>Winner Score وحاسبة CPA</h3><p>تصنيف حسب عمر الإعلان، وتقييم استكشافي، ونماذج ربح تعتمد على معدل التسليم وتكاليف الطلب.</p><button class="btn" data-action="nav" data-page="calculator">افتح الحاسبة</button></div>
 <div class="setting-card"><span class="status-note">غير متصل</span><h3>Meta Ad Library</h3><p>ليس هناك وصول شامل تلقائي لكل الإعلانات التجارية. يمكن حاليًا إدخال روابط الإعلانات أو استيراد ملف بيانات بطريقة مسموحة.</p></div>
 <div class="setting-card"><span class="status-note">غير متصل</span><h3>TikTok Ads</h3><p>ربط أي مصدر رسمي أو موثوق لاحقًا، مع مراجعة حدود البيانات والترخيص. لا توجد مزاعم بسحب تلقائي الآن.</p></div>
 <div class="setting-card"><span class="status-note">غير متصل</span><h3>Telegram Supplier Search</h3><p>المرحلة القادمة: Telethon بعد تسجيل دخول المستخدم بشكل آمن للقنوات المصرح له بمشاهدتها، وفهرسة الرسائل المتاحة.</p></div>
 <div class="setting-card"><span class="status-note">غير متصل</span><h3>AI Image Search</h3><p>البحث بالصور، والتشابه المرئي، واستخراج بيانات الكرييتف لسه محتاجين مصدر بيانات أو محرك بحث مناسب.</p></div>
 <div class="setting-card full-row"><div class="panel-title">ملاحظات خصوصية وأمان</div><p>نسخة الويب قابلة للنشر كصفحة ثابتة، لكن البيانات بتتحفظ في المتصفح الحالي فقط (Local Storage) ومش بتتنقل بين الأجهزة، ولا فيه حسابات أو قاعدة بيانات مشتركة. لو مسحت بيانات المتصفح، ممكن تخسر بياناتك؛ اعمل نسخة JSON باستمرار. ماتدخلش بيانات شخصية أو حساسة هنا. مشاركة البيانات بين مستخدمين تحتاج Backend آمن وتسجيل دخول.</p></div></div>`}
function render(){let html={dashboard,ads:adsPage,winners:adsPage,saved:adsPage,suppliers:suppliersPage,competitors:competitorsPage,calculator:calculatorPage,settings:settingsPage,research:researchPage,sources:sourcesPage}[S.page]();$('#content').innerHTML=html;if(S.page==='calculator'&&!S.calcResults)calculate()}
function closeModal(){$('#modalOverlay').classList.add('hidden');$('#modal').innerHTML=''}
function modal(title,body,footer=''){$('#modalOverlay').classList.remove('hidden');$('#modal').innerHTML=`<div class="modal-head"><div class="modal-title" id="modalTitle">${title}</div><button type="button" class="close-modal" data-action="close" aria-label="إغلاق">×</button></div>${body}${footer?`<div class="modal-footer">${footer}</div>`:''}`}
const formFields={
 ads:[['title','اسم المنتج / الإعلان','text',true],['advertiser','اسم المعلن','text'],['platform','المنصة','select:Meta|TikTok|Google|YouTube|Facebook|Instagram|Other'],['country','الدولة','text'],['category','التصنيف','text'],['days_active','أيام التشغيل','number'],['copies','عدد النسخ','number'],['ad_text','نص الإعلان','textarea'],['ad_url','رابط الإعلان','url'],['landing_url','رابط اللاندنج','url']],
 suppliers:[['product','اسم المنتج','text',true],['supplier_name','اسم المورد','text',true],['phone','رقم المورد','tel'],['price','سعر المنتج EGP','number'],['channel','اسم قناة Telegram','text'],['message_url','رابط رسالة تليجرام','url'],['notes','ملاحظات','textarea']],
 competitors:[['name','اسم المنافس','text',true],['platform','المنصة','select:Meta|TikTok|Facebook|Instagram|Other'],['page_url','رابط صفحة المنافس','url'],['notes','ملاحظات','textarea']]
};
const kindLabel={ads:'إعلان',suppliers:'مورد',competitors:'منافس'};
function openAdd(kind){const fields=formFields[kind];modal(`إضافة ${kindLabel[kind]} جديد`, `<form id="addForm" class="modal-form">${fields.map(([key,label,type,required])=>`<label class="${type==='textarea'?'wide':''}"><span class="field-label">${label}${required?' *':''}</span>${type==='textarea'?`<textarea class="field-input" style="height:85px;resize:vertical" name="${key}"></textarea>`:type.startsWith('select:')?`<select class="field-select" name="${key}">${type.substring(7).split('|').map(t=>`<option>${t}</option>`).join('')}</select>`:`<input class="field-input" type="${type}" name="${key}" ${required?'required':''} ${type==='number'?'min="0"':''} />`}</label>`).join('')}<div class="wide modal-footer"><button type="button" class="btn" data-action="close">إلغاء</button><button class="btn primary" type="submit">حفظ ${kindLabel[kind]}</button></div></form>`);$('#addForm').onsubmit=async ev=>{ev.preventDefault();let row=Object.fromEntries(new FormData(ev.target));try{await api('/api/'+kind,{method:'POST',body:JSON.stringify(row)});closeModal();toast('اتضاف بنجاح ✓');await refresh()}catch(err){toast(err.message,true)}}}
function parseCSV(t){
 t=t.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<t.length;i++){let ch=t[i];if(quoted){if(ch==='"'&&t[i+1]==='"'){field+='"';i++}else if(ch==='"')quoted=false;else field+=ch;}else{if(ch==='"')quoted=true;else if(ch===','){row.push(field);field=''}else if(ch==='\r'&&t[i+1]==='\n'){row.push(field);rows.push(row);row=[];field='';i++}else if(ch==='\n'||ch==='\r'){row.push(field);rows.push(row);row=[];field=''}else field+=ch;}}
 if(field!==''||row.length){row.push(field);rows.push(row)}if(!rows.length)return [];
 const columns=rows.shift().map(s=>s.trim());return rows.filter(r=>r.some(c=>String(c).trim())).map(r=>Object.fromEntries(columns.map((name,i)=>[name,r[i]||''])));
}
function openImport(kind='ads'){
 const example={ads:'title,advertiser,platform,days_active,copies,ad_text,ad_url,landing_url\nمكنسة سيارة,متجر تجريبي,Meta,70,3,نص الإعلان,https://example.com/ad,https://example.com/product',suppliers:'product,supplier_name,phone,price,channel,message_url\nمكنسة سيارة,مورد تجريبي,01000000000,175,اسم القناة,https://t.me/example',competitors:'name,platform,page_url,notes\nمتجر تجريبي,Meta,https://example.com,منافس محلي'};
 modal('استيراد CSV أو JSON',`<div class="page-subtitle">ارفع ملف بيانات تملكه أو مصرحلك تستخدمه. البيانات المستوردة هتتحفظ محليًا.</div><label class="field-label" for="importKind">نوع البيانات</label><select class="field-select" id="importKind"><option value="ads" ${kind==='ads'?'selected':''}>الإعلانات</option><option value="suppliers" ${kind==='suppliers'?'selected':''}>الموردين</option><option value="competitors" ${kind==='competitors'?'selected':''}>المنافسين</option></select><div class="import-drop"><div style="font-size:28px">⇧</div><b>اختار ملف CSV أو JSON</b><div class="text-xs muted">حد أقصى 500 صف و2MB لكل عملية</div><input id="importFile" type="file" accept=".csv,.json,text/csv,application/json" style="margin:15px auto 0"/></div><div id="importStatus" class="text-xs muted">مفيش ملف مختار.</div><div class="panel-title" style="margin:18px 0 8px">مثال لأسماء الأعمدة</div><div class="preview-code" id="importExample">${e(example[kind])}</div><div class="modal-footer"><button class="btn" data-action="close">إلغاء</button><button class="btn primary" data-action="doImport">استيراد البيانات</button></div>`);
 $('#importKind').onchange=ev=>$('#importExample').textContent=example[ev.target.value];
 $('#importFile').onchange=ev=>$('#importStatus').textContent=ev.target.files.length?`اختارت: ${ev.target.files[0].name}`:'مفيش ملف مختار';
}
async function doImport(){let file=$('#importFile').files[0],kind=$('#importKind').value;if(!file){toast('اختار ملف الأول',true);return}if(file.size>2e6){toast('الملف أكبر من 2MB',true);return}try{
 let text=await file.text();let records=file.name.toLowerCase().endsWith('.json')?JSON.parse(text):parseCSV(text);
 if(!Array.isArray(records)){if(records&&Array.isArray(records[kind]))records=records[kind];else throw new Error('ملف JSON لازم يكون Array من السجلات أو نسخة مصدّرة من التول')}
 if(!records.length)throw new Error('الملف فاضي');if(records.length>500)throw new Error('قسّم الملف لدفعات لا تزيد عن 500 صف');
 let res=await api('/api/import',{method:'POST',body:JSON.stringify({kind,rows:records})});closeModal();toast(`تم استيراد ${res.imported} من ${res.total} صف بنجاح`);await refresh();
 }catch(err){toast('تعذّر الاستيراد: '+err.message,true)}}
async function calculate(){try{S.calcResults=await api('/api/profit',{method:'POST',body:JSON.stringify(S.calc)});if(S.page==='calculator'){const target=$('#calcOutput');if(target){let wrap=document.createElement('div');wrap.innerHTML=calcPanel();target.replaceWith(wrap.firstElementChild)}}}catch(err){toast(err.message,true)}}
function exportJSON(){api('/api/export').then(data=>{const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='winner-hunter-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);toast('اتصدرت النسخة الاحتياطية')}).catch(err=>toast(err.message,true))}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('اتنسخ ✓')}catch{window.prompt('انسخ النص من هنا:',text)}}

// Unified event delegation
window.addEventListener('click',async ev=>{
 let nav=ev.target.closest('[data-page]');if(nav){go(nav.dataset.page);return}
 let action=ev.target.closest('[data-action]');if(!action)return;
 let name=action.dataset.action,kind=action.dataset.kind,id=Number(action.dataset.id);
 try{
  if(name==='nav')return go(action.dataset.page);
  if(name==='close')return closeModal();
  if(name==='import')return openImport();
  if(name==='importKind')return openImport(kind);
  if(name==='add')return openAdd(kind);
  if(name==='doImport')return doImport();
  if(name==='filterAds'){S.filters={search:$('#adSearch').value.trim(),platform:$('#platformFilter').value,level:$('#gradeFilter').value,sort:$('#sortFilter').value};return render()}
  if(name==='clearFilters'){S.filters={search:'',platform:'all',level:'all',sort:'days'};return render()}
  if(name==='filterSuppliers'){S.supplierSearch=$('#supplierSearch').value.trim();return render()}
  if(name==='clearSupplierSearch'){S.supplierSearch='';return render()}
  if(name==='findSupplier'){S.supplierSearch=action.dataset.title;return go('suppliers')}
  if(name==='toggleSave'){let ad=S.ads.find(a=>a.id===id);await api('/api/ads/'+id,{method:'PATCH',body:JSON.stringify({saved:!ad.saved})});toast(ad.saved?'اتشال من المحفوظات':'اتحفظ ✓');return refresh()}
  if(name==='copyAd'){let ad=S.ads.find(a=>a.id===id);return copy(ad.ad_text||ad.title)}
  if(name==='copyText')return copy(action.dataset.text);
  if(name==='copyCalc')return copy(JSON.stringify({...S.calc,results:S.calcResults},null,2));
  if(name==='delete'){if(!window.confirm('متأكد إنك عاوز تحذف السجل ده؟'))return;await api('/api/'+kind+'/'+id,{method:'DELETE'});toast('اتحذف بنجاح');return refresh()}
  if(name==='export')return exportJSON();
 }catch(err){toast(err.message,true)}
});
window.addEventListener('submit',ev=>{if(ev.target.id!=='calculatorForm')return;ev.preventDefault();ev.target.querySelectorAll('[data-calc]').forEach(input=>S.calc[input.dataset.calc]=Number(input.value)||0);S.calc.delivery_rate=Math.min(S.calc.delivery_rate,100);calculate()});
window.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeModal();if(ev.key==='Enter'&&ev.target.id==='adSearch'){$('[data-action="filterAds"]')?.click()}if(ev.key==='Enter'&&ev.target.id==='supplierSearch'){$('[data-action="filterSuppliers"]')?.click()}});
$('#topImport').onclick=()=>openImport();
$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
$('#modalOverlay').onclick=ev=>{if(ev.target===$('#modalOverlay'))closeModal()};


// Free research workspace. External sources open on their own sites.
Object.assign(pageTitles,{research:'مركز البحث المجاني',sources:'مصادر الموردين'});
const supplierSources=[
 {name:'CrazyGift — كريزي جيفت',handle:'Crazy_Gift',category:'هدايا ومنتجات ترندي',notes:'الموسكي، القاهرة. القناة بتعلن بيع جملة فقط وليس بالقطعة؛ شروط الدروبشيبينج غير مؤكدة.',evidence:'https://t.me/s/Crazy_Gift',checked:'2026-10-26'},
 {name:'تجمع تجار ومستوردين ومصانع مصر',handle:'egyptbigmall',category:'دليل مصادر متنوع',notes:'دليل بينشر روابط تجار؛ كل تاجر محتاج مراجعة منفصلة. ليس موردًا واحدًا ولا ضمانًا لجودة التجار.',evidence:'https://t.me/s/egyptbigmall?before=23',checked:'2026-10-26'},
 {name:'دليل مصانع وتجار الملابس بمصر',handle:'gfdegy',category:'ملابس ومصانع',notes:'مصدر لاكتشاف مصانع وتجار الملابس. الأسعار والمخزون وخدمة الشحن تحتاج تأكيد من المورد.',evidence:'https://t.me/s/gfdegy?after=5199',checked:'2026-10-26'},
 {name:'القائد للاستيراد',handle:'elqaed_salah',category:'أدوات منزلية ومطبخ',notes:'يذكر البيع من أول قطعة عند تجميع الطلبات. تحقق من السعر الحالي والتوفر وشروط شحن الطلبات الفردية.',evidence:'https://t.me/elqaed_salah',checked:'2026-10-26'},
 {name:'فدوريستا جملة',handle:'Fadwrista',category:'أدوات منزلية',notes:'سعر الجملة من أول قطعة بشروط معلنة في القناة. راجع متطلبات التعامل والشحن قبل الاعتماد على المصدر.',evidence:'https://t.me/s/Fadwrista',checked:'2026-10-26'},
 {name:'شركة الطيار',handle:'TR_Eslam2025',category:'أدوات منزلية ولعب أطفال',notes:'يعلن البيع جملة بالدستة والكرتونة؛ ليس مورد دروبشيبنج بالقطعة حسب الوصف المنشور.',evidence:'https://t.me/TR_Eslam2025',checked:'2026-10-26'},
 {name:'Trendfire',handle:'trendfire1',category:'أدوات منزلية بالجملة',notes:'يذكر البيع بالكرتونة فقط؛ تحقق من الحد الأدنى والشحن.',evidence:'https://t.me/trendfire1',checked:'2026-10-26'},
 {name:'الطناوي',handle:'eltanawygroup',category:'أدوات منزلية',notes:'تظهر عروض بأسعار للقطعة وعدد قطع الكرتونة؛ تأكد من الحد الأدنى الفعلي للطلب.',evidence:'https://t.me/s/eltanawygroup',checked:'2026-10-26'},
 {name:'Dr.Wear',handle:'drwear',category:'ملابس جملة',notes:'يعلن البيع جملة من أول قطعة. تحقق من الموديلات والتوافر وإمكانية تنفيذ طلبات دروبشيبنج.',evidence:'https://t.me/s/drwear',checked:'2026-10-26'}
];
function researchPage(){
 return header('مركز البحث المجاني','ابدأ بحثك في مصر، وافتح نتائج المصادر الأصلية، وبعد المراجعة احفظ الفرصة هنا.')+
 '<div class="notice">البحث بيفتح المصدر الأصلي في تبويب جديد. الأداة لا تسحب النتائج تلقائيًا، ولا تعرف مبيعات أو أرباح المنافسين.</div>'+
 '<div class="panel"><form id="freeResearchForm"><label class="field-label" for="researchTerm">اسم المنتج أو المنافس أو موقعه</label><input id="researchTerm" name="term" class="field-input" maxlength="160" placeholder="مثال: مكنسة سيارة، أو اسم متجر، أو example.com" required><div class="field-grid" style="margin-top:16px"><label><span class="field-label">مصدر البحث</span><select name="source" class="field-select"><option value="meta">Meta Ad Library — مصر</option><option value="tiktok">TikTok Creative Center</option><option value="google">Google Ads Transparency — معلن أو موقع</option><option value="telegram">اكتشاف موردين على Telegram عبر Google</option></select></label><div><span class="field-label">ابدأ بالمصدر</span><button class="btn primary" type="submit" style="height:42px;width:100%">افتح البحث ↗</button></div></div></form><p class="muted text-small" style="line-height:2">ميتا: بحث المنتج أو المعلن مع مصر. تيك توك: راجع فلتر المنطقة داخل المصدر، وقد تحتاج تسجيل دخول لعرض المزيد. جوجل: ابحث باسم المعلن أو الدومين وحدد مصر داخل المصدر. تليجرام: نتائج بحث عامة عن قنوات الموردين.</p></div>'+
 '<div class="settings-grid" style="margin-top:20px"><div class="setting-card"><span class="status-note status-ready">الخطوة ٢</span><h3>احفظ الإعلان اللي راجعته</h3><p>سجل رابط الإعلان والمنتج والمعلن ومدة التشغيل المرصودة. التقييم مؤشر بحث وليس إثبات نجاح المنتج.</p><button class="btn primary" data-action="add" data-kind="ads">+ حفظ إعلان حقيقي</button></div><div class="setting-card"><span class="status-note status-ready">الخطوة ٣</span><h3>راجع مصدر المورد</h3><p>مصادر عامة بروابط أصلية، مع توضيح تخصص كل مصدر وحدود المعلومات المتاحة.</p><button class="btn" data-page="sources">افتح مصادر الموردين</button></div><div class="setting-card"><span class="status-note status-ready">الخطوة ٤</span><h3>احسب جدوى الاختبار</h3><p>بعد تأكيد تكلفة المورد والشحن ونسبة التسليم، احسب أقصى CPA قبل صرف ميزانية إعلان.</p><button class="btn" data-page="calculator">حاسبة الربحية</button></div><div class="setting-card"><span class="status-note">الخصوصية</span><h3>شغلك محفوظ على المتصفح</h3><p>الواجهة منشورة للعامة؛ المحفوظات المحلية تخص المتصفح المستخدم. لا يوجد حساب خاص أو مزامنة بين الأجهزة. صدّر نسخة احتياطية بعد كل جلسة.</p><button class="btn" data-action="export">تصدير النسخة الاحتياطية</button></div></div>';
}
function sourcesPage(){
 return header('مصادر موردين في مصر','قنوات وأدلة عامة اكتشفناها بالبحث. ظهور المصدر لا يعتبر تزكية للمورد أو تأكيدًا لخدمة الدروبشيبينج.')+
 '<div class="notice">الأسعار والمخزون والشحن والحد الأدنى للطلب غير مؤكدة هنا. راجع المورد قبل تسجيل عرض سعر. آخر مراجعة للمصادر: ٢٦ أكتوبر ٢٠٢٦.</div><div class="supplier-grid">'+
 supplierSources.map(s=>'<div class="supplier-card"><div class="badges"><span class="badge platform">Telegram</span><span class="badge super">للمراجعة</span></div><h3>'+e(s.name)+'</h3><div class="supplier-product">'+e(s.category)+'</div><p style="line-height:2">'+e(s.notes)+'</p><div class="supplier-actions"><a class="btn primary" href="https://t.me/'+e(s.handle)+'" target="_blank" rel="noopener noreferrer">افتح القناة ↗</a><a class="btn" href="'+e(s.evidence)+'" target="_blank" rel="noopener noreferrer">المنشورات العامة ↗</a><button class="btn" data-action="add" data-kind="suppliers">سجل عرض مورد</button></div></div>').join('')+
 '</div><div class="panel" style="margin-top:20px"><h3>محتاج تدور على مورد لمنتج معين؟</h3><p class="muted">افتح مركز البحث واختار اكتشاف موردين على Telegram. راجع إن المورد في مصر وإن شروط البيع مناسبة ليك.</p><button class="btn primary" data-page="research">افتح مركز البحث</button></div>';
}
window.addEventListener('submit',ev=>{
 if(ev.target.id!=='freeResearchForm')return;
 ev.preventDefault();
 const f=new FormData(ev.target),term=String(f.get('term')||'').trim(),source=f.get('source');
 if(!term)return;
 let link;
 if(source==='meta'){const p=new URLSearchParams({active_status:'active',ad_type:'all',country:'EG',q:term,search_type:'keyword_unordered'});link='https://www.facebook.com/ads/library/?'+p}
 if(source==='tiktok')link='https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?'+new URLSearchParams({region:'EG',keyword:term});
 if(source==='google')link='https://adstransparency.google.com/?'+new URLSearchParams({region:'EG',search:term});
 if(source==='telegram')link='https://www.google.com/search?'+new URLSearchParams({q:'site:t.me '+term+' جملة مورد مصر'});
 if(link){const opened=window.open(link,'_blank','noopener,noreferrer');toast('راجع النتائج في المصدر الأصلي، وبعدها احفظ الفرصة هنا')}
});

(async function boot(){try{await reload();render()}catch(err){$('#content').innerHTML=`<div class="panel">تعذر تشغيل نسخة الويب: ${e(err.message)}. جرّب متصفح آخر يسمح بـ Local Storage.</div>`}})();
