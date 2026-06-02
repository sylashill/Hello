/* ============================================================
   reader.js — PDF okuyucu
   ÖNEMLİ: temel ölçek = ekran genişliği / sayfa genişliği.
   Böylece PDF her telefonda tam oturur. "zoom" bunun çarpanıdır
   (100% = ekrana sığdır).
   Her kitabın kendi okuma ayarları kitap kaydında saklanır.
   ============================================================ */

const READ_THEMES = {
  day:   { bg:'#f4ece0', filter:'none',      bright:100, contrast:100 },
  sepia: { bg:'#e8dcc0', filter:'sepia',     bright:100, contrast:100 },
  night: { bg:'#2b2620', filter:'none',      bright:90,  contrast:100 },
  black: { bg:'#000000', filter:'invert',    bright:100, contrast:100 },
};
const READ_BG_SWATCHES = ['#f4ece0','#e8dcc0','#dce8dc','#2b2b2b','#1a1a1a','#000000'];
const HL_COLORS = ['#b8924a','#e0b84a','#7db58a','#7fa8d8','#cf85a0','#d98a5a'];

/* okuyucu durumu */
let R = { pdf:null, book:null, page:1, mode:'scroll', rendering:false, _zt:null };

/* kitap ayarları için varsayılan */
function defaultReaderPrefs(){
  return { mode:'scroll', fit:'width', zoom:100, theme:'night',
           bg:'#2b2b2b', filter:'none', bright:100, contrast:100,
           margin:10, gap:12, hlColor:'#b8924a', showPage:true, tapTurn:true };
}

async function openBook(id){
  const b = await dbGet('books', id); if(!b) return;
  b.prefs = Object.assign(defaultReaderPrefs(), b.prefs||{});
  b.bookmarks = b.bookmarks||[]; b.highlights = b.highlights||[];
  b.lastOpened = Date.now(); R.book = b; await dbPut('books', b);

  go('reader');
  document.getElementById('readerTitle').textContent = b.title;
  R.mode = b.prefs.mode; R.page = b.lastPage||1;
  applyReaderVisuals();
  const stage = document.getElementById('readerStage');
  stage.innerHTML = '<div style="color:#888;margin:auto">…</div>';
  R.pdf = await pdfjsLib.getDocument({data:b.data.slice(0)}).promise;
  b.numPages = R.pdf.numPages; await dbPut('books', b);
  document.getElementById('pageSlider').max = R.pdf.numPages;
  updateBookmarkBtn();
  // ölçüm doğru olsun diye bir kare bekle
  requestAnimationFrame(()=> renderReader());
}

/* görsel ayarları (renk/filtre/parlaklık) uygula */
function applyReaderVisuals(){
  const p = R.book.prefs, stage = document.getElementById('readerStage');
  stage.style.setProperty('--read-bg', p.bg);
  stage.style.setProperty('--pg-gap', p.gap+'px');
  stage.style.setProperty('--hl-color', p.hlColor);
  let f = `brightness(${p.bright/100}) contrast(${p.contrast/100})`;
  if(p.filter==='sepia') f += ' sepia(.6)';
  if(p.filter==='gray')  f += ' grayscale(1)';
  if(p.filter==='invert')f += ' invert(1) hue-rotate(180deg)';
  stage.style.filter = f;
  document.getElementById('readerBottom').style.display = p.showPage?'block':'none';
}

