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
                text: 'dawn · peach & gold',
                gradient: 'radial-gradient(circle at 30% 40%, rgba(255, 215, 200, 0.35) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(255, 235, 200, 0.3) 0%, transparent 45%)',
                cloudTint: '#ffdcb5' // Peach
            };
            break;
        case 1: // Day
            mood = {
                text: 'day · warm sand',
                gradient: 'radial-gradient(circle at 50% 30%, rgba(255, 250, 240, 0.3) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(230, 215, 240, 0.2) 0%, transparent 45%)',
                cloudTint: '#fffaf0' // Ivory
            };
            break;
        case 2: // Golden Hour
            mood = {
                text: 'golden hour · nostalgia',
                gradient: 'radial-gradient(circle at 60% 40%, rgba(255, 200, 150, 0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(210, 190, 230, 0.25) 0%, transparent 45%)',
                cloudTint: '#ffdea0' // Gold
            };
            break;
        case 3: // Night
            mood = {
                text: 'night · deep lavender',
                gradient: 'radial-gradient(circle at 40% 30%, rgba(160, 140, 210, 0.3) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(100, 90, 180, 0.4) 0%, transparent 45%)',
                cloudTint: '#e0d0ff' // Lavender
            };
            break;
    }

    // 2. Apply Changes
    if (timeMoodEl) timeMoodEl.innerText = mood.text;
    if (headerMoodEl) headerMoodEl.innerText = mood.text;

    if (gradientLayer) {
        // Blend new gradient with base dark anchor
        gradientLayer.style.background = `${mood.gradient}, linear-gradient(145deg, #050406, #000000)`; // Dark Anchor
    }

    // Tint Clouds
    clouds.forEach(cloud => {
        cloud.style.background = mood.cloudTint;

        // Update box-shadows dynamically
        // Since we can't easily query the old box-shadow values to just replace color, we need to reconstruct them tailored to the specific cloud class
        // BUT, a simpler CSS variable approach is better if we set it on the element
        // For now, let's just set the Background and use the CSS Variable which we update below
    });

    document.documentElement.style.setProperty('--cloud-color', mood.cloudTint);
}

// Start
initMnemonic();
