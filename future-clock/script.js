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
    gsap.to(".container", { opacity: 1, duration: 1, onComplete: () => {
        // Initialize hero enhancements for returning users
        initHeroEnhancements();
        // Initialize timeline enhancements for returning users
        initTimelineEnhancements();
        // Initialize skills enhancements for returning users
        initSkillsEnhancements();
        // Initialize project cards enhancements for returning users
        initProjectCardsEnhancements();
        // Initialize new sections for returning users
        initNewSections();
    }});
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
        sfx.init(); sfx.playPowerUp(); jarvis.speak("System online. All modules activated.");
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
                        // Initialize hero section enhancements (typing effect, floating code, glitch)
                        initHeroEnhancements();
                        // Initialize timeline enhancements (data stream, particles, progress)
                        initTimelineEnhancements();
                        // Initialize skills section enhancements (3D flip, counters, particles)
                        initSkillsEnhancements();
                        // Initialize project cards enhancements (3D tilt, tech badges, glow)
                        initProjectCardsEnhancements();
                        // Initialize new sections (stats dashboard, contact terminal)
                        initNewSections();
                    }
                });
            }
        });
    });
}
// Boot sequence is now triggered after successful login
// window.addEventListener('load', runBootSequence);

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
    const glitchEl = document.getElementById('clock-glitch');
    if (clockEl) {
        clockEl.innerText = t;
        const hue = (Date.now() % 3000) / 3000 * 360;
        const color = `hsl(${hue},100%,50%)`;
        const shadow = `0 0 30px ${color}`;

        clockEl.style.color = color;
        clockEl.style.textShadow = shadow;

        if (glitchEl) {
            glitchEl.innerText = t;
            glitchEl.style.color = color;
            glitchEl.style.textShadow = shadow;
        }
    }
    requestAnimationFrame(timeEngine);
}
timeEngine();

// --- PROJECT PREVIEW MODAL LOGIC ---
const modal = document.getElementById('preview-modal');
const iframe = document.getElementById('preview-iframe');
const loader = document.getElementById('modal-loader');
const externalLink = document.getElementById('modal-external-link');

function openPreview(url) {
    if (!modal || !iframe || !loader) return;

    // Reset state
    iframe.classList.remove('loaded');
    iframe.src = '';
    loader.style.display = 'block';
    modal.classList.add('active');

    // Set new content
    iframe.src = url;
    if (externalLink) externalLink.href = url;

    // Smooth transition
    iframe.onload = () => {
        loader.style.display = 'none';
        iframe.classList.add('loaded');
    };

    // Play system sound if available
    if (window.sfx && typeof sfx.playBootBeep === 'function') sfx.playBootBeep();
}

function closePreview() {
    if (!modal || !iframe) return;
    modal.classList.remove('active');
    iframe.src = '';
    iframe.classList.remove('loaded');
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreview();
});

// Close modal on outside click
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePreview();
    });
}

// ============================================
// HERO SECTION ENHANCEMENTS
// ============================================

class HeroEnhancements {
    constructor() {
        this.architectText = document.getElementById('architect-text');
        this.floatingCodeContainer = document.getElementById('floating-code');
        this.heroTitle = document.getElementById('hero-title');

        this.fullText = 'System Architect: Trinno Asphalt';
        this.typingSpeed = 80;
        this.typingStarted = false;
    }

    init() {
        // Start typing effect after a delay (after title animation)
        setTimeout(() => {
            this.startTypingEffect();
        }, 3000); // Start after title letters finish animating

        // Add interactive floating code behavior
        this.initFloatingCodeInteraction();

        // Add glitch effect to title on random intervals
        this.initRandomGlitch();
    }

