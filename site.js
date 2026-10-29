/* הגר בן דוד · סקיצת עמוד בית. בלי ספריות: headroom, תפריט, reveal, איורים שמציירים את עצמם,
   רגע החתימה (דמות החיבוק מהלוגו מצוירת בגלילה), ציטוטים מתחלפים, פס וואטסאפ בטלפון, נגישות. */
(function () {
  'use strict';
  var root = document.documentElement;
  var qa = root.classList.contains('qa');
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = function () { return qa || mq.matches || root.classList.contains('a11y-still'); };

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ===== הדר: משטח אחרי גלילה, נעלם בגלילה למטה וחוזר למעלה ===== */
  var hd = document.getElementById('hd');
  var lastY = window.scrollY, menuOpen = false;
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle('is-solid', y > 24);
    // תזוזות קטנות (סוף גלילה חלקה) לא משנות את המצב, אחרת ההדר מהבהב
    if (Math.abs(y - lastY) < 4 && y > 160) return;
    if (!menuOpen && y > 160 && y > lastY && !hd.contains(document.activeElement)) hd.classList.add('is-hidden');
    if (y < lastY || y <= 160) hd.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  hd.addEventListener('focusin', function () { hd.classList.remove('is-hidden'); });
  onScroll();

  /* ===== תפריט בטלפון ===== */
  var burger = hd.querySelector('.hd-burger'), menu = document.getElementById('menu');
  function setMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט');
    menu.hidden = !open;
    // הנעילה על html, והמקום של פס הגלילה נשמר באותו רגע: שום דבר לא זז כשהפס נעלם
    root.style.overflow = open ? 'hidden' : '';
    root.style.scrollbarGutter = open ? 'stable' : '';
    hd.classList.remove('is-hidden');
    hd.classList.toggle('is-solid', open || window.scrollY > 24);
    if (open) menu.querySelector('a').focus();
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menuOpen) { setMenu(false); burger.focus(); }
    if (!a11yPanel.hidden) { toggleA11y(false); a11yBtn.focus(); }
  });
  // מלכודת פוקוס פשוטה: Tab מהקישור האחרון בתפריט חוזר לכפתור הסגירה
  menu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = menu.querySelectorAll('a'), last = f[f.length - 1];
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); burger.focus(); }
  });

  /* ===== עוגנים: הקישור הפעיל בהדר ===== */
  var links = Array.prototype.slice.call(hd.querySelectorAll('.hd-link'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  /* ===== reveal ואיורים שמציירים את עצמם ===== */
  var groups = new Map();
  document.querySelectorAll('.rv').forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0;
    el.style.setProperty('--d', (n * 0.08).toFixed(2) + 's');
    groups.set(p, n + 1);
  });
  var drawables = document.querySelectorAll('.draw, .cta-hand, .steps-line');
  if (!('IntersectionObserver' in window) || still()) {
    document.querySelectorAll('.rv, .steps-line').forEach(function (el) { el.classList.add('is-in'); });
    drawables.forEach(function (el) { el.classList.add('is-drawn'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    // הקו בין השלבים חתוך לגמרי לפני שהוא נכנס, ולכן Chrome לא רואה אותו: עוקבים אחרי העטיפה שלו
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target.classList.contains('steps-wrap') ? en.target.querySelector('.steps-line') : en.target;
        t.classList.add('is-drawn', 'is-in');
        io2.unobserve(en.target);
      });
    }, { threshold: 0.35 });
    drawables.forEach(function (el) { io2.observe(el.classList.contains('steps-line') ? el.parentElement : el); });
    // גלילה מהירה: מה שקפץ מתחת למסך אל מעליו בין שני פריימים לא מדווח ב-IO, ולכן משלימים אותו בגלילה
    var pending = Array.prototype.slice.call(document.querySelectorAll('.rv, .draw, .cta-hand')), tick = false;
    function catchUp() {
      tick = false;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top >= innerHeight) return true;
        el.classList.add(el.classList.contains('rv') ? 'is-in' : 'is-drawn');
        return false;
      });
      if (!pending.length) removeEventListener('scroll', onCatch);
    }
    function onCatch() { if (!tick) { tick = true; requestAnimationFrame(catchUp); } }
    addEventListener('scroll', onCatch, { passive: true });
  }

  /* ===== היד בסוגר: התיבה נחתכת לפי היד עצמה ===== */
  var hand = document.querySelector('.art-hand');
  if (hand) {
    try {
      var b = hand.getBBox(), pad = Math.max(b.width, b.height) * 0.04;
      hand.setAttribute('viewBox', [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad].map(function (v) { return v.toFixed(1); }).join(' '));
    } catch (e) {}
  }

  /* ===== רגע החתימה: דמות החיבוק מצוירת לפי הגלילה. קודם הדמויות (אפור), אחר כך השמלה (כחול), בסוף היד שמחזיקה (ורוד) ===== */
  var you = document.getElementById('you'), mark = document.querySelector('.art-mark');
  var markPaths = [];
  if (mark) ['m-gray', 'm-blue', 'm-pink'].forEach(function (c) { mark.querySelectorAll('.' + c).forEach(function (p) { markPaths.push(p); }); });
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function drawMark() {
    if (!mark) return;
    var p = 1;
    if (!still()) {
      var r = you.getBoundingClientRect(), vh = window.innerHeight;
      // מתחיל כשראש הסקשן ב-85% מהמסך, נגמר כשהתחתית שלו ב-75%
      p = clamp01((vh * 0.85 - r.top) / (r.height - vh * 0.1));
    }
    var n = markPaths.length, span = 0.45;
    for (var i = 0; i < n; i++) {
      var start = (i / n) * (0.8 - span);
      var local = clamp01((p - start) / span);
      markPaths[i].style.setProperty('--o', (1 - local).toFixed(3));
      markPaths[i].style.setProperty('--f', clamp01((p - 0.72) / 0.22).toFixed(3));
    }
  }
  var ticking = false;
  function frame() {
    ticking = false;
    drawMark();
    // הקישור הפעיל בהדר: הסקשן שחוצה את קו ה-35% של המסך
    var line = window.innerHeight * 0.35, active = -1;
    targets.forEach(function (t, i) { if (t) { var r = t.getBoundingClientRect(); if (r.top <= line && r.bottom > line) active = i; } });
    links.forEach(function (a, i) { if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  /* ===== ציטוטים מתחלפים: 7 שניות, עוצר במעבר עכבר ובפוקוס, כבוי בהפחתת תנועה ===== */
  var rot = document.querySelector('[data-rot]');
  if (rot) {
    var items = rot.querySelectorAll('.rot-item'), track = rot.querySelector('.rot-track');
    var dotsBox = rot.querySelector('.rot-dots'), pauseBtn = rot.querySelector('.rot-pause');
    var idx = 0, timer = null, userPaused = still(), hover = false;
    var dots = Array.prototype.map.call(items, function (it, i) {
      var d = document.createElement('button');
      d.type = 'button'; d.className = 'rot-dot'; d.setAttribute('aria-label', 'ציטוט ' + (i + 1));
      d.addEventListener('click', function () { show(i, true); });
      dotsBox.appendChild(d); return d;
    });
    function show(i, byUser) {
      idx = (i + items.length) % items.length;
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === idx); it.setAttribute('aria-hidden', String(k !== idx)); });
      dots.forEach(function (d, k) { if (k === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      if (byUser) { track.setAttribute('aria-live', 'polite'); restart(); }
    }
    function restart() {
      clearInterval(timer); timer = null;
      if (!userPaused && !hover && !still()) timer = setInterval(function () { show(idx + 1); }, 7000);
    }
    function setPaused(v) {
      userPaused = v;
      pauseBtn.setAttribute('aria-pressed', String(v));
      pauseBtn.setAttribute('aria-label', v ? 'הפעלת ההחלפה האוטומטית' : 'עצירת ההחלפה האוטומטית');
      track.setAttribute('aria-live', v ? 'polite' : 'off');
      restart();
    }
    rot.querySelector('.rot-prev').addEventListener('click', function () { show(idx - 1, true); });
    rot.querySelector('.rot-next').addEventListener('click', function () { show(idx + 1, true); });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    rot.addEventListener('mouseenter', function () { hover = true; restart(); });
    rot.addEventListener('mouseleave', function () { hover = false; restart(); });
    rot.addEventListener('focusin', function () { hover = true; restart(); });
    rot.addEventListener('focusout', function (e) { if (!rot.contains(e.relatedTarget)) { hover = false; restart(); } });
    show(0);
    setPaused(userPaused);
  }

  /* ===== פס וואטסאפ בטלפון: אחרי ההירו, נעלם מול הסוגר והפוטר ===== */
  var mbar = document.getElementById('mbar');
  if (mbar && 'IntersectionObserver' in window) {
    var heroIn = true, endIn = false;
    var upd = function () { var on = !heroIn && !endIn; mbar.classList.toggle('is-on', on); mbar.tabIndex = on ? 0 : -1; };
    new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(document.querySelector('.hero'));
    var endObs = new IntersectionObserver(function (es) {
      endIn = es.some(function (x) { return x.isIntersecting; }) || document.querySelector('.cta-panel').getBoundingClientRect().top < window.innerHeight;
      upd();
    }, { threshold: 0 });
    endObs.observe(document.querySelector('.cta-panel')); endObs.observe(document.querySelector('.ft'));
    upd();
  }

  /* ===== נגישות: ארבעה מתגים, נשמרים בדפדפן של המבקרת ===== */
  var a11yBtn = document.querySelector('.a11y-btn'), a11yPanel = document.getElementById('a11y');
  function toggleA11y(open) { a11yPanel.hidden = !open; a11yBtn.setAttribute('aria-expanded', String(open)); if (open) a11yPanel.querySelector('button').focus(); }
  a11yBtn.addEventListener('click', function () { toggleA11y(a11yPanel.hidden); });
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem('hbd-a11y') || '{}'); } catch (e) {}
  a11yPanel.querySelectorAll('[data-a11y]').forEach(function (b) {
    var k = b.getAttribute('data-a11y');
    b.setAttribute('aria-pressed', String(!!saved[k]));
    b.addEventListener('click', function () {
      var on = !root.classList.contains('a11y-' + k);
      root.classList.toggle('a11y-' + k, on);
      b.setAttribute('aria-pressed', String(on));
      saved[k] = on;
      try { localStorage.setItem('hbd-a11y', JSON.stringify(saved)); } catch (e) {}
      if (k === 'still') { drawables.forEach(function (el) { el.classList.add('is-drawn', 'is-in'); }); document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('is-in'); }); drawMark(); if (rot) rot.querySelector('.rot-pause').getAttribute('aria-pressed') === 'false' && rot.querySelector('.rot-pause').click(); }
    });
  });
})();

