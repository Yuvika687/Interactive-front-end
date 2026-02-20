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

    // Build 4K Photorealistic Canvas Sky
    initCanvasSky();
}

function initCanvasSky() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    const stars = [];
    const numStars = 2500; // Ultra high density for 4K realism

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.1, // Depth parallax
            opacity: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            color: Math.random() > 0.8 ? '#e8f0ff' : (Math.random() > 0.6 ? '#ffe4d6' : '#ffffff')
        });
    }

    let shootingStars = [];
    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 1;

        for (let star of stars) {
            // Earth rotation / air movement
            star.x -= 0.08 / star.z;
            if (star.x < 0) star.x = width;

            // Twinkle
            let currentOpacity = star.opacity + Math.sin(time * star.twinkleSpeed) * 0.2;
            if (currentOpacity < 0) currentOpacity = 0;
            if (currentOpacity > 1) currentOpacity = 1;

            // SMALLER STARS: Microscopic pinpricks
            let radius = (0.5 / star.z);
            if (radius < 0.1) radius = 0.1;

            ctx.beginPath();
            ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = currentOpacity;
            ctx.fill();

            // Halo for very close stars - smaller halo
            if (star.z < 0.3 && currentOpacity > 0.8) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 1.5);
                grad.addColorStop(0, `rgba(255,255,255,${currentOpacity * 0.3})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;

        // Occasional shooting star
        if (Math.random() < 0.002 && shootingStars.length < 2) {
            shootingStars.push({
                x: Math.random() * width,
                y: 0,
                len: Math.random() * 80 + 20,
                speed: Math.random() * 10 + 15,
                angle: Math.PI / 4 + Math.random() * 0.2,
                opacity: 1
            });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let ss = shootingStars[i];
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ss.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.02;

            if (ss.opacity <= 0) {
                shootingStars.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
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
    const toggleBtn = document.getElementById('theme-toggle');

    const now = new Date();
    const hour = now.getHours();
    let mood = {};
    let themeIndex = 0;

    if (manualOverrideIndex !== -1) {
        themeIndex = manualOverrideIndex;
        if (toggleBtn) toggleBtn.innerText = ["Theme: Dawn", "Theme: Day", "Theme: Golden", "Theme: Night"][themeIndex];
    } else {
        if (toggleBtn) toggleBtn.innerText = "Change Theme (Auto)";

        if (hour >= 5 && hour < 10) themeIndex = 0;
        else if (hour >= 10 && hour < 17) themeIndex = 1;
        else if (hour >= 17 && hour < 20) themeIndex = 2;
        else themeIndex = 3;
    }

    switch (themeIndex) {
        case 0: // Dawn
            mood = {
                text: 'dawn · misty peach',
                gradient: 'linear-gradient(180deg, #0b1021 0%, #1a2035 50%, #3d3040 100%)',
                canvasOpacity: '0.4',
                auroraGradient: 'radial-gradient(ellipse at center, rgba(255, 180, 150, 0.1) 0%, transparent 60%)',
                cloudOpacity: '0.6'
            };
            break;
        case 1: // Day
            mood = {
                text: 'day · pale azure',
                gradient: 'linear-gradient(180deg, #101a30 0%, #203550 50%, #355070 100%)',
                canvasOpacity: '0.1',
                auroraGradient: 'radial-gradient(ellipse at center, rgba(180, 200, 255, 0.05) 0%, transparent 60%)',
                cloudOpacity: '0.85'
            };
            break;
        case 2: // Golden Hour
            mood = {
                text: 'golden hour · deep embers',
                gradient: 'linear-gradient(180deg, #080c18 0%, #151828 50%, #302025 100%)',
                canvasOpacity: '0.6',
                auroraGradient: 'radial-gradient(ellipse at center, rgba(255, 120, 80, 0.08) 0%, transparent 60%)',
                cloudOpacity: '0.5'
            };
            break;
        case 3: // Night
            mood = {
                text: 'night · cinematic deep space',
                gradient: 'linear-gradient(180deg, #02030a 0%, #050b1c 45%, #0c1330 100%)',
                canvasOpacity: '1.0',
                auroraGradient: 'radial-gradient(ellipse at 40% 60%, rgba(80, 120, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(200, 100, 255, 0.05) 0%, transparent 50%)',
                cloudOpacity: '0.35'
            };
            break;
    }

    if (timeMoodEl) timeMoodEl.innerText = mood.text;
    if (headerMoodEl) headerMoodEl.innerText = mood.text;

    if (gradientLayer) {
        gradientLayer.style.background = mood.gradient;
    }

    const canvas = document.getElementById('star-canvas');
    if (canvas) {
        canvas.style.opacity = mood.canvasOpacity;
    }

    const aurora = document.getElementById('aurora-layer');
    if (aurora) {
        aurora.style.background = mood.auroraGradient;
    }

    const cloudLayer = document.getElementById('cloud-layer');
    if (cloudLayer) {
        cloudLayer.style.opacity = mood.cloudOpacity;
    }
}

// Start
initMnemonic();