    startTypingEffect() {
        if (this.typingStarted || !this.architectText) return;
        this.typingStarted = true;

        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < this.fullText.length) {
                this.architectText.textContent += this.fullText[index];

                // Play typing sound if audio is available
                if (window.sfx && sfx.initialized) {
                    sfx.playKeyClick();
                }

                index++;
            } else {
                clearInterval(typeInterval);
                // Remove cursor after typing is complete
                setTimeout(() => {
                    const cursor = document.querySelector('.typing-cursor-hero');
                    if (cursor) {
                        cursor.style.animation = 'none';
                        cursor.style.opacity = '0';
                    }
                }, 2000);
            }
        }, this.typingSpeed);
    }

    initFloatingCodeInteraction() {
        if (!this.floatingCodeContainer) return;

        // Make floating code respond to mouse movement
        document.addEventListener('mousemove', (e) => {
            const snippets = this.floatingCodeContainer.querySelectorAll('.code-snippet');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            snippets.forEach((snippet, index) => {
                const offsetX = (mouseX - 0.5) * 20 * (index % 2 === 0 ? 1 : -1);
                const offsetY = (mouseY - 0.5) * 20 * (index % 2 === 0 ? -1 : 1);
                snippet.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        });
    }

    initRandomGlitch() {
        if (!this.heroTitle) return;

        // Random glitch effect every 5-10 seconds
        const triggerGlitch = () => {
            const letters = this.heroTitle.querySelectorAll('.title-letter');
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];

            if (randomLetter) {
                randomLetter.style.animation = 'letterGlitch 0.3s ease';
                randomLetter.style.color = 'var(--neon-cyan)';

                setTimeout(() => {
                    randomLetter.style.animation = '';
                    randomLetter.style.color = '';
                }, 300);
            }

            // Schedule next glitch
            setTimeout(triggerGlitch, 5000 + Math.random() * 5000);
        };

        // Start after initial animations
        setTimeout(triggerGlitch, 6000);
    }
}

// Initialize hero enhancements after boot sequence completes
let heroEnhancements = null;

function initHeroEnhancements() {
    if (!heroEnhancements) {
        heroEnhancements = new HeroEnhancements();
        heroEnhancements.init();
    }
}

// ============================================
// TIMELINE ENHANCEMENTS - PART 2
// ============================================

class TimelineEnhancements {
    constructor() {
        this.dataStreamContainer = document.getElementById('timeline-data-stream');
        this.particlesContainer = document.getElementById('timeline-particles');
        this.timeline = document.querySelector('.timeline');
        this.timelineItems = document.querySelectorAll('.timeline-item');

        // Data stream characters
        this.dataChars = ['0', '1', '01', '10', '0x', 'FF', 'A0', '>>'];
    }

    init() {
        this.createDataStream();
        this.createTravelingParticles();
        this.addScanLines();
        this.initScrollProgress();
    }

    // Create flowing binary/hex data stream
    createDataStream() {
        if (!this.dataStreamContainer) return;

        const createBit = () => {
            const bit = document.createElement('span');
            bit.className = 'data-bit' + (Math.random() > 0.5 ? ' alt' : '');
            bit.textContent = this.dataChars[Math.floor(Math.random() * this.dataChars.length)];
            bit.style.left = (Math.random() * 30 + 5) + 'px';
            bit.style.animationDuration = (3 + Math.random() * 4) + 's';
            bit.style.animationDelay = (Math.random() * 2) + 's';

            this.dataStreamContainer.appendChild(bit);

            // Remove after animation completes
            setTimeout(() => {
                bit.remove();
            }, 8000);
        };

        // Create initial batch
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createBit(), i * 200);
        }

        // Continuously create new bits
        setInterval(() => {
            if (this.isTimelineVisible()) {
                createBit();
            }
        }, 400);
    }

    // Create traveling particles along the timeline
    createTravelingParticles() {
        if (!this.particlesContainer) return;

        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'timeline-particle';
            this.particlesContainer.appendChild(particle);
        }
    }

    // Add scan line elements to each timeline card
    addScanLines() {
        this.timelineItems.forEach(item => {
            const panel = item.querySelector('.glass-panel');
            if (panel && !panel.querySelector('.scan-line')) {
                const scanLine = document.createElement('div');
                scanLine.className = 'scan-line';
                panel.appendChild(scanLine);
            }
        });
    }

    // Check if timeline section is visible
    isTimelineVisible() {
        if (!this.timeline) return false;
        const rect = this.timeline.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    // Initialize scroll progress indicator
    initScrollProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress';
        progressBar.innerHTML = '<div class="timeline-progress-fill"></div>';
        document.body.appendChild(progressBar);

        const progressFill = progressBar.querySelector('.timeline-progress-fill');

        window.addEventListener('scroll', () => {
            if (!this.timeline) return;

            const rect = this.timeline.getBoundingClientRect();
            const timelineTop = rect.top + window.scrollY;
            const timelineHeight = this.timeline.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            // Show progress bar only when timeline is in view
            if (rect.top < windowHeight && rect.bottom > 0) {
                progressBar.classList.add('visible');

                // Calculate progress
                const startPoint = timelineTop - windowHeight;
                const endPoint = timelineTop + timelineHeight;
                const currentProgress = ((scrollY - startPoint) / (endPoint - startPoint)) * 100;
                const clampedProgress = Math.max(0, Math.min(100, currentProgress));

                progressFill.style.height = clampedProgress + '%';
            } else {
                progressBar.classList.remove('visible');
            }
        });
    }
}

