/* ============================================================
   recipes.js — Tarif günlüğü (entry tabanlı)
   Yapı: ad, emoji, malzemeler, adımlar (her adımda tüyo), detaylar
   ============================================================ */

async function renderRecipes(){
  const recs = await dbAll('recipes');
  const list = document.getElementById('recList');
  recs.sort((a,b)=>(b.updated||0)-(a.updated||0));
  if(!recs.length){ list.innerHTML=`<div class="empty-mini" style="margin-top:40px">${t('noRecipes')}</div>`; return; }
  list.innerHTML='';
  recs.forEach((r,i)=>{
    const ing=(r.ingredients||[]).length, st=(r.steps||[]).length;
    const sub = lang==='tr' ? `${ing} malzeme · ${st} adım` : `${ing} ingredients · ${st} steps`;
    const c=document.createElement('div'); c.className='rec-card'; c.style.animationDelay=(i*0.05)+'s';
    c.onclick=()=>viewRecipe(r.id);
    c.innerHTML=`<div class="rec-thumb">${r.emoji||'🍽️'}</div>
      <div class="rec-info"><div class="rt">${esc(r.name)}</div><div class="rs">${sub}</div></div>`;
    list.appendChild(c);
  });
}

/* ---- editör ---- */
let editingRecipeId=null;
function openRecipeEditor(){
  editingRecipeId=null;
  document.getElementById('recipeSheetTitle').textContent=t('newRecipe');
  document.getElementById('recName').value='';
  document.getElementById('recEmoji').value='';
  document.getElementById('recIngredients').value='';
  document.getElementById('recDetails').value='';
  document.getElementById('stepsContainer').innerHTML='';
  document.getElementById('recipeDeleteRow').style.display='none';
  addStep();
  openSheet('recipeSheet');
}
function addStep(data){
  const c=document.getElementById('stepsContainer');
  const block=document.createElement('div'); block.className='step-block';
  block.innerHTML=`
    <div class="step-head">
      <div class="step-num">${c.children.length+1}</div>
      <input type="text" class="stitle" placeholder="${t('stepTitle')}" value="${data?esc(data.title||''):''}">
      <button class="del-x" onclick="this.closest('.step-block').remove();renumberSteps()">✕</button>
    </div>
    <textarea class="stext" placeholder="${t('stepText')}">${data?esc(data.text||''):''}</textarea>
    <div class="tip-tag">✦ ${t('tip')}</div>
    <textarea class="stip" placeholder="${t('tipPh')}">${data?esc(data.tip||''):''}</textarea>`;
  c.appendChild(block);
}
function renumberSteps(){
  document.querySelectorAll('#stepsContainer .step-num').forEach((el,i)=>el.textContent=i+1);
}
async function saveRecipe(){
  const name=document.getElementById('recName').value.trim();
  if(!name){ toast(t('needName')); return; }
  const ingredients=document.getElementById('recIngredients').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const steps=[...document.querySelectorAll('#stepsContainer .step-block')].map(b=>({
    title:b.querySelector('.stitle').value.trim(),
    text: b.querySelector('.stext').value.trim(),
    tip:  b.querySelector('.stip').value.trim()
  })).filter(s=>s.text||s.title||s.tip);
  const details=document.getElementById('recDetails').value.trim();
  const emoji=document.getElementById('recEmoji').value.trim()||'🍽️';
  const id=editingRecipeId||'r_'+Date.now();
  await dbPut('recipes',{id,name,emoji,ingredients,steps,details,updated:Date.now()});
  closeSheets(); renderRecipes(); toast(t('recipeSaved'));
}

/* ---- görüntüleme ---- */
let viewingRecipeId=null;
async function viewRecipe(id){
  viewingRecipeId=id; const r=await dbGet('recipes',id); if(!r) return;
  let h=`<div class="rv-hero"><div class="rv-emoji">${r.emoji||'🍽️'}</div><h1>${esc(r.name)}</h1></div><div class="rv-body">`;
  if((r.ingredients||[]).length){
    h+=`<div class="rv-section"><h3>${t('ingTitle')}</h3>`;
    r.ingredients.forEach(i=>h+=`<div class="ingredient">${esc(i)}</div>`);
    h+=`</div>`;
  }
  if((r.steps||[]).length){
    h+=`<div class="rv-section"><h3>${t('stepsTitle')}</h3>`;
    r.steps.forEach((s,i)=>{
      h+=`<div class="rv-step"><div class="rs-head"><div class="rs-num">${i+1}</div><div class="rs-title">${esc(s.title||'')}</div></div>`;
      if(s.text) h+=`<div class="rs-text">${esc(s.text)}</div>`;
      if(s.tip)  h+=`<div class="rv-tip"><span class="tl">✦ ${t('tip')}</span>${esc(s.tip)}</div>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  if(r.details) h+=`<div class="rv-section"><h3>${t('detailsTitle')}</h3><div class="rv-details">${esc(r.details)}</div></div>`;
  h+=`</div>`;
  document.getElementById('rvScroll').innerHTML=h;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('recipeView').classList.add('active');
}
async function editCurrentRecipe(){
  const r=await dbGet('recipes',viewingRecipeId); if(!r) return;
  editingRecipeId=r.id;
  document.getElementById('recipeSheetTitle').textContent=t('editRecipe');
  document.getElementById('recName').value=r.name;
  document.getElementById('recEmoji').value=r.emoji||'';
  document.getElementById('recIngredients').value=(r.ingredients||[]).join('\n');
  document.getElementById('recDetails').value=r.details||'';
  const c=document.getElementById('stepsContainer'); c.innerHTML='';
  (r.steps||[]).forEach(s=>addStep(s));
  if(!(r.steps||[]).length) addStep();
  document.getElementById('recipeDeleteRow').style.display='flex';
  openSheet('recipeSheet');
}
async function deleteRecipe(){
  if(!confirm(t('confirmDel'))) return;
  await dbDel('recipes',editingRecipeId); closeSheets(); go('recipes');
}
