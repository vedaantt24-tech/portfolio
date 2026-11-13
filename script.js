const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#yr').textContent=new Date().getFullYear();

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// Count-up stats
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target.querySelector('b'),end=+el.dataset.count,suf=el.dataset.suffix||'';let n=0;
  const t=setInterval(()=>{n++;el.textContent=n+suf;if(n>=end)clearInterval(t)},Math.max(30,900/end));
  co.unobserve(e.target);
}),{threshold:.6});
document.querySelectorAll('.stats > div').forEach(el=>co.observe(el));

/* ---------- HoldButton (plain JS version of the React Bits component) ---------- */
function holdButton(host,{label,done,ms=1500,onHold}){
  const b=document.createElement('button');b.type='button';b.className='hold-btn';
  const L=t=>`<span class="hb-l">${t}</span>`;
  b.innerHTML=L(label)+`<span class="hb-fill" aria-hidden="true">${L(label)}</span><span class="hb-sr">Press and hold for ${ms/1000} seconds to confirm</span>`;
  host.append(b);
  let p=0,raf=0,t0=0,on=0,fin=0;
  const set=v=>{p=v;b.style.setProperty('--p',v)};
  const run=n=>{const v=Math.min(1,(n-t0)/ms);set(v);if(v>=1){on=0;fin=1;b.querySelectorAll('.hb-l').forEach(x=>x.textContent=done);onHold&&onHold();return}raf=requestAnimationFrame(run)};
  const start=()=>{if(on||fin)return;on=1;t0=performance.now()-p*ms;raf=requestAnimationFrame(run)};
  const stop=()=>{if(!on)return;on=0;cancelAnimationFrame(raf);const f=p,s=performance.now();const back=n=>{const u=Math.min(1,(n-s)/200);set(f*Math.pow(1-u,3));if(u<1)raf=requestAnimationFrame(back)};raf=requestAnimationFrame(back)};
  b.addEventListener('pointerdown',e=>{if(e.button===0){b.dataset.hold=1;start()}});
  ['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>{delete b.dataset.hold;stop()}));
  b.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();start()}if(e.key==='Escape')stop()});
  b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')stop()});
  b.addEventListener('blur',stop);b.addEventListener('contextmenu',e=>e.preventDefault());
}

