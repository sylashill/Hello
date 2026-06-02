/* ============================================================
   settings.js — Genel özelleştirme
   Tema (aydınlık/karanlık/oto), vurgu rengi, yazı tipi, dil,
   ana sayfa arka planı, tarif arka planı, yedekleme.
   ============================================================ */

/* ---- Hazır seçenekler ---- */
const ACCENTS = [
  {name:'Kiremit', c:'#9c4a2f', c2:'#c97b4a'},
  {name:'Orman',   c:'#3f6b4f', c2:'#6a9c7d'},
  {name:'Lacivert',c:'#2f4a6b', c2:'#5a7da8'},
  {name:'Erik',    c:'#6b3f5f', c2:'#a06b8f'},
  {name:'Altın',   c:'#8a6d2f', c2:'#bda05a'},
  {name:'Gül',     c:'#a8536b', c2:'#cf85a0'},
  {name:'Okyanus', c:'#2f6b6b', c2:'#5aa8a8'},
];
const FONTS = {
  literary:{ key:'fontLiterary', d:"'Fraunces',Georgia,serif",        b:"'Newsreader',Georgia,serif" },
  classic: { key:'fontClassic',  d:"'Playfair Display',Georgia,serif", b:"'Lora',Georgia,serif" },
  clean:   { key:'fontClean',    d:"'Bricolage Grotesque',sans-serif", b:"'Source Sans 3',sans-serif" },
  cozy:    { key:'fontCozy',     d:"'Quicksand',sans-serif",           b:"'Nunito',sans-serif" },
};
const HOME_SOLIDS = ['#f4ece0','#e8e0d4','#dce4dd','#e4dce4','#f0e2d8','#2b2620','#1f2937','#27332b'];
const HOME_GRADS = [
  'linear-gradient(160deg,#f6d8b8,#e88a6a)',
  'linear-gradient(160deg,#cfe0f0,#7fa8d8)',
  'linear-gradient(160deg,#d4e8d4,#7db58a)',
  'linear-gradient(160deg,#2b2620,#473b2c)',
  'linear-gradient(160deg,#3a2a3a,#6b4a6b)',
  'linear-gradient(160deg,#f0e2d8,#c9a87a)',
];
const REC_BGS = [
  'linear-gradient(180deg,#f3e3d0,#e6cdb0)',
  'linear-gradient(180deg,#e8efe2,#cdddc0)',
  'linear-gradient(180deg,#f0e6ef,#ddc9dc)',
  'linear-gradient(180deg,#2a2620,#3d352b)',
  'linear-gradient(180deg,#f5e9d8,#e9d2a8)',
];

/* ---- Mevcut ayar ---- */
let S_APP = { key:'app', theme:'light', accent:'#9c4a2f', accent2:'#c97b4a', font:'literary' };

async function loadAppSettings(){
  const saved = await dbGet('settings','app');
  if(saved) S_APP = Object.assign(S_APP, saved);
  applyTheme(); applyAccent(); applyFont();
}
async function saveAppSettings(){ await dbPut('settings', S_APP); }

/* ---- Tema ---- */
function applyTheme(){
  let dark = S_APP.theme === 'dark';
  if(S_APP.theme === 'auto') dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark', dark);
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{ if(S_APP.theme==='auto') applyTheme(); });
async function setTheme(mode){ S_APP.theme=mode; await saveAppSettings(); applyTheme(); buildSettingsSheet(); }

/* ---- Vurgu rengi ---- */
function applyAccent(){
  document.documentElement.style.setProperty('--accent', S_APP.accent);
  document.documentElement.style.setProperty('--accent2', S_APP.accent2 || S_APP.accent);
  const meta = document.querySelector('meta[name=theme-color]'); if(meta) meta.content = S_APP.accent;
}
async function setAccent(c, c2){ S_APP.accent=c; S_APP.accent2=c2||c; await saveAppSettings(); applyAccent(); buildSettingsSheet(); }

/* ---- Yazı tipi ---- */
function applyFont(){
  const f = FONTS[S_APP.font] || FONTS.literary;
  document.documentElement.style.setProperty('--font-display', f.d);
  document.documentElement.style.setProperty('--font-body', f.b);
}
async function setFont(key){ S_APP.font=key; await saveAppSettings(); applyFont(); buildSettingsSheet(); }

