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
    setupEvents();
    requestAnimationFrame(loop);

    // 5. Time System
    startTimeSystem();
}

function createMemoryNode(data) {
    const el = document.createElement('div');
    el.className = `memory-node layer-${data.layer}`;
    el.style.backgroundImage = `url(${data.src})`;
    el.style.width = `${data.baseSize}px`;
    el.style.height = `${data.baseSize * 1.2}px`; // Portrait aspect

    // Custom properties for logic
    // We store visual position separate from data position to allow smooth interpolation if needed
    const node = {
        data: data,
        el: el,
        x: data.x,
        y: data.y,
        z: data.z, // Depth
        vx: data.driftSpeed.x,
        vy: data.driftSpeed.y,
        hovered: false
    };

    // Store reference on element for event delegation
    el.dataset.id = data.id;

    return node;
}

// --- The Physics Loop ---
function loop() {
    // Center point
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    state.memories.forEach(node => {
        // 1. Apply Drift
        if (!state.activeMemory && !node.hovered) {
            node.x += node.vx;
            node.y += node.vy;

            // Wrap around logic (Infinite Universe)
            const bounds = 2500; // Match generation spread
            if (node.x > bounds) node.x = -bounds;
            if (node.x < -bounds) node.x = bounds;
            if (node.y > bounds) node.y = -bounds;
            if (node.y < -bounds) node.y = bounds;
        }

        // 2. Mouse Parallax (The "Look" effect)
        // Deeper memories move less than surface ones (Parallax)
        // Z goes from -500 (deep) to 100 (surface)
        // Factor: Surface=1, Deep=0.1
        const depthFactor = (node.z + 500) / 600;
        const mx = (state.mouseX - cx) * 0.05 * depthFactor;
        const my = (state.mouseY - cy) * 0.05 * depthFactor;

        // 3. Render
        // We use translate3d for hardware accel
        // We add the 'mx' directly to the transform, not the permanent XY
        const renderX = node.x + mx;
        const renderY = node.y + my;

        node.el.style.transform = `translate3d(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px, ${node.z}px)`;
    });

    requestAnimationFrame(loop);
}

// --- Interaction ---
function setupEvents() {
    // Mouse Move
    window.addEventListener('mousemove', e => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });

    // Delegation for Hover/Click
    // Doing per-node listeners is expensive for 1000 nodes, 
    // but `mouseenter`/`mouseleave` don't bubble.
    // However, we used standard :hover CSS for the basic glow. 
    // For Logic (pausing drift), we can use mouseover on the container.

    dom.universe.addEventListener('mouseover', e => {
        if (e.target.classList.contains('memory-node')) {
            const id = e.target.dataset.id;
            const node = state.memories.find(m => m.data.id == id);
            if (node) {
                node.hovered = true;
                state.hoverTarget = node;
                // Optional: Update HUD with memory details?
            }
        }
    });

    dom.universe.addEventListener('mouseout', e => {
        if (e.target.classList.contains('memory-node')) {
            const id = e.target.dataset.id;
            const node = state.memories.find(m => m.data.id == id);
            if (node) {
                node.hovered = false;
                state.hoverTarget = null;
            }
        }
    });

    // Click to Open
    dom.universe.addEventListener('click', e => {
        if (e.target.classList.contains('memory-node')) {
            const id = e.target.dataset.id;
            openMemory(id);
        }
    });

    // Close
    dom.closeBtn.addEventListener('click', closeMemory);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMemory();
    });
}

function openMemory(id) {
    const node = state.memories.find(m => m.data.id == id);
    if (!node) return;

    state.activeMemory = node;

    // Populate Overlay
    dom.focusImg.src = node.data.src;
    dom.focusTitle.textContent = "Memory " + node.data.id; // Placeholder title
    dom.focusDate.textContent = node.data.created.toDateString();

    // Show
    dom.overlay.classList.add('active');
}

function closeMemory() {
    dom.overlay.classList.remove('active');
    state.activeMemory = null;
}

// --- Time System ---
function startTimeSystem() {
    const update = () => {
        const now = new Date();
        dom.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Simple mock mode logic (can be expanded)
        const h = now.getHours();
        let label = "Night Mode";
        if (h > 6 && h < 18) label = "Day Mode";
        dom.mode.textContent = label;
    };
    setInterval(update, 1000);
    update();
}

// Run
init();