/* ---------- TechText (plain JS version of the React Bits component) ---------- */
function techText(el,text){
  const cv=document.createElement('canvas'),c=cv.getContext('2d');
  cv.style.cssText='display:block;width:100%;height:100%';
  el.append(cv);el.setAttribute('role','img');el.setAttribute('aria-label',text);
  const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,SPR=320,DMP=2*Math.sqrt(SPR)*(1-.4*.96);
  const fnt=s=>`800 ${s}px "Plus Jakarta Sans",system-ui,sans-serif`;
  const ap=(a,b,dt,s)=>a+(b-a)*(1-Math.exp(-dt/s));
  const rnd=(a,b)=>{const h=Math.sin(a*127.1+b*311.7)*43758.5;return h-Math.floor(h)};
  let W,H,D,S,B,G=[],P={x:0,y:0,in:0},L=0,F={x1:0,y1:0,x2:0,y2:0,a:0,i:-1},T=0,sw=0,vis=0,raf=0,last=0;
  function layout(){
    W=el.clientWidth;H=el.clientHeight;if(!W||!H)return;
    D=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*D);cv.height=Math.round(H*D);
    c.font=fnt(100);S=Math.min(260,100*W*.92/c.measureText(text).width,H*.8);
    c.font=fnt(S);const m=c.measureText(text),x0=(W-m.width)/2;B=(H+m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
    G=[...text].map((ch,i)=>{const q=c.measureText(ch);return{ch,x:x0+c.measureText(text.slice(0,i)).width,w:q.width,y1:B-q.actualBoundingBoxAscent,y2:B+q.actualBoundingBoxDescent,o:0,oy:0,v:0}}).filter(g=>g.ch.trim());
  }
  function draw(now){
    raf=0;const dt=Math.min(.05,(now-last)/1e3||.016);last=now;T+=dt;if(!G.length)return;
    const ink=getComputedStyle(el).color,acc=getComputedStyle(document.documentElement).getPropertyValue('--y').trim()||'#FFC93C';
    const g0=G[0],g1=G[G.length-1];let tx=P.x;
    if(!P.in){if(!RM)sw+=dt;tx=g0.x+(g1.x+g1.w-g0.x)*(.5-.5*Math.cos(sw*.45))}
    L=ap(L,tx,dt,P.in?.05:.22);
    const away=P.in&&Math.abs(P.y-(B-S*.35))>S*.75;let k=-1,best=1e9;
    if(!away)G.forEach((g,i)=>{const d=L<g.x?g.x-L:L>g.x+g.w?L-g.x-g.w:0;if(d<best){best=d;k=i}});
    G.forEach((g,i)=>{g.v+=(-SPR*g.oy-DMP*g.v)*dt;g.oy+=g.v*dt;g.o=ap(g.o,i===k?1:0,dt,.09)});
    const a=G[k];
    if(a){const b=[a.x-6,a.y1+a.oy-6,a.x+a.w+6,a.y2+a.oy+6];if(F.a<.02||F.i<0){F.x1=b[0];F.y1=b[1];F.x2=b[2];F.y2=b[3]}
      F.x1=ap(F.x1,b[0],dt,.08);F.y1=ap(F.y1,b[1],dt,.08);F.x2=ap(F.x2,b[2],dt,.08);F.y2=ap(F.y2,b[3],dt,.08);F.i=k}
    F.a=ap(F.a,a?1:0,dt,.1);
    c.setTransform(D,0,0,D,0,0);c.clearRect(0,0,W,H);c.font=fnt(S);c.textBaseline='alphabetic';c.lineJoin='round';
    G.forEach(g=>{
      if(g.o<.99){c.globalAlpha=1-g.o;c.fillStyle=ink;c.fillText(g.ch,g.x,B+g.oy)}
      const m=Math.max(g.o,Math.min(1,Math.abs(g.oy)/24)*.55);
      if(m>.01){c.globalAlpha=m;c.strokeStyle=ink;c.lineWidth=1.5;c.setLineDash([4,2]);c.strokeText(g.ch,g.x,B+g.oy);c.setLineDash([])}
    });
    if(F.a>.01&&F.i>=0){
      const w=F.x2-F.x1,h=F.y2-F.y1,gg=G[F.i];
      c.strokeStyle=acc;c.fillStyle=acc;c.lineWidth=1;c.globalAlpha=.5*F.a;c.strokeRect(Math.round(F.x1)+.5,Math.round(F.y1)+.5,Math.round(w),Math.round(h));
      c.globalAlpha=.95*F.a;[[F.x1,F.y1],[F.x2,F.y1],[F.x2,F.y2],[F.x1,F.y2]].forEach(([x,y])=>c.fillRect(Math.round(x)-2,Math.round(y)-2,5,5));
      for(let s=0;s<14;s++){
        const per=.5+rnd(s,11)*1.2,u=T/per+rnd(s,17),cy=Math.floor(u),life=u-cy;if(life>.7)continue;
        const d=rnd(s,cy)*2*(w+h);let px,py,nx=0,ny=0;
        if(d<w){px=F.x1+d;py=F.y1;ny=-1}else if(d<w+h){px=F.x2;py=F.y1+d-w;nx=1}else if(d<2*w+h){px=F.x2-(d-w-h);py=F.y2;ny=1}else{px=F.x1;py=F.y2-(d-2*w-h);nx=-1}
        const o=4+Math.floor(rnd(s,cy+1)*5)*3,r=rnd(s,cy+2),z=r<.6?2:r<.85?3:5;
        c.globalAlpha=F.a*(.3+.6*rnd(s,cy+3))*((life<.06||(life>.32&&life<.36))?.35:1);
        c.fillRect(Math.round(px+nx*o-z/2),Math.round(py+ny*o-z/2),z,z);
      }
      c.font='10px ui-monospace,Menlo,Consolas,monospace';c.textBaseline='bottom';c.globalAlpha=.62*F.a;
      c.fillText(`${gg.ch}  ${Math.round(gg.w)} × ${Math.round(gg.y2-gg.y1)}`,Math.round(F.x1),Math.round(F.y1)-7);
    }
    c.globalAlpha=1;
    if(vis&&(P.in||!RM||G.some(g=>Math.abs(g.oy)>.05||Math.abs(g.v)>.5)||F.a>.01))raf=requestAnimationFrame(draw);
  }
  const wake=()=>{if(!raf&&vis){last=performance.now();raf=requestAnimationFrame(draw)}};
  const loc=e=>{const r=el.getBoundingClientRect();P.x=e.clientX-r.left;P.y=e.clientY-r.top};
  const kick=i=>{const s=S*11;G[i].v-=s;for(let d=1;d<G.length;d++){const v=s*Math.pow(.62,d);if(v<30)break;[i-d,i+d].forEach(j=>G[j]&&(G[j].v-=v))}};
  ['pointermove','pointerenter'].forEach(n=>el.addEventListener(n,e=>{loc(e);P.in=1;wake()},{passive:true}));
  el.addEventListener('pointerleave',()=>{P.in=0;wake()});
  el.addEventListener('pointerdown',e=>{loc(e);P.in=1;if(!RM){const i=G.findIndex(g=>P.x>=g.x-10&&P.x<=g.x+g.w+10&&P.y>g.y1-30&&P.y<g.y2+30);if(i>=0)kick(i)}wake()},{passive:true});
  new ResizeObserver(()=>{layout();wake()}).observe(el);
  new IntersectionObserver(([e])=>{vis=e.isIntersecting;wake()}).observe(el);
  (document.fonts?document.fonts.load(fnt(100),text):Promise.resolve()).then(()=>{layout();wake()},()=>{layout();wake()});
}
techText($('#wordmark'),'Yash');

