// The Redemption Arc | System Core | Trinno Asphalt

const cursor = document.getElementById('cursor');
const mouse = { x: 0, y: 0 };
const outputCoords = document.getElementById('mouse-coords');
const bootScreen = document.getElementById('boot-screen');
const bootLog = document.getElementById('boot-log');
const bootCta = document.getElementById('boot-cta');
const initBtn = document.getElementById('init-btn');
const bootPercent = document.getElementById('boot-percent');

// --- MOUSE TRACKING & CUSTOM CURSOR ---
function initMouseTracking() {
    // Update cursor position and coordinates display
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Update custom cursor position
        if (cursor) {
            cursor.style.left = mouse.x + 'px';
            cursor.style.top = mouse.y + 'px';
        }

        // Update coordinate display in HUD
        if (outputCoords) {
            outputCoords.innerText = `${mouse.x}, ${mouse.y}`;
        }
    });

    // Add hover effect to interactive elements
    const sensitiveElements = document.querySelectorAll('.sensitive, button, a, input');
    sensitiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hovered');
        });
    });
}

// Initialize mouse tracking when page loads
document.addEventListener('DOMContentLoaded', initMouseTracking);


// --- 1. VOICE MODULE ---
class VoiceModule {
    constructor() { this.synth = window.speechSynthesis; this.enabled = false; }
    speak(text) {
        if (!this.enabled || !this.synth) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 0.8; utterance.rate = 1.0;
        this.synth.speak(utterance);
    }
    enable() { this.enabled = true; }
}
const jarvis = new VoiceModule();

// --- 2. AUDIO SFX (Main Page) ---
class AudioController {
    constructor() { this.ctx = null; this.initialized = false; }
    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;
    }
    playPowerUp() {
        if (!this.initialized) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(50, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 1.5);
        g.gain.setValueAtTime(0, this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        o.start(); o.stop(this.ctx.currentTime + 1.5);
    }

    // Boot sequence sounds
    playKeyClick() {
        if (!this.initialized) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
        g.gain.setValueAtTime(0.02, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
        o.start(); o.stop(this.ctx.currentTime + 0.02);
    }

    playPhaseComplete() {
        if (!this.initialized) return;
        const notes = [523, 659, 784]; // C5, E5, G5 - major chord
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.connect(g); g.connect(this.ctx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, this.ctx.currentTime);
                g.gain.setValueAtTime(0.08, this.ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                o.start(); o.stop(this.ctx.currentTime + 0.15);
            }, i * 50);
        });
    }

    playBootBeep() {
        if (!this.initialized) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(1200, this.ctx.currentTime);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        o.start(); o.stop(this.ctx.currentTime + 0.05);
    }

    playSuccessFanfare() {
        if (!this.initialized) return;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.connect(g); g.connect(this.ctx.destination);
                o.type = 'triangle';
                o.frequency.setValueAtTime(freq, this.ctx.currentTime);
                g.gain.setValueAtTime(0.1, this.ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
                o.start(); o.stop(this.ctx.currentTime + 0.3);
            }, i * 100);
        });
    }

    playDataStream() {
        if (!this.initialized) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(100 + Math.random() * 200, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.03, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        o.start(); o.stop(this.ctx.currentTime + 0.1);
    }
}
const sfx = new AudioController();

