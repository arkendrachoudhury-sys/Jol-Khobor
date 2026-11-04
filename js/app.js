const N={Behala:[120,480],Majerhat:[215,400],Taratala:[95,340],Alipore:[300,345],Hastings:[245,260],Esplanade:[330,195],"Central Ave":[375,130],"Amherst St":[460,75],Thanthania:[330,70],"Park Circus":[520,255],Tollygunge:[300,490],Gariahat:[430,370]};
const PRONE=["Behala","Thanthania","Park Circus"];
// id,from,to,name,drain(slow/fast),base minutes
const S=[["s1","Behala","Majerhat","Diamond Harbour Rd, Behala–Majerhat","slow",9],["s2","Majerhat","Alipore","Majerhat–Alipore","fast",8],["s3","Alipore","Hastings","Alipore–Hastings","fast",7],["s4","Hastings","Esplanade","Hastings–Esplanade","fast",8],["s5","Behala","Taratala","Behala–Taratala","slow",10],["s6","Taratala","Hastings","Taratala–Khidirpur–Hastings","slow",12],["s7","Esplanade","Central Ave","Central Avenue (south)","fast",6],["s8","Central Ave","Amherst St","Central Ave–Amherst St","fast",7],["s9","Amherst St","Thanthania","Amherst St–Thanthania","slow",5],["s10","Esplanade","Park Circus","Esplanade–Park Circus","fast",12],["s11","Behala","Tollygunge","Behala–Tollygunge","slow",12],["s12","Tollygunge","Park Circus","Tollygunge–Gariahat–Park Circus","slow",18]];
const SEG=Object.fromEntries(S.map(s=>[s[0],{id:s[0],a:s[1],b:s[2],name:s[3],drain:s[4],min:s[5]}]));
const CORR=[["Via Majerhat and Alipore",["s1","s2","s3","s4"]],["Via Taratala and Hastings",["s5","s6","s4"]],["Via Tollygunge and Park Circus",["s11","s12","s10"]]];
const D=[["Water gone",0],["Ankle (~10 cm)",10],["Shin (~25 cm)",25],["Knee (~45 cm)",45],["Thigh (~65 cm)",65],["Waist or more (~90 cm)",90]];
const MODES={Walk:65,"Two-wheeler":25,Car:35,Bus:60};
const TIER=["Unverified","Community confirmed","Field verified"];
let mode="Car",rain=true,paused=false,sel="s1",now=18*60+40,uid=0;
const R=[];
function add(seg,d,ago,tier){R.push({id:++uid,seg,d,t:now-ago,tier})}
add("s1",45,18,1);add("s5",45,22,1);add("s9",90,35,1);add("s10",25,8,0);add("s4",10,40,2);add("s3",0,15,2);add("s7",25,25,1);add("s6",65,50,0);
const fmt=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
const ttl=id=>(SEG[id].drain==="slow"?180:50)*(rain?0.6:1);
function status(id){
  const rs=R.filter(r=>r.seg===id);
  if(!rs.length)return{lv:"nodata",why:"No reports yet"};
  const r=rs.reduce((a,b)=>b.t>a.t?b:a),age=now-r.t,T=ttl(id),thr=MODES[mode];
  if(age>T)return{lv:"nodata",r,age,why:"Last report expired ("+age+" min old)"};
  let lv=r.d===0?"clear":r.d>=thr?"avoid":r.d>=thr*0.6?"caution":"clear";
  let why="";
  if(age>T/2){if(lv==="avoid")lv="caution";if(lv==="clear")lv="nodata";why="Ageing, re-check requested"}
  if(lv==="clear"&&r.tier<1){lv="nodata";why="Clear claims need confirmation"}
  return{lv,r,age,why};
}
const col={avoid:"var(--red)",caution:"var(--amber)",clear:"var(--teal)",nodata:"var(--grey)"};
const lab={avoid:"Avoid",caution:"Caution",clear:"No flooding reported",nodata:"No data"};
function drawMap(){
  let h='<path d="M20 0C70 120 40 260 70 360S30 500 50 560L0 560L0 0Z" fill="var(--river)"/><text x="14" y="200" fill="var(--mute)" font-size="12" transform="rotate(-90 14 200)">Hooghly</text>';
  S.forEach(s=>{const A=N[s[1]],B=N[s[2]],st=status(s[0]),mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;
    const sl=sel===s[0];
    h+=`<g style="cursor:pointer" data-s="${s[0]}" tabindex="0" role="button" aria-label="${s[3]}: ${lab[st.lv]}">
    <line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="transparent" stroke-width="26"/>
    ${sl?`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="var(--ink)" stroke-width="13" stroke-linecap="round" opacity=".18"/>`:""}
    <line class="${st.lv==="avoid"?"pulse":""}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${col[st.lv]}" stroke-width="7" stroke-linecap="round" ${st.lv==="nodata"?'stroke-dasharray="3 9"':""}/>
    ${st.r&&st.lv!=="nodata"?`<text class="seglabel" x="${mx+6}" y="${my-6}">T${st.r.tier}</text>`:""}</g>`});
  Object.entries(N).forEach(([n,p])=>{h+=`<g class="node">${PRONE.includes(n)?`<circle cx="${p[0]}" cy="${p[1]}" r="17" fill="none" stroke="var(--mute)" stroke-dasharray="3 3"/>`:""}<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--ink)"/><text x="${p[0]+10}" y="${p[1]+18}">${n}</text></g>`});
  const m=document.getElementById("map");m.innerHTML=h;
  m.querySelectorAll("[data-s]").forEach(g=>{const f=()=>{sel=g.dataset.s;render()};g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter")f()}});
}
function drawRoutes(){
  const rows=CORR.map(([n,ids])=>{let a=0,c=0,nd=0,base=0;ids.forEach(i=>{const l=status(i).lv;base+=SEG[i].min;if(l==="avoid")a++;else if(l==="caution")c++;else if(l==="nodata")nd++});
    const lv=a?"avoid":c?"caution":nd?"nodata":"clear";
    const msg=a?`${a} segment${a>1?"s":""} to avoid for ${mode.toLowerCase()}`:c?`${c} segment${c>1?"s":""} needing caution`:nd?`No data on ${nd} segment${nd>1?"s":""}`:"No flooding reported on any segment";
    return{n,lv,msg,eta:base+a*35+c*12+nd*4,base,score:a*100+c*10+nd*3+base,ids}}).sort((x,y)=>x.score-y.score);
  document.getElementById("routes").innerHTML=rows.map((r,i)=>`<div class="route"><b>${r.n}</b> ${i===0?'<span class="tag clear">Least affected</span>':""}<br><span class="${r.lv}">${r.msg}.</span><br><small style="color:var(--mute)">Estimated ${r.eta} min (${r.base} min normally)</small></div>`).join("")+'<p class="note">Based on reports up to '+fmt(now)+'. Conditions change fast. Use your own judgment.</p>';
}
function drawDetail(){
  const s=SEG[sel],st=status(sel);
  const last=st.r?`Last report: ${D.find(x=>x[1]===st.r.d)[0]}, ${TIER[st.r.tier]}, ${st.age} min ago.`:"No report on this segment yet.";
  document.getElementById("detail").innerHTML=`<h2>${s.name}</h2><p class="${st.lv}" style="margin:0"><b>${lab[st.lv]}</b> for ${mode.toLowerCase()}${st.why?" · "+st.why:""}</p><p style="margin:4px 0 8px">${last}</p><small style="color:var(--mute)">${s.drain==="slow"?"Slow-draining low-lying zone":"Fast-draining zone"}. Reports expire after about ${Math.round(ttl(sel))} min${rain?" while it is raining":""}.</small><br><br><button class="btn" id="fv" ${st.r&&st.r.tier<2&&st.lv!=="nodata"?"":"disabled"}>Simulate volunteer field check</button>`;
  const b=document.getElementById("fv");if(b)b.onclick=()=>{st.r.tier=2;render()};
}
function drawFeed(){
  document.getElementById("feed").innerHTML=[...R].sort((a,b)=>b.t-a.t).map(r=>{const st=status(r.seg),age=now-r.t;
    return`<li><span><b>${SEG[r.seg].name}</b><br><small>${D.find(x=>x[1]===r.d)[0]} · ${age} min ago</small></span><span style="text-align:right"><span class="tag t${r.tier}">${TIER[r.tier]}</span><br><small class="${age>ttl(r.seg)?"nodata":""}">${age>ttl(r.seg)?"Expired":"Active"}</small></span></li>`}).join("");
}
function stats(){
  let a=0,n=0;S.forEach(s=>{const l=status(s[0]).lv;if(l==="avoid")a++;if(l==="nodata")n++});
  s1.textContent=a;s2.textContent=n;s3.textContent=R.filter(r=>now-r.t<=60).length;
  clock.textContent="Simulated time "+fmt(now)+(paused?" (paused)":"");
}
function render(){drawMap();drawRoutes();drawDetail();drawFeed();stats()}
// controls
const modes=document.getElementById("modes");
Object.keys(MODES).forEach(m=>{const b=document.createElement("button");b.textContent=m;b.setAttribute("aria-pressed",m===mode);b.onclick=()=>{mode=m;modes.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.textContent===m));render()};modes.appendChild(b)});
fs.innerHTML=S.map(s=>`<option value="${s[0]}">${s[3]}</option>`).join("");
fd.innerHTML=D.map(d=>`<option value="${d[1]}">${d[0]}</option>`).join("");fd.value=45;
send.onclick=()=>{const seg=fs.value,d=+fd.value;const prev=R.filter(r=>r.seg===seg&&now-r.t<=20);
  const tier=prev.length?1:0;prev.forEach(p=>{if(p.tier<1)p.tier=1});add(seg,d,0,tier);sel=seg;render()};
document.getElementById("rain").onclick=e=>{rain=!rain;e.target.setAttribute("aria-pressed",rain);e.target.textContent=rain?"Raining now":"Rain stopped";render()};
document.getElementById("pause").onclick=e=>{paused=!paused;e.target.textContent=paused?"Resume clock":"Pause clock";stats()};
document.getElementById("theme").onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).colorScheme==="dark";r.setAttribute("data-theme",d?"light":"dark")};
setInterval(()=>{if(!paused){now++;render()}},2500);
render();
