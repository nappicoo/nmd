/* ============================================================
   Навигация по слайдам · свайпы · клавиатура · колесо · частицы
   ============================================================ */
(function(){
  'use strict';

  const slides   = Array.from(document.querySelectorAll('.slide'));
  const dotsBox  = document.getElementById('dots');
  const progress = document.getElementById('progress');
  const counter  = document.getElementById('counter');
  const deck     = document.getElementById('deck');

  let i = 0;
  let locked = false;

  /* ---------- точки навигации ---------- */
  slides.forEach((_, k) => {
    const d = document.createElement('button');
    d.className = 'dot' + (k === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Слайд ' + (k + 1));
    d.addEventListener('click', () => go(k));
    dotsBox.appendChild(d);
  });
  const dots = Array.from(dotsBox.children);

  /* ---------- переход к слайду ---------- */
  function go(n){
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === i && slides[i].classList.contains('active')) return;

    // выходим слева при движении вперёд, справа — назад
    const forward = n > i;
    slides.forEach((s, k) => {
      s.classList.remove('exit-left');
      if (k === i && k !== n) {
        if (forward) s.classList.add('exit-left');
      }
      s.classList.toggle('active', k === n);
    });

    dots.forEach((d, k) => d.classList.toggle('on', k === n));
    i = n;

    progress.style.width = ((i + 1) / slides.length * 100) + '%';
    counter.textContent = (i + 1) + ' / ' + slides.length;
    slides[i].scrollTop = 0;

    locked = true;
    setTimeout(() => locked = false, 700);
  }

  /* ---------- кнопки ---------- */
  document.getElementById('next').addEventListener('click', () => go(i + 1));
  document.getElementById('prev').addEventListener('click', () => go(i - 1));

  /* ---------- клавиатура ---------- */
  window.addEventListener('keydown', e => {
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) {
      e.preventDefault(); go(i + 1);
    }
    if (['ArrowLeft','ArrowUp','PageUp'].includes(e.key)) {
      e.preventDefault(); go(i - 1);
    }
    if (e.key === 'Home') go(0);
    if (e.key === 'End')  go(slides.length - 1);
  });

  /* ---------- колесо мыши ---------- */
  window.addEventListener('wheel', e => {
    if (locked) return;
    if (Math.abs(e.deltaY) < 24) return;
    // не мешаем внутреннему скроллу слайда
    const s = slides[i];
    const atTop    = s.scrollTop <= 0;
    const atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
    if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    go(i + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- свайпы ---------- */
  let x0 = 0, y0 = 0, t0 = 0;
  deck.addEventListener('touchstart', e => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    t0 = Date.now();
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    const dt = Date.now() - t0;
    if (dt < 800 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(i + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ---------- частицы (золотые пылинки) ---------- */
  const particlesBox = document.getElementById('particles');
  const COUNT = window.innerWidth < 640 ? 14 : 26;
  for (let k = 0; k < COUNT; k++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = 3 + Math.random() * 6;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';
    p.style.left   = Math.random() * 100 + '%';
    p.style.animationDuration = (14 + Math.random() * 18) + 's';
    p.style.animationDelay    = (-Math.random() * 25) + 's';
    p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    p.style.opacity = 0.15 + Math.random() * 0.35;
    particlesBox.appendChild(p);
  }

  /* ---------- лёгкий параллакс декораций ---------- */
  const ornL = document.querySelector('.ornament.top-left');
  const ornR = document.querySelector('.ornament.bottom-right');
  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - .5) * 10;
    const cy = (e.clientY / window.innerHeight - .5) * 10;
    if (ornL) ornL.style.transform = `translate(${cx}px, ${cy}px)`;
    if (ornR) ornR.style.transform = `rotate(180deg) translate(${-cx}px, ${-cy}px)`;
  }, { passive: true });

  /* ---------- старт ---------- */
  go(0);
  requestAnimationFrame(() => slides[0].classList.add('active'));
  progress.style.width = (1 / slides.length * 100) + '%';
  counter.textContent = '1 / ' + slides.length;
})();
