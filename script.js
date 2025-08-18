/* =======================
   script.js
   ======================= */

/* ---------- i18n dictionary ---------- */
const translations = {
  en: {
    about: "About",
    books: "Books",
    papers: "Papers",
    thesis: "Thesis",
    drafts: "Drafts",
    interests: "Interests",
    social: "Social Media",
    explore: "Explore Publications",
    footerNote: "All rights reserved.",
    tagline: "Research that connects the Gulf’s past to its present—history that informs policy, culture, and society.",
    empty: (k) => `No ${k} yet.`
  },
  ar: {
    about: "النبذة",
    books: "الكتب",
    papers: "الأوراق",
    thesis: "الأطروحات",
    drafts: "المسودات",
    interests: "الاهتمامات",
    social: "وسائل التواصل",
    explore: "استكشاف المنشورات",
    footerNote: "جميع الحقوق محفوظة.",
    tagline: "أبحاث تربط ماضي الخليج بحاضره — تاريخ يستنير به المجتمع وصانع القرار.",
    empty: (k) => `لا توجد ${k} بعد.`
  }
};

/* ---------- utils ---------- */
function esc(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function setText(id, val){ const el = document.getElementById(id); if (el) el.textContent = val ?? ''; }
function setHTML(id, html){ const el = document.getElementById(id); if (el) el.innerHTML = html ?? ''; }
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

/* ---------- icons (inline SVGs) ---------- */
function svgInstagram(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4zm0 2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM18 6.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>`;}
function svgX(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 3.5h3.7l5.5 7 6.6-7h3.2l-7.9 8.5 8.4 10.5h-3.7l-6.1-7.7-7.3 7.7H2l8.9-9.5L2.5 3.5z"/></svg>`;}
function svgLinkedIn(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h3.96v12H3V9Zm7.49 0H14v1.64h.06c.42-.8 1.47-1.64 3.03-1.64 3.24 0 3.84 2.13 3.84 4.9V21H17v-5.37c0-1.28-.02-2.93-1.79-2.93-1.79 0-2.07 1.4-2.07 2.85V21h-3.65V9Z"/></svg>`;}
function svgScholar(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 9l10 7 10-7-10-7Zm0 11.6L5.2 9 12 4.4 18.8 9 12 13.6ZM4 14.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5l-2 1.4V18H6v-2.1L4 14.5Z"/></svg>`;}
function svgYouTube(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.3 4 12 4 12 4s-6.3 0-8.2.7A4 4 0 0 0 1 7.5 41.7 41.7 0 0 0 1 12c0 1.8.1 3.7.8 4.5a4 4 0 0 0 2.8 2.8C5.7 20 12 20 12 20s6.3 0 8.2-.7a4 4 0 0 0 2.8-2.8c.7-.9.8-2.7.8-4.5s-.1-3.7-.8-4.5zM10 8.8 16 12l-6 3.2V8.8z"/></svg>`;}

/* ---------- social & chips renderers ---------- */
function sPill(cls, href, svg, label){
  const safeHref = esc(href);
  const safeLabel = esc(label);
  return `<a class="s-pill ${cls}" href="${safeHref}" target="_blank" rel="noopener" aria-label="${safeLabel}">
            ${svg}<span>${safeLabel}</span>
          </a>`;
}
function setSocials(id, s){
  const el = document.getElementById(id);
  if (!el) return;
  const items = [];
  if (s.instagram) items.push(sPill('instagram', s.instagram, svgInstagram(), 'Instagram'));
  if (s.twitter)   items.push(sPill('x',         s.twitter,   svgX(),         'X'));
  if (s.youtube)   items.push(sPill('youtube',   s.youtube,   svgYouTube(),   'YouTube'));
  if (s.linkedin)  items.push(sPill('linkedin',  s.linkedin,  svgLinkedIn(),  'LinkedIn'));
  if (s.scholar)   items.push(sPill('scholar',   s.scholar,   svgScholar(),    'Scholar'));
  el.innerHTML = items.join('') || `<span class="muted">No social links yet.</span>`;
}
function setChips(id, arr){
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = (arr||[]).map(t => `<span class="chip">${esc(t)}</span>`).join('');
}

/* ---------- item localization ---------- */
function localizeItem(it, lang){
  const L = it?.i18n?.[lang] || {};
  return {
    title: L.title || it.title || 'Untitled',
    abstract: L.abstract || it.abstract || '',
    authors: it.authors || '',
    venue: it.venue || '',
    year: it.year ?? null,
    thumbnail: it.thumbnail,
    pdf: it.pdf,
    doi: it.doi,
    link: it.link
  };
}

/* ---------- card component ---------- */
function card(it) {
  const el = document.createElement('article');
  el.className = 'card';
  const thumb = esc(it.thumbnail || 'assets/placeholder.png');
  const title = esc(it.title || 'Untitled');
  const meta  = [it.authors, it.venue, it.year].filter(Boolean).join(' · ');
  const abstract = it.abstract ? `<details><summary>Abstract</summary><p>${esc(it.abstract)}</p></details>` : '';

  el.innerHTML = `
    <img class="thumb" src="${thumb}" alt="" onerror="this.src='assets/placeholder.png'">
    <div>
      <h3 class="item-title">${title}</h3>
      <p class="meta">${esc(meta)}</p>
      ${abstract}
      <p class="links">
        ${it.pdf ? `<a href="${esc(it.pdf)}" target="_blank" rel="noopener">Download PDF</a>` : ''}
        ${it.doi ? `<a href="${esc(it.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}
        ${it.link ? `<a href="${esc(it.link)}" target="_blank" rel="noopener">Link</a>` : ''}
      </p>
    </div>`;
  return el;
}

/* ---------- global state ---------- */
let APP_DATA = null;

/* ---------- static UI translation ---------- */
function applyStaticStrings(lang){
  const t = translations[lang];

  // Tabs
  setText('tab-about', t.about);
  setText('tab-books', t.books);
  setText('tab-papers', t.papers);
  setText('tab-thesis', t.thesis);
  setText('tab-drafts', t.drafts);

  // About headings
  setText('about-title', t.about);
  setText('subtitle-interests', t.interests);
  setText('subtitle-social', t.social);

  // CTA
  setText('cta-explore', t.explore);

  // Footer links
  setText('footer-about', t.about);
  setText('footer-books', t.books);
  setText('footer-papers', t.papers);
  setText('footer-thesis', t.thesis);
  setText('footer-drafts', t.drafts);

  // Tagline & note
  setText('footer-tagline', t.tagline);
  const note = document.querySelector('.footer-note');
  if (note) {
    note.innerHTML = `© <span id="year"></span> Professor Abdullah M. Alhajeri — ${t.footerNote}`;
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }
}

/* ---------- render profile + panels in selected lang ---------- */
function renderContent(lang){
  if (!APP_DATA) return;
  const p = APP_DATA.profile || {};
  const P = p.i18n?.[lang] ? p.i18n[lang] : p; // fallback to top-level

  setText('name', P.name || p.name);
  setText('affiliation', P.affiliation || p.affiliation);
  setText('bio', P.bio || p.bio);
  setChips('interestsChips', (Array.isArray(P.interests) && P.interests.length) ? P.interests : (p.interests || []));
  setSocials('socials', p.socials || {});

  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) {
    avatarEl.src = p.photo || 'assets/logo.jpeg';
    avatarEl.onerror = () => { avatarEl.src = 'assets/logo.jpeg'; };
  }

  // Panels
  const panels = ['books','papers','thesis','drafts'];
  panels.forEach(key => {
    const panel = document.getElementById(key);
    if (!panel) return;
    panel.innerHTML = '';
    const items = Array.isArray(APP_DATA[key]) ? APP_DATA[key] : [];
    if (!items.length) {
      // localize the empty message key (use English key names)
      const k = translations[lang][key] || key;
      panel.innerHTML = `<p class="meta" style="opacity:.7">${translations[lang].empty(k)}</p>`;
      return;
    }
    items.map(raw => localizeItem(raw, lang))
         .forEach(item => panel.appendChild(card(item)));
  });
}

/* ---------- language switcher ---------- */
function setLang(lang){
  const html = document.documentElement;
  const enBtn = document.getElementById('btn-en');
  const arBtn = document.getElementById('btn-ar');

  if (lang === 'ar'){
    html.lang = 'ar'; html.dir = 'rtl'; html.classList.add('rtl');
    enBtn?.classList.remove('active'); arBtn?.classList.add('active');
  } else {
    html.lang = 'en'; html.dir = 'ltr'; html.classList.remove('rtl');
    arBtn?.classList.remove('active'); enBtn?.classList.add('active');
  }

  // Save preference
  try { localStorage.setItem('lang', lang); } catch(_) {}

  // Update UI strings + content
  applyStaticStrings(lang);
  renderContent(lang);
}
window.setLang = setLang; // for buttons

/* ---------- tabs & routing ---------- */
function setupTabRouting(){
  const tabButtons = document.querySelectorAll('.tabs button');
  const panels = document.querySelectorAll('.tab-panel');

  function showTab(id){
    panels.forEach(p => p.classList.toggle('active', p.id === id));
    tabButtons.forEach(b => {
      const on = b.dataset.tab === id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    history.replaceState(null, '', `#${id}`);
  }

  tabButtons.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (document.getElementById(id)) {
      e.preventDefault();
      showTab(id);
      document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const initial = location.hash?.slice(1);
  if (initial && document.getElementById(initial)) showTab(initial); else showTab('about');

  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (document.getElementById(h)) showTab(h);
  });
}

/* ---------- language buttons + year ---------- */
function setupChrome(){
  const enBtn = document.getElementById('btn-en');
  const arBtn = document.getElementById('btn-ar');
  enBtn?.addEventListener('click', () => setLang('en'));
  arBtn?.addEventListener('click', () => setLang('ar'));

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- data loader ---------- */
async function load(){
  try {
    const res = await fetch('data/publications.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} loading publications.json`);
    APP_DATA = await res.json();

    setupTabRouting();
    setupChrome();

    // Default language (stored preference -> Arabic -> English)
    const stored = (()=>{ try { return localStorage.getItem('lang'); } catch(_) { return null; }})();
    const initialLang = stored || 'en';
    setLang(initialLang);

  } catch (err) {
    console.error('Failed to load data:', err);
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = `<p style="color:#b00">Could not load <code>data/publications.json</code>. Check the server, path, and JSON validity.</p>`;
    }
    setupTabRouting();
    setupChrome();
    setLang('en');
  }
}

/* ---------- boot ---------- */
window.addEventListener('DOMContentLoaded', load);