async function renderReader(){
  if(R.rendering || !R.pdf) return; R.rendering = true;
  const stage = document.getElementById('readerStage');
  stage.innerHTML = '';
  stage.classList.toggle('paged', R.mode==='paged');
  // dokunma bölgeleri (sayfa modunda)
  if(R.mode==='paged' && R.book.prefs.tapTurn){
    const lz=document.createElement('div'); lz.className='tap-zone left'; lz.onclick=e=>{e.stopPropagation();turnPage(-1)};
    const rz=document.createElement('div'); rz.className='tap-zone right'; rz.onclick=e=>{e.stopPropagation();turnPage(1)};
    stage.appendChild(lz); stage.appendChild(rz);
  }
  if(R.mode==='scroll'){
    for(let i=1;i<=R.pdf.numPages;i++){ await renderPage(i, stage, false); }
    stage.onscroll = throttle(updateScrollPage, 250);
    // son okunan sayfaya git
    const w = stage.querySelector(`.pdf-page-wrap[data-page="${R.page}"]`);
    if(w) stage.scrollTop = w.offsetTop - 8;
  } else {
    await renderPage(R.page, stage, true);
  }
  updatePageInfo(); R.rendering = false;
}

/* TEK SAYFA — sığdırma mantığı burada */
async function renderPage(num, stage, paged){
  const page = await R.pdf.getPage(num);
  const base = page.getViewport({scale:1});
  const p = R.book.prefs;
  const usableW = Math.max(stage.clientWidth - p.margin*2, 120);

  let scale = (usableW / base.width) * (p.zoom/100);          // genişliğe sığdır × zoom
  if(paged && p.fit==='page'){
    const usableH = Math.max(stage.clientHeight - p.margin*2, 200);
    scale = Math.min(usableW/base.width, usableH/base.height) * (p.zoom/100);
  }
  const vp = page.getViewport({scale});

  const wrap = document.createElement('div');
  wrap.className='pdf-page-wrap'; wrap.dataset.page=num;
  wrap.style.width = vp.width+'px'; wrap.style.height = vp.height+'px';

  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const cv = document.createElement('canvas');
  cv.width = Math.floor(vp.width*dpr); cv.height = Math.floor(vp.height*dpr);
  cv.style.width = vp.width+'px'; cv.style.height = vp.height+'px';
  const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
  wrap.appendChild(cv);

  const tint = document.createElement('div'); tint.className='read-tint'; wrap.appendChild(tint);
  stage.appendChild(wrap);

  await page.render({canvasContext:ctx, viewport:vp}).promise;

  /* metin katmanı (seçim/vurgu için) */
  const tl = document.createElement('div'); tl.className='pdf-textlayer';
  tl.style.width = vp.width+'px'; tl.style.height = vp.height+'px';
  tl.style.setProperty('--scale-factor', scale);
  wrap.appendChild(tl);
  try{
    const source = page.streamTextContent({includeMarkedContent:true});
    await pdfjsLib.renderTextLayer({textContentSource:source, container:tl, viewport:vp, textDivs:[]}).promise;
  }catch(e){ /* taranmış PDF'lerde metin olmayabilir */ }

  /* mevcut vurgular */
  (R.book.highlights||[]).filter(h=>h.page===num).forEach(h=>{
    (h.rects||[]).forEach(r=>{
      const o=document.createElement('div'); o.className='hl-overlay';
      o.style.left=(r.x*vp.width)+'px'; o.style.top=(r.y*vp.height)+'px';
      o.style.width=(r.w*vp.width)+'px'; o.style.height=(r.h*vp.height)+'px';
      wrap.appendChild(o);
    });
  });
}

/* ---- gezinme ---- */
function updatePageInfo(){
  document.getElementById('pageInfo').textContent = `${R.page} / ${R.pdf?R.pdf.numPages:'—'}`;
  document.getElementById('pageSlider').value = R.page;
}
function updateScrollPage(){
  const stage=document.getElementById('readerStage');
  const mid = stage.scrollTop + stage.clientHeight/2;
  stage.querySelectorAll('.pdf-page-wrap').forEach(w=>{
    if(w.offsetTop<=mid && w.offsetTop+w.offsetHeight>=mid) R.page=+w.dataset.page;
  });
  updatePageInfo(); R.book.lastPage=R.page; dbPut('books',R.book);
}
async function turnPage(dir){
  const next = R.page + dir;
  if(next<1 || next>R.pdf.numPages) return;
  R.page = next; R.book.lastPage = next; dbPut('books',R.book);
  if(R.mode==='paged'){ await renderReader(); }
  else { const w=document.querySelector(`.pdf-page-wrap[data-page="${next}"]`); if(w) document.getElementById('readerStage').scrollTo({top:w.offsetTop-8,behavior:'smooth'}); }
  updatePageInfo(); updateBookmarkBtn();
}
async function sliderJump(v){
  R.page=+v; R.book.lastPage=R.page; dbPut('books',R.book);
  if(R.mode==='paged'){ await renderReader(); }
  else { const w=document.querySelector(`.pdf-page-wrap[data-page="${v}"]`); if(w) document.getElementById('readerStage').scrollTo({top:w.offsetTop-8,behavior:'smooth'}); }
  updatePageInfo(); updateBookmarkBtn();
}

