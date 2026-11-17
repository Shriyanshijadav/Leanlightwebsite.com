(function(){
"use strict";
var LL=window.LL=window.LL||{}, RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var inr=function(n){return "₹"+Math.round(n).toLocaleString("en-IN")};
var lakh=function(v){return v>=1e7?"₹"+(v/1e7).toFixed(2)+" crore":v>=1e5?"₹"+(v/1e5).toFixed(2).replace(/\.?0+$/,"")+" lakh":inr(v)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var pages=$$(".page"), multi=pages.length>1, current=pages[0]||document.body;

/* ---------- navigation ---------- */
var nav=document.getElementById("nav");
function closeMega(){ $$(".mega.show").forEach(function(m){m.classList.remove("show")}); $$(".menu button[aria-expanded]").forEach(function(b){b.setAttribute("aria-expanded","false")}); }
$$(".menu button[aria-controls]").forEach(function(b){
  var panel=document.getElementById(b.getAttribute("aria-controls"));
  function open(){ closeMega(); panel.classList.add("show"); b.setAttribute("aria-expanded","true"); }
  b.addEventListener("click",function(){ b.getAttribute("aria-expanded")==="true"?closeMega():open(); });
  b.parentNode.addEventListener("mouseenter",function(){ if(matchMedia("(hover:hover)").matches) open(); });
});
nav.addEventListener("mouseleave",closeMega);
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ closeMega(); nav.classList.remove("open"); } });
document.addEventListener("click",function(e){ if(!nav.contains(e.target)) closeMega(); });
var burger=nav.querySelector(".burger");
burger.addEventListener("click",function(){ var o=nav.classList.toggle("open"); burger.setAttribute("aria-expanded",o); document.body.style.overflow=o?"hidden":""; });
function closeAll(){ closeMega(); nav.classList.remove("open"); burger.setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
addEventListener("scroll",function(){
  nav.classList.toggle("stuck",scrollY>40);
  var doc=document.documentElement.scrollHeight-innerHeight; nav.style.setProperty("--sp",doc>0?clamp(scrollY/doc,0,1):0);
},{passive:true});

/* in-page jumps that work in both the static site and the single-file preview */
document.addEventListener("click",function(e){
  var a=e.target.closest("[data-go]"); if(a){ e.preventDefault(); var t=current.querySelector('[data-anchor="'+a.getAttribute("data-go")+'"]'); if(t) t.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"}); closeAll(); return; }
  var l=e.target.closest("a[href]"); if(l&&nav.contains(l)) closeAll();
});

/* ---------- per-page behaviour ---------- */
function reveal(root){
  var els=$$(".rv",root);
  if(RM||!("IntersectionObserver" in window)) return;
  var io=new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.remove("pre"); io.unobserve(e.target); } }); },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
  els.forEach(function(el,i){ var r=el.getBoundingClientRect(); if(r.top>innerHeight*.92){ el.classList.add("pre"); el.style.transitionDelay=((i%4)*70)+"ms"; io.observe(el); } });
  var so=new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); so.unobserve(e.target); } }); },{threshold:.4});
  $$(".steps>li",root).forEach(function(li){ so.observe(li); });
  var bo=new IntersectionObserver(function(en){ en.forEach(function(e){ e.target.classList.toggle("live",e.isIntersecting); }); },{threshold:.35});
  $$(".beat",root).forEach(function(b){ bo.observe(b); });
}
function spotlight(root){ $$(".card",root).forEach(function(c){ c.addEventListener("pointermove",function(e){ var r=c.getBoundingClientRect(); c.style.setProperty("--mx",(e.clientX-r.left)+"px"); c.style.setProperty("--my",(e.clientY-r.top)+"px"); }); }); }
function magnets(root){ if(RM||!matchMedia("(hover:hover)").matches) return; $$(".btn",root).forEach(function(b){ b.addEventListener("pointermove",function(e){ var r=b.getBoundingClientRect(); b.style.transform="translate("+((e.clientX-r.left)/r.width-.5)*8+"px,"+((e.clientY-r.top)/r.height-.5)*6+"px)"; }); b.addEventListener("pointerleave",function(){ b.style.transform=""; }); }); }

