(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  /* ----- Thème clair / sombre ----- */
  $('#theme-btn').addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  /* ----- Menu déroulant ----- */
  const menuBtn = $('#menu-btn'), dropdown = $('#dropdown');
  const setMenu = open => { dropdown.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!dropdown.classList.contains('open')); });
  document.addEventListener('click', e => { if (!dropdown.contains(e.target)) setMenu(false); });
  dropdown.addEventListener('click', () => setMenu(false));

  /* ----- Texte qui s'écrit / s'efface ----- */
  const phrases = ['mes pensées, mes réflexions et tout', 'mes projets, mes idées et tout', 'mes essais, mes erreurs et tout'];
  const typed = $('#typed');
  let p = 0, i = 0, del = false;
  (function tick() {
    const word = phrases[p];
    typed.textContent = word.slice(0, i);
    let delay = del ? 28 : 55;
    if (!del && i === word.length) { del = true; delay = 1800; }
    else if (del && i === 0) { del = false; p = (p + 1) % phrases.length; delay = 400; }
    else i += del ? -1 : 1;
    setTimeout(tick, delay);
  })();

  /* ----- Lien actif selon le scroll ----- */
  const links = $$('.nav-link');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ----- Apparition au scroll ----- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach((el, n) => { el.style.transitionDelay = (n % 3) * 90 + 'ms'; io.observe(el); });

  /* ----- Palette de commandes (⌘K / Ctrl+K) ----- */
  const palette = $('#palette'), input = $('#p-input'), list = $('#p-list');
  const items = [
    ['Accueil', '#accueil'], ['Blog', '#blog'], ['Extraits', '#extraits'], ['Projets', '#projets'],
    ['À propos', '#apropos'], ['Contact', '#contact'], ['Livre d\'or', '#livre-dor'],
    ['Changer de thème', () => $('#theme-btn').click()]
  ];
  let shown = [], sel = 0;
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function render() {
    const q = norm(input.value.trim());
    shown = items.filter(([t]) => norm(t).includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = shown.length
      ? shown.map(([t], n) => `<li data-n="${n}" class="${n === sel ? 'sel' : ''}">${t}</li>`).join('')
      : '<li class="empty">Aucun résultat</li>';
  }
  function open() { palette.hidden = false; input.value = ''; sel = 0; render(); input.focus(); }
  function close() { palette.hidden = true; }
  function run(n) {
    const it = shown[n]; if (!it) return;
    close();
    typeof it[1] === 'function' ? it[1]() : (location.hash = it[1]);
  }

  $('#cmd-btn').addEventListener('click', open);
  palette.addEventListener('click', e => { if (e.target === palette) close(); });
  input.addEventListener('input', () => { sel = 0; render(); });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-n]'); if (li) run(+li.dataset.n); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? open() : close(); return; }
    if (palette.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % (shown.length || 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % (shown.length || 1); render(); }
    else if (e.key === 'Enter') run(sel);
  });
})();