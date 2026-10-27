const $=(s,r=document)=>r.querySelector(s);
const arr=v=>Array.isArray(v)?v:(v?[v]:[]);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const jget=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(u);return r.json()};
let CFG;
async function init(){
  CFG=await jget('site.config.json');
  const cur=location.pathname.split('/').pop()||'index.html';
  $('#nav').innerHTML='<a href="index.html">'+esc(CFG.siteName)+'</a><nav aria-label="Main">'+
    CFG.nav.map(([n,h])=>'<a href="'+h+'"'+(h===cur?' aria-current="page"':'')+'>'+n+'</a>').join('')+'</nav>';
}
/* Dropbox共有リンク → 表示用URL。相対パスはそのまま(サイトのルート基準) */
function imgUrl(u){
  if(!u)return '';
  try{const x=new URL(u,document.baseURI);
    if(/(^|\.)dropbox\.com$/.test(x.hostname)){x.searchParams.delete('dl');x.searchParams.set('raw','1')}
    return x.href}catch(e){return u}
}
/* 読み込めない時は枠だけ残す */
function pic(src,alt){
  const u=imgUrl(src);
  if(!u)return '<span class="ph">'+esc(alt)+'</span>';
  return '<img src="'+esc(u)+'" alt="'+esc(alt)+'" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'ph\',textContent:this.alt}))">';
}
function video(u){
  let m;
  if(m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/))
    return '<div class="vid"><iframe src="https://www.youtube.com/embed/'+m[1]+'" loading="lazy" allowfullscreen title="video"></iframe></div>';
  if(m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/))
    return '<div class="vid"><iframe src="https://player.vimeo.com/video/'+m[1]+'" loading="lazy" allowfullscreen title="video"></iframe></div>';
  return '<div class="vid"><video src="'+esc(imgUrl(u))+'" controls preload="metadata"></video></div>';
}
/* 英語キャプションをJSONの値から組み立てる */
function caption(w){
  const p=[];
  if(w.screen)p.push('Screen: '+w.screen);
  arr(w.method).forEach(m=>p.push(m));
  if(arr(w.software).length)p.push('Software: '+arr(w.software).join(', '));
  return p.join(' / ');
}
function sortKey(w){const m=w._file.match(/(\d{4})\/(\d{2})\//);return m?m[1]+m[2]:String(w.year||0)+'00'}
async function loadWorks(){
  const out=[];
  for(const s of CFG.sources){
    let list=[];try{list=await jget(s+'/work/index.json')}catch(e){continue}
    await Promise.all(list.map(async f=>{
      try{const w=await jget(f);if(w.published===false)return;w._file=f;w._demo=(s==='demo');out.push(w)}catch(e){}
    }));
  }
  return out.sort((a,b)=>sortKey(b).localeCompare(sortKey(a))||a._file.localeCompare(b._file));
}
