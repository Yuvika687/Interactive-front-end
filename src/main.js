/**
 * SERENITY ENGINE v1.0
 * Handles the Living Memory Universe
 */

// --- Configuration ---
const CONFIG = {
    mouseInfluence: 0.05, // How much cursor affects drift
    zoomLevel: 1000, // Initial Z start
    maxDepth: 1000,
    interactionDist: 100
};

// --- State ---
const state = {
    memories: [],
    activeMemory: null,
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    isHovering: false,
    hoverTarget: null
};

// --- DOM Cache ---
const dom = {
    universe: document.getElementById('memory-universe'),
    overlay: document.getElementById('focus-overlay'),
    // Focus Elements
    focusImg: document.querySelector('.focus-visual img'),
    focusTitle: document.querySelector('.focus-title'),
    focusDate: document.querySelector('.focus-date'),
    focusStats: document.querySelector('.focus-stats-container'), // We need to inject stats here
    closeBtn: document.querySelector('.close-btn'),
    // HUD
    clock: document.getElementById('clock'),
    mode: document.getElementById('mode-indicator')
};

// --- Initialization ---
function init() {
    console.log("Initializing Serenity...");

    // 1. Generate Data
    if (!window.SerenityData) {
        console.error("SerenityData not loaded");
        return;
    }

    const rawData = window.SerenityData.generateMemoryData();

    // 2. Create DOM Nodes & Internal Objects
    state.memories = rawData.map(data => createMemoryNode(data));

    // 3. Mount to DOM
    // Use a document fragment for performance
    const fragment = document.createDocumentFragment();
    state.memories.forEach(m => fragment.appendChild(m.el));
    dom.universe.appendChild(fragment);

    // 4. Start Events & Loop
    try {
        setupEvents();
    } catch (e) {
        console.error("Error setting up events:", e);
    }
    requestAnimationFrame(loop);

    // 5. Time System
    startTimeSystem();

    // 6. Particles
    generateParticles();
}

function createMemoryNode(data) {
    const el = document.createElement('div');
    el.className = `memory-node layer-${data.layer}`;
    el.style.backgroundImage = `url(${data.src})`;
    el.style.width = `${data.baseSize}px`;
    el.style.height = `${data.baseSize * 1.2}px`; // Portrait aspect

    // Color Application based on emotion
    el.style.border = `1px solid ${data.baseColor}40`; // Slight tint border
    el.style.boxShadow = `0 4px 12px ${data.baseColor}20`;

    // Custom properties for logic
    const node = {
        data: data,
        el: el,
        x: data.x,
        y: data.y,
        z: data.z,
        vx: data.driftSpeed.x,
        vy: data.driftSpeed.y,
        hovered: false,

        // Emotional State
        currentWarmth: data.warmth || 0,
        visitTimer: null,
        visitStartTime: 0
    };

    // Store reference
    el.dataset.id = data.id;
    return node;
}

// --- The Physics Loop ---
function loop() {
    // Center point - CRITICAL for centering the universe
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    state.memories.forEach(node => {
        // 1. Apply Drift
        // If hovered or active, drift STOPS or Slows drastically
        let moveFactor = 1;
        if (state.activeMemory) moveFactor = 0; // Universe pauses when focused
        else if (node.hovered) moveFactor = 0.05; // "Gaze" effect

        if (moveFactor > 0) {
            node.x += node.vx * moveFactor;
            node.y += node.vy * moveFactor;

            // Wrap around logic (Infinite Universe)
            const bounds = 2500;
            if (node.x > bounds) node.x = -bounds;
            if (node.x < -bounds) node.x = bounds;
            if (node.y > bounds) node.y = -bounds;
            if (node.y < -bounds) node.y = bounds;
        }

        // 2. Mouse Parallax
        if (!state.activeMemory) {
            const depthFactor = (node.z + 500) / 1000;
            const mx = (state.mouseX - cx) * 0.02 * depthFactor;
            const my = (state.mouseY - cy) * 0.02 * depthFactor;

            // 3. Render
            const scale = 1 + (node.currentWarmth * 0.2);

            // Offset by Center (cx, cy) so (0,0) is center of screen
            const renderX = cx + node.x + mx - (parseFloat(node.el.style.width) / 2);
            const renderY = cy + node.y + my - (parseFloat(node.el.style.height) / 2);

            node.el.style.transform = `translate3d(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px, ${node.z}px) scale(${scale})`;

            // Dynamic Warmth Visuals
            if (node.currentWarmth > 0) {
                node.el.style.boxShadow = `0 0 ${20 + node.currentWarmth * 50}px ${node.data.baseColor}60`;
                node.el.style.borderColor = node.data.baseColor;
            }
        }
    });

    requestAnimationFrame(loop);
}