// Initialize timeline enhancements
let timelineEnhancements = null;

function initTimelineEnhancements() {
    if (!timelineEnhancements) {
        timelineEnhancements = new TimelineEnhancements();
        timelineEnhancements.init();
    }
}

// ============================================
// SKILLS SECTION ENHANCEMENTS - PART 3
// ============================================

class SkillsEnhancements {
    constructor() {
        this.moduleCards = document.querySelectorAll('.module-card');
        this.skillsStats = document.getElementById('skills-stats');
        this.modulesSection = document.getElementById('modules');
    }

    init() {
        this.initScrollReveal();
        this.initParticleBurst();
        this.initStatsCounter();
        this.initSoundEffects();
    }

    // Staggered reveal animation on scroll
    initScrollReveal() {
        if (!this.modulesSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.moduleCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(this.modulesSection);
    }

    // Particle burst effect on hover
    initParticleBurst() {
        this.moduleCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createParticleBurst(card);
            });
        });
    }

    createParticleBurst(card) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Create particle container if not exists
        let container = card.querySelector('.module-particles');
        if (!container) {
            container = document.createElement('div');
            container.className = 'module-particles';
            card.appendChild(container);
        }

        // Create 8 particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'skill-particle';

            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';

            container.appendChild(particle);

            // Animate particle
            particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }).onfinish = () => particle.remove();
        }
    }

    // Animated stats counter
    initStatsCounter() {
        if (!this.skillsStats) return;

        const totalSkillsEl = document.getElementById('total-skills');
        const avgProficiencyEl = document.getElementById('avg-proficiency');
        const expertCountEl = document.getElementById('expert-count');

        // Calculate actual values
        let totalSkills = this.moduleCards.length;
        let totalProficiency = 0;
        let expertCount = 0;

        this.moduleCards.forEach(card => {
            const skill = parseInt(card.dataset.skill) || 0;
            totalProficiency += skill;
            if (skill >= 90) expertCount++;
        });

        const avgProficiency = Math.round(totalProficiency / totalSkills);

        // Animate counters when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(totalSkillsEl, 0, totalSkills, 1000);
                    this.animateCounter(avgProficiencyEl, 0, avgProficiency, 1500, '%');
                    this.animateCounter(expertCountEl, 0, expertCount, 800);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.skillsStats);
    }

    animateCounter(element, start, end, duration, suffix = '') {
        if (!element) return;

        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (end - start) * easeOutQuart);

            element.textContent = current + suffix;
            element.classList.add('counting');

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.classList.remove('counting');
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Sound effects on interaction
    initSoundEffects() {
        this.moduleCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.sfx && sfx.initialized) {
                    sfx.playBootBeep();
                }
            });
        });
    }
}