/* ---------- Projects (data lives in projects.js) ---------- */
const KEY='yash-projects-draft',clone=o=>JSON.parse(JSON.stringify(o));
let list=(()=>{try{const d=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(d))return d}catch(e){}return clone(window.PROJECTS)})();
let filter='all',editing=-1,authed=false,dlg;
const grid=$('#pgrid'),fb=document.querySelectorAll('.fbtn');
const safe=u=>{try{const x=new URL(/^https?:\/\//i.test(u)?u:'https://'+u);return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}};
function renderProjects(){
  grid.innerHTML=list.map(p=>{const u=p.link?safe(p.link):'';return `<article class="panel rv in${u?' linked':''}" data-status="${esc(p.status)}"><div class="top"><p class="tag">${esc(p.tag)}</p><span class="status ${p.status==='done'?'done':'prog'}">${p.status==='done'?'Completed':'In progress'}</span></div><h3>${u?`<a class="plink" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}<span class="hb-sr"> (opens in a new tab)</span></a>`:esc(p.title)}</h3><p>${esc(p.desc)}</p>${u?`<p class="visit">${/github\.com/i.test(u)?'View on GitHub':'Open live site'} ↗</p>`:''}</article>`}).join('');
  grid.querySelectorAll('[data-status]').forEach(c=>{c.hidden=!(filter==='all'||c.dataset.status===filter)});
}
fb.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;fb.forEach(x=>x.setAttribute('aria-pressed',x===b));renderProjects()}));
renderProjects();

