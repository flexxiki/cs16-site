// main.js - simplified, robust dialog handling for local file opening
(function(){
  // Sounds
  const clickSound = document.getElementById('click-sound');
  const closeSound = document.getElementById('close-sound');

  function playClick(){ try{ if(clickSound){ clickSound.currentTime=0; clickSound.play(); } } catch(e){} }
  function playClose(){ try{ if(closeSound){ closeSound.currentTime=0; closeSound.play(); } } catch(e){} }

  // Backdrop element (single)
  function ensureBackdrop(){
    let backdrop = document.getElementById('custom-backdrop');
    if(!backdrop){
      backdrop = document.createElement('div');
      backdrop.id = 'custom-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.inset = '0';
      backdrop.style.background = 'rgba(0,0,0,0.6)';
      backdrop.style.zIndex = '45';
      backdrop.style.opacity = '0';
      backdrop.style.transition = 'opacity .18s ease';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', ()=>{
        // close topmost dialog if any
        const openDialogs = document.querySelectorAll('.cs-dialog[data-open="true"]');
        if(openDialogs.length) closeDialogById(openDialogs[openDialogs.length-1].id);
      });
    }
    return backdrop;
  }

  // Open / close dialog helpers (works with file://)
  function openDialogById(id){
    const dialog = document.getElementById(id);
    if(!dialog) return;
    const backdrop = ensureBackdrop();
    backdrop.style.display = 'block';
    requestAnimationFrame(()=> backdrop.style.opacity = '1');
    dialog.style.display = 'block';
    dialog.dataset.open = 'true';
    dialog.style.zIndex = '50';
    dialog.style.opacity = '0';
    dialog.style.transform = 'translate(-50%, -50%) scale(.98)';
    dialog.style.transition = 'opacity .18s ease, transform .18s ease';
    requestAnimationFrame(()=>{ dialog.style.opacity = '1'; dialog.style.transform = 'translate(-50%, -50%) scale(1)'; });
  }

  function closeDialogById(id){
    const dialog = document.getElementById(id);
    const backdrop = document.getElementById('custom-backdrop');
    if(dialog){
      dialog.style.opacity = '0';
      dialog.style.transform = 'translate(-50%, -50%) scale(.98)';
      dialog.removeAttribute('data-open');
      setTimeout(()=>{ dialog.style.display = 'none'; }, 200);
    }
    if(backdrop){
      backdrop.style.opacity = '0';
      setTimeout(()=>{ backdrop.style.display = 'none'; }, 200);
    }
  }

  // Attach handlers once DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    // Language: default en
    let lang = localStorage.getItem('flexxi_lang') || 'en';
    const langBtn = document.getElementById('lang-btn');
    function setLang(l){
      lang = l;
      localStorage.setItem('flexxi_lang', l);
      document.documentElement.lang = (l==='en'?'en':'ru');
      document.querySelectorAll('.en').forEach(el=> el.style.display = (l==='en')? 'block':'none');
      document.querySelectorAll('.ru').forEach(el=> el.style.display = (l==='ru')? 'block':'none');
      langBtn.textContent = (l==='en')? 'EN / RU' : 'EN / RU';
    }
    if(langBtn) langBtn.addEventListener('click', ()=>{ playClick(); setLang(lang==='en'?'ru':'en'); });
    setLang(lang);

    // Menu mapping
    const mapping = {
      about: 'about-dialog',
      achievements: 'achievements-dialog',
      settings: 'settings-dialog',
      exit: 'exit-dialog'
    };

    document.querySelectorAll('.menu-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const sec = btn.dataset.section;
        playClick();
        const id = mapping[sec];
        if(id) openDialogById(id);
      });
    });

    // Close buttons (data-target)
    document.querySelectorAll('.close-btn').forEach(b=>{
      b.addEventListener('click', ()=>{
        const targetId = b.dataset.target;
        if(targetId){ closeDialogById(targetId); playClose(); }
      });
    });

    // Specific dialog controls
    document.getElementById('new-game-start')?.addEventListener('click', ()=>{
      closeDialogById('about-dialog'); playClick(); alert((localStorage.getItem('flexxi_lang')==='ru')? 'Начало... (демо)' : 'Starting... (demo)');
    });
    document.getElementById('new-game-cancel')?.addEventListener('click', ()=>{
      closeDialogById('about-dialog'); playClose();
    });

    document.getElementById('settings-cancel')?.addEventListener('click', ()=>{
      closeDialogById('settings-dialog'); playClose();
    });
    document.getElementById('settings-save')?.addEventListener('click', ()=>{
      closeDialogById('settings-dialog'); playClick();
    });

    document.getElementById('quit-yes')?.addEventListener('click', ()=>{
      playClose();
      // Try to close window; if not possible, show goodbye
      try{ window.close(); } catch(e){}
      alert((localStorage.getItem('flexxi_lang')==='ru')? 'Пока!' : 'Goodbye!');
    });
    document.getElementById('quit-no')?.addEventListener('click', ()=>{
      closeDialogById('exit-dialog'); playClick();
    });


    // Ensure keyboard escape closes all dialogs
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        document.querySelectorAll('.cs-dialog').forEach(d=>{ if(d.style.display !== 'none') closeDialogById(d.id); });
      }
    });

    // play intro briefly if present (once per session)
    const intro = document.getElementById('intro-overlay');
    if(intro && !sessionStorage.getItem('shown_intro')){
      intro.classList.remove('hidden');
      const v = document.getElementById('intro-video');
      try{ v.play(); } catch(e){}
      setTimeout(()=>{ intro.classList.add('hidden'); sessionStorage.setItem('shown_intro','1'); }, 2400);
    }
  });

  // expose for debug
  window.openDialogById = openDialogById;
  window.closeDialogById = closeDialogById;

