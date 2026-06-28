/* =========================================================
   Portfolio — Shared JavaScript
   Handles: theme toggle, mobile nav, scroll effects,
   reveal-on-scroll, typing effect, count-up stats,
   project filter, 3D tilt, magnetic buttons, email copy.
   ========================================================= */

/* ---------- Theme (persisted, defaults to dark) ---------- */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  document.documentElement.setAttribute('data-theme', saved || 'dark');
})();

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Theme toggle ---------- */
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- Mobile nav ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      })
    );
  }

  /* ---------- Scroll progress bar (injected) ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  /* ---------- Navbar shadow + back-to-top + progress ---------- */
  const nav = document.querySelector('.nav');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Typing effect (hero role) ---------- */
  const typed = document.querySelector('.typed');
  if (typed) {
    const words = JSON.parse(typed.dataset.words || '[]');
    let w = 0, c = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.substring(0, c);
      if (!deleting && c < word.length) { c++; }
      else if (deleting && c > 0) { c--; }
      else if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 1400); }
      else { deleting = false; w = (w + 1) % words.length; }
      setTimeout(tick, deleting ? 55 : 100);
    };
    if (words.length) tick();
  }

  /* ---------- Project filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.cat.includes(f);
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------- Email button: copy address + feedback (mailto still fires) ---------- */
  const emailBtn = document.querySelector('#email-btn');
  if (emailBtn) {
    const fallbackCopy = (t) => {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.top = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    };
    emailBtn.addEventListener('click', () => {
      const addr = emailBtn.dataset.email || 'syedmustafaa024@gmail.com';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(addr).catch(() => fallbackCopy(addr));
      } else {
        fallbackCopy(addr);
      }
      const lbl = emailBtn.querySelector('.lbl');
      if (lbl && lbl.textContent.indexOf('copied') === -1) {
        const old = lbl.textContent;
        lbl.textContent = '✓ Email copied!';
        setTimeout(() => { lbl.textContent = old; }, 2000);
      }
    });
  }

  /* ---------- Count-up stats ---------- */
  const animateCount = (el) => {
    const raw = el.textContent.trim();
    if (!/^\d+$/.test(raw)) return;            // skip non-numeric (e.g. ∞)
    const target = +raw, dur = 1600, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat .num span').forEach(s => co.observe(s));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Spotlight + 3D tilt on skill cards ---------- */
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
      if (reduceMotion) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform 0.06s linear';
      card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transition = ''; card.style.transform = ''; });
  });

  /* ---------- 3D tilt on project cards ---------- */
  if (!reduceMotion) document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform 0.06s linear';
      card.style.transform = `perspective(1000px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-12px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transition = ''; card.style.transform = ''; });
  });

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion) document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.45;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
});

/* ---------- Preloader (hide once page is loaded) ---------- */
window.addEventListener('load', () => {
  const pre = document.querySelector('.preloader');
  if (pre) setTimeout(() => pre.classList.add('done'), 300);
});