// Initialize skills enhancements
let skillsEnhancements = null;

function initSkillsEnhancements() {
    if (!skillsEnhancements) {
        skillsEnhancements = new SkillsEnhancements();
        skillsEnhancements.init();
    }
}

// ============================================
// PROJECT CARDS ENHANCEMENTS - PART 4
// ============================================

class ProjectCardsEnhancements {
    constructor() {
        this.projectCards = document.querySelectorAll('.tech-card[data-tilt]');
        this.projectsSection = document.getElementById('showcase');
        this.projectsGrid = document.getElementById('projects-grid');
    }

    init() {
        this.init3DTilt();
        this.initScrollReveal();
        this.initSoundEffects();
    }

    // 3D Tilt effect based on mouse position
    init3DTilt() {
        this.projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                this.handleTilt(card, e);
            });

            card.addEventListener('mouseleave', () => {
                this.resetTilt(card);
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

    handleTilt(card, e) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (max 10 degrees)
        const rotateY = (mouseX / (rect.width / 2)) * 10;
        const rotateX = -(mouseY / (rect.height / 2)) * 10;

        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
    }

    resetTilt(card) {
        card.style.transition = 'transform 0.5s ease-out';
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
    }

    // Staggered scroll reveal animation
    initScrollReveal() {
        if (!this.projectsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.projectCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 150);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.projectsSection);
    }

    // Sound effects on hover
    initSoundEffects() {
        this.projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.sfx && sfx.initialized) {
                    sfx.playDataStream();
                }
            });
        });
    }
}

// Initialize project cards enhancements
let projectCardsEnhancements = null;

function initProjectCardsEnhancements() {
    if (!projectCardsEnhancements) {
        projectCardsEnhancements = new ProjectCardsEnhancements();
        projectCardsEnhancements.init();
    }
}

// ============================================
// PART 5: NEW SECTIONS - STATS & CONTACT
// ============================================

class StatsEnhancements {
    constructor() {
        this.statsSection = document.getElementById('stats-dashboard');
        this.statCards = document.querySelectorAll('.stat-card');
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.achievementBadges = document.querySelectorAll('.achievement-badge');
    }

    init() {
        this.initScrollReveal();
        this.initAchievementHover();
    }

    // Animate stats when section comes into view
    initScrollReveal() {
        if (!this.statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate stat cards
                    this.statCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });

                    // Animate numbers
                    this.statNumbers.forEach(numEl => {
                        const target = parseInt(numEl.dataset.target) || 0;
                        this.animateNumber(numEl, 0, target, 2000);
                    });

                    // Animate achievements
                    setTimeout(() => {
                        this.achievementBadges.forEach((badge, index) => {
                            setTimeout(() => {
                                badge.style.opacity = '1';
                                badge.style.transform = 'translateY(0)';
                            }, index * 100);
                        });
                    }, 500);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        // Set initial state for achievements
        this.achievementBadges.forEach(badge => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            badge.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });

        observer.observe(this.statsSection);
    }

    // Animate number counting
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const formatNumber = (num) => {
            if (num >= 1000) {
                return num.toLocaleString();
            }
            return num.toString();
        };

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOut);

            element.textContent = formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    // Achievement hover effects
    initAchievementHover() {
        this.achievementBadges.forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                if (window.sfx && sfx.initialized && badge.classList.contains('unlocked')) {
                    sfx.playPhaseComplete();
                }
            });
        });
    }
}

class ContactTerminal {
    constructor() {
        this.contactForm = document.getElementById('contact-form');
        this.contactOutput = document.getElementById('contact-output');
        this.nameInput = document.getElementById('contact-name');
        this.emailInput = document.getElementById('contact-email');
        this.subjectInput = document.getElementById('contact-subject');
        this.messageInput = document.getElementById('contact-message');
    }