window.openPhoto = function(img) {
  const overlay = document.getElementById('photo-overlay');
  const preview = document.getElementById('photo-preview');
  const srcAttr = img.getAttribute('src') || '';
  preview.src = srcAttr;
  overlay.style.display = 'flex';

  // Проверяем — если это именно 1.jpg, проигрываем звук
  if (/1\.jpg$/i.test(srcAttr)) {
    try {
      const audio = new Audio('123.mp3'); // или 'sounds/123.mp3' если звук в папке sounds
      audio.volume = 1.0; // 100% громкости
      audio.play().catch(err => console.warn('Playback blocked:', err));
    } catch (err) {
      console.error('Audio error:', err);
    }
  }
};

window.closePhoto = function() {
  document.getElementById('photo-overlay').style.display = 'none';
};

function closePhoto(){
  document.getElementById('photo-overlay').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
  const enBtn = document.getElementById("lang-en");
  const ruBtn = document.getElementById("lang-ru");

  if (!enBtn || !ruBtn) return;

  enBtn.addEventListener("click", () => switchLang("en"));
  ruBtn.addEventListener("click", () => switchLang("ru"));
});

function switchLang(lang) {
  const texts = {
    en: {
      about: "About Me",
      achievements: "Achievements",
      settings: "Settings",
      exit: "Exit",
      greeting: "Hi, I’m Artem, also known in-game as flexxi...",
    },
    ru: {
      about: "Обо мне",
      achievements: "Достижения",
      settings: "Настройки",
      exit: "Выход",
      greeting: "Привет, я Артём, также известный как flexxi...",
    },
  };

  // кнопки меню
  document.querySelectorAll(".menu-btn")[0].textContent = texts[lang].about;
  document.querySelectorAll(".menu-btn")[1].textContent = texts[lang].achievements;
  document.querySelectorAll(".menu-btn")[2].textContent = texts[lang].settings;
  document.querySelectorAll(".menu-btn")[3].textContent = texts[lang].exit;

  // пример текста в About
  const aboutText = document.querySelector("#about-dialog p");
  if (aboutText) aboutText.textContent = texts[lang].greeting;

  // обновляем активность кнопок
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  document.getElementById("lang-ru").classList.toggle("active", lang === "ru");
}

})();