/* ============================================================
   AYARLAR SAYFASI (sheet) — dinamik kuruluyor
   ============================================================ */
function buildSettingsSheet(){
  const el = document.getElementById('settingsBody'); if(!el) return;
  let h = '';

  /* görünüm */
  h += `<div class="sec-label"><span>${t('appearance')}</span></div>`;
  h += `<div class="field"><label>${t('theme')}</label><div class="seg">
    <button class="${S_APP.theme==='light'?'on':''}" onclick="setTheme('light')">${t('light')}</button>
    <button class="${S_APP.theme==='dark'?'on':''}" onclick="setTheme('dark')">${t('dark')}</button>
    <button class="${S_APP.theme==='auto'?'on':''}" onclick="setTheme('auto')">${t('auto')}</button>
  </div></div>`;

  h += `<div class="field"><label>${t('accent')}</label><div class="color-row">`;
  ACCENTS.forEach(a=>{ h += `<div class="swatch ${S_APP.accent===a.c?'sel':''}" style="background:${a.c}" onclick="setAccent('${a.c}','${a.c2}')"></div>`; });
  h += `<label class="swatch custom">✎<input type="color" value="${S_APP.accent}" oninput="setAccent(this.value)"></label>`;
  h += `</div></div>`;

  h += `<div class="field"><label>${t('font')}</label><div class="seg">`;
  Object.keys(FONTS).forEach(k=>{ h += `<button class="${S_APP.font===k?'on':''}" onclick="setFont('${k}')">${t(FONTS[k].key)}</button>`; });
  h += `</div></div>`;

  h += `<div class="field"><label>${t('language')}</label><div class="seg">
    <button class="${lang==='tr'?'on':''}" onclick="setLang('tr');buildSettingsSheet()">Türkçe</button>
    <button class="${lang==='en'?'on':''}" onclick="setLang('en');buildSettingsSheet()">English</button>
  </div></div>`;

  /* tarif kütüphanesi arka planı */
  h += `<div class="sec-label"><span>${t('recipeLib')}</span></div>`;
  h += `<div class="field"><label>${t('recipeBg')}</label><div class="color-row">`;
  REC_BGS.forEach((g,i)=>{ h += `<div class="swatch ${S_HOME.recBg===g?'sel':''}" style="background:${g}" onclick="setRecBg(${i})"></div>`; });
  h += `</div></div>`;

  /* veri */
  h += `<div class="sec-label"><span>${t('data')}</span></div>`;
  h += `<div class="btn-row"><button class="btn ghost" onclick="exportData()">⬇ ${t('exportData')}</button>
        <button class="btn ghost" onclick="document.getElementById('importInput').click()">⬆ ${t('importData')}</button></div>`;
  h += `<button class="btn danger" style="margin-top:10px" onclick="clearAllData()">${t('clearData')}</button>`;

  el.innerHTML = h;
}
function openSettings(){ buildSettingsSheet(); openSheet('settingsSheet'); }

/* ============================================================
   ANA SAYFA ÖZELLEŞTİRME + arka planlar
   ============================================================ */
let S_HOME = { key:'home', bgType:'solid', bg:'#f4ece0', gif:null, recBg:REC_BGS[0] };

async function loadHomeSettings(){
  const saved = await dbGet('settings','home');
  if(saved) S_HOME = Object.assign(S_HOME, saved);
  applyHome(); applyRecBg();
}
async function saveHomeSettings(){ await dbPut('settings', S_HOME); }

function applyHome(){
  document.getElementById('home').style.setProperty('--home-bg', S_HOME.bg);
  const img = document.getElementById('homeGif'), ph = document.getElementById('gifPlaceholder');
  if(S_HOME.gif){ img.src=S_HOME.gif; img.style.display='block'; ph.style.display='none'; }
  else { img.style.display='none'; ph.style.display='block'; }
}
function applyRecBg(){
  document.getElementById('recipes').style.setProperty('--rec-bg', S_HOME.recBg);
  document.getElementById('recipeView').style.setProperty('--rec-bg', S_HOME.recBg);
}
async function setRecBg(i){ S_HOME.recBg = REC_BGS[i]; await saveHomeSettings(); applyRecBg(); buildSettingsSheet(); }

