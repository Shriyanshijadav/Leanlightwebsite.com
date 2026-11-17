/* LeanLight 3D engine: one WebGL canvas, each .view[data-view] box gets its own scene drawn into its rectangle */
(function(){
"use strict";
var LL=window.LL=window.LL||{};
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
var SMALL=matchMedia("(max-width: 940px)").matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))}, lerp=function(a,b,k){return a+(b-a)*k};
var ease=function(k){k=clamp(k,0,1);return 1-Math.pow(1-k,3)};
LL.RM=RM; LL.SMALL=SMALL;
if(!window.THREE){ LL.scan=function(){}; return; }
var T=THREE, R, cv=document.getElementById("gl"), ENV=null, M={}, B={};
try{ R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"high-performance"}); }catch(e){ LL.scan=function(){}; return; }
R.setPixelRatio(Math.min(devicePixelRatio||1,SMALL?1.4:1.8));
R.outputEncoding=T.sRGBEncoding; R.toneMapping=T.ACESFilmicToneMapping; R.toneMappingExposure=.82;
R.shadowMap.enabled=!SMALL; R.shadowMap.type=T.PCFSoftShadowMap;
R.setClearColor(0,0); R.autoClear=false;
function size(){ R.setSize(innerWidth,innerHeight,false); }
size(); addEventListener("resize",size);

/* studio environment for reflections */
(function(){
  var s=new T.Scene();
  var sg=new T.SphereGeometry(50,32,20), pos=sg.attributes.position, col=new Float32Array(pos.count*3), ca=new T.Color(0x05070f), cb=new T.Color(0x6f86bd), cc=new T.Color(0xffb86a), tmp=new T.Color();
  for(var i=0;i<pos.count;i++){ var h=pos.getY(i)/50; if(h<.12) tmp.copy(cc).lerp(cb,Math.max(0,(h+.1)/.22)); else tmp.copy(cb).lerp(ca,Math.min(1,(h-.12)/.7)); if(h<-.1) tmp.set(0x1a1c26); col[i*3]=tmp.r; col[i*3+1]=tmp.g; col[i*3+2]=tmp.b; }
  sg.setAttribute("color",new T.BufferAttribute(col,3));
  var sky=new T.Mesh(sg,new T.MeshBasicMaterial({side:T.BackSide,vertexColors:true}));
  s.add(sky);
  [[10,14,6,9,2.2],[-12,9,-8,6,1.4],[0,20,0,10,1.2]].forEach(function(b){ var m=new T.Mesh(new T.BoxGeometry(b[3],.2,b[3]),new T.MeshBasicMaterial({color:new T.Color(b[4],b[4],b[4]*.92)})); m.position.set(b[0],b[1],b[2]); m.lookAt(0,0,0); s.add(m); });
  var p=new T.PMREMGenerator(R); ENV=p.fromScene(s,.03).texture; p.dispose();
})();

function tex(w,h,draw){ var c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); var t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=8; return t; }
var cellTex=tex(512,768,function(g,w,h){
  g.fillStyle="#8f98a8"; g.fillRect(0,0,w,h);
  var cols=6, rows=12, gw=w/cols, gh=h/rows;
  for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
    var x=c*gw+1.5, y=r*gh+1.5+(r>=rows/2?2:0), cw=gw-3, ch=gh-3;
    var lg=g.createLinearGradient(x,y,x+cw,y+ch); lg.addColorStop(0,"#101b3d"); lg.addColorStop(.5,"#0b1330"); lg.addColorStop(1,"#0e1836");
    g.fillStyle=lg; g.fillRect(x,y,cw,ch);
    g.strokeStyle="rgba(190,205,235,.34)"; g.lineWidth=.8; g.beginPath();
    for(var b=1;b<=9;b++){ var bx=x+cw*b/10; g.moveTo(bx,y); g.lineTo(bx,y+ch); } g.stroke();
  }
  g.fillStyle="#8f98a8"; g.fillRect(0,h/2-2,w,4);
});
var sheetTex=tex(256,64,function(g,w,h){ for(var i=0;i<w;i+=16){ var lg=g.createLinearGradient(i,0,i+16,0); lg.addColorStop(0,"#8b97a6"); lg.addColorStop(.5,"#c9d2dc"); lg.addColorStop(1,"#7d8896"); g.fillStyle=lg; g.fillRect(i,0,16,h);} });
sheetTex.wrapS=sheetTex.wrapT=T.RepeatWrapping;
function P(o){ o.envMap=ENV; return new T.MeshPhysicalMaterial(o); }
function S(o){ o.envMap=ENV; return new T.MeshStandardMaterial(o); }
M.panel=P({map:cellTex,roughness:.16,metalness:.1,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:.8});
M.frame=S({color:0xaab3c2,roughness:.32,metalness:.95});
M.wall=S({color:0x7a8190,roughness:.92,metalness:0,envMapIntensity:.4});
M.wall2=S({color:0x596070,roughness:.9,envMapIntensity:.4});
M.dark=S({color:0x232b3d,roughness:.6,metalness:.4});
M.steel=S({color:0x6f7b8c,roughness:.38,metalness:.9});
M.sheet=S({map:sheetTex,roughness:.45,metalness:.75});
M.glass=P({color:0x0c1428,roughness:.06,metalness:.2,clearcoat:1,envMapIntensity:1.4});
M.white=S({color:0xc4cad4,roughness:.5,metalness:.1});
M.ground=S({color:0x161d33,roughness:1,envMapIntensity:.2});
M.shadow=new T.ShadowMaterial({opacity:.34});
M.lit=function(hex,i){ return new T.MeshStandardMaterial({color:0x111111,emissive:hex,emissiveIntensity:i==null?1.6:i,roughness:.4}); };
function accent(el){ var c=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#FFB020"; return new T.Color(c); }
function a2(){ var c=getComputedStyle(document.body).getPropertyValue("--a2").trim()||"#5AA7FF"; return new T.Color(c); }
function box(w,h,d,mat,x,y,z){ var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat); m.position.set(x||0,y||0,z||0); m.castShadow=true; m.receiveShadow=true; return m; }
function cyl(r1,r2,h,mat,x,y,z,seg){ var m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg||24),mat); m.position.set(x||0,y||0,z||0); m.castShadow=true; m.receiveShadow=true; return m; }
function module(w,d){ var g=new T.Group(); g.add(box(w,.04,d,M.panel,0,.012,0)); var f=box(w+.05,.055,d+.05,M.frame,0,-.03,0); g.add(f); return g; }
function label(text,scale){
  var t=tex(512,128,function(g){ g.clearRect(0,0,512,128); g.font="500 46px 'Instrument Sans',Arial,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle="rgba(233,236,243,.94)"; g.fillText(text,256,64); });
  var s=new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthTest:false})); s.scale.set(4*(scale||1),1*(scale||1),1); return s;
}
function stage(o){
  o=o||{};
  var s=new T.Scene(), c=new T.PerspectiveCamera(o.fov||32,1,.1,400);
  s.environment=ENV;
  var hemi=new T.HemisphereLight(0xbfd2ff,0x1a1730,o.hemi==null?.42:o.hemi); s.add(hemi);
  var sun=new T.DirectionalLight(0xffe2b8,o.sun==null?1.7:o.sun); sun.position.set(6,10,5); s.add(sun);
  if(!SMALL){ sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); var k=o.shadow||12, sc=sun.shadow.camera; sc.near=.5; sc.far=120; sc.left=-k; sc.right=k; sc.top=k; sc.bottom=-k; sun.shadow.bias=-.0006; sun.shadow.radius=4; }
  var rim=new T.DirectionalLight(a2().getHex(),.5); rim.position.set(-7,4,-6); s.add(rim);
  if(o.floor!==false){ var f=new T.Mesh(new T.PlaneGeometry(200,200),M.shadow); f.rotation.x=-Math.PI/2; f.receiveShadow=true; s.add(f); }
  var v={scene:s,cam:c,sun:sun,hemi:hemi,pos:new T.Vector3().fromArray(o.pos||[6,5,8]),look:new T.Vector3().fromArray(o.look||[0,1,0])};
  c.position.copy(v.pos); c.lookAt(v.look); return v;
}
function orbit(v,t,amp,spd,ph){
  var dx=v.pos.x-v.look.x, dz=v.pos.z-v.look.z, r=Math.hypot(dx,dz), a=Math.atan2(dz,dx)+Math.sin(t*(spd||.2)+(ph||0))*(amp||.3);
  v.cam.position.set(v.look.x+Math.cos(a)*r,v.pos.y,v.look.z+Math.sin(a)*r); v.cam.lookAt(v.look);
}
function field(list,w,d,tilt){ /* list of [x,y,z]; instanced tilted modules */
  var g=new T.Group(), n=list.length, dummy=new T.Object3D();
  var p=new T.InstancedMesh(new T.BoxGeometry(w,.04,d),M.panel,n), f=new T.InstancedMesh(new T.BoxGeometry(w+.05,.055,d+.05),M.frame,n);
  p.castShadow=f.castShadow=true; p.receiveShadow=true;
  g.add(p); g.add(f);
  g.userData.set=function(i,x,y,z,sc){ dummy.position.set(x,y,z); dummy.rotation.set(tilt,0,0); dummy.scale.setScalar(sc==null?1:sc); dummy.updateMatrix(); p.setMatrixAt(i,dummy.matrix); dummy.position.y=y-.04; dummy.updateMatrix(); f.setMatrixAt(i,dummy.matrix); };
  g.userData.done=function(){ p.instanceMatrix.needsUpdate=true; f.instanceMatrix.needsUpdate=true; };
  for(var i=0;i<n;i++) g.userData.set(i,list[i][0],list[i][1],list[i][2]);
  g.userData.done(); g.userData.list=list; return g;
}
function rise(g,t,first,spread){ /* modules settle into place in a wave */
  var L=g.userData.list, age=RM?99:t-first; if(g.userData.settled) return;
  for(var i=0;i<L.length;i++){ var k=ease((age-(L[i][3]||0)*(spread||1))/.9); g.userData.set(i,L[i][0],L[i][1]+(1-k)*2.2,L[i][2],.2+.8*k); }
  g.userData.done(); if(age>4+(spread||1)*2) g.userData.settled=true;
}
function tube(pts,rad,mat){ var c=new T.CatmullRomCurve3(pts.map(function(p){return new T.Vector3(p[0],p[1],p[2])})); var m=new T.Mesh(new T.TubeGeometry(c,40,rad||.035,8,false),mat||M.dark); m.userData.curve=c; return m; }
function pulses(scene,curve,n,color){ var arr=[], geo=new T.SphereGeometry(.085,12,10), mat=new T.MeshBasicMaterial({color:color}); for(var i=0;i<n;i++){ var m=new T.Mesh(geo,mat); scene.add(m); arr.push(m); } return {arr:arr,curve:curve,mat:mat,run:function(t,on,rev,spd){ for(var i=0;i<arr.length;i++){ arr[i].visible=on; if(!on) continue; var k=(((t*(spd||.35)+i/arr.length)%1)+1)%1; if(rev) k=1-k; arr[i].position.copy(curve.getPoint(k)); } }}; }
function houseBody(g,w,h,d){
  g.add(box(w,h,d,M.wall,0,h/2,0)); g.add(box(w+.3,.18,d+.3,M.wall2,0,h+.09,0));
  [[0,d/2+.1,w+.3,.14],[0,-d/2-.1,w+.3,.14],[w/2+.1,0,.14,d+.3],[-w/2-.1,0,.14,d+.3]].forEach(function(e){ g.add(box(e[2],.42,e[3],M.wall2,e[0],h+.36,e[1])); });
  var nx=Math.max(2,Math.floor(w/1.6)), ny=Math.max(1,Math.floor(h/1.5));
  for(var y=0;y<ny;y++) for(var x=0;x<nx;x++){ var gx=(x-(nx-1)/2)*(w/nx), gy=.9+y*(h/ny); var win=box(w/nx*.5,h/ny*.52,.06,M.glass,gx,gy,d/2+.02); win.castShadow=false; g.add(win); }
}

