/**
 * MNEMONIC ENGINE
 * Handles Theme Shifts & Time Logic
 */

let manualOverrideIndex = -1; // -1 = Automatic, 0-3 = Manual Themes

function initMnemonic() {
    console.log("Initializing Mnemonic Vault...");

    // Theme Toggle Listener
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', cycleManualTheme);
    }

    // Start Time Loop
    updateMood();
    setInterval(updateMood, 60000); // Check every minute

    // Generate photorealistic stars
    generateStars();
}

function generateStars() {
    const atmo = document.querySelector('.memory-atmosphere');
    if (!atmo) return;

    // Remove old constellation if it exists
    const oldConst = document.querySelector('.constellation');
    if (oldConst) oldConst.remove();

    const starContainer = document.createElement('div');
    starContainer.className = 'real-starfield';

    for (let i = 0; i < 350; i++) {
        const star = document.createElement('div');
        star.className = 'real-star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() < 0.95 ? (Math.random() * 1.5 + 0.5) : (Math.random() * 3 + 1.5);
        const opacity = Math.random() * 0.8 + 0.1;
        const duration = Math.random() * 4 + 2;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = opacity;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;

        const colors = ['#ffffff', '#e8f0ff', '#f0f5ff', '#fff0e5', '#ffffff'];
        star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Big stars get a subtle glow
        if (size > 2.5) {
            star.style.boxShadow = `0 0 ${size * 2}px ${star.style.backgroundColor}`;
            star.style.borderRadius = '50%';
        } else {
            // Very tiny stars can just be square chunks rendered as dots
            star.style.borderRadius = '50%';
        }

        starContainer.appendChild(star);
    }

    atmo.appendChild(starContainer);
}

function cycleManualTheme() {
    // Cycle: Auto (-1) -> Dawn (0) -> Day (1) -> Golden (2) -> Night (3) -> Auto (-1)
    manualOverrideIndex++;
    if (manualOverrideIndex > 3) manualOverrideIndex = -1; // Reset to Auto

    updateMood(); // Apply immediately
}

function updateMood() {
    const timeMoodEl = document.getElementById('timeMood');
    const headerMoodEl = document.getElementById('header-mood-text');
    const gradientLayer = document.querySelector('.atmo-gradient');
    const clouds = document.querySelectorAll('.cloud');
    const toggleBtn = document.getElementById('theme-toggle');

    // Simulate time (or get real time)
    const now = new Date();
    const hour = now.getHours();

    let mood = {};

    // Determine Index: either Manual or Time-based
    let themeIndex = 0;

    if (manualOverrideIndex !== -1) {
        // MANUAL MODE
        themeIndex = manualOverrideIndex;
        if (toggleBtn) toggleBtn.innerText = ["Theme: Dawn", "Theme: Day", "Theme: Golden", "Theme: Night"][themeIndex];
    } else {
        // AUTOMATIC MODE
        if (toggleBtn) toggleBtn.innerText = "Change Theme (Auto)";

        if (hour >= 5 && hour < 10) themeIndex = 0;      // Dawn
        else if (hour >= 10 && hour < 17) themeIndex = 1; // Day
        else if (hour >= 17 && hour < 20) themeIndex = 2; // Golden
        else themeIndex = 3;                              // Night
    }

    // Apply Theme Stats
    switch (themeIndex) {
        case 0: // Dawn
            mood = {
                text: 'dawn · misty peach',
                gradient: 'linear-gradient(180deg, #0b1021 0%, #1a2035 50%, #3d3040 100%)',
                cloudTint: 'rgba(200, 160, 150, 0.25)'
            };
            break;
        case 1: // Day
            mood = {
                text: 'day · pale azure',
                gradient: 'linear-gradient(180deg, #101a30 0%, #203550 50%, #355070 100%)',
                cloudTint: 'rgba(180, 200, 220, 0.25)'
            };
            break;
        case 2: // Golden Hour
            mood = {
                text: 'golden hour · deep embers',
                gradient: 'linear-gradient(180deg, #080c18 0%, #151828 50%, #302025 100%)',
                cloudTint: 'rgba(180, 140, 120, 0.25)'
            };
            break;
        case 3: // Night
            mood = {
                text: 'night · cinematic deep space',
                gradient: 'linear-gradient(180deg, #02030a 0%, #050b1c 45%, #0c1330 100%)',
                cloudTint: 'rgba(30, 45, 90, 0.15)' // subtle cool blue-indigo tint
            };
            break;
    }

    // 2. Apply Changes
    if (timeMoodEl) timeMoodEl.innerText = mood.text;
    if (headerMoodEl) headerMoodEl.innerText = mood.text;

    if (gradientLayer) {
        gradientLayer.style.background = mood.gradient;
    }

    // Tint Clouds - Using radial-gradient directly so the SVG filter distorts a gradient mass, avoiding hard box edges
    clouds.forEach(cloud => {
        cloud.style.background = `radial-gradient(ellipse at center, ${mood.cloudTint} 0%, transparent 65%)`;
    });

    document.documentElement.style.setProperty('--cloud-color', mood.cloudTint);
}

// Start
initMnemonic();
