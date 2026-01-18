// The Redemption Arc | System Core | Trinno Asphalt

const cursor = document.getElementById('cursor');
const mouse = { x: 0, y: 0 };
const outputCoords = document.getElementById('mouse-coords');
const bootScreen = document.getElementById('boot-screen');
const bootLog = document.getElementById('boot-log');
const bootCta = document.getElementById('boot-cta');
const initBtn = document.getElementById('init-btn');
const bootPercent = document.getElementById('boot-percent');

// --- 1. VOICE MODULE (JARVIS Style) ---
class VoiceModule {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = false;
    }

    speak(text) {
        if (!this.enabled || !this.synth) return;
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 0.8;
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        const voices = this.synth.getVoices();
        const sciFiVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
        if (sciFiVoice) utterance.voice = sciFiVoice;

        this.synth.speak(utterance);
    }

    enable() {
        this.enabled = true;
    }
}
const jarvis = new VoiceModule();

// --- 2. AUDIO SFX ---
class AudioController {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.initialized = false;
    }
    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;
    }
    playHover() {
        if (!this.initialized || this.isMuted) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(800, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        o.start(); o.stop(this.ctx.currentTime + 0.05);
    }
    playKeystroke() {
        if (!this.initialized || this.isMuted) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'square'; o.frequency.setValueAtTime(200, this.ctx.currentTime);
        g.gain.setValueAtTime(0.03, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        o.start(); o.stop(this.ctx.currentTime + 0.03);
    }
    playClick() {
        if (!this.initialized || this.isMuted) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'triangle'; o.frequency.setValueAtTime(300, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        o.start(); o.stop(this.ctx.currentTime + 0.1);
    }
    playPowerUp() {
        if (!this.initialized || this.isMuted) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(50, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 1.5);
        g.gain.setValueAtTime(0, this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        o.start(); o.stop(this.ctx.currentTime + 1.5);
    }
}
const sfx = new AudioController();

// --- 3. LIQUID DISTORTION ---
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
            r.radius += r.speed;
            r.alpha -= 0.02;
            if (r.alpha <= 0) { this.ripples.splice(i, 1); i--; continue; }
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${r.alpha * 0.5})`;
            this.ctx.stroke();
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${r.alpha * 0.3})`;
            this.ctx.stroke();
        }
        requestAnimationFrame(() => this.animate());
    }
}

// --- BOOT SEQUENCE ---
const bootMessages = [
    "INITIALIZING KERNEL...", "LOADING LEGACY ARCHIVE...", "DECRYPTING SECTORS...",
    "CHECKING INTEGRITY...", "ESTABLISHING SECURE LINK...", "ACCESSING REPOS...",
    "SYNCING TIME...", "COMPILING DATA...", "PHYSICS: READY", "VOICE: ONLINE", "SYSTEM READY."
];

function runBootSequence() {
    if (sessionStorage.getItem('booted')) {
        skipBootSequence();
        return;
    }
    initMatrixRain();
    let delay = 0;
    bootMessages.forEach((msg, index) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.classList.add('boot-line');
            line.innerText = `> ${msg}`;
            bootLog.appendChild(line);
            bootLog.scrollTop = bootLog.scrollHeight;
            const percent = Math.round(((index + 1) / bootMessages.length) * 100);
            if (bootPercent) bootPercent.innerText = `${percent}%`;

            if (index === bootMessages.length - 1) {
                setTimeout(() => {
                    bootCta.style.display = 'block';
                    gsap.fromTo(bootCta, { opacity: 0 }, { opacity: 1, duration: 0.5 });
                }, 800);
            }
        }, delay);
        delay += Math.random() * 500 + 200;
    });
}

function skipBootSequence() {
    document.body.classList.remove('loading');
    if (bootScreen) bootScreen.style.display = 'none';
    gsap.to(".container", { opacity: 1, duration: 1 });
    gsap.from("#rgb-clock", { y: 50, opacity: 0, duration: 1, delay: 0.2 });
    gsap.from(".architect-tag", { y: 20, opacity: 0, duration: 1, delay: 0.5 });

    // Init systems immediately if skipped
    const liquid = new LiquidEffects();
    document.addEventListener('mousemove', (e) => liquid.addRipple(e.clientX, e.clientY));
}

if (initBtn) {
    initBtn.addEventListener('click', () => {
        sfx.init();
        sfx.playPowerUp();
        jarvis.enable();
        jarvis.speak("Identity Verified. Welcome back, Trinno.");

        sessionStorage.setItem('booted', 'true');

        const liquid = new LiquidEffects();
        document.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.8) liquid.addRipple(e.clientX, e.clientY);
        });

        gsap.to(bootScreen, {
            opacity: 0, duration: 1.5, ease: "power2.inOut",
            onComplete: () => {
                bootScreen.style.display = 'none';
                document.body.classList.remove('loading');
                gsap.to(".container", { opacity: 1, duration: 1 });
                gsap.from("#rgb-clock", { y: 50, opacity: 0, duration: 1, delay: 0.2 });
                gsap.from(".architect-tag", { y: 20, opacity: 0, duration: 1, delay: 0.5 });
            }
        });
    });
    initBtn.addEventListener('mouseenter', () => { if (sfx.initialized) sfx.playHover(); });
}
window.addEventListener('load', runBootSequence);


