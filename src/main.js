/**
 * SERENITY ENGINE - Emotional UI v2.0
 */

// --- State ---
const state = {
    memories: [],
    activeMemory: null
};

// --- DOM Cache ---
const dom = {
    // New Atmospheric Background
    background: document.getElementById('atmospheric-background'),
    // Grid
    grid: document.getElementById('foreground-grid'),
    // Overlay
    overlay: document.getElementById('focus-overlay'),
    focusImg: document.querySelector('.focus-visual img'),
    focusTitle: document.querySelector('.focus-title'),
    focusDate: document.querySelector('.focus-date'),
    focusStats: document.querySelector('.focus-stats-container'),
    focusDesc: document.getElementById('focus-desc'),
    input: document.getElementById('memory-input'),
    closeBtn: document.querySelector('.close-btn'),
    // HUD
    clock: document.getElementById('clock'),
    mode: document.getElementById('mode-indicator')
};

// --- Initialization ---
function init() {
    console.log("Initializing Serenity (Emotional UI)...");

    // 1. Generate Data
    if (!window.SerenityData) {
        console.error("SerenityData not loaded");
        return;
    }

    const rawData = window.SerenityData.generateMemoryData();
    // Wrap data to match expected structure
    state.memories = rawData.map(data => ({ data: data }));

    // 2. Render Grid
    renderCinematicGrid();

    // 3. Time System
    startTimeSystem();

    // 4. Dust Particles
    generateParticles();

    // 5. Events
    setupEvents();
}

// --- Rendering ---
function renderCinematicGrid() {
    if (!dom.grid) return;

    // Pick 3 Top Memories for the Grid (Center Stage)
    // For now, just take the first 3
    const featured = state.memories.slice(0, 3);

    dom.grid.innerHTML = featured.map(node => `
        <article class="cinematic-card" onclick="openMemory(${node.data.id})">
            <img src="${node.data.src}" loading="lazy" alt="Memory">
            <div class="card-meta">
                <div class="card-date">${node.data.created.toLocaleDateString()}</div>
                <div class="card-title">Memory ${node.data.id}</div>
            </div>
        </article>
    `).join('');
}

// --- Particles (Dust) ---
function generateParticles() {
    const container = document.querySelector('.dust-container');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'dust-particle';

        // Randomize size
        const size = Math.random() * 2 + 1; // 1-3px
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        // Randomize position
        p.style.left = `${Math.random() * 100}vw`;

        // Randomize Animation
        p.style.animationDuration = `${Math.random() * 20 + 20}s`; // 20-40s (Slow)
        p.style.animationDelay = `-${Math.random() * 20}s`;

        container.appendChild(p);
    }
}

// --- Interaction ---
function setupEvents() {
    dom.closeBtn.addEventListener('click', closeMemory);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMemory(); });
}

// Global scope for onclick
window.openMemory = function (id) {
    const node = state.memories.find(m => m.data.id == id);
    if (!node) return;

    state.activeMemory = node;
    node.visitStartTime = Date.now();

    // Populate Overlay
    dom.focusImg.src = node.data.src;
    dom.focusTitle.textContent = "Memory " + node.data.id;
    dom.focusDate.textContent = node.data.created.toDateString();

    // Stats
    const warmthPercent = Math.floor((node.data.warmth || 0) * 100);
    let metaHTML = `
        <div class="focus-stat"><b>${node.data.visits || 0}</b> Visits</div>
        <div class="focus-stat"><b>${warmthPercent}%</b> Warmth</div>
    `;
    if (node.data.constellationId) {
        metaHTML += `<div class="focus-stat" style="color:var(--glow-gold)">✦ ${node.data.constellationId}</div>`;
    }
    // dom.focusStats.innerHTML = metaHTML; // Fix: Use the cached container
    if (dom.focusStats) dom.focusStats.innerHTML = metaHTML;

    // Load Note
    if (dom.input) {
        dom.input.value = node.data.note || "";
        dom.input.oninput = (e) => { node.data.note = e.target.value; };
    }

    dom.overlay.classList.add('active');

    // Start Timer
    node.visitTimer = setInterval(() => {
        const duration = (Date.now() - node.visitStartTime) / 1000;
        if (duration % 10 < 1) {
            node.data.warmth = Math.min(1, (node.data.warmth || 0) + 0.01);
            // Optional: Update UI live
        }
    }, 1000);
};

function closeMemory() {
    if (!state.activeMemory) return;
    const node = state.activeMemory;
    clearInterval(node.visitTimer);

    // Save stats
    node.data.visits = (node.data.visits || 0) + 1;
    state.activeMemory = null;

    dom.overlay.classList.remove('active');
}

// --- Time System ---
function startTimeSystem() {
    const update = () => {
        const now = new Date();
        if (dom.clock) dom.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Simple mode check
        const h = now.getHours();
        const mode = (h > 6 && h < 18) ? "DAY MODE" : "NIGHT MODE";
        if (dom.mode) dom.mode.textContent = mode;

        // Dynamic Background Colors (Subtle shift)
        if (mode === "DAY MODE") {
            document.documentElement.style.setProperty('--base-navy', '#f8f5f2');
            document.body.style.color = '#1e293b';
        } else {
            document.documentElement.style.setProperty('--base-navy', '#0f172a');
            document.body.style.color = 'rgba(255,255,255,0.9)';
        }
    };
    setInterval(update, 1000);
    update();
    // Start Pattern Cycle (for demo)
    cycleEmotions();
}

function cycleEmotions() {
    const modes = ['mode-happy', 'mode-romantic', 'mode-sad', 'mode-deep'];
    let idx = 0;

    // Initial State
    document.body.classList.add(modes[0]);

    // Shift every 8 seconds to show "Living" memory aspect
    setInterval(() => {
        document.body.classList.remove(...modes);
        idx = (idx + 1) % modes.length;
        document.body.classList.add(modes[idx]);
    }, 8000);
}

// Start
init();