/* ===== אייקונים על פיקסל שלם (design-dna tools/icons/snap-icons.js): אייקון על y=826.42 נראה רך ===== */
(function () {
  var SEL = "svg.ic, svg.arr", t = 0;
  function snap(scope) {
    var dpr = window.devicePixelRatio || 1;
    (scope || document).querySelectorAll(SEL).forEach(function (el) {
      el.style.translate = "";
      var r = el.getBoundingClientRect(); if (!r.width) return;
      var fixed = false; for (var q = el; q && q !== document.body; q = q.parentElement) if (getComputedStyle(q).position === "fixed") { fixed = true; break; }
      var x = r.left + (fixed ? 0 : scrollX), y = r.top + (fixed ? 0 : scrollY);
      var dx = Math.round(x * dpr) / dpr - x, dy = Math.round(y * dpr) / dpr - y;
      if (Math.abs(dx) > .01 || Math.abs(dy) > .01) el.style.translate = dx.toFixed(3) + "px " + dy.toFixed(3) + "px";
    });
  }
  function soon() { clearTimeout(t); t = setTimeout(function () { snap(); }, 120); }
  window.snapIcons = snap;
  addEventListener("load", soon); addEventListener("resize", soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  if (window.ResizeObserver) new ResizeObserver(soon).observe(document.body);
  document.addEventListener("load", function (e) { if (e.target.tagName === "IMG") soon(); }, true);
  document.addEventListener("animationend", function (e) { if (e.target.querySelector) snap(e.target); });
  document.addEventListener("transitionend", function (e) { if (/translate|transform/.test(e.propertyName) && e.target.querySelector) snap(e.target); });
})();