/* ---- üst/alt çubuk göster-gizle ---- */
let chromeHidden=false;
function toggleReaderChrome(){
  const sel=window.getSelection(); if(sel && sel.toString().trim()) return;
  chromeHidden=!chromeHidden;
  document.getElementById('readerTop').classList.toggle('hidden',chromeHidden);
  document.getElementById('readerBottom').classList.toggle('hidden',chromeHidden);
}
function closeReader(){
  if(R.pdf && R.pdf.destroy) R.pdf.destroy();
  R={pdf:null,book:null,page:1,mode:'scroll',rendering:false,_zt:null};
  go('library');
}

/* ============================================================
   OKUMA AYARLARI (Aa) — kitaba özel
   ============================================================ */
function buildReadSheet(){
  const p=R.book.prefs, el=document.getElementById('readBody'); let h='';

  h += `<div class="field"><label>${t('readMode')}</label><div class="seg">
    <button class="${R.mode==='scroll'?'on':''}" onclick="setPref('mode','scroll')">${t('scroll')}</button>
    <button class="${R.mode==='paged'?'on':''}" onclick="setPref('mode','paged')">${t('paged')}</button>
  </div></div>`;

  if(R.mode==='paged'){
    h += `<div class="field"><label>${t('fitMode')}</label><div class="seg">
      <button class="${p.fit==='width'?'on':''}" onclick="setPref('fit','width')">${t('fitWidth')}</button>
      <button class="${p.fit==='page'?'on':''}" onclick="setPref('fit','page')">${t('fitPage')}</button>
    </div></div>`;
  }

  h += `<div class="field"><label>${t('zoom')}</label><div class="range-row">
    <input type="range" min="50" max="300" value="${p.zoom}" oninput="setPrefLive('zoom',this.value,'%')">
    <span class="val" id="v_zoom">${p.zoom}%</span></div></div>`;

  h += `<div class="field"><label>${t('presets')}</label><div class="seg">
    <button onclick="applyReadTheme('day')">${t('day')}</button>
    <button onclick="applyReadTheme('sepia')">${t('sepia')}</button>
    <button onclick="applyReadTheme('night')">${t('night')}</button>
    <button onclick="applyReadTheme('black')">${t('black')}</button>
  </div></div>`;

  h += `<div class="field"><label>${t('readBg')}</label><div class="color-row">`;
  READ_BG_SWATCHES.forEach(c=>{ h += `<div class="swatch ${p.bg===c?'sel':''}" style="background:${c}" onclick="setPref('bg','${c}')"></div>`; });
  h += `<label class="swatch custom">✎<input type="color" value="${p.bg}" oninput="setPref('bg',this.value)"></label></div></div>`;

  h += `<div class="field"><label>${t('filter')}</label><div class="seg">
    <button class="${p.filter==='none'?'on':''}" onclick="setPref('filter','none')">${t('fNone')}</button>
    <button class="${p.filter==='sepia'?'on':''}" onclick="setPref('filter','sepia')">${t('fSepia')}</button>
    <button class="${p.filter==='gray'?'on':''}" onclick="setPref('filter','gray')">${t('fGray')}</button>
    <button class="${p.filter==='invert'?'on':''}" onclick="setPref('filter','invert')">${t('fInvert')}</button>
  </div></div>`;

  h += `<div class="field"><label>${t('brightness')}</label><div class="range-row">
    <input type="range" min="30" max="100" value="${p.bright}" oninput="setPrefLive('bright',this.value,'%',true)">
    <span class="val" id="v_bright">${p.bright}%</span></div></div>`;

  h += `<div class="field"><label>${t('contrast')}</label><div class="range-row">
    <input type="range" min="70" max="160" value="${p.contrast}" oninput="setPrefLive('contrast',this.value,'%',true)">
    <span class="val" id="v_contrast">${p.contrast}%</span></div></div>`;

  h += `<div class="field"><label>${t('margin')}</label><div class="range-row">
    <input type="range" min="0" max="40" value="${p.margin}" oninput="setPrefLive('margin',this.value,'px')">
    <span class="val" id="v_margin">${p.margin}px</span></div></div>`;

  if(R.mode==='scroll'){
    h += `<div class="field"><label>${t('pageGap')}</label><div class="range-row">
      <input type="range" min="0" max="40" value="${p.gap}" oninput="setPrefLive('gap',this.value,'px',true)">
      <span class="val" id="v_gap">${p.gap}px</span></div></div>`;
  }

  h += `<div class="field"><label>${t('hlColor')}</label><div class="color-row">`;
  HL_COLORS.forEach(c=>{ h += `<div class="swatch ${p.hlColor===c?'sel':''}" style="background:${c}" onclick="setPref('hlColor','${c}')"></div>`; });
  h += `</div></div>`;

  h += `<div class="switch-row"><span class="sl">${t('showPage')}</span><button class="toggle ${p.showPage?'on':''}" onclick="togglePref('showPage')"></button></div>`;
  if(R.mode==='paged')
    h += `<div class="switch-row"><span class="sl">${t('tapTurn')}</span><button class="toggle ${p.tapTurn?'on':''}" onclick="togglePref('tapTurn')"></button></div>`;

  el.innerHTML = h;
}
function openReadSettings(){ buildReadSheet(); openSheet('readSheet'); }