/* ---------------------------------------------------------------- scenes */
B.journey=function(el){
  var v=stage({fov:42,floor:false,shadow:24,hemi:.4}); var s=v.scene;
  var skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{uTop:{value:new T.Color(0x0b1130)},uBot:{value:new T.Color(0xd9763f)}},
    vertexShader:"varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:"uniform vec3 uTop;uniform vec3 uBot;varying float h;void main(){float k=smoothstep(-.16,.6,h);gl_FragColor=vec4(mix(uBot,uTop,k),1.);}"});
  s.add(new T.Mesh(new T.SphereGeometry(190,24,16),skyMat)); s.fog=new T.Fog(0x121a3c,30,120);
  var gr=new T.Mesh(new T.PlaneGeometry(400,400),M.ground); gr.rotation.x=-Math.PI/2; gr.receiveShadow=true; s.add(gr);
  var glow=new T.Sprite(new T.SpriteMaterial({map:tex(256,256,function(g){ var rg=g.createRadialGradient(128,128,0,128,128,128); rg.addColorStop(0,"rgba(255,255,240,1)"); rg.addColorStop(.28,"rgba(255,186,80,.55)"); rg.addColorStop(1,"rgba(255,180,60,0)"); g.fillStyle=rg; g.fillRect(0,0,256,256); }),blending:T.AdditiveBlending,depthWrite:false,fog:false})); s.add(glow);
  var h=new T.Group(); s.add(h); houseBody(h,11,5.2,8);
  var slots=[]; for(var r=0;r<2;r++) for(var c=0;c<4;c++) slots.push([(c-1.5)*1.95,6.15+r*.12,(r-.5)*1.5,(r*4+c)*.12]);
  var arr=field(slots,1.75,1.08,-.28); h.add(arr);
  slots.forEach(function(p){ h.add(box(.07,.6,.07,M.frame,p[0]-.6,5.85,p[2]+.42)); h.add(box(.07,.6,.07,M.frame,p[0]+.6,5.85,p[2]+.42)); });
  var inv=new T.Group(); inv.position.set(5.57,2.6,1.4); h.add(inv);
  inv.add(box(.3,1.5,1,M.white)); var face=box(.04,.5,.66,M.glass,.17,.3,0); inv.add(face);
  var led=new T.Mesh(new T.SphereGeometry(.05,10,8),new T.MeshBasicMaterial({color:0x4dff9b})); led.position.set(.2,-.3,.3); inv.add(led);
  h.add(cyl(.05,.05,3.2,M.steel,5.57,4.2,1.4,8));
  var met=new T.Group(); met.position.set(5.57,2.6,-.6); h.add(met);
  met.add(box(.28,.95,.75,M.dark)); var mf=new T.Mesh(new T.CircleGeometry(.26,32),M.white); mf.rotation.y=Math.PI/2; mf.position.set(.145,.12,0); met.add(mf);
  var needle=new T.Mesh(new T.BoxGeometry(.012,.22,.03),new T.MeshBasicMaterial({color:0xc0392b})); needle.geometry.translate(0,.11,0); needle.position.set(.155,.12,0); met.add(needle);
  var wins=[]; h.traverse(function(o){ if(o.material===M.glass){ o.material=M.glass.clone(); o.material.emissive=new T.Color(0xffc266); o.material.emissiveIntensity=0; wins.push(o);} });
  var rnd=(function(q){return function(){q=(q*16807)%2147483647;return q/2147483647}})(11), np=[];
  for(var i=0;i<(SMALL?16:30);i++){ var bw=4+rnd()*6,bh=3+rnd()*9,bd=4+rnd()*5,an=rnd()*6.28,di=17+rnd()*50,bx=Math.cos(an)*di,bz=Math.sin(an)*di-6;
    var b=box(bw,bh,bd,S({color:new T.Color().setHSL(.62,.16,.2+rnd()*.14),roughness:.95,envMapIntensity:.3}),bx,bh/2,bz); s.add(b);
    if(rnd()>.45){ var n=Math.max(1,Math.floor(bw/2.2)); for(var k=0;k<n;k++) np.push([bx+(k-(n-1)/2)*2.1,bh+.3,bz]); }
    if(rnd()>.5) s.add(cyl(.5,.5,.9,M.dark,bx+bw/2-.9,bh+.45,bz-bd/2+.9,12)); }
  s.add(field(np,1.8,1.1,-.3));
  var KEY=[{p:[16,9.5,24],t:[0,5,0],f:44,a:.1,top:0x0b1130,bot:0xe0804a,h:.35},{p:[4.5,12.5,8.5],t:[0,6,0],f:36,a:.28,top:0x13266a,bot:0xf0a659,h:.6},
    {p:[10.5,3.6,-3.2],t:[5.6,2.8,-.4],f:30,a:.44,top:0x1b3f9c,bot:0x8fc0ff,h:.85},{p:[-7,9,8],t:[0,6,0],f:34,a:.58,top:0x1b3f9c,bot:0x9cc6ff,h:.9},
    {p:[12,4.6,5.5],t:[5.6,2.9,.6],f:34,a:.78,top:0x2a2a78,bot:0xff9a5c,h:.6},{p:[18,7,-22],t:[0,4.4,0],f:46,a:1.06,top:0x070b20,bot:0x241a44,h:.22}];
  var cur={p:KEY[0].p.slice(),t:KEY[0].t.slice(),f:44}, prog=0, top=new T.Color(KEY[0].top), bot=new T.Color(KEY[0].bot), mx=0,my=0,px=0,py=0, c1=new T.Color(), c2=new T.Color();
  if(!SMALL) addEventListener("pointermove",function(e){ mx=e.clientX/innerWidth-.5; my=e.clientY/innerHeight-.5; },{passive:true});
  v.update=function(t,ctx){
    rise(arr,t,ctx.first,1);
    var target=0, r=ctx.rect; if(ctx.host&&ctx.host.hasAttribute("data-journey")) target=clamp((innerHeight*.55-r.top)/Math.max(1,r.height-innerHeight*.35),0,1);
    prog=RM?target:lerp(prog,target,.08);
    var n=KEY.length-1,f=prog*n,i=Math.min(Math.floor(f),n-1),k=f-i; k=k*k*(3-2*k); var a=KEY[i],b=KEY[i+1],e=RM?1:.1;
    for(var j=0;j<3;j++){ cur.p[j]=lerp(cur.p[j],lerp(a.p[j],b.p[j],k),e); cur.t[j]=lerp(cur.t[j],lerp(a.t[j],b.t[j],k),e); }
    cur.f=lerp(cur.f,lerp(a.f,b.f,k),e); px=lerp(px,mx,.05); py=lerp(py,my,.05);
    var back=v.cam.aspect<1?1.75:1;
    v.cam.position.set(cur.t[0]+(cur.p[0]-cur.t[0])*back+px*2.2,cur.t[1]+(cur.p[1]-cur.t[1])*back-py*1.4,cur.t[2]+(cur.p[2]-cur.t[2])*back);
    v.cam.lookAt(cur.t[0],cur.t[1],cur.t[2]); v.cam.fov=cur.f;
    var sa=lerp(a.a,b.a,k), el2=Math.sin(Math.PI*clamp(sa,0,1)), below=sa>1, sx=Math.cos(Math.PI*(1-sa))*62, sy=el2*46-(below?14:0), sz=-28+Math.sin(sa*2.2)*8;
    v.sun.position.set(sx,Math.max(sy,-12),sz); v.sun.intensity=Math.max(0,el2)*1.45; v.sun.color.setHSL(.09+el2*.045,.85-el2*.33,.55+el2*.2);
    glow.position.set(sx*.75,Math.max(sy,-10)*.8,sz*.75); glow.material.opacity=clamp(el2*1.1,0,1); glow.scale.setScalar(14+(1-el2)*14);
    v.hemi.intensity=lerp(a.h,b.h,k); top.lerp(c1.setHex(a.top).lerp(c2.setHex(b.top),k),.12); bot.lerp(c1.setHex(a.bot).lerp(c2.setHex(b.bot),k),.12);
    skyMat.uniforms.uTop.value.copy(top); skyMat.uniforms.uBot.value.copy(bot); s.fog.color.copy(bot).lerp(top,.55);
    var night=clamp(1-el2*2.4,0,1); for(var w=0;w<wins.length;w++) wins[w].material.emissiveIntensity=night*(.7+.3*Math.sin(t*1.3+w));
    led.material.color.setHex(el2>.08?0x4dff9b:0x2b3350); needle.rotation.x=(el2>.12?-1:1)*t*(el2>.12?2.2*el2:.7);
  };
  return v;
};

