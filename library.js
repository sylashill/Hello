/* ============================================================
   library.js — Kitaplık (PDF) ve "son okunan" reyonu
   ============================================================ */

function pickPdf(){ document.getElementById('pdfInput').click(); }

async function handlePdfFile(file){
  if(!file) return;
  toast(t('processing'));
  try{
    const buf = await file.arrayBuffer();
    const cover = await renderCover(buf.slice(0));
    const id = 'b_'+Date.now();
    await dbPut('books', {
      id, title:file.name.replace(/\.pdf$/i,''), data:buf, cover,
      bookmarks:[], highlights:[], lastPage:1, numPages:0,
      prefs:defaultReaderPrefs(), lastOpened:Date.now()
    });
    renderBooks(); toast(t('bookAdded'));
  }catch(err){ toast('PDF: '+err.message); }
}

/* ilk sayfadan kapak üret */
async function renderCover(buf){
  const pdf = await pdfjsLib.getDocument({data:buf}).promise;
  const page = await pdf.getPage(1);
  const v1 = page.getViewport({scale:1});
  const scale = Math.min(440/v1.width, 2);
  const vp = page.getViewport({scale});
  const cv = document.createElement('canvas');
  cv.width=vp.width; cv.height=vp.height;
  await page.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
  const url = cv.toDataURL('image/jpeg', 0.8);
  pdf.destroy && pdf.destroy();
  return url;
}

async function renderBooks(){
  const books = await dbAll('books');
  const grid = document.getElementById('bookGrid'); grid.innerHTML='';
  document.getElementById('libEmpty').style.display = books.length?'none':'block';
  books.sort((a,b)=>(b.lastOpened||0)-(a.lastOpened||0));
  books.forEach((b,i)=>{
    const el=document.createElement('div'); el.className='book'; el.style.animationDelay=(i*0.04)+'s';
    el.onclick=()=>openBook(b.id);
    el.oncontextmenu=ev=>{ ev.preventDefault(); openBookSheet(b.id); };
    let timer;
    el.addEventListener('touchstart',()=>{ timer=setTimeout(()=>openBookSheet(b.id),500); },{passive:true});
    el.addEventListener('touchend',()=>clearTimeout(timer));
    el.addEventListener('touchmove',()=>clearTimeout(timer));
    const bmCount=(b.bookmarks||[]).length;
    el.innerHTML=`<div class="book-cover">
        ${b.cover?`<img src="${b.cover}">`:`<div class="noimg">${esc(b.title)}</div>`}
        <div class="spine"></div>
        ${bmCount?`<div class="badge">🔖 ${bmCount}</div>`:''}
      </div><div class="bt">${esc(b.title)}</div>`;
    grid.appendChild(el);
  });
  const add=document.createElement('div'); add.className='add-tile'; add.onclick=pickPdf;
  add.innerHTML=`<div class="p">＋</div><small>PDF</small>`;
  grid.appendChild(add);
}

/* "son okunan" reyonu (ana sayfa) */
async function renderReyon(){
  const books = await dbAll('books');
  const rail = document.getElementById('reyonRail');
  const recent = books.filter(b=>b.lastOpened).sort((a,b)=>b.lastOpened-a.lastOpened).slice(0,10);
  if(!recent.length){ rail.innerHTML=`<div class="reyon-empty">${t('noRecent')}</div>`; return; }
  rail.innerHTML='';
  recent.forEach((b,i)=>{
    const prog = b.numPages?Math.min(100,Math.round((b.lastPage/b.numPages)*100)):0;
    const c=document.createElement('div'); c.className='reyon-card'; c.style.animationDelay=(i*0.05)+'s';
    c.onclick=()=>openBook(b.id);
    c.innerHTML=`<div class="reyon-cover">${b.cover?`<img src="${b.cover}">`:`<div class="noimg">${esc(b.title)}</div>`}</div>
      <div class="t">${esc(b.title)}</div>
      <div class="prog"><i style="width:${prog}%"></i></div>`;
    rail.appendChild(c);
  });
}

/* kitap seçenekleri (uzun bas) */
let sheetBookId=null;
async function openBookSheet(id){
  sheetBookId=id; const b=await dbGet('books',id);
  document.getElementById('bookTitleInput').value=b.title;
  if(navigator.vibrate) navigator.vibrate(12);
  openSheet('bookSheet');
}
function openBookFromSheet(){ closeSheets(); openBook(sheetBookId); }
async function saveBookTitle(){
  const b=await dbGet('books',sheetBookId);
  b.title=document.getElementById('bookTitleInput').value.trim()||b.title;
  await dbPut('books',b); closeSheets(); renderBooks(); toast(t('savedTitle'));
}
async function deleteBook(){
  if(!confirm(t('confirmDel'))) return;
  await dbDel('books',sheetBookId); closeSheets(); renderBooks();
}