    init() {
        if (!this.contactForm) return;
        this.initFormHandling();
        this.initTypingEffect();
    }

    initFormHandling() {
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.contactForm.addEventListener('reset', () => {
            this.addTerminalLine('> FORM CLEARED');
        });

        // Add typing sounds to inputs
        const inputs = this.contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('keydown', () => {
                if (window.sfx && sfx.initialized) {
                    sfx.playKeyClick();
                }
            });
        });
    }

    handleSubmit() {
        const name = this.nameInput.value;
        const email = this.emailInput.value;
        const subject = this.subjectInput.value || 'No Subject';
        const message = this.messageInput.value;

        // Simulate transmission
        this.addTerminalLine('&nbsp;');
        this.addTerminalLine('> INITIATING TRANSMISSION...');

        setTimeout(() => {
            this.addTerminalLine(`> FROM: ${name} <${email}>`);
        }, 500);

        setTimeout(() => {
            this.addTerminalLine(`> SUBJECT: ${subject}`);
        }, 1000);

        setTimeout(() => {
            this.addTerminalLine('> ENCRYPTING MESSAGE...');
        }, 1500);

        setTimeout(() => {
            this.addTerminalLine('> TRANSMISSION SUCCESSFUL!');
            this.addTerminalLine('> Message has been queued for delivery.');
            this.addTerminalLine('&nbsp;');

            // Play success sound
            if (window.sfx && sfx.initialized) {
                sfx.playSuccessFanfare();
            }

            // Create mailto link (actual email sending)
            const mailtoLink = `mailto:trinnoasphalt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;
            window.open(mailtoLink, '_blank');

            // Reset form
            this.contactForm.reset();
        }, 2500);
    }

    addTerminalLine(text) {
        const line = document.createElement('div');
        line.className = 'term-line-contact';
        line.innerHTML = text;
        this.contactOutput.appendChild(line);
        this.contactOutput.scrollTop = this.contactOutput.scrollHeight;
    }

    initTypingEffect() {
        // Focus effect on inputs
        const inputs = this.contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('active');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('active');
            });
        });
    }
}

// Initialize new sections
let statsEnhancements = null;
let contactTerminal = null;

function initNewSections() {
    if (!statsEnhancements) {
        statsEnhancements = new StatsEnhancements();
        statsEnhancements.init();
    }
    if (!contactTerminal) {
        contactTerminal = new ContactTerminal();
        contactTerminal.init();
    }
}

// ============================================
// FUTURISTIC LOGIN SCREEN FUNCTIONALITY
// ============================================

class LoginSystem {
    constructor() {
        this.loginScreen = document.getElementById('login-screen');
        this.loginForm = document.getElementById('login-form');
        this.passwordInput = document.getElementById('password-input');
        this.loginContainer = document.querySelector('.login-container');
        this.loginButton = document.querySelector('.login-button');
        this.powerBtn = document.getElementById('power-btn');
        this.easeBtn = document.getElementById('ease-btn');
        this.inputGroup = document.querySelector('.input-group');
        this.togglePasswordBtn = document.getElementById('toggle-password');
        this.passwordVisible = false;

        // Correct password
        this.correctPassword = 'trinno2025';

        // Initialize if login screen exists
        if (this.loginScreen) {
            this.init();
        }
    }

    init() {
        // Bind events
        this.bindEvents();

        // Focus password input after a short delay
        setTimeout(() => {
            if (this.passwordInput) {
                this.passwordInput.focus();
            }
        }, 500);

        // Add matrix rain effect to login background
        this.createMatrixRain();
    }

    bindEvents() {
        // Form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.attemptLogin();
            });
        }

        // Password input - remove error state on typing
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => {
                this.clearError();
            });

            // Add typing sound effect
            this.passwordInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== 'Tab') {
                    this.playKeySound();
                }
            });
        }

        // Toggle password visibility
        if (this.togglePasswordBtn) {
            this.togglePasswordBtn.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }

        // Power button - close the page
        if (this.powerBtn) {
            this.powerBtn.addEventListener('click', () => {
                this.closePage();
            });
        }

        // Accessibility button
        if (this.easeBtn) {
            this.easeBtn.addEventListener('click', () => {
                this.toggleHighContrast();
            });
        }
    }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;

        if (this.passwordVisible) {
            this.passwordInput.type = 'text';
            this.togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            this.togglePasswordBtn.classList.add('active');
        } else {
            this.passwordInput.type = 'password';
            this.togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            this.togglePasswordBtn.classList.remove('active');
        }

        // Keep focus on input
        this.passwordInput.focus();
    }

    closePage() {
        // Create shutdown overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 999999;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        overlay.innerHTML = `
            <div style="
                color: var(--neon-green, #00ff41);
                font-family: 'JetBrains Mono', monospace;
                font-size: 1rem;
                text-align: center;
            ">
                <div style="margin-bottom: 15px;">> SYSTEM SHUTDOWN INITIATED</div>
                <div style="opacity: 0.6;">Closing connection...</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Fade to black
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);

        // Close the page after animation
        setTimeout(() => {
            // Try to close the window/tab
            window.close();

            // If window.close() doesn't work (browser restrictions),
            // navigate to a blank page or show a message
            setTimeout(() => {
                // If still here, the browser blocked window.close()
                overlay.innerHTML = `
                    <div style="
                        color: var(--neon-green, #00ff41);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 1rem;
                        text-align: center;
                    ">
                        <div style="margin-bottom: 15px;">> SHUTDOWN BLOCKED BY BROWSER</div>
                        <div style="opacity: 0.6; margin-bottom: 20px;">Please close this tab manually</div>
                        <div style="opacity: 0.4; font-size: 0.8rem;">[Press Ctrl+W or Cmd+W]</div>
                    </div>
                `;
            }, 500);
        }, 800);
    }

    attemptLogin() {
        const password = this.passwordInput.value;

        // Show loading state
        this.setLoadingState(true);

        // Simulate authentication delay
        setTimeout(() => {
            if (password === this.correctPassword) {
                this.loginSuccess();
            } else {
                this.loginFailed();
            }
        }, 800);
    }

    setLoadingState(loading) {
        if (this.loginButton) {
            if (loading) {
                this.loginButton.classList.add('loading');
            } else {
                this.loginButton.classList.remove('loading');
            }
        }
    }

    loginSuccess() {
        // Play success sound
        this.playSuccessSound();

        // Stop matrix rain animation
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
        }

        // Speak "Identity Verified" AFTER successful authentication
        if (window.jarvis && typeof jarvis.speak === 'function') {
            jarvis.enable();
            jarvis.speak('Identity Verified. Welcome back, Administrator.');
        }

        // Add success animation class
        this.loginScreen.classList.add('success');

        // Hide login screen after animation
        setTimeout(() => {
            this.loginScreen.classList.add('hidden');

            // Trigger boot sequence after login
            this.onLoginComplete();
        }, 1000);
    }

    loginFailed() {
        // Remove loading state
        this.setLoadingState(false);

        // Play error sound
        this.playErrorSound();

        // Add error states
        this.loginContainer.classList.add('shake');
        this.passwordInput.classList.add('error');
        this.inputGroup.classList.add('error');

        // Clear password
        this.passwordInput.value = '';
        this.passwordInput.focus();

        // Remove shake after animation
        setTimeout(() => {
            this.loginContainer.classList.remove('shake');
        }, 500);
    }

    clearError() {
        this.passwordInput.classList.remove('error');
        this.inputGroup.classList.remove('error');
    }

    onLoginComplete() {
        // This function is called after successful login
        console.log('[SYSTEM] Login successful. Initiating boot sequence...');

        // Start the boot sequence now
        if (typeof runBootSequence === 'function') {
            runBootSequence();
        }
    }

    createMatrixRain() {
        // Create canvas for matrix rain effect
        const canvas = document.createElement('canvas');
        canvas.id = 'login-matrix-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.15;
            pointer-events: none;
        `;

        const background = document.querySelector('.login-background');
        if (!background) return;
        background.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Matrix characters
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        // Animation
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff41';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        // Store interval for cleanup
        this.matrixInterval = setInterval(draw, 50);
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast-login');

        // Add high contrast styles if not already present
        if (!document.getElementById('high-contrast-styles')) {
            const style = document.createElement('style');
            style.id = 'high-contrast-styles';
            style.textContent = `
                body.high-contrast-login #login-screen {
                    filter: contrast(1.5) brightness(1.2);
                }
                body.high-contrast-login .login-input {
                    background: #000 !important;
                    border-color: #fff !important;
                    color: #fff !important;
                }
                body.high-contrast-login .login-button {
                    background: #fff !important;
                    color: #000 !important;
                    border-color: #fff !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Sound effects
    playKeySound() {
        if (window.sfx && sfx.initialized) {
            sfx.playKeyClick();
        }
    }

    playSuccessSound() {
        if (window.sfx && sfx.initialized) {
            sfx.playSuccessFanfare();
        }
    }

    playErrorSound() {
        if (window.sfx && sfx.initialized) {
            // Create a quick error beep
            if (sfx.ctx) {
                const o = sfx.ctx.createOscillator();
                const g = sfx.ctx.createGain();
                o.connect(g);
                g.connect(sfx.ctx.destination);
                o.type = 'square';
                o.frequency.setValueAtTime(200, sfx.ctx.currentTime);
                o.frequency.setValueAtTime(150, sfx.ctx.currentTime + 0.1);
                g.gain.setValueAtTime(0.1, sfx.ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, sfx.ctx.currentTime + 0.2);
                o.start();
                o.stop(sfx.ctx.currentTime + 0.2);
            }
        }
    }
}

// Initialize Login System when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
    // Initialize Footer Audio System
    window.footerSystem = new FooterAudioSystem();
});