B.house=function(el){
  var mini=el.hasAttribute("data-mini"), v=stage({pos:mini?[8,5.6,9.5]:[9.5,6.2,11],look:[0,2.3,0],fov:mini?30:32,shadow:11}), g=new T.Group(); v.scene.add(g);
  houseBody(g,5.4,3.4,4.2); g.add(box(1.5,1.5,1.5,M.wall,-1.7,4.3,-1.1)); g.add(cyl(.38,.38,.8,M.dark,1.9,4.05,-1.4,16));
  g.add(box(9,.9,.16,M.wall2,0,.45,4.4)); g.add(box(.16,.9,8.6,M.wall2,-4.5,.45,.2));
  var L=[]; for(var r=0;r<2;r++) for(var c=0;c<3;c++) L.push([(c-.3)*1.25-.1,4.02+r*.1,(r-.2)*1.25+.5,(r*3+c)*.14]);
  var arr=field(L,1.14,1.08,-.3); g.add(arr);
  var arc=new T.Line(new T.BufferGeometry().setFromPoints(Array.apply(0,Array(49)).map(function(_,i){ var a=Math.PI*i/48; return new T.Vector3(Math.cos(a)*8.5,Math.sin(a)*7.2,-2.5); })),new T.LineDashedMaterial({color:accent().getHex(),dashSize:.3,gapSize:.3,transparent:true,opacity:.55}));
  arc.computeLineDistances(); if(!mini) v.scene.add(arc);
  var ball=new T.Mesh(new T.SphereGeometry(.34,24,18),new T.MeshBasicMaterial({color:0xffd27a})); if(!mini) v.scene.add(ball);
  v.update=function(t,ctx){ rise(arr,t,ctx.first,1); orbit(v,t,.28,.17);
    var a=RM?1.1:(.25+((t*.07)%1)*(Math.PI-.5)); var x=Math.cos(a)*8.5,y=Math.sin(a)*7.2; ball.position.set(x,y,-2.5); v.sun.position.set(x,y+1,-2.5+5); v.sun.intensity=1.2+Math.sin(a)*1.4; };
  return v;
};