function buildHomeSheet(){
  const el = document.getElementById('homeBody'); let h='';
  h += `<div class="field"><label>${t('bgType')}</label><div class="seg">
    <button class="${S_HOME.bgType==='solid'?'on':''}" onclick="setHomeBgType('solid')">${t('solid')}</button>
    <button class="${S_HOME.bgType==='gradient'?'on':''}" onclick="setHomeBgType('gradient')">${t('gradient')}</button>
  </div></div>`;
  h += `<div class="field"><label>${t('bgColor')}</label><div class="color-row">`;
  if(S_HOME.bgType==='solid'){
    HOME_SOLIDS.forEach(c=>{ h += `<div class="swatch ${S_HOME.bg===c?'sel':''}" style="background:${c}" onclick="setHomeBg('${c}')"></div>`; });
    h += `<label class="swatch custom">✎<input type="color" value="#f4ece0" oninput="setHomeBg(this.value)"></label>`;
  } else {
    HOME_GRADS.forEach(g=>{ h += `<div class="swatch ${S_HOME.bg===g?'sel':''}" style="background:${g}" onclick="setHomeBg(&quot;${g}&quot;)"></div>`; });
  }
  h += `</div></div>`;
  h += `<div class="btn-row"><button class="btn ghost" onclick="pickHomeGif()">${t('changeGif')}</button>
        <button class="btn ghost" onclick="removeHomeGif()">${t('removeGif')}</button></div>`;
  el.innerHTML = h;
}
function openHomeCustom(){ buildHomeSheet(); openSheet('homeSheet'); }
async function setHomeBgType(type){ S_HOME.bgType=type; S_HOME.bg = type==='solid'?HOME_SOLIDS[0]:HOME_GRADS[0]; await saveHomeSettings(); applyHome(); buildHomeSheet(); }
async function setHomeBg(v){ S_HOME.bg=v; await saveHomeSettings(); applyHome(); buildHomeSheet(); }
function pickHomeGif(){ document.getElementById('gifInput').click(); }
async function removeHomeGif(){ S_HOME.gif=null; await saveHomeSettings(); applyHome(); buildHomeSheet(); }

/* ============================================================
   YEDEKLEME — dışa/içe aktarma + temizleme
   ============================================================ */
function abToB64(buf){ let s=''; const b=new Uint8Array(buf); const chunk=0x8000; for(let i=0;i<b.length;i+=chunk){ s+=String.fromCharCode.apply(null,b.subarray(i,i+chunk)); } return btoa(s); }
function b64ToAb(b64){ const bin=atob(b64); const len=bin.length; const b=new Uint8Array(len); for(let i=0;i<len;i++) b[i]=bin.charCodeAt(i); return b.buffer; }

async function exportData(){
  toast(t('processing'));
  const books = await dbAll('books');
  const recipes = await dbAll('recipes');
  const settings = await dbAll('settings');
  const payload = {
    version:1, exportedAt:new Date().toISOString(),
    books: books.map(b=>({ ...b, data: b.data ? abToB64(b.data) : null })),
    recipes, settings
  };
  const blob = new Blob([JSON.stringify(payload)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`okur-defteri-yedek-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  toast(t('exported'));
}
async function importData(file){
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(data.books){ for(const b of data.books){ if(b.data) b.data = b64ToAb(b.data); await dbPut('books', b); } }
    if(data.recipes){ for(const r of data.recipes) await dbPut('recipes', r); }
    if(data.settings){ for(const s of data.settings) await dbPut('settings', s); }
    toast(t('imported'));
    await loadAppSettings(); await loadHomeSettings();
    renderReyon(); renderBooks(); renderRecipes();
  }catch(e){ toast(t('importErr')); }
}
async function clearAllData(){
  if(!confirm(t('clearWarn'))) return;
  await dbClear('books'); await dbClear('recipes'); await dbClear('settings');
  S_APP = { key:'app', theme:'light', accent:'#9c4a2f', accent2:'#c97b4a', font:'literary' };
  S_HOME = { key:'home', bgType:'solid', bg:'#f4ece0', gif:null, recBg:REC_BGS[0] };
  applyTheme(); applyAccent(); applyFont(); applyHome(); applyRecBg();
  closeSheets(); renderReyon(); renderBooks(); renderRecipes();
}