/* ---------- Admin editor (open the site with #admin, or use the Admin link) ---------- */
const ADMIN_HASH='d831ad42f6c7b4b322a12233efec840787967fcdd232f504cf19d43ba6ac782c'; // SHA-256 of your passcode. See README to change it.
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const exportJs=()=>'window.PROJECTS='+JSON.stringify(list,null,2)+';\n';
function persist(){try{localStorage.setItem(KEY,JSON.stringify(list))}catch(e){}renderProjects();drawAdmin()}
function openAdmin(){
  if(!dlg){dlg=document.createElement('dialog');dlg.className='adm';document.body.append(dlg);
    dlg.addEventListener('close',()=>{try{if(location.hash==='#admin')history.replaceState(null,'',location.pathname+location.search)}catch(e){}})}
  authed?drawAdmin():drawLogin();if(!dlg.open)dlg.showModal();
}
function drawLogin(){
  dlg.innerHTML='<h2>Admin</h2><p class="muted">Enter your passcode to edit projects.</p><input id="apw" type="password" autocomplete="current-password" aria-label="Passcode"><p id="aerr" class="muted" role="alert"></p><div class="arow"><button class="btn btn-y" id="alog" type="button">Unlock</button><button class="btn btn-o" id="aclose" type="button">Close</button></div>';
  const go=async()=>{if(await sha($('#apw',dlg).value)===ADMIN_HASH){authed=true;drawAdmin()}else $('#aerr',dlg).textContent='Wrong passcode.'};
  $('#alog',dlg).onclick=go;$('#apw',dlg).onkeydown=e=>e.key==='Enter'&&go();$('#aclose',dlg).onclick=()=>dlg.close();$('#apw',dlg).focus();
}
function drawAdmin(){
  if(!dlg||!authed)return;
  const p=list[editing]||{title:'',tag:'',desc:'',link:'',status:'progress'},sel=v=>p.status===v?' selected':'';
  dlg.innerHTML=`<div class="ahead"><h2>Projects</h2><button class="btn btn-o sm" id="aclose" type="button">Close</button></div>
<div class="afield"><label>Title<input id="ft" value="${esc(p.title)}"></label><label>Small label above the title<input id="fg" value="${esc(p.tag)}"></label><label>Description<textarea id="fd" rows="3">${esc(p.desc)}</textarea></label><label>Link (GitHub repo or live website, optional)<input id="fl" type="url" inputmode="url" placeholder="https://github.com/vedaantt24-tech/your-repo" value="${esc(p.link||'')}"></label><label>Status<select id="fs"><option value="progress"${sel('progress')}>In progress</option><option value="done"${sel('done')}>Completed</option></select></label>
<p class="muted small" id="aerr" role="alert"></p><div class="arow"><button class="btn btn-y" id="asave" type="button">${editing>=0?'Save changes':'Add project'}</button>${editing>=0?'<button class="btn btn-o" id="acancel" type="button">Cancel</button>':''}</div></div>
<ul class="alist">${list.map((x,i)=>`<li><div><b>${esc(x.title)}</b><br><span class="muted small">${x.status==='done'?'Completed':'In progress'}${x.link?' · link added':''}</span></div><div class="arow"><button class="btn btn-o sm" data-e="${i}" type="button">Edit</button><span data-d="${i}"></span></div></li>`).join('')}</ul>
<p class="muted small">Changes show only in this browser. To make them live for everyone, copy the code below into projects.js in VS Code and push to GitHub.</p>
<div class="arow"><button class="btn btn-y" id="acopy" type="button">Copy projects.js</button><button class="btn btn-o" id="areset" type="button">Reset to published</button></div><textarea id="aout" rows="5" readonly aria-label="projects.js code">${esc(exportJs())}</textarea>`;
  $('#aclose',dlg).onclick=()=>dlg.close();
  $('#asave',dlg).onclick=()=>{const t=$('#ft',dlg).value.trim();if(!t){$('#ft',dlg).focus();return}
    const raw=$('#fl',dlg).value.trim(),lk=raw?safe(raw):'';if(raw&&!lk){$('#aerr',dlg).textContent='That link does not look right. Paste the full address, like https://github.com/...';$('#fl',dlg).focus();return}
    const it={title:t,tag:$('#fg',dlg).value.trim(),desc:$('#fd',dlg).value.trim(),link:lk,status:$('#fs',dlg).value};
    if(editing>=0)list[editing]=it;else list.push(it);editing=-1;persist()};
  const c=$('#acancel',dlg);if(c)c.onclick=()=>{editing=-1;drawAdmin()};
  dlg.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{editing=+b.dataset.e;drawAdmin();$('#ft',dlg).focus()});
  dlg.querySelectorAll('[data-d]').forEach(s=>holdButton(s,{label:'Hold to delete',done:'Deleted',ms:1200,onHold:()=>{list.splice(+s.dataset.d,1);editing=-1;setTimeout(persist,500)}}));
  $('#acopy',dlg).onclick=async e=>{const ta=$('#aout',dlg);try{await navigator.clipboard.writeText(ta.value);e.target.textContent='Copied'}catch(_){ta.select();let ok=0;try{ok=document.execCommand('copy')}catch(__){}e.target.textContent=ok?'Copied':'Select all, then copy'}};
  $('#areset',dlg).onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}list=clone(window.PROJECTS);editing=-1;renderProjects();drawAdmin()};
}
addEventListener('hashchange',()=>{if(location.hash==='#admin')openAdmin()});
if(location.hash==='#admin')openAdmin();