B.flow=function(el){
  var mode=el.getAttribute("data-mode")||"ongrid", hasGrid=mode!=="offgrid", hasBat=mode!=="ongrid";
  var v=stage({pos:[0,4.6,12.2],look:[0,1.7,0],fov:SMALL?52:30,shadow:13}), s=v.scene, ac=accent().getHex();
  var pad=new T.Mesh(new T.CircleGeometry(9.5,64),S({color:0x10172c,roughness:1,transparent:true,opacity:.55,envMapIntensity:.1})); pad.rotation.x=-Math.PI/2; pad.position.y=.005; s.add(pad);
  var xs={arr:-6.2,inv:-2.3,home:1.6,grid:6.3};
  var st=new T.Group(); st.position.set(xs.arr,0,0); s.add(st);
  for(var i=0;i<4;i++){ var m=module(1.1,1.7); m.position.set((i%2-.5)*1.2,1.5,(i<2?-.9:.9)); m.rotation.z=.42; st.add(m); }
  st.add(box(.08,1.4,.08,M.steel,-.5,.7,-.9)); st.add(box(.08,1.4,.08,M.steel,-.5,.7,.9)); st.add(box(.08,1.9,.08,M.steel,.55,.95,-.9)); st.add(box(.08,1.9,.08,M.steel,.55,.95,.9));
  var inv=new T.Group(); inv.position.set(xs.inv,0,0); s.add(inv); inv.add(box(.9,1.3,.36,M.white,0,1.25,0)); inv.add(box(.5,.34,.02,M.glass,0,1.5,.19)); inv.add(box(.1,.6,.1,M.steel,0,.3,0));
  var led=new T.Mesh(new T.SphereGeometry(.05,10,8),new T.MeshBasicMaterial({color:0x4dff9b})); led.position.set(-.3,.9,.2); inv.add(led);
  var hm=new T.Group(); hm.position.set(xs.home,0,-.2); s.add(hm); houseBody(hm,2.6,1.9,2.2);
  var wins=[]; hm.traverse(function(o){ if(o.material===M.glass){ o.material=M.glass.clone(); o.material.emissive=new T.Color(0xffc266); wins.push(o);} });
  var bat=null,cells=[];
  if(hasBat){ bat=new T.Group(); bat.position.set(xs.inv,0,3.3); s.add(bat); bat.add(box(1.5,1.5,.5,M.dark,0,.8,0));
    for(var c=0;c<5;c++){ var ce=box(.2,1.05,.03,M.lit(0x4dff9b,0),(c-2)*.26,.8,.265); ce.castShadow=false; bat.add(ce); cells.push(ce); } }
  var py=null, pyMat=M.steel.clone();
  if(hasGrid){ py=new T.Group(); py.position.set(xs.grid,0,0); s.add(py);
    [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].forEach(function(q){ var leg=cyl(.04,.06,4.6,pyMat,q[0]*.6,2.3,q[1]*.6,6); leg.rotation.z=-q[0]*.16; leg.rotation.x=q[1]*.16; py.add(leg); });
    [1.2,2.4,3.4].forEach(function(y,i){ py.add(box(1.1-i*.25,.05,.05,pyMat,0,y,.36-i*.08)); py.add(box(1.1-i*.25,.05,.05,pyMat,0,y,-.36+i*.08)); });
    py.add(box(2.6,.07,.07,pyMat,0,4.2,0)); py.add(box(1.9,.07,.07,pyMat,0,3.5,0)); py.add(cyl(.03,.03,.9,pyMat,0,4.7,0,6)); }
  var wm=S({color:0x2a3350,roughness:.5,metalness:.6});
  var c1=tube([[xs.arr+.6,.9,0],[xs.arr+1.6,.25,0],[xs.inv-.9,.25,0],[xs.inv-.2,.7,0]],.04,wm); s.add(c1);
  var c2=tube([[xs.inv+.3,.7,0],[xs.inv+1.2,.25,0],[xs.home-1.6,.25,0],[xs.home-1.25,.6,0]],.04,wm); s.add(c2);
  var c3=hasBat?tube([[xs.inv,.6,.25],[xs.inv,.22,1.2],[xs.inv,.22,2.4],[xs.inv,.6,3]],.04,wm):null; if(c3) s.add(c3);
  var c4=hasGrid?tube([[xs.home+1.3,.6,-.2],[xs.home+2,.25,-.1],[xs.grid-1.4,.25,0],[xs.grid-.3,1.2,0]],.04,wm):null; if(c4) s.add(c4);
  var p1=pulses(s,c1.userData.curve,5,0xffc24a), p2=pulses(s,c2.userData.curve,5,0xffc24a), p3=c3?pulses(s,c3.userData.curve,4,0x4dff9b):null, p4=c4?pulses(s,c4.userData.curve,5,0x8fd0ff):null;
  var lb=[["Solar array",xs.arr,3.5,0],["Inverter",xs.inv,2.6,0],["Home loads",xs.home,3.6,-.2]]; if(hasBat) lb.push(["Battery",xs.inv,2.2,3.3]); if(hasGrid) lb.push(["Grid",xs.grid,5.6,0]);
  lb.forEach(function(q){ var sp=label(q[0],.62); sp.position.set(q[1],q[2],q[3]); s.add(sp); });
  var state=label("",.7); state.position.set(0,6.6,0); s.add(state); var last="";
  function say(txt){ if(txt===last) return; last=txt; var g=state.material.map.image.getContext("2d"); g.clearRect(0,0,512,128); g.font="600 44px 'Instrument Sans',Arial,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle="#"+accent().getHexString(); g.fillText(txt,256,64); state.material.map.needsUpdate=true; }
  v.update=function(t){
    orbit(v,t,.16,.2);
    var ph=RM?.2:(t/14)%1, day=ph<.5, outage=hasGrid&&hasBat&&ph>.78, k=day?Math.sin(ph*2*Math.PI):0;
    v.sun.intensity=.35+k*2.1; v.hemi.intensity=.22+k*.5; v.sun.position.set(-8+ph*24,3+k*8,5);
    p1.run(t,day,false,.4); p2.run(t,day||hasBat||hasGrid,false,.4); p2.mat.color.setHex(day?0xffc24a:(hasBat&&(mode==="offgrid"||outage||mode!=="ongrid")?0x4dff9b:0x8fd0ff));
    if(p3) p3.run(t,true,!day,.4);
    if(p4){ var exp=day&&k>.35, imp=!day&&!outage&&(mode==="ongrid"); if(mode!=="ongrid"&&!day&&!outage&&ph>.9) imp=true; p4.run(t,exp||imp,imp,.4); p4.mat.color.setHex(exp?0xffc24a:0x8fd0ff); }
    pyMat.color.setHex(outage?0x2a2f3a:0x6f7b8c); if(pyMat.emissive) pyMat.emissive.setHex(outage?0x000000:0x000000);
    var lvl=day?clamp(ph*2.4,0,1):clamp(1-(ph-.5)*1.7,.1,1); for(var i=0;i<cells.length;i++) cells[i].material.emissiveIntensity=(i/cells.length<lvl)?1.5:.06;
    for(var w=0;w<wins.length;w++) wins[w].material.emissiveIntensity=day?.05:(mode==="ongrid"&&false?0:.95);
    led.material.color.setHex(mode==="ongrid"&&!day?0x8fd0ff:0x4dff9b);
    say(day?(k>.35?(hasGrid?(hasBat?"Day: powering the home, charging, exporting":"Day: powering the home, exporting surplus"):"Day: powering the home, charging the battery"):"Day: powering the home")
      :(outage?"Grid outage: battery keeps the home running":(mode==="ongrid"?"Night: the home draws from the grid":(mode==="offgrid"?"Night: the battery powers the home":"Night: battery first, grid after"))));
  };
  return v;
};

B.battery=function(el){
  var v=stage({pos:[4.2,3,6.2],look:[0,1.5,0],fov:30,shadow:6}), g=new T.Group(); v.scene.add(g);
  g.add(box(2.2,3,.7,M.white,0,1.55,0)); g.add(box(2.24,.12,.74,M.dark,0,.06,0)); g.add(box(1.7,2.3,.03,M.glass,0,1.6,.36));
  var cells=[]; for(var r=0;r<6;r++) for(var c=0;c<3;c++){ var m=box(.44,.26,.03,M.lit(0x4dff9b,0),(c-1)*.52,.65+r*.36,.385); m.castShadow=false; g.add(m); cells.push(m); }
  var strip=box(1.7,.04,.03,M.lit(accent().getHex(),1.4),0,2.9,.37); strip.castShadow=false; g.add(strip);
  v.update=function(t){ orbit(v,t,.4,.22); var ph=RM?.7:(t/9)%1, lvl=ph<.6?ph/.6:1-(ph-.6)/.4; for(var i=0;i<cells.length;i++){ var on=i/cells.length<lvl; cells[i].material.emissive.setHex(ph<.6?0x4dff9b:0xffc24a); cells[i].material.emissiveIntensity=on?1.4+.3*Math.sin(t*3+i):.05; } };
  return v;
};

B.shed=function(el){
  var kind=el.getAttribute("data-kind")||"gable", mini=el.hasAttribute("data-mini");
  var W=kind==="long"?46:30, D=kind==="long"?16:20, Hh=5;
  var v=stage({pos:mini?[30,17,34]:(kind==="long"?[30,13,30]:[26,15,30]),look:[0,4,0],fov:mini?30:(SMALL?44:30),shadow:30}), s=v.scene, g=new T.Group(); s.add(g);
  g.add(box(W,Hh,D,M.wall,0,Hh/2,0)); var L=[], tilt=0;
  if(kind==="saw"){ var n=5, bw=W/n; for(var i=0;i<n;i++){ var x=-W/2+bw*(i+.5); var roof=box(bw*1.06,.12,D+.4,M.sheet,x,Hh+1.05,0); roof.rotation.z=-.42; g.add(roof); g.add(box(.12,2.2,D+.4,M.glass,x+bw/2-.06,Hh+1.1,0));
      for(var r=0;r<4;r++) for(var c=0;c<8;c++) L.push([x-bw*.34+r*1.2,Hh+1.5-r*.52+.12,(c-3.5)*2.2,(i*4+r)*.07+c*.02]); }
    var arr=new T.Group(); var f=field(L,1.1,2.05,0); f.children.forEach(function(ch){ }); g.add(f); g.userData.f=f;
    /* tilt each module with its bay: rebuild with rotation about z */
    var d=new T.Object3D(); f.userData.set=function(i,x,y,z,sc){ d.position.set(x,y,z); d.rotation.set(0,0,-.42); d.scale.setScalar(sc==null?1:sc); d.updateMatrix(); f.children[0].setMatrixAt(i,d.matrix); d.position.y=y-.04; d.updateMatrix(); f.children[1].setMatrixAt(i,d.matrix); };
  } else {
    var rl=box(W/2+.4,.14,D+.6,M.sheet,-W/4,Hh+.75,0), rr=box(W/2+.4,.14,D+.6,M.sheet,W/4,Hh+.75,0); var pitch=kind==="long"?.06:.1; rl.rotation.z=pitch; rr.rotation.z=-pitch; g.add(rl); g.add(rr);
    var cols=Math.floor((W/2-2)/1.25), rows=Math.floor((D-2)/2.25);
    for(var side=-1;side<=1;side+=2) for(var c2=0;c2<cols;c2++) for(var r2=0;r2<rows;r2++){ var px=side*(1+c2*1.25+.6); L.push([px,Hh+.92+(W/4-Math.abs(px))*Math.tan(pitch)*-1+ (W/4)*Math.tan(pitch),(r2-(rows-1)/2)*2.25,(c2*.05+r2*.03)]); }
    var f2=field(L,1.12,2.08,0); g.add(f2); g.userData.f=f2;
    var d2=new T.Object3D(); f2.userData.set=function(i,x,y,z,sc){ d2.position.set(x,y,z); d2.rotation.set(0,0,x<0?pitch:-pitch); d2.scale.setScalar(sc==null?1:sc); d2.updateMatrix(); f2.children[0].setMatrixAt(i,d2.matrix); d2.position.y=y-.04; d2.updateMatrix(); f2.children[1].setMatrixAt(i,d2.matrix); };
  }
  for(var q=0;q<Math.floor(W/7);q++){ var door=box(3,3.4,.1,M.dark,-W/2+5+q*7,1.7,D/2+.03); g.add(door); }
  g.add(cyl(.5,.6,7.5,M.steel,W/2+2,3.75,-D/2+2,16)); g.add(box(4,2.4,3,M.wall2,-W/2-3.2,1.2,D/2-3));
  var pad=new T.Mesh(new T.PlaneGeometry(W+26,D+26),S({color:0x121a2c,roughness:1,transparent:true,opacity:.5,envMapIntensity:.1})); pad.rotation.x=-Math.PI/2; pad.position.y=.01; pad.receiveShadow=true; s.add(pad);
  v.sun.position.set(18,26,14);
  v.update=function(t,ctx){ rise(g.userData.f,t,ctx.first,1.4); if(mini){ g.rotation.y=t*.12; } else orbit(v,t,.34,.11); };
  return v;
};

B.farm=function(el){
  var v=stage({pos:[17,7.5,22],look:[3,2.2,-5],fov:SMALL?50:32,shadow:30}), s=v.scene, L=[];
  for(var r=0;r<7;r++) for(var c=0;c<12;c++) L.push([-16+c*1.75,1.2,8-r*3.3,r*.12+c*.03]);
  var f=field(L,1.6,2.3,-.42); s.add(f);
  for(var r2=0;r2<7;r2++) for(var c2=0;c2<4;c2++) s.add(box(.1,1.1,.1,M.steel,-15+c2*6.3,.55,8.3-r2*3.3));
  var pts=[[9,0,0],[16,0,-9],[23,0,-18]], pm=M.steel;
  pts.forEach(function(p){ var g=new T.Group(); g.position.set(p[0],0,p[2]); s.add(g); [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ var leg=cyl(.05,.08,7,pm,q[0]*.5,3.5,q[1]*.5,6); leg.rotation.z=-q[0]*.1; leg.rotation.x=q[1]*.1; g.add(leg); }); g.add(box(3.6,.09,.09,pm,0,6.4,0)); g.add(box(2.6,.09,.09,pm,0,5.4,0)); });
  var lm=new T.MeshBasicMaterial({color:0x4a556b});
  var line=tube([[4,1.6,2],[9,6.4,0],[12.5,5.6,-4.5],[16,6.4,-9],[19.5,5.6,-13.5],[23,6.4,-18],[26,3,-21]],.03,lm); s.add(line);
  var fac=new T.Group(); fac.position.set(29,0,-24); s.add(fac); fac.add(box(9,4,6,M.wall,0,2,0)); fac.add(box(9.4,.2,6.4,M.sheet,0,4.1,0)); fac.add(cyl(.4,.5,6,M.steel,3.5,3,-2,12));
  var p=pulses(s,line.userData.curve,9,accent().getHex());
  var a=label("Solar plant, off-site",1.5); a.position.set(-6,5.2,2); s.add(a); var b=label("Your factory",1.5); b.position.set(29,7.6,-24); s.add(b); var c3=label("Grid wheeling",1.4); c3.position.set(16,8.6,-9); s.add(c3);
  v.sun.position.set(14,22,10);
  v.update=function(t,ctx){ rise(f,t,ctx.first,1.2); orbit(v,t,.22,.12); p.run(t,true,false,.16); };
  return v;
};

