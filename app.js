/* ============================================================
   app.js — Gezinme, ortak yardımcılar, başlatma
   PDF.js worker burada ayarlanır. En son yüklenen dosyadır.
   ============================================================ */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ---- sayfa geçişi ---- */
function go(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='library') renderBooks();
  if(id==='recipes') renderRecipes();
  if(id==='home')    renderReyon();
}

/* ---- sheet kontrol ---- */
let openSheetEl=null;
function openSheet(id){
  closeSheets(true);
  document.getElementById('scrim').classList.add('open');
  const el=document.getElementById(id); el.classList.add('open'); openSheetEl=el;
}
function closeSheets(keepScrim){
  document.querySelectorAll('.sheet.open').forEach(s=>s.classList.remove('open'));
  if(!keepScrim) document.getElementById('scrim').classList.remove('open');
  openSheetEl=null;
}

/* ---- toast ---- */
let toastTimer;
function toast(msg){
  const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),1900);
}

/* ---- küçük yardımcılar ---- */
function esc(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fileToDataURL(f){ return new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(f); }); }
function throttle(fn,ms){ let last=0,timer; return(...a)=>{ const now=Date.now(); if(now-last>=ms){ last=now; fn(...a); } else { clearTimeout(timer); timer=setTimeout(()=>{ last=Date.now(); fn(...a); },ms); } }; }

/* ---- dosya girişleri ---- */
function wireInputs(){
  document.getElementById('gifInput').onchange = async e=>{
    const f=e.target.files[0]; if(!f) return;
    S_HOME.gif = await fileToDataURL(f); await saveHomeSettings(); applyHome();
    if(document.getElementById('homeSheet').classList.contains('open')) buildHomeSheet();
    e.target.value='';
  };
  document.getElementById('pdfInput').onchange = e=>{ handlePdfFile(e.target.files[0]); e.target.value=''; };
  document.getElementById('importInput').onchange = e=>{ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=''; };
}

/* ---- başlat ---- */
(async function init(){
  await openDB();
  applyLang();
  await loadAppSettings();
  await loadHomeSettings();
  wireInputs();
  await renderReyon();
})();