/* canlı güncelleme (yeniden çizim gerektirmeyen) */
function setPrefLive(key, val, unit, visualOnly){
  val = +val; R.book.prefs[key]=val;
  const span=document.getElementById('v_'+key); if(span) span.textContent=val+(unit||'');
  if(visualOnly){ applyReaderVisuals(); dbPut('books',R.book); return; }
  // boyut/marj → yeniden çiz (gecikmeli)
  applyReaderVisuals();
  clearTimeout(R._zt); R._zt=setTimeout(()=>{ dbPut('books',R.book); renderReader(); }, 220);
}
/* yeniden çizim/uygulama gereken seçimler */
async function setPref(key, val){
  R.book.prefs[key]=val;
  if(key==='mode') R.mode=val;
  await dbPut('books',R.book);
  applyReaderVisuals();
  if(['mode','fit','bg','filter'].includes(key)) await renderReader();
  buildReadSheet();
}
async function togglePref(key){
  R.book.prefs[key]=!R.book.prefs[key]; await dbPut('books',R.book);
  applyReaderVisuals();
  if(key==='tapTurn') await renderReader();
  buildReadSheet();
}
async function applyReadTheme(name){
  const th=READ_THEMES[name]; Object.assign(R.book.prefs, th);
  await dbPut('books',R.book); applyReaderVisuals(); await renderReader(); buildReadSheet();
}

/* ============================================================
   AYRAÇ + VURGU
   ============================================================ */