// --- TERMINAL ---
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const termToggle = document.getElementById('term-toggle-btn');
const termWrapper = document.getElementById('terminal-wrapper');
if (termToggle && termWrapper) {
    termToggle.addEventListener('click', () => { termWrapper.classList.toggle('closed'); if (sfx.initialized) sfx.playHover(); });
    document.getElementById('term-close-btn').addEventListener('click', () => termWrapper.classList.add('closed'));
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (sfx.initialized) sfx.playKeystroke();
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            printToTerminal(`Trinno@Asphalt:~$ ${command}`);
            handleCommand(command);
            terminalInput.value = '';
        }
    });
}
function printToTerminal(text) {
    const line = document.createElement('div');
    line.classList.add('term-line');
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function handleCommand(cmd) {
    let response = "";
    switch (cmd) {
        case 'help': response = "CMDS: status, whoami, projects, skills, connect abhilash, date, quote, clear"; break;
        case 'status': response = "SYSTEM: OPTIMAL. LEGACY ARCHIVE: LOADED. GRADE 11 LOGS: ACTIVE."; break;
        case 'whoami': response = "GUEST USER via WEB PORTAL."; break;
        case 'trinno': response = "TRINNO ASPHALT: THE SYSTEM ARCHITECT. GRADE 11."; break;
        case 'projects': response = "LISTING: ArthShastra, OSEM, NerdTutors, Chaos Hub..."; break;
        case 'connect abhilash': response = "SECURE LINK TO PUNE ESTABLISHED. MESSAGE: 'THE LEGACY CONTINUES, BROTHER.'"; break;
        case 'clear': terminalOutput.innerHTML = ''; return;

        // NEW COMMANDS
        case 'skills': response = "INSTALLED: React, JS, Tailwind, Firebase, Three.js, TS"; break;
        case 'date':
        case 'time': response = `CURRENT SYSTEM TIME: ${new Date().toLocaleString()}`; break;
        case 'quote':
            const quotes = [
                "The code is the law.",
                "System failure is just a reboot opportunity.",
                "Chaos spawns creativity.",
                "Legacy is what you build."
            ];
            response = quotes[Math.floor(Math.random() * quotes.length)];
            break;
        case 'stats': response = "CPU: 12% | RAM: 4.2GB | UPTIME: 99.99% | TEMP: 45°C"; break;
        case 'sudo': response = "PERMISSION DENIED. YOU ARE NOT TRINNO ASPHALT."; break;
        case 'matrix': response = "WAKE UP, NEO... (See boot screen for full effect)"; break;

        default: response = `ERROR: Command '${cmd}' not recognized.`;
    }

    if (sfx.initialized) sfx.playKeystroke();
    setTimeout(() => {
        printToTerminal(`> ${response}`);
        if (sfx.initialized) sfx.playKeystroke();
        if (jarvis.enabled) jarvis.speak(response);
    }, 200);
}


// --- EASTER EGG: KONAMI CODE ---
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateKonamiMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});
function activateKonamiMode() {
    document.body.classList.toggle('matrix-mode');
    jarvis.speak("God Mode Activated.");
    printToTerminal("!!! GOD MODE ACTIVATED !!!");
}


// --- COMMON MOUSE & MATRIX ---
function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const chars = 'TRINNO01'; const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = []; for (let i = 0; i < columns; i++) drops[i] = 1;
    function draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0'; ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        if (document.body.classList.contains('loading')) requestAnimationFrame(draw);
    }
    draw();
}

// Custom Cursor & Physics
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
    if (outputCoords) outputCoords.innerText = `${mouse.x}, ${mouse.y}`;
    document.querySelectorAll('.sensitive').forEach(el => {
        const rect = el.getBoundingClientRect();
        const dist = Math.hypot(mouse.x - (rect.left + rect.width / 2), mouse.y - (rect.top + rect.height / 2));
        if (dist < 300) {
            gsap.to(el, { x: (mouse.x - (rect.left + rect.width / 2)) * 0.1, y: (mouse.y - (rect.top + rect.height / 2)) * 0.1, duration: 0.5 });
        } else {
            gsap.to(el, { x: 0, y: 0, duration: 0.5 });
        }
    });
});
document.querySelectorAll('.sensitive').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); if (sfx.initialized) sfx.playHover(); });
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

// Clock Engine
function timeEngine() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { hour12: false });
    const clockEl = document.getElementById('rgb-clock');
    if (clockEl) {
        clockEl.innerText = t;
        const hue = (Date.now() % 3000) / 3000 * 360;
        clockEl.style.color = `hsl(${hue}, 100%, 50%)`;
        clockEl.style.textShadow = `0 0 30px hsl(${hue}, 100%, 50%)`;
    }
    requestAnimationFrame(timeEngine);
}
timeEngine();