B.bars=function(el){
  var vals=(el.getAttribute("data-bars")||"30,60,78").split(",").map(Number), labs=(el.getAttribute("data-labels")||"").split("|"), mx=Math.max.apply(0,vals), n=vals.length;
  var hl=+(el.getAttribute("data-hl")||n-1), gap=1.5;
  var v=stage({pos:[n*.9+2.6,3.6,n*1.1+5],look:[0,1.5,0],fov:30,shadow:8}), g=new T.Group(); v.scene.add(g);
  var gold=P({color:accent().getHex(),roughness:.24,metalness:1,clearcoat:.6,envMapIntensity:1.3}), base=S({color:0x56617a,roughness:.3,metalness:.9}), bars=[];
  g.add(box(n*gap+.8,.12,1.8,M.dark,0,.06,0));
  vals.forEach(function(val,i){ var m=box(.9,1,.9,i===hl?gold:base,(i-(n-1)/2)*gap,.12,0); m.geometry.translate(0,.5,0); m.userData.h=val/mx*3; m.scale.y=.01; g.add(m); bars.push(m);
    if(labs[i]){ var sp=label(labs[i],.5); sp.position.set(m.position.x,val/mx*3+.55,0); g.add(sp); m.userData.l=sp; } });
  v.update=function(t,ctx){ orbit(v,t,.3,.25); var age=RM?9:t-ctx.first; bars.forEach(function(m,i){ var k=ease((age-i*.18)/1.1); m.scale.y=Math.max(.01,m.userData.h*k); if(m.userData.l){ m.userData.l.position.y=.12+m.userData.h*k+.42; m.userData.l.material.opacity=k; } }); };
  return v;
};

B.module=function(el){
  var v=stage({pos:[0,3.6,7.4],look:[0,.2,0],fov:30,shadow:6,floor:false}), g=new T.Group(); v.scene.add(g); g.rotation.x=-.18; var W=3.6,D=2.2;
  function layer(mat,h){ var m=new T.Mesh(new T.BoxGeometry(W,h,D),mat); m.castShadow=true; return m; }
  var glass=layer(P({color:0xdfeaff,roughness:.04,metalness:0,transparent:true,opacity:.28,clearcoat:1}),.05), e1=layer(S({color:0xffffff,roughness:.5,transparent:true,opacity:.3}),.03), cells=layer(M.panel,.04), e2=layer(S({color:0xffffff,roughness:.5,transparent:true,opacity:.3}),.03), back=layer(M.white,.04), jb=box(.7,.2,.5,M.dark,0,0,-.4);
  var fr=new T.Group(); fr.add(box(W+.16,.18,.08,M.frame,0,0,D/2+.04)); fr.add(box(W+.16,.18,.08,M.frame,0,0,-D/2-.04)); fr.add(box(.08,.18,D,M.frame,W/2+.04,0,0)); fr.add(box(.08,.18,D,M.frame,-W/2-.04,0,0));
  var Ls=[[glass,2],[e1,1],[cells,0],[e2,-1],[back,-2],[jb,-3]]; Ls.forEach(function(l){ g.add(l[0]); }); g.add(fr);
  v.update=function(t,ctx){ var r=ctx.rect, p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1), e=RM?.8:clamp(Math.sin(p*Math.PI)*1.25,0,1); Ls.forEach(function(l){ l[0].position.y=l[1]*(.035+e*.62); }); g.rotation.y=Math.sin(t*.3)*.45-.25; };
  return v;
};

B.scan=function(el){
  var v=stage({pos:[0,6.5,9],look:[0,.4,0],fov:32,shadow:9}), g=new T.Group(); v.scene.add(g); g.rotation.x=-.12;
  var tiles=[], heat=[], rnd=(function(q){return function(){q=(q*48271)%2147483647;return q/2147483647}})(9);
  for(var r=0;r<4;r++) for(var c=0;c<7;c++){ var m=module(1.1,1.75); m.position.set((c-3)*1.22,.3,(r-1.5)*1.9); g.add(m);
    var hot=(r===1&&c===4), h=new T.Mesh(new T.PlaneGeometry(1.1,1.75),new T.MeshBasicMaterial({color:new T.Color().setHSL(hot?.01:.62-rnd()*.16,.95,hot?.55:.5),transparent:true,opacity:0,depthWrite:false})); h.rotation.x=-Math.PI/2; h.position.set(m.position.x,.36,m.position.z); h.userData.hot=hot; g.add(h); heat.push(h); }
  var bar=box(.06,.5,8.4,M.lit(accent().getHex(),2),0,.6,0); bar.castShadow=false; g.add(bar);
  var ring=new T.Mesh(new T.RingGeometry(.75,.83,48),new T.MeshBasicMaterial({color:0xff5b3d,transparent:true,side:T.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(1.22,.4,-.95); g.add(ring);
  v.update=function(t){ orbit(v,t,.25,.16); var ph=RM?.9:(t/7)%1, bx=-5+Math.min(ph/.7,1)*10; bar.position.x=bx; bar.visible=ph<.72;
    heat.forEach(function(h){ var tgt=h.position.x<bx?(h.userData.hot?.85:.5):0; if(ph>.92) tgt=0; h.material.opacity+=(tgt-h.material.opacity)*.15; });
    var on=bx>1.4&&ph<.92; ring.material.opacity=on?.6+.4*Math.sin(t*6):0; ring.scale.setScalar(1+(on?.12*Math.sin(t*6):0)); };
  return v;
};

B.blueprint=function(el){
  var v=stage({pos:[9,8.5,11],look:[0,.6,0],fov:30,floor:false}), s=v.scene, g=new T.Group(); s.add(g);
  var lc=a2().getHex(), ac=accent().getHex();
  function wire(w,h,d,x,y,z,col){ var m=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),new T.LineBasicMaterial({color:col||lc,transparent:true,opacity:.85})); m.position.set(x,y,z); g.add(m); return m; }
  wire(10,.3,7,0,-.15,0); wire(10.3,.5,.15,0,.25,3.55); wire(10.3,.5,.15,0,.25,-3.55); wire(.15,.5,7,5.1,.25,0); wire(.15,.5,7,-5.1,.25,0);
  var obs=[[-3.6,1.2,-2.2,1.8,2.4,1.8],[3.9,.6,-2.5,1,1.2,1]]; obs.forEach(function(o){ wire(o[3],o[4],o[5],o[0],o[1],o[2]); });
  var grid=new T.GridHelper(10,20,lc,lc); grid.material.transparent=true; grid.material.opacity=.14; grid.position.y=.01; grid.scale.z=.7; g.add(grid);
  var pan=[]; for(var r=0;r<3;r++) for(var c=0;c<5;c++){ var w=wire(1.1,.04,1.7,(c-1.4)*1.22+.6,.5,(r-.6)*1.9,ac); w.rotation.x=-.25; pan.push(w); }
  var sh=obs.map(function(o){ var m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:lc,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false})); m.rotation.x=-Math.PI/2; g.add(m); return m; });
  [.55,.8,1.05].forEach(function(k,i){ var pts=[]; for(var j=0;j<=40;j++){ var a=Math.PI*j/40; pts.push(new T.Vector3(Math.cos(a)*7.5,Math.sin(a)*6*k,-3+i*2.2)); } var l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:ac,dashSize:.25,gapSize:.25,transparent:true,opacity:.5})); l.computeLineDistances(); s.add(l); });
  var ball=new T.Mesh(new T.SphereGeometry(.26,20,14),new T.MeshBasicMaterial({color:0xffd27a})); s.add(ball);
  v.update=function(t){ orbit(v,t,.3,.15); var a=RM?.9:(.18+((t*.08)%1)*(Math.PI-.36)), sx=Math.cos(a)*7.5, sy=Math.sin(a)*4.8; ball.position.set(sx,sy,-.8);
    obs.forEach(function(o,i){ var len=clamp(o[4]/Math.tan(Math.max(.12,Math.atan2(sy,Math.abs(sx)+.001))),.2,7), dir=sx>0?-1:1; sh[i].scale.set(len,o[5],1); sh[i].position.set(o[0]+dir*(o[3]/2+len/2),.02,o[2]); });
    pan.forEach(function(p){ var shaded=obs.some(function(o,i){ var m=sh[i]; return Math.abs(p.position.x-m.position.x)<m.scale.x/2&&Math.abs(p.position.z-m.position.z)<o[5]/2+.6; }); p.material.color.setHex(shaded?0xff5b3d:ac); p.material.opacity=shaded?.5:.95; }); };
  return v;
};

