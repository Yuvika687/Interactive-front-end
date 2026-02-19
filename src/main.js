// --- Data Configuration ---
const MEMORIES = [
    { id: 1, title: "Solis", date: "Aug 14, 2024", desc: "Morning light.", src: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=600&auto=format&fit=crop" },
    { id: 2, title: "Azure Deep", date: "Sep 02, 2024", desc: "Deep ocean silence.", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop" },
    { id: 3, title: "Night Walk", date: "Nov 12, 2024", desc: "City rain reflections.", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop" },
    { id: 4, title: "Nebula", date: "Dec 31, 2024", desc: "Neon clouds.", src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=600&auto=format&fit=crop" },
    { id: 5, title: "Alpine", date: "Jan 10, 2025", desc: "Mountain peak.", src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600&auto=format&fit=crop" },
    { id: 6, title: "Glass House", date: "Feb 05, 2025", desc: "Botanical time capsule.", src: "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?q=80&w=600&auto=format&fit=crop" },
    { id: 7, title: "Canyon", date: "Mar 12, 2025", desc: "Red dust.", src: "https://images.unsplash.com/photo-1474044158699-59270e99d264?q=80&w=600&auto=format&fit=crop" },
    { id: 8, title: "Forest", date: "Apr 22, 2025", desc: "Green canopy.", src: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=600&auto=format&fit=crop" }
];

// --- State ---
const state = {
    particles: [],
    frameCount: 0
};

// --- DOM ---
const dom = {
    universe: document.getElementById('memory-universe'),
    featured: document.getElementById('featured-card'),
    secondary: document.getElementById('secondary-grid'),
    clock: document.getElementById('clock'),
    mode: document.getElementById('mode-indicator'),
    overlay: document.getElementById('focus-overlay'),
    focusMedia: document.getElementById('focus-media'),
    focusTitle: document.getElementById('focus-title'),
    focusDate: document.getElementById('focus-date'),
    focusDesc: document.getElementById('focus-desc'),
    closeBtn: document.getElementById('close-focus')
};

// --- Init ---
function init() {
    generateUniverse();
    renderUI();
    startTimeSystem();
    animateUniverse();
    setupEvents();
}

// --- Memory Universe System ---
function generateUniverse() {
    const COUNT = 100;

    for (let i = 0; i < COUNT; i++) {
        const memory = MEMORIES[Math.floor(Math.random() * MEMORIES.length)];
        const el = document.createElement('div');
        el.className = 'universe-card';
        el.style.backgroundImage = `url(${memory.src})`;

        // Config based on layers
        // 0-50: Deep (Slow, Transparent)
        // 50-80: Mid (Medium)
        // 80-100: Surface (Fast, Visible)

        let layer = 'deep';
        let size, opacity, speed;

        if (i < 50) {
            layer = 'deep'; size = rnd(200, 300); opacity = 0.15; speed = 0.1;
        } else if (i < 80) {
            layer = 'mid'; size = rnd(150, 200); opacity = 0.25; speed = 0.3;
        } else {
            layer = 'surface'; size = rnd(100, 150); opacity = 0.4; speed = 0.6;
        }

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        el.style.width = `${size}px`;
        el.style.height = `${size * 1.2}px`; // Aspect ratio
        el.style.opacity = opacity;

        // Store Particle Data
        state.particles.push({
            el,
            x, y,
            speedX: (Math.random() - 0.5) * speed,
            speedY: (Math.random() - 0.5) * speed,
            rot: Math.random() * 10 - 5
        });

        // Initial Move
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.random() * 10 - 5}deg)`;

        dom.universe.appendChild(el);
    }
}

function animateUniverse() {
    state.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        const w = window.innerWidth;
        const h = window.innerHeight;
        const padding = 200;

        if (p.x < -padding) p.x = w + padding;
        if (p.x > w + padding) p.x = -padding;
        if (p.y < -padding) p.y = h + padding;
        if (p.y > h + padding) p.y = -padding;

        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
    });

    requestAnimationFrame(animateUniverse);
}

// --- UI Rendering ---
function renderUI() {
    // Featured Card (Top Memory)
    const feat = MEMORIES[1]; // Azure Deep
    dom.featured.innerHTML = `
    <article class="feature-glass" onclick="openMemory(${feat.id})">
       <img src="${feat.src}" class="feature-img">
       <div class="feature-info">
          <h2 class="feature-title">${feat.title}</h2>
          <p class="feature-date">${feat.date}</p>
       </div>
    </article>
  `;

    // Secondary Cards
    const sec = [MEMORIES[2], MEMORIES[3]];
    dom.secondary.innerHTML = sec.map(m => `
    <div class="mini-card" onclick="openMemory(${m.id})">
       <div>
         <strong>${m.title}</strong><br>
         <span style="opacity:0.6">${m.date}</span>
       </div>
    </div>
  `).join('');
}

// --- Time System ---
function startTimeSystem() {
    const update = () => {
        const now = new Date();
        // Clock
        dom.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Themes
        const h = now.getHours();
        let theme = 'night';
        let label = 'Night Mode';

        if (h >= 6 && h < 10) { theme = 'morning'; label = 'Morning Mode'; }
        else if (h >= 10 && h < 16) { theme = 'day'; label = 'Day Mode'; }
        else if (h >= 16 && h < 18) { theme = 'golden'; label = 'Golden Hour'; }
        else { theme = 'night'; label = 'Night Mode'; }

        document.body.className = theme;
        dom.mode.textContent = label;
    };

    update();
    setInterval(update, 60000); // Check every minute
}

// --- Interaction ---
window.openMemory = (id) => {
    const m = MEMORIES.find(x => x.id === id);
    if (!m) return;

    dom.focusTitle.innerText = m.title;
    dom.focusDate.innerText = m.date;
    dom.focusDesc.innerText = m.desc;
    dom.focusMedia.innerHTML = `<img src="${m.src}">`;

    dom.overlay.classList.remove('hidden');
    // Tick to allow transition
    requestAnimationFrame(() => dom.overlay.classList.add('active'));
};

function setupEvents() {
    dom.closeBtn.onclick = () => {
        dom.overlay.classList.remove('active');
        setTimeout(() => dom.overlay.classList.add('hidden'), 400);
    };

    // Quick escape
    document.onkeydown = (e) => {
        if (e.key === 'Escape') dom.closeBtn.click();
    };
}

// Helper
function rnd(min, max) { return Math.random() * (max - min) + min; }

// Run
init();