// --- Interaction & Emotional Logic ---
function setupEvents() {
    window.addEventListener('mousemove', e => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });

    // Hover - "The Gaze"
    dom.universe.addEventListener('mouseover', e => {
        if (state.activeMemory) return; // Don't hover background when focused
        if (e.target.classList.contains('memory-node')) {
            const id = e.target.dataset.id;
            const node = state.memories.find(m => m.data.id == id);
            if (node) {
                node.hovered = true;
                node.el.style.zIndex = 9999;
                // "Responds to you" - slight brightness bump handled by CSS
            }
        }
    });

    dom.universe.addEventListener('mouseout', e => {
        if (e.target.classList.contains('memory-node')) {
            const id = e.target.dataset.id;
            const node = state.memories.find(m => m.data.id == id);
            if (node) {
                node.hovered = false;
                node.el.style.zIndex = 'auto';
            }
        }
    });

    dom.universe.addEventListener('click', e => {
        if (state.activeMemory) return;
        if (e.target.classList.contains('memory-node')) {
            openMemory(e.target.dataset.id);
        }
    });

    dom.closeBtn.addEventListener('click', closeMemory);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMemory(); });
}

function openMemory(id) {
    const node = state.memories.find(m => m.data.id == id);
    if (!node) return;

    state.activeMemory = node;
    node.visitStartTime = Date.now();

    // UI Transitions
    dom.focusImg.src = node.data.src;
    dom.focusTitle.textContent = "Memory " + node.data.id;
    dom.focusDate.textContent = node.data.created.toDateString();

    // Inject Emotional Context
    const warmthPercent = Math.floor(node.currentWarmth * 100);
    dom.focusStats.innerHTML = `
        <div class="focus-stat"><b>${node.data.visits}</b> Visits</div>
        <div class="focus-stat"><b>${warmthPercent}%</b> Warmth</div>
        <div class="focus-stat" style="color:${node.data.baseColor}">Type: ${node.data.emotion.toUpperCase()}</div>
    `;

    dom.overlay.classList.add('active');
    dom.universe.style.transition = "transform 1s ease, filter 1s ease";
    dom.universe.style.filter = "blur(10px) brightness(0.2)";
    dom.universe.style.transform = "scale(1.1)"; // Zoom in slightly

    // Start "Loving" Timer
    node.visitTimer = setInterval(() => {
        const duration = (Date.now() - node.visitStartTime) / 1000;

        // "Your attention is LOVE"
        // Every 10 seconds, adds 1% warmth
        if (duration % 10 < 1) {
            node.currentWarmth = Math.min(1, node.currentWarmth + 0.01);
            // Update UI live
            dom.focusStats.querySelector('.focus-stat:nth-child(2) b').innerText = Math.floor(node.currentWarmth * 100) + "%";
        }
    }, 1000);
}

function closeMemory() {
    if (!state.activeMemory) return;

    const node = state.activeMemory;

    // Stop Timer
    clearInterval(node.visitTimer);
    const sessionDuration = (Date.now() - node.visitStartTime) / 1000;

    // Update Stats
    node.data.visits++;
    node.data.timeSpent += sessionDuration;
    node.data.lastVisited = new Date();

    // "Leave" effect - Pulse
    // We can animate this in CSS or just leave the warmth state

    // Reset UI
    dom.overlay.classList.remove('active');
    dom.universe.style.filter = "none";
    dom.universe.style.transform = "none";

    state.activeMemory = null;
}

// Helper: Ensure we have the input element cached if not already
if (!dom.input) dom.input = document.getElementById('memory-input');

// --- Particles ---
function generateParticles() {
    const container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 100}vh`;
        p.style.animationDuration = `${Math.random() * 20 + 10}s`;
        p.style.animationDelay = `-${Math.random() * 20}s`;
        container.appendChild(p);
    }
}

// Run
init();