B.sizes=function(el){
  var kws=[1,2,3,5,10], cnt=[2,4,6,9,18], v=stage({pos:[0,9,25],look:[0,.6,0],fov:SMALL?58:30,shadow:20}), s=v.scene, grp=[], x=-13.5;
  var on=P({color:accent().getHex(),roughness:.3,metalness:.9}), off=M.dark;
  kws.forEach(function(kw,i){ var n=cnt[i], cols=Math.ceil(n/(n>9?3:n>4?2:n>2?2:1)), rows=Math.ceil(n/cols), w=cols*1.16+.5, g=new T.Group(); g.position.set(x+w/2,0,0); x+=w+.9; s.add(g);
    var pl=box(w,.16,rows*1.86+.5,off,0,.08,0); g.add(pl); g.userData.pl=pl;
    for(var k=0;k<n;k++){ var m=module(1.08,1.72); m.position.set((k%cols-(cols-1)/2)*1.16,.42,(Math.floor(k/cols)-(rows-1)/2)*1.86); m.rotation.x=-.2; g.add(m); }
    var sp=label(kw+" kW",1); sp.position.set(0,2.6,0); g.add(sp); grp.push(g); });
  v.update=function(t){ var d=Math.max(15,15.5/(Math.tan(v.cam.fov*Math.PI/360)*v.cam.aspect)); v.pos.set(0,d*.36,d); orbit(v,t,.14,.2); var act=el.hasAttribute("data-active")?+el.getAttribute("data-active"):Math.floor((t/2.6)%5); grp.forEach(function(g,i){ g.userData.pl.material=i===act?on:off; g.position.y+=((i===act?.5:0)-g.position.y)*.12; }); };
  return v;
};

B.sunpath=function(el){
  var v=stage({pos:[8,5.5,11],look:[0,1.6,0],fov:30,shadow:9}), s=v.scene, ac=accent().getHex();
  var disc=cyl(5.6,5.6,.14,S({color:0x7d8798,roughness:.7,metalness:.1}),0,.07,0,72); s.add(disc);
  var ringm=new T.Mesh(new T.RingGeometry(5.62,5.7,96),new T.MeshBasicMaterial({color:ac,side:T.DoubleSide})); ringm.rotation.x=-Math.PI/2; ringm.position.y=.15; s.add(ringm);
  for(var i=0;i<24;i++){ var tk=box(.03,.02,i%6===0?.5:.24,M.dark,Math.cos(i/24*6.283)*5.2,.16,Math.sin(i/24*6.283)*5.2); tk.rotation.y=-i/24*6.283+Math.PI/2; tk.castShadow=false; s.add(tk); }
  var arcs=[[.5,-2.4],[.78,0],[1,2.4]].map(function(a){ var pts=[]; for(var j=0;j<=48;j++){ var th=Math.PI*j/48; pts.push(new T.Vector3(Math.cos(th)*5.6,Math.sin(th)*5.2*a[0],a[1])); } var l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:ac,transparent:true,opacity:.6})); s.add(l); return a; });
  var st=new T.Group(); s.add(st); for(var k=0;k<6;k++){ var m=module(1.1,1.7); m.position.set((k%3-1)*1.18,1.05,(k<3?-.9:.9)); m.rotation.x=-.3; st.add(m); } st.add(box(3.6,.1,.1,M.steel,0,.6,-.1)); st.add(box(.1,.6,.1,M.steel,-1.4,.44,0)); st.add(box(.1,.6,.1,M.steel,1.4,.44,0));
  var ball=new T.Mesh(new T.SphereGeometry(.3,24,18),new T.MeshBasicMaterial({color:0xffc24a})); s.add(ball);
  v.update=function(t){ orbit(v,t,.35,.14); var cyc=RM?.4:(t*.06)%1, th=.12+cyc*(Math.PI-.24), a=arcs[Math.floor((t*.06)%3)]; var x=Math.cos(th)*5.6,y=Math.sin(th)*5.2*a[0]; ball.position.set(x,y,a[1]); v.sun.position.set(x*1.6,y*1.6+1,a[1]+2); v.sun.intensity=.8+Math.sin(th)*1.8; };
  return v;
};

B.roofs=function(el){
  var v=stage({pos:[0,22,46],look:[0,0,0],fov:SMALL?46:32,shadow:44}), s=v.scene, g=new T.Group(); s.add(g);
  var rnd=(function(q){return function(){q=(q*16807)%2147483647;return q/2147483647}})(31), L=[], d=new T.Object3D(), N=SMALL?70:150;
  var blocks=new T.InstancedMesh(new T.BoxGeometry(1,1,1),M.wall,N); blocks.castShadow=blocks.receiveShadow=true; g.add(blocks);
  for(var i=0;i<N;i++){ var gx=(i%15-7)*5.6+(rnd()-.5)*1.2, gz=(Math.floor(i/15)-5)*6.4+(rnd()-.5)*1.4, w=3.2+rnd()*1.6, h=1.6+rnd()*5, dd=3.4+rnd()*1.8;
    d.position.set(gx,h/2,gz); d.scale.set(w,h,dd); d.rotation.set(0,0,0); d.updateMatrix(); blocks.setMatrixAt(i,d.matrix);
    if(rnd()>.55){ var n=Math.floor(w/1.25); for(var k=0;k<n;k++) for(var r=0;r<2;r++) L.push([gx+(k-(n-1)/2)*1.2,h+.3,gz+(r-.5)*1.5,(Math.abs(gx)+Math.abs(gz))*.03]); } }
  var f=field(L,1.1,1.36,-.26); g.add(f);
  var gp=new T.Mesh(new T.PlaneGeometry(120,100),S({color:0x10172a,roughness:1,transparent:true,opacity:.6,envMapIntensity:.1})); gp.rotation.x=-Math.PI/2; gp.position.y=.01; gp.receiveShadow=true; s.add(gp);
  v.sun.position.set(24,30,12);
  v.update=function(t,ctx){ rise(f,t,ctx.first,1); g.position.z=RM?0:Math.sin(t*.1)*5; orbit(v,t,.2,.09); };
  return v;
};

B.meter=function(el){
  var v=stage({pos:[2.6,2.2,5.2],look:[0,1.5,0],fov:30,shadow:5}), g=new T.Group(); v.scene.add(g);
  g.add(box(2.3,3,.9,M.dark,0,1.6,0)); g.add(box(2.36,.5,.96,M.steel,0,.3,0));
  var win=box(1.8,1.6,.05,M.glass,0,2,.46); win.material=P({color:0xeef2f8,roughness:.2,transparent:true,opacity:.92}); g.add(win);
  var disc=cyl(.62,.62,.03,S({color:0xd8dde6,roughness:.25,metalness:1}),0,1.62,.52,48); disc.castShadow=false; g.add(disc);
  var mark=box(.22,.035,.06,new T.MeshBasicMaterial({color:0xc0392b}),.5,1.62,.52); g.add(mark);
  var dt=tex(512,128,function(c){}), disp=new T.Mesh(new T.PlaneGeometry(1.5,.38),new T.MeshBasicMaterial({map:dt})); disp.position.set(0,2.42,.49); g.add(disp); var shown="";
  var arrow=label("",.5); arrow.position.set(0,3.5,0); g.add(arrow);
  v.update=function(t){ orbit(v,t,.35,.2); var ph=RM?.2:(t/10)%1, exp=ph<.6, a=t*(exp?-2.4:1.2); mark.position.set(Math.cos(a)*.5,1.62,.52+Math.sin(a)*.5*.2); mark.rotation.y=-a;
    var val=(4218.4+(exp?-1:1)*((t*3)%40)/10).toFixed(1), txt=("00000"+val).slice(-7)+" kWh"; if(txt!==shown){ shown=txt; var c=dt.image.getContext("2d"); c.fillStyle="#0c1220"; c.fillRect(0,0,512,128); c.font="600 70px 'Bricolage Grotesque',Arial"; c.textBaseline="middle"; c.textAlign="center"; c.fillStyle=exp?"#7dffb4":"#ffc24a"; c.fillText(txt,256,66); dt.needsUpdate=true;
      var g2=arrow.material.map.image.getContext("2d"); g2.clearRect(0,0,512,128); g2.font="500 44px Arial"; g2.textAlign="center"; g2.textBaseline="middle"; g2.fillStyle="rgba(233,236,243,.9)"; g2.fillText(exp?"Exporting: meter runs back":"Importing from the grid",256,64); arrow.material.map.needsUpdate=true; } };
  return v;
};