// --- 3. GAME SFX ---
class GameSFX {
    constructor(ctx) { this.ctx = ctx; }
    playEat() {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'square'; o.frequency.setValueAtTime(600, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        o.start(); o.stop(this.ctx.currentTime + 0.1);
    }
    playMove() {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(100, this.ctx.currentTime);
        g.gain.setValueAtTime(0.02, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        o.start(); o.stop(this.ctx.currentTime + 0.03);
    }
    playDeath() {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(200, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        o.start(); o.stop(this.ctx.currentTime + 0.3);
    }
}

// --- 4. LIQUID DISTORTION ---
class LiquidEffects {
    constructor() {
        this.canvas = document.getElementById('liquid-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.ripples = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
    addRipple(x, y) { this.ripples.push({ x, y, radius: 0, alpha: 1, speed: 2 }); }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.ripples.length; i++) {
            let r = this.ripples[i];
            r.radius += r.speed; r.alpha -= 0.02;
            if (r.alpha <= 0) { this.ripples.splice(i, 1); i--; continue; }
            this.ctx.beginPath(); this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${r.alpha * 0.5})`;
            this.ctx.stroke();
        }
        requestAnimationFrame(() => this.animate());
    }
}

// --- PARTICLE SYSTEM ---
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.colors = ['#00f3ff', '#ff00ff', '#00ff41', '#bd00ff', '#ffd700'];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            alpha: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, index) => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.02;

            // Mouse interaction - particles move away from cursor
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x += (dx / dist) * force * 2;
                p.y += (dy / dist) * force * 2;
            }

            // Wrap around screen
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle with pulsing effect
            const pulseSize = p.size + Math.sin(p.pulse) * 0.5;
            const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = pulseAlpha;
            this.ctx.fill();

            // Draw glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, pulseSize * 2, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 2);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = pulseAlpha * 0.3;
            this.ctx.fill();

            this.ctx.globalAlpha = 1;

            // Draw connections between nearby particles
            this.particles.slice(index + 1).forEach(p2 => {
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = p.color;
                    this.ctx.globalAlpha = (1 - dist2 / 100) * 0.2;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system after boot
let particleSystem = null;

// --- 5. LEADERBOARD (LocalStorage) ---
const LEADERBOARD_KEY = 'trinno_snake_leaderboard';
function loadLeaderboard() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
}
function saveScore(score) {
    if (score <= 0) return;
    let board = loadLeaderboard();
    board.push(score);
    board.sort((a, b) => b - a); // Desc
    board = board.slice(0, 5); // Top 5
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
}
function renderLeaderboard() {
    const board = loadLeaderboard();
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = board.length > 0
        ? board.map(s => `<li>${s * 10}</li>`).join('')
        : '<li>NO DATA</li>';
}

// --- 6. ARCADE: SNAKE GAME ---
class SnakeGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('game-score');
        this.active = false;
        this.grid = 20;
        this.snake = [];
        this.food = {};
        this.dx = 0; this.dy = 0;
        this.score = 0;
        this.sfx = null;

        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.getElementById('game-quit-btn').addEventListener('click', () => this.quit());
        this.setupSwipeControls();
    }

    setupSwipeControls() {
        let touchStartX = 0, touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        this.canvas.addEventListener('touchend', (e) => {
            if (!this.active) return;
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            const threshold = 30;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > threshold) this.changeDir(1, 0);
                else if (diffX < -threshold) this.changeDir(-1, 0);
            } else {
                if (diffY > threshold) this.changeDir(0, 1);
                else if (diffY < -threshold) this.changeDir(0, -1);
            }
        });
    }

    start() {
        sfx.init(); this.sfx = new GameSFX(sfx.ctx);
        this.active = true;
        this.container.classList.remove('hidden');
        this.resize();
        this.reset();
        renderLeaderboard();
        this.loop();
    }

    resize() {
        const maxWidth = Math.min(window.innerWidth - 20, 600);
        const maxHeight = Math.min(window.innerHeight - 200, 400);
        this.canvas.width = Math.floor(maxWidth / this.grid) * this.grid;
        this.canvas.height = Math.floor(maxHeight / this.grid) * this.grid;
    }

    quit() { this.active = false; this.container.classList.add('hidden'); }

    reset() {
        // Save previous score before reset
        if (this.score > 0) {
            saveScore(this.score);
            renderLeaderboard();
        }
        this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
        this.changeDir(1, 0);
        this.score = 0;
        this.scoreEl.innerText = "SCORE: 0";
        this.spawnFood();
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.grid)),
            y: Math.floor(Math.random() * (this.canvas.height / this.grid))
        };
    }

    handleInput(e) {
        if (!this.active) return;
        if (e.key === 'Escape') this.quit();
        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); this.changeDir(0, -1); break;
            case 'ArrowDown': e.preventDefault(); this.changeDir(0, 1); break;
            case 'ArrowLeft': e.preventDefault(); this.changeDir(-1, 0); break;
            case 'ArrowRight': e.preventDefault(); this.changeDir(1, 0); break;
        }
    }
    changeDir(x, y) { if (this.dx !== -x || this.dy !== -y) { this.dx = x; this.dy = y; } }

    loop() {
        if (!this.active) return;
        setTimeout(() => {
            if (this.active) { requestAnimationFrame(() => this.loop()); this.update(); this.draw(); }
        }, 100);
    }

    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        if (head.x < 0) head.x = (this.canvas.width / this.grid) - 1;
        if (head.x >= this.canvas.width / this.grid) head.x = 0;
        if (head.y < 0) head.y = (this.canvas.height / this.grid) - 1;
        if (head.y >= this.canvas.height / this.grid) head.y = 0;
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreEl.innerText = `SCORE: ${this.score * 10}`;
            this.spawnFood();
            if (this.sfx) this.sfx.playEat();
        } else {
            this.snake.pop();
            if (this.sfx) this.sfx.playMove();
        }
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                if (this.sfx) this.sfx.playDeath();
                this.reset();
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        this.ctx.beginPath();
        for (let x = 0; x <= this.canvas.width; x += this.grid) { this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); }
        for (let y = 0; y <= this.canvas.height; y += this.grid) { this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); }
        this.ctx.stroke();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(this.food.x * this.grid + 1, this.food.y * this.grid + 1, this.grid - 2, this.grid - 2);
        this.ctx.shadowColor = '#00ff41';
        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? '#ccffcc' : '#00ff41';
            this.ctx.fillRect(seg.x * this.grid + 1, seg.y * this.grid + 1, this.grid - 2, this.grid - 2);
        });
        this.ctx.shadowBlur = 0;
    }
}
const snakeGame = new SnakeGame();

// --- 7. THEME SWITCHER ---
function setTheme(themeName) {
    document.body.classList.remove('theme-matrix', 'theme-synthwave');
    if (themeName === 'matrix') document.body.classList.add('theme-matrix');
    else if (themeName === 'synthwave') document.body.classList.add('theme-synthwave');
    // 'default' does nothing, just removes classes
}

// --- 8. LIVE GLOBAL DATA ---
async function fetchGlobalData() {
    try {
        const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const cryptoData = await cryptoRes.json();
        document.getElementById('btc-price').innerText = `$${cryptoData.bitcoin.usd.toLocaleString()}`;
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current_weather=true');
        const weatherData = await weatherRes.json();
        document.getElementById('pune-temp').innerText = `${weatherData.current_weather.temperature}°C`;
    } catch (e) {
        document.getElementById('btc-price').innerText = "$98,420";
        document.getElementById('pune-temp').innerText = "28°C";
    }
}
fetchGlobalData(); setInterval(fetchGlobalData, 60000);

// --- 9. BOOT & EVENTS ---
const bootMessages = [
    // PHASE 1: BIOS & Hardware Init
    "[BIOS] POST Check... OK",
    "[BIOS] CPU: TRINNO-CORE-X9 @ 4.8GHz... DETECTED",
    "[BIOS] RAM: 64GB DDR5-6400 @ CL32... INITIALIZED",
    "[BIOS] GPU: NVIDIA RTX 5090 Ti... DETECTED",
    "[BIOS] NVME: Samsung 990 PRO 4TB... MOUNTED",
    "[BIOS] Audio Subsystem: Dolby Atmos... ENABLED",

    // PHASE 2: Kernel Boot
    "[KERNEL] Loading TRINNO_OS v5.3.1...",
    "[KERNEL] Initializing memory management unit...",
    "[KERNEL] Allocating heap space: 0x00000000 - 0xFFFFFFFF",
    "[KERNEL] Mounting virtual filesystem...",
    "[KERNEL] Loading device drivers...",
    "[DRIVER] Display controller: ACTIVE",
    "[DRIVER] Input subsystem: ACTIVE",
    "[DRIVER] Network interface: ACTIVE",
    "[DRIVER] Audio controller: ACTIVE",

    // PHASE 3: Network Init
    "[NETWORK] Scanning available interfaces...",
    "[NETWORK] eth0: 10.0.0.42/24 UP",
    "[NETWORK] wlan0: 192.168.1.137/24 UP",
    "[NETWORK] Establishing secure tunnel...",
    "[NETWORK] VPN: tunnel0 -> 45.33.32.156:443",
    "[NETWORK] Handshake: TLS 1.3... SUCCESS",
    "[NETWORK] DNS: 1.1.1.1, 8.8.8.8... RESOLVED",
    "[NETWORK] Latency check: 12ms... OPTIMAL",

    // PHASE 4: Security
    "[SECURITY] Loading firewall rules... 847 RULES APPLIED",
    "[SECURITY] Intrusion Detection System: ARMED",
    "[SECURITY] Encryption: AES-256-GCM... ENABLED",
    "[SECURITY] SSH Keys: RSA-4096... VERIFIED",
    "[SECURITY] Certificate chain: VALID until 2027-12-31",
    "[SECURITY] Two-factor auth module: STANDBY",

    // PHASE 5: Services
    "[SERVICE] Starting daemon: redis-server... PID 1842",
    "[SERVICE] Starting daemon: nginx... PID 1901",
    "[SERVICE] Starting daemon: node-runtime... PID 2001",
    "[SERVICE] Starting daemon: matrix-rain... PID 2077",
    "[SERVICE] Loading UI framework: GSAP/TweenMax",
    "[SERVICE] Loading voice synthesizer: JARVIS_V2",
    "[SERVICE] Loading arcade subsystem...",

    // PHASE 6: Data Sync
    "[SYNC] Connecting to CoinGecko API...",
    "[SYNC] Fetching BTC/USD: $98,420.00",
    "[SYNC] Connecting to Weather API...",
    "[SYNC] Fetching PUNE temp: 28°C",
    "[SYNC] Syncing leaderboard data...",
    "[SYNC] Last session: RESTORED",

    // PHASE 7: System Checks
    "[CHECK] Running memory diagnostic... PASS",
    "[CHECK] Running disk integrity... PASS",
    "[CHECK] Running GPU stress test... PASS",
    "[CHECK] Verifying system binaries... 2,847 FILES OK",
    "[CHECK] Loading environment variables... 156 VARS",

    // PHASE 8: Final
    "[BOOT] Initializing display compositor...",
    "[BOOT] Loading theme: CYBER_NEON_DARK",
    "[BOOT] Rendering viewport: 1920x1080",
    "[BOOT] Enabling hardware acceleration...",
    "[BOOT] All subsystems: NOMINAL",

    // PHASE 9: Welcome
    "═══════════════════════════════════════════════",
    "   TRINNO ASPHALT OPERATING SYSTEM v5.3.1",
    "   Copyright (c) 2024-2026 Trinno Industries",
    "   All rights reserved.",
    "═══════════════════════════════════════════════",
    " ",
    "[READY] System boot complete.",
    "[READY] Awaiting operator authentication..."
];

function typeWriterEffect(element, text, callback, playSound = false) {
    let i = 0;
    const speed = 3 + Math.random() * 8; // Faster typing
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            // Play key click sound occasionally
            if (playSound && sfx.initialized && Math.random() > 0.7) {
                sfx.playKeyClick();
            }
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// Phase markers for sound effects
const phaseMarkers = [6, 14, 22, 28, 35, 41, 46, 51]; // Indices where phases end

function runBootSequence() {
    if (sessionStorage.getItem('booted')) { skipBootSequence(); return; }

    // Initialize audio early for boot sounds
    sfx.init();

    initMatrixRain();

    const loadingBarFill = document.getElementById('loading-bar-fill');
    let currentIndex = 0;
    const totalMessages = bootMessages.length;

    function displayNextMessage() {
        if (currentIndex >= totalMessages) {
            // All messages displayed, show button with fanfare
            setTimeout(() => {
                sfx.playSuccessFanfare();
                bootCta.style.display = 'block';
                gsap.fromTo(bootCta, { opacity: 0, y: 20, scale: 0.9 }, {
                    opacity: 1, y: 0, scale: 1, duration: 0.6,
                    ease: "back.out(1.7)"
                });
            }, 500);
            return;
        }

        const msg = bootMessages[currentIndex];
        const line = document.createElement('div');
        line.classList.add('boot-line');
        bootLog.appendChild(line);

        // Update percentage and loading bar
        const progress = Math.round(((currentIndex + 1) / totalMessages) * 100);
        if (bootPercent) bootPercent.innerText = `${progress}%`;
        if (loadingBarFill) {
            loadingBarFill.style.width = `${progress}%`;
        }

        // Play phase complete sound at phase boundaries
        if (phaseMarkers.includes(currentIndex)) {
            sfx.playPhaseComplete();
        }

        // Play data stream sound for certain messages
        if (msg.includes('SYNC') || msg.includes('NETWORK')) {
            sfx.playDataStream();
        }

        // Type out the message character by character with sounds
        typeWriterEffect(line, `> ${msg}`, () => {
            bootLog.scrollTop = bootLog.scrollHeight;
            currentIndex++;

            // Play beep occasionally
            if (Math.random() > 0.85) {
                sfx.playBootBeep();
            }

            // Random delay between messages for that hacker feel
            const delay = 20 + Math.random() * 60;
            setTimeout(displayNextMessage, delay);
        }, true);
    }

    // Start the boot sequence
    displayNextMessage();
}
function skipBootSequence() {
    document.body.classList.remove('loading');
    if (bootScreen) bootScreen.style.display = 'none';
    gsap.to(".container", { opacity: 1, duration: 1 });
    const liquid = new LiquidEffects();
    document.addEventListener('mousemove', (e) => liquid.addRipple(e.clientX, e.clientY));

    // Initialize particles and scroll animations
    particleSystem = new ParticleSystem();
    initScrollAnimations();
}

// --- SCROLL REVEAL ANIMATIONS ---
function initScrollAnimations() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero section parallax
    gsap.to("#hero .clock-container", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Section title animations
    gsap.utils.toArray(".section-title").forEach(title => {
        gsap.fromTo(title,
            { opacity: 0, y: 50, scale: 0.9 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Timeline items staggered reveal
    gsap.utils.toArray(".timeline-item").forEach((item, index) => {
        const direction = item.classList.contains('left') ? -50 : 50;
        gsap.fromTo(item,
            { opacity: 0, x: direction, scale: 0.9 },
            {
                opacity: 1, x: 0, scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Tech cards with staggered animation
    gsap.utils.toArray(".tech-card").forEach((card, index) => {
        gsap.fromTo(card,
            { opacity: 0, y: 80, rotateX: -10 },
            {
                opacity: 1, y: 0, rotateX: 0,
                duration: 0.8,
                delay: (index % 3) * 0.15,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Modules grid animation
    gsap.utils.toArray(".module").forEach((module, index) => {
        gsap.fromTo(module,
            { opacity: 0, scale: 0.5, rotation: -10 },
            {
                opacity: 1, scale: 1, rotation: 0,
                duration: 0.5,
                delay: index * 0.05,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: ".modules-grid",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Apology gate reveal
    gsap.fromTo("#apology-gate .glass-panel",
        { opacity: 0, scale: 0.8, y: 50 },
        {
            opacity: 1, scale: 1, y: 0,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
                trigger: "#apology-gate",
                start: "top 70%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

if (initBtn) {
    initBtn.addEventListener('click', () => {
        sfx.init(); sfx.playPowerUp(); jarvis.enable(); jarvis.speak("Identity Verified.");
        sessionStorage.setItem('booted', 'true');
        const liquid = new LiquidEffects();
        document.addEventListener('mousemove', (e) => { if (Math.random() > 0.8) liquid.addRipple(e.clientX, e.clientY); });

        gsap.to(bootScreen, {
            opacity: 0, duration: 1.5, ease: "power2.inOut", onComplete: () => {
                bootScreen.style.display = 'none';
                document.body.classList.remove('loading');
                gsap.to(".container", {
                    opacity: 1, duration: 1, onComplete: () => {
                        // Initialize particles and scroll animations after transition
                        particleSystem = new ParticleSystem();
                        initScrollAnimations();
                    }
                });
            }
        });
    });
}
window.addEventListener('load', runBootSequence);

// --- 10. TERMINAL ---
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const termToggle = document.getElementById('term-toggle-btn');
const termWrapper = document.getElementById('terminal-wrapper');
if (termToggle && termWrapper) {
    termToggle.addEventListener('click', () => { termWrapper.classList.toggle('closed'); });
    document.getElementById('term-close-btn').addEventListener('click', () => termWrapper.classList.add('closed'));
}
if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            printToTerminal(`Trinno@Asphalt:~$ ${command}`);
            handleCommand(command);
            terminalInput.value = '';
        }
    });
}
function printToTerminal(text) {
    const line = document.createElement('div'); line.classList.add('term-line'); line.innerHTML = text;
    terminalOutput.appendChild(line); terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
function handleCommand(cmd) {
    let response = "";
    switch (cmd) {
        case 'help': response = "CMDS: play snake, theme [matrix|synthwave|default], stats"; break;
        case 'play snake': snakeGame.start(); response = "ARCADE LAUNCHED."; break;
        case 'theme matrix': setTheme('matrix'); response = "THEME: MATRIX ACTIVE."; break;
        case 'theme synthwave': setTheme('synthwave'); response = "THEME: SYNTHWAVE ACTIVE."; break;
        case 'theme default': setTheme('default'); response = "THEME: DEFAULT RESTORED."; break;
        case 'status': response = "SYSTEM: OPTIMAL."; break;
        case 'connect abhilash': response = "LINK ESTABLISHED."; break;
        case 'clear': terminalOutput.innerHTML = ''; return;
        default: response = "CMD UNKNOWN. Type 'help'.";
    }
    setTimeout(() => { printToTerminal(`> ${response}`); if (jarvis.enabled) jarvis.speak(response); }, 200);
}
function initMatrixRain() { const canvas = document.getElementById('matrix-canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; const chars = '01'; const cols = canvas.width / 16; const drops = []; for (let i = 0; i < cols; i++)drops[i] = 1; function d() { ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#0F0'; for (let i = 0; i < drops.length; i++) { ctx.fillText(chars[Math.floor(Math.random() * 2)], i * 16, drops[i] * 16); if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; } if (document.body.classList.contains('loading')) requestAnimationFrame(d); } d(); }
function timeEngine() {
    const now = new Date(); const t = now.toLocaleTimeString('en-US', { hour12: false });
    const clockEl = document.getElementById('rgb-clock');
    if (clockEl) { clockEl.innerText = t; const hue = (Date.now() % 3000) / 3000 * 360; clockEl.style.color = `hsl(${hue},100%,50%)`; clockEl.style.textShadow = `0 0 30px hsl(${hue},100%,50%)`; }
    requestAnimationFrame(timeEngine);
}
timeEngine();