function updateBookmarkBtn(){
  document.getElementById('bmBtn').style.opacity = (R.book.bookmarks||[]).includes(R.page)?'1':'.55';
}
async function toggleBookmark(){
  R.book.bookmarks = R.book.bookmarks||[];
  const i=R.book.bookmarks.indexOf(R.page);
  if(i>=0){ R.book.bookmarks.splice(i,1); toast(t('bmRemoved')); }
  else { R.book.bookmarks.push(R.page); R.book.bookmarks.sort((a,b)=>a-b); toast(t('bmAdded')); }
  await dbPut('books',R.book); updateBookmarkBtn();
}
function openMarks(){ renderMarks(); openSheet('marksSheet'); }
function showMarkTab(which){
  document.getElementById('tabBm').classList.toggle('on',which==='bm');
  document.getElementById('tabHl').classList.toggle('on',which==='hl');
  document.getElementById('bmList').style.display=which==='bm'?'block':'none';
  document.getElementById('hlList').style.display=which==='hl'?'block':'none';
}
function renderMarks(){
  const bm=document.getElementById('bmList'), hl=document.getElementById('hlList');
  const bms=R.book.bookmarks||[];
  bm.innerHTML = bms.length?'':`<div class="empty-mini">${t('noBm')}</div>`;
  bms.forEach(pg=>{
    const d=document.createElement('div'); d.className='hl-item';
    d.innerHTML=`<span class="pg">${t('page')} ${pg}</span>`;
    d.onclick=()=>{ closeSheets(); sliderJump(pg); };
    bm.appendChild(d);
  });
  const hls=R.book.highlights||[];
  hl.innerHTML = hls.length?'':`<div class="empty-mini">${t('noHl')}</div>`;
  hls.forEach((h,idx)=>{
    const d=document.createElement('div'); d.className='hl-item';
    d.innerHTML=`<span class="pg">${t('page')} ${h.page}</span>${esc(h.text)}<button class="hx" onclick="event.stopPropagation();delHighlight(${idx})">✕</button>`;
    d.onclick=()=>{ closeSheets(); sliderJump(h.page); };
    hl.appendChild(d);
  });
}
async function delHighlight(i){ R.book.highlights.splice(i,1); await dbPut('books',R.book); renderMarks(); renderReader(); }

/* seçim → "İşaretle" balonu */
let selPopup=null;
document.addEventListener('selectionchange', ()=>{
  if(!document.getElementById('reader').classList.contains('active')) return;
  const sel=window.getSelection();
  if(sel && sel.toString().trim().length>1) showSelPopup(sel);
  else if(selPopup){ selPopup.remove(); selPopup=null; }
});
function showSelPopup(sel){
  if(selPopup) selPopup.remove();
  const rect=sel.getRangeAt(0).getBoundingClientRect();
  selPopup=document.createElement('button');
  selPopup.className='sel-popup'; selPopup.textContent='✦ '+t('highlight');
  selPopup.style.left=Math.min(Math.max(rect.left+rect.width/2-55,10),window.innerWidth-120)+'px';
  selPopup.style.top=Math.max(rect.top-46,60)+'px';
  selPopup.onclick=()=>saveHighlight(sel);
  document.body.appendChild(selPopup);
}
async function saveHighlight(sel){
  const text=sel.toString().trim(); if(!text) return;
  let node=sel.anchorNode; while(node && !(node.classList && node.classList.contains('pdf-page-wrap'))) node=node.parentNode;
  const pg = node?+node.dataset.page:R.page;
  const rects=[];
  if(node){
    const wr=node.getBoundingClientRect();
    for(const r of sel.getRangeAt(0).getClientRects()){
      rects.push({ x:(r.left-wr.left)/wr.width, y:(r.top-wr.top)/wr.height, w:r.width/wr.width, h:r.height/wr.height });
    }
  }
  R.book.highlights = R.book.highlights||[];
  R.book.highlights.push({page:pg, text, rects});
  R.book.highlights.sort((a,b)=>a.page-b.page);
  await dbPut('books',R.book);
  sel.removeAllRanges(); if(selPopup){ selPopup.remove(); selPopup=null; }
  toast(t('hlAdded')); renderReader();
}

/* yön tuşları (klavye / APK donanım) */
document.addEventListener('keydown', e=>{
  if(!document.getElementById('reader').classList.contains('active')) return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown') turnPage(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp') turnPage(-1);
});