B.wafer=function(el){
  var v=stage({pos:[0,2.4,5.4],look:[0,0,0],fov:34,floor:false,sun:.5,hemi:.25}), s=v.scene;
  var m=new T.Mesh(new T.PlaneGeometry(12,8),M.panel.clone()); m.material.map=cellTex.clone(); m.material.map.needsUpdate=true; m.material.map.wrapS=m.material.map.wrapT=T.RepeatWrapping; m.material.map.repeat.set(2,1.2); m.rotation.x=-Math.PI/2; s.add(m);
  var pl=new T.PointLight(0xffd9a0,3,9); s.add(pl); var pl2=new T.PointLight(a2().getHex(),1.6,8); s.add(pl2);
  v.update=function(t){ pl.position.set(Math.sin(t*.4)*4.5,1.1,Math.cos(t*.3)*2); pl2.position.set(Math.cos(t*.25)*4,1.4,Math.sin(t*.35)*2.4); v.cam.position.set(Math.sin(t*.1)*.8,2.4,5.4); v.cam.lookAt(0,0,0); };
  return v;
};

B.roof=function(el){
  var v=stage({pos:[6.2,6.4,7.4],look:[0,0,.3],fov:31,shadow:8}), g=new T.Group(); v.scene.add(g);
  g.add(box(9.2,.4,6.4,M.wall,0,-.2,0)); [[0,3.25,9.4,.2],[0,-3.25,9.4,.2],[4.65,0,.2,6.6],[-4.65,0,.2,6.6]].forEach(function(e){ g.add(box(e[2],.55,e[3],M.wall2,e[0],.27,e[1])); });
  g.add(cyl(.42,.42,.9,M.dark,3.9,.45,2.55,16)); g.add(box(1,.9,1,M.wall2,-3.9,.45,2.5));
  var slots=[]; for(var r=0;r<4;r++) for(var c=0;c<6;c++) slots.push([(c-2.5)*1.36,(r-1.5)*1.38]);
  slots.sort(function(a,b){ return (Math.abs(a[0])*.8+Math.abs(a[1]-.7))-(Math.abs(b[0])*.8+Math.abs(b[1]-.7)); });
  var mods=[];
  v.update=function(t){ orbit(v,t,.22,.18); var n=+(el.getAttribute("data-n")||6);
    for(var i=0;i<24;i++){ var want=i<n, m=mods[i];
      if(want&&!m){ m=module(1.22,1.12); m.position.set(slots[i][0],3.2,slots[i][1]); m.rotation.x=-.24; g.add(m); mods[i]=m; }
      if(!want&&m){ g.remove(m); mods[i]=null; continue; }
      if(m){ m.userData.vy=((m.userData.vy||0)+(.38-m.position.y)*.18)*.68; m.position.y+=m.userData.vy; } } };
  return v;
};

B.tower=function(el){
  var v=stage({pos:[9,7,11],look:[0,3,0],fov:30,shadow:10}), g=new T.Group(); v.scene.add(g);
  var a=new T.Group(); a.position.set(-1.2,0,0); g.add(a); houseBody(a,3.2,7,3.2); var b=new T.Group(); b.position.set(2.6,0,.4); g.add(b); houseBody(b,2.6,4.6,2.8);
  var L=[]; for(var i=0;i<6;i++) L.push([-1.2+(i%3-1)*1,7.62,(i<3?-.7:.7),i*.1]); for(var j=0;j<4;j++) L.push([2.6+(j%2-.5)*1.05,5.22,.4+(j<2?-.6:.6),.6+j*.1]);
  var f=field(L,.92,1.2,-.28); g.add(f);
  v.update=function(t,ctx){ rise(f,t,ctx.first,1); g.rotation.y=RM?.5:t*.14; };
  return v;
};

B.clean=function(el){
  var v=stage({pos:[0,3.6,5],look:[0,0,0],fov:34,shadow:6}), g=new T.Group(); v.scene.add(g); g.rotation.x=-.3; g.rotation.y=-.2;
  for(var i=0;i<3;i++){ var m=module(1.24,2.3); m.position.set((i-1)*1.3,0,0); g.add(m); }
  var strips=[], N=12, sw=3.9/N; for(var k=0;k<N;k++){ var d=new T.Mesh(new T.BoxGeometry(sw*1.02,.01,2.28),new T.MeshStandardMaterial({color:0x9a8c72,roughness:1,transparent:true,opacity:.55})); d.position.set(-1.95+sw*(k+.5),.04,0); g.add(d); strips.push(d); }
  var br=new T.Group(); br.add(box(.14,.1,2.5,M.steel,0,.14,0)); var roll=cyl(.07,.07,2.44,S({color:0x3d6fd1,roughness:.9}),0,.07,0,16); roll.rotation.x=Math.PI/2; br.add(roll); g.add(br);
  v.update=function(t){ var ph=RM?.5:(t*.2)%1, bx=-2.15+Math.min(ph/.8,1)*4.3; br.position.x=bx; br.visible=ph<.84; roll.rotation.z=t*9;
    strips.forEach(function(s){ var tg=ph<.84?(bx>s.position.x?.02:.55):.55*((ph-.84)/.16); s.material.opacity+=(tg-s.material.opacity)*.2; }); };
  return v;
};


B.society=function(el){
  var mini=el.hasAttribute("data-mini"), common=el.getAttribute("data-mode")==="common";
  var v=stage({pos:mini?[17,12,21]:[19,12.5,24],look:[0,4.6,0],fov:mini?32:(SMALL?50:32),shadow:20}), s=v.scene, g=new T.Group(); s.add(g);
  var towers=[[-6.2,9.5,0],[0,13,-1.2],[6.2,7.5,.4]], L=[];
  towers.forEach(function(tw,ti){ var t=new T.Group(); t.position.set(tw[0],0,tw[2]); g.add(t); houseBody(t,4.4,tw[1],4.4);
    t.add(cyl(.55,.55,1.1,M.dark,-1.25,tw[1]+.55+.18,-1.3,16)); t.add(cyl(.55,.55,1.1,M.dark,-.05,tw[1]+.55+.18,-1.3,16));
    t.add(box(1.3,1.5,1.2,M.wall2,1.3,tw[1]+.93,-1.25));
    for(var r=0;r<2;r++) for(var c=0;c<3;c++) L.push([tw[0]+(c-1)*1.22,tw[1]+.62+r*.08,tw[2]+.35+r*1.05,ti*.5+(r*3+c)*.08]); });
  var f=field(L,1.1,.9,-.28); g.add(f);
  var wins=[]; g.traverse(function(o){ if(o.material===M.glass){ o.material=M.glass.clone(); o.material.emissive=new T.Color(0xffc266); o.material.emissiveIntensity=0; wins.push(o);} });
  var pad=new T.Mesh(new T.CircleGeometry(16,64),S({color:0x121a2c,roughness:1,transparent:true,opacity:.55,envMapIntensity:.1})); pad.rotation.x=-Math.PI/2; pad.position.y=.01; pad.receiveShadow=true; s.add(pad);
  var P=null, loads=[];
  if(!mini){
    var kiosk=new T.Group(); kiosk.position.set(0,0,6.2); s.add(kiosk); kiosk.add(box(1.4,1.8,.7,M.dark,0,.9,0)); var scr=box(.8,.3,.02,M.lit(0x7dffb4,1.2),0,1.35,.36); scr.castShadow=false; kiosk.add(scr);
    var lift=new T.Group(); lift.position.set(-7.5,0,7.5); s.add(lift); lift.add(box(.9,2.4,.9,M.steel,0,1.2,0)); var ls=box(.06,1.8,.06,M.lit(0xffc24a,0),.47,1.2,.47); ls.castShadow=false; lift.add(ls);
    var pump=new T.Group(); pump.position.set(-3.4,0,9.6); s.add(pump); pump.add(cyl(.45,.45,.9,M.steel,0,.45,0,16)); var pipe=cyl(.12,.12,1.8,M.steel,.9,.4,0,8); pipe.rotation.z=Math.PI/2; pump.add(pipe);
    var lamps=new T.Group(); lamps.position.set(3.6,0,9.6); s.add(lamps); var heads=[]; for(var i=0;i<3;i++){ lamps.add(cyl(.05,.07,2.4,M.dark,i*1.1-1.1,1.2,0,8)); var h=new T.Mesh(new T.SphereGeometry(.16,12,10),M.lit(0xffd38a,0)); h.position.set(i*1.1-1.1,2.45,0); lamps.add(h); heads.push(h); }
    var club=new T.Group(); club.position.set(8,0,7.2); s.add(club); club.add(box(2.6,1.3,2,M.wall,0,.65,0)); club.add(box(2.8,.12,2.2,M.wall2,0,1.36,0));
    loads=[lift,pump,lamps,club];
    var wm=S({color:0x2a3350,roughness:.5,metalness:.6});
    var down=tube([[0,13.4,-.2],[0,12.6,1.05],[0,6,1.05],[0,.25,1.3],[0,.25,5.6],[0,.8,5.9]],.05,wm); s.add(down);
    P=[pulses(s,down.userData.curve,7,0xffc24a)];
    [[-7.5,.25,7.1],[-3.4,.25,9.1],[3.6,.25,9.1],[8,.25,6.1]].forEach(function(q){ var c=tube([[0,.6,6.5],[q[0]*.4,.22,(6.5+q[2])/2],[q[0],.22,q[2]],[q[0],.7,q[2]]],.035,wm); s.add(c); P.push(pulses(s,c.userData.curve,3,0x7dffb4)); });
    [["Lifts",-7.5,3.6,7.5],["Water pumps",-3.4,2.2,9.6],["Common lighting",3.6,3.4,9.6],["Clubhouse",8,2.4,7.2],["Common-area meter",0,2.8,6.2]].forEach(function(q){ var sp=label(q[0],.85); sp.position.set(q[1],q[2],q[3]); s.add(sp); });
  }
  v.sun.position.set(12,24,14);
  v.update=function(t,ctx){ rise(f,t,ctx.first,1);
    if(mini){ g.rotation.y=RM?.4:t*.16; return; }
    orbit(v,t,.22,.12);
    var ph=RM?.3:(t/16)%1, day=ph<.62, k=day?Math.sin(ph/.62*Math.PI):0;
    v.sun.intensity=.3+k*1.6; v.hemi.intensity=.2+k*.35;
    P[0].run(t,day&&k>.08,false,.3); for(var i=1;i<P.length;i++) P[i].run(t,true,false,.35), P[i].mat.color.setHex(day?0xffc24a:0x8fd0ff);
    for(var w=0;w<wins.length;w++) wins[w].material.emissiveIntensity=day?.0:.6+.3*Math.sin(t+w);
    loads[0].children[1].material.emissiveIntensity=1.2+Math.sin(t*3)*.6;
    loads[2].children.forEach(function(o){ if(o.geometry&&o.geometry.type==="SphereGeometry") o.material.emissiveIntensity=day?.1:1.8; });
  };
  return v;
};