// ============================================
// PART 6: FOOTER & AUDIO SYSTEM LOGIC
// ============================================

class FooterAudioSystem {
    constructor() {
        this.footer = document.getElementById('main-footer');
        this.musicToggle = document.getElementById('music-toggle');
        this.sfxToggle = document.getElementById('sfx-toggle');
        this.volumeSlider = document.getElementById('master-volume');
        this.visualizerCanvas = document.getElementById('audio-visualizer');

        this.bgMusic = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isMusicPlaying = false;
        this.isSfxEnabled = true;
        this.visualizerActive = false;

        if (this.footer) {
            this.init();
        }
    }

    init() {
        this.initMatrixBackground();
        this.initAudioControls();
        this.initSocialTooltips();

        // Initialize GSAP reveals
        this.initScrollReveal();
    }

    initAudioControls() {
        // SFX Toggle
        if (this.sfxToggle) {
            this.sfxToggle.addEventListener('click', () => {
                this.isSfxEnabled = !this.isSfxEnabled;
                this.updateBtnState(this.sfxToggle, this.isSfxEnabled, 'SFX: ON', 'SFX: OFF');

                // Mute/Unmute global SFX
                if (window.sfx) {
                    if (this.isSfxEnabled) {
                        sfx.playKeyClick(); // Test sound
                    }
                    // We don't actually mute the class, we just control it via flags
                    // In a real app, we'd update a property on the AudioController
                }
            });
        }

        // Music Toggle
        if (this.musicToggle) {
            this.musicToggle.addEventListener('click', () => {
                if (!this.audioContext) {
                    this.setupAudioContext();
                }

                if (this.isMusicPlaying) {
                    this.pauseMusic();
                } else {
                    this.playMusic();
                }

                this.updateBtnState(this.musicToggle, this.isMusicPlaying, 'AMBIENCE: ON', 'AMBIENCE: OFF');
            });
        }

        // Volume Control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                if (this.gainNode) {
                    this.gainNode.gain.value = vol * 0.5; // Max 0.5 for background
                }
                // Update track color
                const percent = vol * 100;
                e.target.style.background = `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`;
            });
            // Trigger initial style update
            this.volumeSlider.dispatchEvent(new Event('input'));
        }
    }

    updateBtnState(btn, isActive, onText, offText) {
        const label = btn.querySelector('.btn-label');
        if (isActive) {
            btn.classList.add('active');
            label.innerText = onText;
        } else {
            btn.classList.remove('active');
            label.innerText = offText;
        }
    }

    setupAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.analyser = this.audioContext.createAnalyser();

        // Connect nodes
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Configure analyser
        this.analyser.fftSize = 64;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        // Set initial volume
        const vol = this.volumeSlider ? parseFloat(this.volumeSlider.value) : 0.5;
        this.gainNode.gain.value = vol * 0.5;

        // Create Synthwave drone using oscillators logic
        // This simulates an ambient track without external assets
    }

    playMusic() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isMusicPlaying = true;
        this.visualizerActive = true;

        // Create oscillators for ambient drone
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 55; // Low drone (A1)

        osc2.type = 'sine';
        osc2.frequency.value = 110; // Octave up (A2)

        osc3.type = 'triangle';
        osc3.frequency.value = 164.81; // E3

        // Filters for smoother sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        // Individual gains
        const g1 = this.audioContext.createGain(); g1.gain.value = 0.3;
        const g2 = this.audioContext.createGain(); g2.gain.value = 0.2;
        const g3 = this.audioContext.createGain(); g3.gain.value = 0.1;

        // LFO for movement
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Slow pulse
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Connections
        osc1.connect(g1);
        osc2.connect(g2);
        osc3.connect(g3);

        g1.connect(filter);
        g2.connect(filter);
        g3.connect(filter);

        filter.connect(this.gainNode);

        // Start playing
        const now = this.audioContext.currentTime;
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        lfo.start(now);

        // Store references to stop later
        this.oscillators = [osc1, osc2, osc3, lfo];

        // Start visualizer
        this.drawVisualizer();

        // Notify
        if (window.jarvis) jarvis.speak("Ambient protocols engaged.");
    }

    pauseMusic() {
        this.isMusicPlaying = false;
        this.visualizerActive = false;

        // Stop all oscillators
        if (this.oscillators) {
            const now = this.audioContext.currentTime;
            this.oscillators.forEach(osc => {
                try {
                    osc.stop(now + 0.1);
                } catch(e) {}
            });
            this.oscillators = [];
        }
    }

    drawVisualizer() {
        if (!this.visualizerActive || !this.visualizerCanvas) return;

        const canvas = this.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.offsetWidth;
        const height = canvas.height = canvas.parentElement.offsetHeight;

        const draw = () => {
            if (!this.visualizerActive) return;
            requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(this.dataArray);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / this.dataArray.length) * 2;
            let x = 0;

            for(let i = 0; i < this.dataArray.length; i++) {
                const barHeight = (this.dataArray[i] / 255) * height;

                ctx.fillStyle = `rgba(0, 243, 255, ${this.dataArray[i]/255})`;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }

    initMatrixBackground() {
        const canvas = document.getElementById('footer-matrix');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.offsetWidth;
        let height = canvas.height = canvas.parentElement.offsetHeight;

        const chars = '01';
        const fontSize = 10;
        const columns = Math.ceil(width / fontSize);
        const drops = Array(columns).fill(1).map(() => Math.random() * -100);

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        });

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#003300';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(draw);
        };

        draw();
    }

    initSocialTooltips() {
        const links = document.querySelectorAll('.social-icon');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if(this.isSfxEnabled && window.sfx) sfx.playKeyClick();
            });
        });
    }

    initScrollReveal() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.fromTo(".footer-content > *",
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: ".main-footer",
                    start: "top 85%"
                }
            }
        );
    }
}
