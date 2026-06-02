/* ============================================================
   i18n.js — Türkçe / İngilizce metinler
   Yeni metin eklemek için iki dile de anahtar ekle.
   ============================================================ */
const I18N = {
  tr:{
    appName:"Okur Defteri",
    tapGif:"Dokun ve bir GIF seç", tapGifSub:"ana sayfan senin imzan",
    lastRead:"Son okunan", noRecent:"Henüz kitap eklemedin. Kütüphaneye gir ve başla.",
    lib1:"Kitaplık", lib1sub:"PDF kitapların", lib2:"Tarifler", lib2sub:"mutfak günlüğün",
    libEmpty:"Rafların boş. ＋ ile ilk PDF kitabını ekle.",
    /* genel */ save:"Kaydet", delete:"Sil", confirmDel:"Silinsin mi?", processing:"İşleniyor…",
    /* ayarlar */ settings:"Ayarlar", appearance:"Görünüm", theme:"Tema", light:"Aydınlık",
    dark:"Karanlık", auto:"Otomatik", accent:"Vurgu rengi", font:"Yazı tipi", language:"Dil",
    fontLiterary:"Edebi", fontClassic:"Klasik", fontClean:"Modern", fontCozy:"Sıcak",
    recipeLib:"Tarif kütüphanesi", recipeBg:"Arka plan teması",
    data:"Veriler", exportData:"Yedeği dışa aktar", importData:"Yedeği içe aktar",
    clearData:"Tüm verileri sil", clearWarn:"TÜM kitaplar, tarifler ve ayarlar silinecek. Emin misin?",
    exported:"Yedek indirildi", imported:"Yedek yüklendi", importErr:"Yedek okunamadı",
    /* ana sayfa özelleştir */ homeCustom:"Ana Sayfa", homeCustomSub:"arka planı ve gif'i özelleştir",
    bgType:"Arka plan türü", solid:"Düz renk", gradient:"Geçiş", bgColor:"Arka plan rengi",
    changeGif:"GIF seç / değiştir", removeGif:"GIF kaldır",
    /* kitap */ bookOpt:"Kitap", bookTitle:"Başlık", readNow:"Oku", savedTitle:"Başlık kaydedildi",
    bookAdded:"Kitap eklendi", longPressHint:"İpucu: kitaba uzun bas → düzenle/sil",
    /* okuyucu */ readSettings:"Okuma Ayarları", readMode:"Okuma modu", scroll:"Kaydırma", paged:"Sayfa",
    fitMode:"Sığdırma", fitWidth:"Genişliğe", fitPage:"Tüm sayfa", zoom:"Yazı boyutu / Yakınlaştırma",
    presets:"Hazır temalar", day:"Gündüz", sepia:"Sepya", night:"Gece", black:"Siyah",
    readBg:"Arka plan rengi", brightness:"Parlaklık", contrast:"Kontrast", filter:"Filtre",
    fNone:"Yok", fSepia:"Sepya", fGray:"Gri", fInvert:"Ters (gece için)",
    margin:"Kenar boşluğu", pageGap:"Sayfa aralığı", hlColor:"Vurgu rengi",
    showPage:"Sayfa numarasını göster", tapTurn:"Dokunarak sayfa çevir",
    marks:"İşaretler", marksSub:'Metin seç, çıkan "İşaretle"ye dokun',
    bookmarks:"Ayraçlar", highlights:"Vurgular", highlight:"İşaretle",
    noBm:"Henüz ayraç yok.", noHl:"Henüz vurgu yok.", page:"Sayfa",
    bmAdded:"Ayraç eklendi", bmRemoved:"Ayraç kaldırıldı", hlAdded:"Vurgu eklendi",
    /* tarif */ newRecipe:"Yeni Tarif", editRecipe:"Tarifi Düzenle",
    newRecipeSub:"malzemeler, adımlar, tüyolar ve detaylar",
    recipeName:"Tarif adı", recipeEmoji:"Simge (emoji)", ingredients:"Malzemeler (her satıra bir tane)",
    steps:"Adımlar", addStep:"＋ Adım ekle", stepTitle:"Adım başlığı (örn. Hamuru yoğur)",
    stepText:"Ne yapılacak?", tip:"Tüyo", tipPh:"Püf noktası (opsiyonel)",
    details:"Detaylar (notlar, servis, saklama)", saveRecipe:"Tarifi Kaydet",
    noRecipes:"Henüz tarif yok. ＋ ile ilk tarifini yaz.", needName:"Tarif adı gerekli",
    recipeSaved:"Tarif kaydedildi", ingTitle:"Malzemeler", stepsTitle:"Hazırlanışı", detailsTitle:"Detaylar"
  },
  en:{
    appName:"Reader's Journal",
    tapGif:"Tap to pick a GIF", tapGifSub:"your home, your signature",
    lastRead:"Last read", noRecent:"No books yet. Enter the library to begin.",
    lib1:"Library", lib1sub:"your PDF books", lib2:"Recipes", lib2sub:"your kitchen journal",
    libEmpty:"Shelves are empty. Tap ＋ to add your first PDF.",
    save:"Save", delete:"Delete", confirmDel:"Delete this?", processing:"Processing…",
    settings:"Settings", appearance:"Appearance", theme:"Theme", light:"Light",
    dark:"Dark", auto:"Auto", accent:"Accent color", font:"Typeface", language:"Language",
    fontLiterary:"Literary", fontClassic:"Classic", fontClean:"Modern", fontCozy:"Cozy",
    recipeLib:"Recipe library", recipeBg:"Background theme",
    data:"Data", exportData:"Export backup", importData:"Import backup",
    clearData:"Erase all data", clearWarn:"ALL books, recipes and settings will be erased. Sure?",
    exported:"Backup downloaded", imported:"Backup loaded", importErr:"Couldn't read backup",
    homeCustom:"Home", homeCustomSub:"customize background and gif",
    bgType:"Background type", solid:"Solid", gradient:"Gradient", bgColor:"Background color",
    changeGif:"Pick / change GIF", removeGif:"Remove GIF",
    bookOpt:"Book", bookTitle:"Title", readNow:"Read", savedTitle:"Title saved",
    bookAdded:"Book added", longPressHint:"Tip: long-press a book → edit/delete",
    readSettings:"Reading Settings", readMode:"Reading mode", scroll:"Scroll", paged:"Paged",
    fitMode:"Fit", fitWidth:"To width", fitPage:"Whole page", zoom:"Text size / Zoom",
    presets:"Presets", day:"Day", sepia:"Sepia", night:"Night", black:"Black",
    readBg:"Background color", brightness:"Brightness", contrast:"Contrast", filter:"Filter",
    fNone:"None", fSepia:"Sepia", fGray:"Gray", fInvert:"Invert (night)",
    margin:"Margin", pageGap:"Page gap", hlColor:"Highlight color",
    showPage:"Show page number", tapTurn:"Tap to turn page",
    marks:"Marks", marksSub:'Select text, tap the "Highlight" button',
    bookmarks:"Bookmarks", highlights:"Highlights", highlight:"Highlight",
    noBm:"No bookmarks yet.", noHl:"No highlights yet.", page:"Page",
    bmAdded:"Bookmark added", bmRemoved:"Bookmark removed", hlAdded:"Highlight added",
    newRecipe:"New Recipe", editRecipe:"Edit Recipe",
    newRecipeSub:"ingredients, steps, tips & details",
    recipeName:"Recipe name", recipeEmoji:"Icon (emoji)", ingredients:"Ingredients (one per line)",
    steps:"Steps", addStep:"＋ Add step", stepTitle:"Step title (e.g. Knead the dough)",
    stepText:"What to do?", tip:"Tip", tipPh:"Helpful tip (optional)",
    details:"Details (notes, serving, storage)", saveRecipe:"Save Recipe",
    noRecipes:"No recipes yet. Tap ＋ to write your first.", needName:"Recipe name required",
    recipeSaved:"Recipe saved", ingTitle:"Ingredients", stepsTitle:"Method", detailsTitle:"Details"
  }
};

let lang = localStorage.getItem('od_lang') || 'tr';
function t(k){ return (I18N[lang] && I18N[lang][k]) || (I18N.tr[k]) || k; }
function applyLang(){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
}
function setLang(l){
  lang = l; localStorage.setItem('od_lang', l); applyLang();
  if(window.renderReyon) renderReyon();
  if(window.renderRecipes) renderRecipes();
}
