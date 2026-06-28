# 🚀 Syed Mustafa Ali — Portfolio

A clean, modern, fully responsive multi-page portfolio for **Syed Mustafa Ali**,
a full-stack & AI developer. Built with plain **HTML, CSS and JavaScript** —
no build step, no dependencies.

## ✨ Features
- 4 pages: **Home, About, Projects, Contact**
- 🌗 Dark / light theme toggle (remembers your choice)
- 📱 Fully responsive with a mobile hamburger menu
- ⌨️ Animated typing effect + count-up stats
- 🪄 3D tilt cards, magnetic buttons, scroll progress bar
- 🌌 Animated aurora background, glassmorphism & film-grain texture
- 🗂️ Filterable projects grid (Mobile / Web / AI / Automation)
- ✉️ Working contact form (opens email app; Formspree-ready)

## 📂 Structure
```
portfolio/
├── index.html        ← Home / hero + services
├── about.html        ← About, skills, timeline
├── projects.html     ← 4 real projects with filters
├── contact.html      ← Contact info + form
├── css/style.css     ← All styles (theme variables at the top)
├── js/script.js      ← All interactivity
└── assets/           ← (add your photo + resume here)
```

## ▶️ How to run
Just **double-click `index.html`** — it opens in your browser.

## ✅ Content — already filled in
Name, role, summary, skills, all 4 projects (MediaTree AI, IdeaRank AI,
F&O Trading Bot, ZYRK-Recon), experience, education, email
(`syedmustafaa024@gmail.com`), phone, location, GitHub
(`SyedMustafaAli31` + `ZYRKSec`) and X (`Syed_Mustafa_31`) are all set.

## 📌 Two things left to add (optional)
1. **Resume PDF** — drop your CV into `assets/Syed-Mustafa-Ali-Resume.pdf`
   so the "Download CV" buttons work.
2. **Profile photo** — create an `assets/` folder, add `profile.jpg`, then in
   `index.html` and `about.html` replace `<div class="avatar-inner">SMA</div>`
   with `<div class="avatar-inner"><img src="assets/profile.jpg" alt="Syed Mustafa Ali"></div>`.
3. **LinkedIn (if you want it)** — no public URL was provided, so the email icon
   is shown instead. Send me the URL (or add an `<a href="...">` in the social rows).

### Change the colors
Open `css/style.css` and edit the variables at the very top:
```css
--accent:   #7c5cff;   /* violet */
--accent-2: #1fd1f9;   /* cyan   */
--accent-3: #ff5cf0;   /* pink   */
```

### Receive form submissions for real
The form opens the visitor's email app by default. To collect messages on a
server instead, sign up at https://formspree.io and follow the comment inside
`contact.html`.

## 🌍 Deploy (free)
- **GitHub Pages:** push this folder to a repo → Settings → Pages → deploy from branch.
- **Netlify / Vercel:** drag-and-drop the folder onto their dashboard.

---
Built with ♥ in Hyderabad.