/* calculator: all-India estimate. Constants in one place for LeanLight to confirm. */
var CFG={unitsPerKwMonth:120,sqftPerKw:100,panelWatt:550,
  cost:{home:[[3,60000,80000],[5,55000,75000],[1e9,50000,65000]],society:[[25,45000,60000],[100,40000,55000],[1e9,35000,50000]],business:[[25,45000,60000],[100,40000,55000],[1e9,35000,50000]]},
  range:{home:[1000,20000,250,4500,8],society:[10000,300000,2500,60000,9],business:[10000,500000,5000,120000,9.5]},
  maxKw:{home:10,society:500,business:1000}};
LL.estimate=function(bill,tariff,t){
  var units=bill/tariff, kw=clamp(Math.round(units/CFG.unitsPerKwMonth*2)/2,1,CFG.maxKw[t]), gen=kw*CFG.unitsPerKwMonth;
  var year=Math.min(units,gen)*tariff*12, band=CFG.cost[t].filter(function(b){return kw<=b[0]})[0];
  var sub=t==="home"?Math.min(kw,2)*30000+clamp(kw-2,0,1)*18000:(t==="society"?Math.min(kw,500)*18000:0);
  var lo=kw*band[1], hi=kw*band[2];
  return {kw:kw,gen:gen*12,year:year,sub:sub,lo:lo,hi:hi,pLo:Math.max(lo-sub,0)/year,pHi:Math.max(hi-sub,0)/year,area:kw*CFG.sqftPerKw,panels:Math.ceil(kw*1000/CFG.panelWatt)};
};
function calc(root){
  $$(".calc",root).forEach(function(c){
    var q=function(k){return c.querySelector('[data-k="'+k+'"]')}, bill=q("bill"), tar=q("tariff"), type=c.getAttribute("data-type")||"home", roof=c.querySelector(".view");
    function setType(t){ type=t; var g=CFG.range[t]; bill.min=g[0]; bill.max=g[1]; bill.step=g[2]; bill.value=g[3]; tar.value=g[4]; draw(); }
    function fill(el){ el.style.setProperty("--fill",((el.value-el.min)/(el.max-el.min)*100)+"%"); }
    function draw(){
      var b=+bill.value, tf=+tar.value, r=LL.estimate(b,tf,type); fill(bill); fill(tar);
      q("billv").innerHTML=inr(b)+"<small>per month</small>"; q("tariffv").textContent="₹"+tf.toFixed(1)+" a unit";
      q("year").textContent=inr(r.year); q("kw").textContent=r.kw+" kW"; q("sub").textContent=r.sub?inr(r.sub):"Not applicable";
      q("cost").textContent=lakh(r.lo)+" to "+lakh(r.hi); q("pay").textContent=r.pLo.toFixed(1)+" to "+r.pHi.toFixed(1)+" years";
      q("gen").textContent=Math.round(r.gen).toLocaleString("en-IN")+" units a year";
      q("panels").textContent=r.panels+" modules of "+CFG.panelWatt+" W"+(r.panels>24?" (first 24 shown)":""); q("area").textContent=Math.round(r.area).toLocaleString("en-IN")+" sq ft shadow-free";
      if(roof) roof.setAttribute("data-n",Math.min(r.panels,24));
    }
    bill.addEventListener("input",draw); tar.addEventListener("input",draw);
    $$('input[type=radio]',c).forEach(function(rd){ rd.addEventListener("change",function(){ setType(rd.value); }); if(rd.value===type) rd.checked=true; });
    setType(type);
  });
}
function forms(root){
  $$(".qf",root).forEach(function(form){
    var sets=$$("fieldset",form), bars=$$(".bars4 i",form.parentNode), cur=0, box=form.parentNode, oops=form.querySelector(".oops"), back=form.querySelector(".back"), next=form.querySelector(".next"), no=box.querySelector(".stepno"), sent=box.querySelector(".sent");
    var titles=sets.map(function(s){return s.getAttribute("data-t")}), last=sets.length-1, f=function(n){return form.querySelector('[name="'+n+'"]')};
    function show(n){ cur=n; sets.forEach(function(s,i){s.classList.toggle("cur",i===n)}); bars.forEach(function(b,i){b.classList.toggle("on",i<=n)}); no.textContent="Step "+(n+1)+" of "+sets.length+": "+titles[n]; back.hidden=n===0; next.textContent=n===last?form.getAttribute("data-submit"):"Next"; oops.textContent=""; }
    function problem(n){
      var s=sets[n], pin=s.querySelector('[name="pincode"]'), nm=s.querySelector('[name="name"]'), mob=s.querySelector('[name="mobile"]'), bl=s.querySelector('[name="bill"]');
      if(bl&&!(+bl.value>=500)) return "Enter your monthly bill, for example 4500.";
      if(pin&&!/^\d{6}$/.test(pin.value.trim())) return "Enter a 6-digit pincode.";
      if(nm&&nm.value.trim().length<2) return "Enter your name.";
      if(mob&&!/^[6-9]\d{9}$/.test(mob.value.trim())) return "Enter a 10-digit mobile number.";
      return "";
    }
    form.addEventListener("submit",function(e){
      e.preventDefault(); var m=problem(cur); if(m){ oops.textContent=m; return; }
      if(cur<last){ show(cur+1); var x=sets[cur].querySelector("input,select,textarea"); if(x) x.focus({preventScroll:true}); return; }
      var dl=sent.querySelector("dl"); dl.textContent="";
      $$("input,select,textarea",form).forEach(function(i){ if(!i.value) return; var dt=document.createElement("dt"), dd=document.createElement("dd"); dt.textContent=i.getAttribute("data-l"); dd.textContent=i.tagName==="SELECT"?i.selectedOptions[0].text:i.value; dl.appendChild(dt); dl.appendChild(dd); });
      /* LIVE SITE: replace this block with the lead endpoint call (Supabase insert + sales alert). */
      form.hidden=true; sent.hidden=false; sent.focus({preventScroll:true});
    });
    back.addEventListener("click",function(){ show(cur-1); });
    sent.querySelector(".again").addEventListener("click",function(){ form.hidden=false; sent.hidden=true; show(0); });
    show(0);
  });
}
function sizes(root){
  $$(".sizes",root).forEach(function(bar){ var view=root.querySelector('.view[data-view="sizes"]'), rows=$$("tbody tr",root.querySelector("[data-sizes-table]"));
    $$("button",bar).forEach(function(b){ b.addEventListener("click",function(){ var i=b.getAttribute("data-i"); $$("button",bar).forEach(function(o){o.setAttribute("aria-pressed",o===b)}); if(view) view.setAttribute("data-active",i); rows.forEach(function(r,k){ $$("td,th",r).forEach(function(c){ c.classList.toggle("me",k==i); }); }); }); }); });
}
function initPage(p){ if(p.__init) return; p.__init=true; reveal(p); spotlight(p); magnets(p); calc(p); forms(p); sizes(p); }

/* ---------- single-file preview router ---------- */
function route(){
  var slug=(location.hash||"#home").slice(1), p=document.querySelector('.page[data-route="'+slug+'"]')||pages[0];
  pages.forEach(function(x){ x.hidden=x!==p; }); current=p;
  document.body.setAttribute("data-tone",p.getAttribute("data-ptone")||p.getAttribute("data-tone")); document.body.setAttribute("data-home",p.getAttribute("data-route")==="home"?"1":"0");
  document.title=p.getAttribute("data-title"); scrollTo(0,0); closeAll();
  p.classList.remove("page-in"); void p.offsetWidth; p.classList.add("page-in");
  if(LL.scan) LL.scan(); initPage(p); nav.classList.remove("stuck");
}
if(multi){ addEventListener("hashchange",route); route(); } else { initPage(current); if(LL.scan) LL.scan(); }
magnets(nav);
})();