B.vnm=function(el){
  var v=stage({pos:[2,7.6,21],look:[2.2,3,0],fov:SMALL?54:32,shadow:16}), s=v.scene, ac=accent().getHex();
  var tw=new T.Group(); tw.position.set(-7,0,0); s.add(tw); houseBody(tw,4,10,4);
  var L=[]; for(var r=0;r<2;r++) for(var c=0;c<3;c++) L.push([-7+(c-1)*1.12,10.62+r*.08,.2+r*1.05,(r*3+c)*.1]);
  var f=field(L,1.02,.9,-.28); s.add(f);
  var gm=new T.Group(); gm.position.set(-4.75,0,1.2); s.add(gm); gm.add(box(.9,1.3,.5,M.dark,0,.65,0)); var gs=box(.6,.25,.02,M.lit(0xffc24a,1.3),0,.95,.26); gs.castShadow=false; gm.add(gs);
  var pm=M.steel; [0,5.5].forEach(function(x){ var g=new T.Group(); g.position.set(x,0,0); s.add(g); [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ var leg=cyl(.04,.06,5.4,pm,q[0]*.4,2.7,q[1]*.4,6); leg.rotation.z=-q[0]*.1; leg.rotation.x=q[1]*.1; g.add(leg); }); g.add(box(2.4,.07,.07,pm,0,5,0)); g.add(box(1.7,.07,.07,pm,0,4.2,0)); });
  var wm=S({color:0x2a3350,roughness:.5,metalness:.6}), lm=new T.MeshBasicMaterial({color:0x4a556b});
  var up=tube([[-7,10.7,-.4],[-5.2,10,-.6],[-4.75,1.4,1.2]],.04,wm); s.add(up);
  var line=tube([[-4.75,1.3,1.2],[-2,4.6,.4],[0,5,0],[2.8,4.4,0],[5.5,5,0],[7,3,0]],.03,lm); s.add(line);
  var wall=box(9.5,2.6,.4,M.wall2,9.5,1.3,-2.2); s.add(wall);
  var meters=[], branches=[];
  for(var i=0;i<6;i++){ var x=5.6+i*1.55, m=new T.Group(); m.position.set(x,1.5,-1.9); s.add(m); m.add(box(.9,1.2,.3,M.dark)); var sc=box(.56,.24,.02,M.lit(0x7dffb4,.08),0,.22,.16); sc.castShadow=false; m.add(sc); meters.push(sc);
    var b=tube([[7,3,0],[x,2.6,-.6],[x,2.1,-1.7]],.025,lm); s.add(b); branches.push(pulses(s,b.userData.curve,2,0x7dffb4)); }
  var pu=pulses(s,up.userData.curve,4,0xffc24a), pl=pulses(s,line.userData.curve,6,ac);
  [["Rooftop plant",-7,13.4,0],["Generation meter",-4.75,2.5,1.2],["DISCOM grid",2.8,6.6,0],["Credits shared across flat meters",9.5,3.9,-2]].forEach(function(q){ var sp=label(q[0],q[0].length>20?1.2:.85); sp.position.set(q[1],q[2],q[3]); s.add(sp); });
  v.sun.position.set(-6,22,12);
  v.update=function(t,ctx){ rise(f,t,ctx.first,1); orbit(v,t,.16,.14); pu.run(t,true,false,.4); pl.run(t,true,false,.22);
    branches.forEach(function(b,i){ b.run(t+i*.17,true,false,.5); var k=((t+i*.17)*.5)%1; meters[i].material.emissiveIntensity=k>.8?1.6:.2; }); };
  return v;
};

B.papers=function(el){
  var v=stage({pos:[3.2,5.2,5.4],look:[0,.5,0],fov:30,shadow:5}), s=v.scene, g=new T.Group(); s.add(g);
  g.add(box(4.6,.12,3.4,S({color:0x3a2c22,roughness:.55,metalness:.1}),0,-.06,0));
  var names=["Committee resolution","General body resolution","Authorisation letter","Registration certificate","Builder NOC","DISCOM approval"], sheets=[];
  names.forEach(function(n,i){ var t=tex(512,724,function(c,w,h){ c.fillStyle="#eef0f3"; c.fillRect(0,0,w,h); c.fillStyle="#1F3BE0"; c.fillRect(40,46,180,10); c.fillStyle="#0e1530"; c.font="600 34px 'Instrument Sans',Arial"; c.fillText(n,40,110); c.fillStyle="#b6bcc8"; for(var y=160;y<620;y+=30) c.fillRect(40,y,w-80-(y%90?0:120),7); c.fillStyle="#0e1530"; c.fillRect(300,650,160,3); });
    var m=new T.Mesh(new T.BoxGeometry(1.5,.012,2.12),[M.white,M.white,new T.MeshStandardMaterial({map:t,roughness:.8}),M.white,M.white,M.white]); m.castShadow=true; m.receiveShadow=true; g.add(m); sheets.push(m); m.userData.r=(i%2?1:-1)*(.05+i*.02); });
  var seal=cyl(.32,.32,.08,P({color:accent().getHex(),roughness:.25,metalness:1}),.35,3,.55,40); g.add(seal);
  v.update=function(t){ orbit(v,t,.3,.2); var cyc=RM?6.5:(t%9);
    sheets.forEach(function(m,i){ var k=ease((cyc-i*.7)/.8); m.position.set((1-k)*(i%2?1.8:-1.8),.02+i*.016+(1-k)*3.2,(1-k)*-.6); m.rotation.set((1-k)*.6,m.userData.r+(1-k)*.9,(1-k)*.3); m.visible=cyc>i*.7-.05; });
    var ks=ease((cyc-5)/.6); seal.position.y=.16+(1-ks)*3; seal.visible=cyc>4.9; seal.rotation.y=t; };
  return v;
};

/* ---------------------------------------------------------------- loop */
var views=[], T0=performance.now();
LL.scan=function(){ views=[].slice.call(document.querySelectorAll(".view[data-view]")).filter(function(e){ return !e.closest("[hidden]"); }); };
function build(el){ if(el.__v!==undefined) return el.__v; var b=B[el.getAttribute("data-view")]; try{ el.__v=b?b(el):null; }catch(e){ el.__v=null; if(window.console) console.warn("scene",el.getAttribute("data-view"),e); } if(el.__v) el.__v.first=0; return el.__v; }
function draw(v,t,vp,sc,ctx){
  var H=innerHeight; if(!v.first) v.first=t; ctx.first=v.first;
  v.cam.aspect=vp.width/vp.height; if(v.update) v.update(t,ctx); v.cam.updateProjectionMatrix();
  R.setViewport(vp.left,H-vp.bottom,vp.width,vp.height); R.setScissor(sc.left,H-sc.bottom,sc.width,sc.height); R.render(v.scene,v.cam);
}
function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden) return;
  var t=RM?4:Math.max(0,(now-T0)/1000), H=innerHeight, W=innerWidth;
  R.setScissorTest(false); R.clear(); R.setScissorTest(true);
  for(var i=0;i<views.length;i++){
    var el=views[i];
    if(el.classList.contains("view--fixed")){
      var hosts=el.parentNode.querySelectorAll(el.getAttribute("data-hosts")), full={left:0,bottom:H,width:W,height:H};
      for(var h=0;h<hosts.length;h++){ var r=hosts[h].getBoundingClientRect(); if(r.bottom<=0||r.top>=H) continue; var v=build(el); if(!v) break;
        var top=Math.max(0,r.top), bot=Math.min(H,r.bottom); draw(v,t,full,{left:0,bottom:bot,width:W,height:bot-top},{rect:r,host:hosts[h],el:el}); break; }
      continue;
    }
    var rc=el.getBoundingClientRect(); if(rc.bottom<0||rc.top>H||rc.width<8||rc.height<8) continue;
    var vv=build(el); if(!vv) continue;
    var box={left:rc.left,bottom:rc.bottom,width:rc.width,height:rc.height}; draw(vv,t,box,box,{rect:rc,el:el});
  }
}
LL.scan(); requestAnimationFrame(frame);
})();
