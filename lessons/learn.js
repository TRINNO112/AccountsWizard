/* ================================================================
   🎮 ACCOUNTS WIZARD - CORE GAME ENGINE
   Part 2: Player Data, XP System, UI Updates, Storage
   "Tum sirf student nahi… ek Accounting Warrior ho!"
================================================================ */

// ============================================
// 🎯 PLAYER DATA (Fresh Start)
// ============================================

const Player = {
    name: 'New Warrior',
    level: 1,
    xp: 0,
    rank: 'Noob Accountant',
    rankEmoji: '😅',
    streak: 0,
    gamesPlayed: 0,
    totalCorrect: 0,
    totalWrong: 0,
    achievements: [],
    bestScores: {
        'trial-balance': 0,
        'brs': 0,
        'depreciation': 0,
        'rectification': 0
    },
    settings: {
        sound: true,
        name: 'New Warrior'
    }
};

// ============================================
// 🏆 RANKS CONFIGURATION
// ============================================

const Ranks = [
    { level: 1, name: 'Noob Accountant', emoji: '😅', xpRequired: 0 },
    { level: 2, name: 'Rookie Ledger Keeper', emoji: '📚', xpRequired: 100 },
    { level: 3, name: 'Trial Balance Soldier', emoji: '⚔️', xpRequired: 250 },
    { level: 4, name: 'Depreciation Sniper', emoji: '🎯', xpRequired: 450 },
    { level: 5, name: 'BRS Hacker', emoji: '💳', xpRequired: 650 },
    { level: 6, name: 'Rectification Surgeon', emoji: '🩺', xpRequired: 900 },
    { level: 7, name: 'Accounts Wizard', emoji: '🧙‍♂️', xpRequired: 1200 }
];

// ============================================
// 🏅 ACHIEVEMENTS CONFIGURATION
// ============================================

const Achievements = [
    {
        id: 'first-blood',
        name: 'First Blood',
        description: 'Complete your first mission',
        icon: '🩸',
        xp: 20,
        condition: () => Player.gamesPlayed >= 1
    },
    {
        id: 'quick-learner',
        name: 'Quick Learner',
        description: 'Score 80%+ accuracy in any mission',
        icon: '📖',
        xp: 30,
        condition: () => Player.totalCorrect > 0 && getAccuracy() >= 80
    },
    {
        id: 'perfect-round',
        name: 'Perfect Round',
        description: 'Complete a mission with 100% accuracy',
        icon: '💯',
        xp: 50,
        condition: () => false // Checked during game
    },
    {
        id: 'streak-3',
        name: 'On Fire',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        xp: 40,
        condition: () => Player.streak >= 3
    },
    {
        id: 'streak-7',
        name: 'Unstoppable',
        description: 'Maintain a 7-day streak',
        icon: '💪',
        xp: 100,
        condition: () => Player.streak >= 7
    },
    {
        id: 'trial-master',
        name: 'Trial Balance Master',
        description: 'Score 500+ in Trial Balance',
        icon: '🎯',
        xp: 60,
        condition: () => Player.bestScores['trial-balance'] >= 500
    },
    {
        id: 'brs-detective',
        name: 'BRS Detective',
        description: 'Score 500+ in BRS mission',
        icon: '🕵️',
        xp: 60,
        condition: () => Player.bestScores['brs'] >= 500
    },
    {
        id: 'depreciation-pro',
        name: 'Depreciation Pro',
        description: 'Score 500+ in Depreciation mission',
        icon: '📉',
        xp: 60,
        condition: () => Player.bestScores['depreciation'] >= 500
    },
    {
        id: 'error-fixer',
        name: 'Error Fixer',
        description: 'Score 500+ in Rectification mission',
        icon: '🛠️',
        xp: 60,
        condition: () => Player.bestScores['rectification'] >= 500
    },
    {
        id: 'level-5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: '⭐',
        xp: 75,
        condition: () => Player.level >= 5
    },
    {
        id: 'wizard',
        name: 'Accounts Wizard',
        description: 'Reach Level 7 - Maximum!',
        icon: '🧙‍♂️',
        xp: 150,
        condition: () => Player.level >= 7
    },
    {
        id: 'all-missions',
        name: 'All Rounder',
        description: 'Play all 4 missions at least once',
        icon: '🎮',
        xp: 80,
        condition: () => {
            return Player.bestScores['trial-balance'] > 0 &&
                   Player.bestScores['brs'] > 0 &&
                   Player.bestScores['depreciation'] > 0 &&
                   Player.bestScores['rectification'] > 0;
        }
    },
    {
        id: 'mistake-killer',
        name: 'Mistake Killer',
        description: 'Achieve 5x streak in Rectification game',
        icon: '🔧',
        xp: 50,
        condition: () => false // Checked during game
    }
];

// ============================================
// 🎮 CURRENT GAME STATE
// ============================================

const Game = {
    isActive: false,
    mission: null,
    missionName: '',
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    correct: 0,
    wrong: 0,
    timeRemaining: 300,
    timerInterval: null,
    currentQuestion: 0,
    totalQuestions: 0,
    startTime: null
};

// ============================================
// 💾 STORAGE FUNCTIONS
// ============================================

const Storage = {
    key: 'accounts_wizard_save',

    save: function() {
        try {
            const data = {
                player: Player,
                lastPlayed: Date.now()
            };
            localStorage.setItem(this.key, JSON.stringify(data));
            console.log('💾 Game saved!');
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },

    load: function() {
        try {
            const saved = localStorage.getItem(this.key);
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(Player, data.player);
                
                // Check streak
                this.checkStreak(data.lastPlayed);
                
                console.log('📂 Game loaded!');
                return true;
            }
        } catch (e) {
            console.warn('Load failed:', e);
        }
        return false;
    },

    checkStreak: function(lastPlayed) {
        if (!lastPlayed) return;
        
        const now = new Date();
        const last = new Date(lastPlayed);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day - increase streak
            Player.streak++;
            showToast('🔥 Streak!', `${Player.streak} days in a row!`, 'success');
        } else if (diffDays > 1) {
            // Streak broken
            if (Player.streak > 0) {
                showToast('💔 Streak Lost', 'Start a new streak today!', 'warning');
            }
            Player.streak = 1;
        }
        // Same day = no change
    },

    reset: function() {
        localStorage.removeItem(this.key);
        location.reload();
    }
};

// ============================================
// 🔊 SOUND MANAGER
// ============================================

const Sound = {
    enabled: true,
    context: null,

    init: function() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio not supported');
        }
    },

    play: function(type) {
        if (!this.enabled || !this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const sounds = {
                click: { freq: 800, duration: 0.1, type: 'sine' },
                correct: { freq: 880, duration: 0.15, type: 'sine' },
                wrong: { freq: 200, duration: 0.25, type: 'sawtooth' },
                levelup: { freq: 523, duration: 0.4, type: 'sine' },
                achievement: { freq: 659, duration: 0.3, type: 'sine' },
                complete: { freq: 784, duration: 0.5, type: 'sine' }
            };

            const sound = sounds[type] || sounds.click;
            oscillator.type = sound.type;
            oscillator.frequency.value = sound.freq;

            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);

            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + sound.duration);
        } catch (e) {
            // Silent fail
        }
    },

    toggle: function() {
        this.enabled = !this.enabled;
        Player.settings.sound = this.enabled;
        updateSoundIndicator();
        Storage.save();
    }
};

// ============================================
// 📊 XP & LEVEL SYSTEM
// ============================================

function addXP(amount) {
    const oldLevel = Player.level;
    Player.xp += amount;
    
    // Check for level up
    let newLevel = 1;
    for (let i = Ranks.length - 1; i >= 0; i--) {
        if (Player.xp >= Ranks[i].xpRequired) {
            newLevel = Ranks[i].level;
            Player.rank = Ranks[i].name;
            Player.rankEmoji = Ranks[i].emoji;
            break;
        }
    }
    
    Player.level = newLevel;
    
    // Show floating XP
    showFloatingXP(amount);
    
    // Return level up info
    return {
        leveledUp: newLevel > oldLevel,
        oldLevel: oldLevel,
        newLevel: newLevel
    };
}

function getXPForNextLevel() {
    for (let i = 0; i < Ranks.length; i++) {
        if (Ranks[i].level === Player.level + 1) {
            return Ranks[i].xpRequired;
        }
    }
    return Ranks[Ranks.length - 1].xpRequired; // Max level
}

function getXPProgress() {
    const currentRankXP = Ranks[Player.level - 1]?.xpRequired || 0;
    const nextRankXP = getXPForNextLevel();
    const progress = ((Player.xp - currentRankXP) / (nextRankXP - currentRankXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
}

function getAccuracy() {
    const total = Player.totalCorrect + Player.totalWrong;
    if (total === 0) return 0;
    return Math.round((Player.totalCorrect / total) * 100);
}

// ============================================
// 🏅 ACHIEVEMENT SYSTEM
// ============================================

function checkAchievements() {
    const newlyUnlocked = [];

    Achievements.forEach(achievement => {
        if (!Player.achievements.includes(achievement.id)) {
            if (achievement.condition()) {
                Player.achievements.push(achievement.id);
                addXP(achievement.xp);
                newlyUnlocked.push(achievement);
                
                showToast('🏆 Achievement!', `${achievement.icon} ${achievement.name}`, 'achievement');
                Sound.play('achievement');
            }
        }
    });

    if (newlyUnlocked.length > 0) {
        Storage.save();
        updateAchievementsUI();
    }

    return newlyUnlocked;
}

function unlockAchievement(id) {
    const achievement = Achievements.find(a => a.id === id);
    if (achievement && !Player.achievements.includes(id)) {
        Player.achievements.push(id);
        addXP(achievement.xp);
        showToast('🏆 Achievement!', `${achievement.icon} ${achievement.name}`, 'achievement');
        Sound.play('achievement');
        return achievement;
    }
    return null;
}

// ============================================
// 🖥️ UI UPDATE FUNCTIONS
// ============================================

function updateAllUI() {
    updatePlayerStatsUI();
    updateRanksUI();
    updateAchievementsUI();
    updateBestScoresUI();
    updateSoundIndicator();
}

function updatePlayerStatsUI() {
    // Navigation
    setText('navXp', `${Player.xp} XP`);
    setText('navLevel', Player.level);
    setText('navStreak', Player.streak);
    setText('profileLevelBadge', Player.level);

    // Mobile
    setText('mobileXp', `${Player.xp} XP`);
    setText('mobileLevel', Player.level);
    setText('mobileStreak', `${Player.streak} Days`);

    // Hero Section
    setText('heroLevel', Player.level);
    setText('heroRankTitle', `${Player.rankEmoji} ${Player.rank}`);
    setText('playerName', Player.name);
    setText('currentXp', Player.xp);
    setText('nextLevelXp', getXPForNextLevel());
    setText('gamesPlayed', Player.gamesPlayed);
    setText('currentStreak', Player.streak);
    setText('totalBadges', Player.achievements.length);
    setText('accuracyPercent', `${getAccuracy()}%`);

    // XP Progress Bar
    const progressBar = document.getElementById('xpProgressFill');
    if (progressBar) {
        progressBar.style.width = `${getXPProgress()}%`;
    }

    // Next rank name
    const nextRank = Ranks.find(r => r.level === Player.level + 1);
    if (nextRank) {
        setText('nextRankName', `${nextRank.name} ${nextRank.emoji}`);
    } else {
        setText('nextRankName', 'MAX LEVEL! 🧙‍♂️');
    }
}

function updateRanksUI() {
    Ranks.forEach((rank, index) => {
        const card = document.getElementById(`rank-${rank.level}`);
        if (!card) return;

        card.classList.remove('locked', 'active');

        if (rank.level < Player.level) {
            // Completed rank
            card.classList.remove('locked');
        } else if (rank.level === Player.level) {
            // Current rank
            card.classList.add('active');
        } else {
            // Locked rank
            card.classList.add('locked');
        }
    });
}

function updateAchievementsUI() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    Achievements.forEach(achievement => {
        const isUnlocked = Player.achievements.includes(achievement.id);
        
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h4 class="achievement-name">${achievement.name}</h4>
            <p class="achievement-description">${achievement.description}</p>
            <div class="achievement-reward">
                <span>⚡ +${achievement.xp} XP</span>
            </div>
            ${isUnlocked ? '<div class="achievement-unlocked-badge">✅ Unlocked</div>' : '<div class="achievement-locked-badge">🔒</div>'}
        `;
        grid.appendChild(card);
    });

    // Update stats
    const unlocked = Player.achievements.length;
    const locked = Achievements.length - unlocked;
    const xpFromAchievements = Achievements
        .filter(a => Player.achievements.includes(a.id))
        .reduce((sum, a) => sum + a.xp, 0);

    setText('unlockedAchievements', unlocked);
    setText('lockedAchievements', locked);
    setText('achievementXpTotal', xpFromAchievements);
}

function updateBestScoresUI() {
    setText('tb-best-score', Player.bestScores['trial-balance'] || '--');
    setText('brs-best-score', Player.bestScores['brs'] || '--');
    setText('dep-best-score', Player.bestScores['depreciation'] || '--');
    setText('rect-best-score', Player.bestScores['rectification'] || '--');
}

function updateSoundIndicator() {
    const icon = document.getElementById('soundIcon');
    const text = document.getElementById('soundText');
    if (icon) icon.textContent = Sound.enabled ? '🔊' : '🔇';
    if (text) text.textContent = Sound.enabled ? 'Sound On' : 'Sound Off';
}

// ============================================
// 🔔 TOAST NOTIFICATIONS
// ============================================

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        xp: '⚡',
        achievement: '🏆'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    Sound.play('click');

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================
// ⚡ FLOATING XP INDICATOR
// ============================================

function showFloatingXP(amount) {
    const container = document.getElementById('floatingXpContainer');
    if (!container) return;

    const floater = document.createElement('div');
    floater.className = 'floating-xp';
    floater.textContent = `+${amount} XP`;
    floater.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--font-gaming);
        font-size: 2rem;
        font-weight: 700;
        color: var(--neon-green);
        text-shadow: 0 0 20px var(--neon-green);
        pointer-events: none;
        z-index: 9999;
        animation: floatUp 1.5s ease-out forwards;
    `;

    container.appendChild(floater);
    setTimeout(() => floater.remove(), 1500);
}

// Add CSS animation for floating XP
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.5);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// 🎮 GAME FLOW FUNCTIONS
// ============================================

function startMission(missionId) {
    console.log(`🎮 Starting mission: ${missionId}`);
    
    const missionNames = {
        'trial-balance': 'Trial Balance',
        'brs': 'Bank Reconciliation',
        'depreciation': 'Depreciation',
        'rectification': 'Rectification'
    };

    const missionLabels = {
        'trial-balance': 'MISSION 01',
        'brs': 'MISSION 02',
        'depreciation': 'MISSION 03',
        'rectification': 'MISSION 04'
    };

    // Reset game state
    Game.isActive = true;
    Game.mission = missionId;
    Game.missionName = missionNames[missionId] || 'Mission';
    Game.score = 0;
    Game.combo = 0;
    Game.maxCombo = 0;
    Game.health = 100;
    Game.correct = 0;
    Game.wrong = 0;
    Game.timeRemaining = 300;
    Game.currentQuestion = 0;
    Game.startTime = Date.now();

    // Update header
    setText('gameMissionLabel', missionLabels[missionId] || 'MISSION');
    setText('gameTitle', missionNames[missionId] || 'Mission');
    setText('gameTimer', formatTime(Game.timeRemaining));
    setText('gameScore', '0');
    setText('gameCombo', '0x');
    updateHealthBar(100);

    // Hide main, show game arena
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('gameArena').classList.add('active');
    document.getElementById('gameArena').style.display = 'block';

    // Start timer
    startTimer();

    // Load mission content
    loadMissionContent(missionId);

    Sound.play('click');
}

function startTimer() {
    if (Game.timerInterval) clearInterval(Game.timerInterval);

    Game.timerInterval = setInterval(() => {
        Game.timeRemaining--;
        setText('gameTimer', formatTime(Game.timeRemaining));

        // Warning at 30 seconds
        const timerEl = document.getElementById('gameTimer');
        if (Game.timeRemaining <= 30) {
            timerEl.style.color = 'var(--neon-red)';
            if (Game.timeRemaining <= 10) {
                Sound.play('click');
            }
        } else if (Game.timeRemaining <= 60) {
            timerEl.style.color = 'var(--neon-yellow)';
        }

        // Time's up
        if (Game.timeRemaining <= 0) {
            endGame(false);
        }
    }, 1000);
}

function stopTimer() {
    if (Game.timerInterval) {
        clearInterval(Game.timerInterval);
        Game.timerInterval = null;
    }
}

function updateHealthBar(health) {
    Game.health = Math.max(0, Math.min(100, health));
    
    const bar = document.getElementById('healthBar');
    const text = document.getElementById('healthText');
    
    if (bar) {
        bar.style.width = `${Game.health}%`;
        
        bar.classList.remove('full', 'medium', 'low', 'critical');
        if (Game.health > 60) bar.classList.add('full');
        else if (Game.health > 30) bar.classList.add('medium');
        else if (Game.health > 10) bar.classList.add('low');
        else bar.classList.add('critical');
    }
    
    if (text) text.textContent = `${Game.health}%`;

    // Check game over
    if (Game.health <= 0) {
        endGame(false);
    }
}

function addScore(points) {
    // Apply combo multiplier
    const multiplier = 1 + (Game.combo * 0.1);
    const finalPoints = Math.floor(points * multiplier);
    
    Game.score += finalPoints;
    setText('gameScore', Game.score);
    
    return finalPoints;
}

function handleCorrect(baseXP = 10) {
    Game.correct++;
    Game.combo++;
    Game.maxCombo = Math.max(Game.maxCombo, Game.combo);
    
    const points = addScore(baseXP * 10);
    setText('gameCombo', `${Game.combo}x`);
    
    // Combo effects
    const comboContainer = document.getElementById('comboContainer');
    if (Game.combo >= 3 && comboContainer) {
        comboContainer.classList.add('active');
    }

    Sound.play('correct');
    
    return points;
}

function handleWrong() {
    Game.wrong++;
    Game.combo = 0;
    setText('gameCombo', '0x');
    
    const comboContainer = document.getElementById('comboContainer');
    if (comboContainer) {
        comboContainer.classList.remove('active');
    }

    // Lose health
    updateHealthBar(Game.health - 20);
    Sound.play('wrong');

    // Screen shake effect
    const gameContent = document.getElementById('gameContent');
    if (gameContent) {
        gameContent.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            gameContent.style.animation = '';
        }, 300);
    }
}

function endGame(completed) {
    stopTimer();
    Game.isActive = false;

    // Calculate results
    const totalQuestions = Game.correct + Game.wrong;
    const accuracy = totalQuestions > 0 ? Math.round((Game.correct / totalQuestions) * 100) : 0;
    const timeTaken = Math.floor((Date.now() - Game.startTime) / 1000);

    // Calculate XP
    let xpEarned = Math.floor(Game.score / 10);
    
    // Bonuses
    if (accuracy === 100 && Game.correct >= 5) {
        xpEarned += 50; // Perfect bonus
    }
    if (Game.maxCombo >= 5) {
        xpEarned += 25; // Combo bonus
    }
    if (completed && timeTaken < 120) {
        xpEarned += 30; // Speed bonus
    }

    // Update player stats
    Player.gamesPlayed++;
    Player.totalCorrect += Game.correct;
    Player.totalWrong += Game.wrong;

    // Update best score
    if (Game.score > Player.bestScores[Game.mission]) {
        Player.bestScores[Game.mission] = Game.score;
    }

    // Add XP and check level up
    const levelResult = addXP(xpEarned);

    // Check achievements
    const newAchievements = checkAchievements();

    // Check for perfect round achievement
    if (accuracy === 100 && Game.correct >= 5) {
        unlockAchievement('perfect-round');
    }

    // Show results
    showResults(completed, accuracy, xpEarned, levelResult, newAchievements);

    // Save progress
    Storage.save();
    updateAllUI();
}

// Add this CSS for scrollable results
const resultsStyle = document.createElement('style');
resultsStyle.textContent = `
    /* Results Screen Scroll Fix */
    #gameResults {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto !important;
        z-index: 10000;
        background: linear-gradient(135deg, 
            rgba(10, 10, 35, 0.98) 0%, 
            rgba(20, 20, 50, 0.98) 100%);
        backdrop-filter: blur(10px);
    }
    
    .results-container {
        min-height: 100vh;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .results-content {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
        background: var(--bg-card);
        border-radius: 20px;
        border: 2px solid rgba(168, 85, 247, 0.3);
        box-shadow: 0 0 50px rgba(168, 85, 247, 0.2);
    }
    
    .result-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .result-action-btn {
        min-width: 180px;
        padding: 15px 30px;
        font-size: 1rem;
        font-family: var(--font-gaming);
    }
    
    .exit-btn {
        background: linear-gradient(135deg, var(--neon-red), #ff3366);
        border: none;
    }
    
    .exit-btn:hover {
        background: linear-gradient(135deg, #ff3366, var(--neon-red));
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(255, 51, 102, 0.3);
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .results-content {
            padding: 20px;
            margin: 20px;
        }
        
        .result-actions {
            flex-direction: column;
            align-items: center;
        }
        
        .result-action-btn {
            width: 100%;
            max-width: 250px;
        }
    }
    
    @media (max-height: 700px) {
        .results-container {
            padding: 10px;
        }
        
        .results-content {
            margin: 10px auto;
        }
    }
    
    /* Close Button */
    .results-close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: rgba(255, 51, 102, 0.2);
        border: 2px solid var(--neon-red);
        border-radius: 50%;
        color: var(--neon-red);
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10001;
    }
    
    .results-close-btn:hover {
        background: var(--neon-red);
        color: white;
        transform: rotate(90deg);
    }
`;
document.head.appendChild(resultsStyle);

// ============================================
// 🏆 UPDATE SHOW RESULTS FUNCTION
// ============================================

function showResults(completed, accuracy, xpEarned, levelResult, newAchievements) {
    // Hide game arena
    document.getElementById('gameArena').style.display = 'none';
    document.getElementById('gameArena').classList.remove('active');

    // Set result content
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');

    if (completed) {
        if (accuracy === 100) {
            resultIcon.textContent = '👑';
            resultTitle.textContent = 'PERFECT!';
            resultTitle.className = 'result-title perfect';
            resultSubtitle.textContent = 'Legendary performance, Wizard!';
        } else if (accuracy >= 80) {
            resultIcon.textContent = '🏆';
            resultTitle.textContent = 'Mission Complete!';
            resultTitle.className = 'result-title victory';
            resultSubtitle.textContent = 'Excellent work, Warrior!';
        } else {
            resultIcon.textContent = '✅';
            resultTitle.textContent = 'Mission Complete';
            resultTitle.className = 'result-title victory';
            resultSubtitle.textContent = 'Good job! Keep practicing!';
        }
        Sound.play('complete');
    } else {
        resultIcon.textContent = '💀';
        resultTitle.textContent = 'Mission Failed';
        resultTitle.className = 'result-title defeat';
        resultSubtitle.textContent = Game.health <= 0 ? 'Health depleted!' : 'Time\'s up!';
        Sound.play('wrong');
    }

    // Stats
    setText('resultCorrect', Game.correct);
    setText('resultWrong', Game.wrong);
    setText('resultAccuracy', `${accuracy}%`);
    setText('resultXp', `+${xpEarned} XP`);

    // Level up notice
    const levelUpNotice = document.getElementById('levelUpNotice');
    if (levelResult.leveledUp) {
        levelUpNotice.style.display = 'block';
        setText('newLevelNum', levelResult.newLevel);
        Sound.play('levelup');
        
        // Add celebratory animation
        levelUpNotice.style.animation = 'pulse 2s infinite';
    } else {
        levelUpNotice.style.display = 'none';
    }

    // New rank notice
    const newRankNotice = document.getElementById('newRankNotice');
    if (levelResult.leveledUp && levelResult.newLevel > levelResult.oldLevel) {
        const newRank = Ranks.find(r => r.level === levelResult.newLevel);
        if (newRank) {
            newRankNotice.style.display = 'block';
            setText('newRankIcon', newRank.emoji);
            setText('newRankTitle', newRank.name);
        }
    } else {
        newRankNotice.style.display = 'none';
    }

    // Achievement notice
    const achievementNotice = document.getElementById('achievementNotice');
    const achievementsList = document.getElementById('unlockedAchievementsList');
    if (newAchievements.length > 0) {
        achievementNotice.style.display = 'block';
        achievementsList.innerHTML = newAchievements.map(a => 
            `<div class="result-achievement">${a.icon} ${a.name}</div>`
        ).join('');
    } else {
        achievementNotice.style.display = 'none';
    }

    // Add close button to results
    const gameResults = document.getElementById('gameResults');
    gameResults.classList.add('active');
    gameResults.style.display = 'flex';
    
    // Update results container structure
    gameResults.innerHTML = `
        <div class="results-container">
            <button class="results-close-btn" onclick="exitToHome()">✕</button>
            <div class="results-content">
                <div class="result-header">
                    <div class="result-icon">${resultIcon.textContent}</div>
                    <h1 class="${resultTitle.className}">${resultTitle.textContent}</h1>
                    <p class="result-subtitle">${resultSubtitle.textContent}</p>
                </div>
                
                <div class="result-stats">
                    <div class="stat-row">
                        <span>Correct Answers:</span>
                        <strong>${Game.correct}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Wrong Answers:</span>
                        <strong>${Game.wrong}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span>
                        <strong>${accuracy}%</strong>
                    </div>
                    <div class="stat-row">
                        <span>XP Earned:</span>
                        <strong class="xp-earned">+${xpEarned} XP</strong>
                    </div>
                </div>
                
                <!-- Level Up Notice -->
                ${levelResult.leveledUp ? `
                <div class="level-up-notice" id="levelUpNotice" style="display: block;">
                    <div class="level-up-icon">🎉</div>
                    <div class="level-up-text">
                        <h3>LEVEL UP!</h3>
                        <p>You reached <span class="new-level">${levelResult.newLevel}</span></p>
                    </div>
                </div>
                ` : ''}
                
                <!-- New Rank Notice -->
                ${levelResult.leveledUp && levelResult.newLevel > levelResult.oldLevel ? `
                <div class="new-rank-notice" id="newRankNotice" style="display: block;">
                    <div class="new-rank-icon">${Ranks.find(r => r.level === levelResult.newLevel)?.emoji || '🏆'}</div>
                    <div class="new-rank-text">
                        <h3>NEW RANK!</h3>
                        <p>${Ranks.find(r => r.level === levelResult.newLevel)?.name || 'New Rank'}</p>
                    </div>
                </div>
                ` : ''}
                
                <!-- Achievement Notice -->
                ${newAchievements.length > 0 ? `
                <div class="achievement-notice" id="achievementNotice" style="display: block;">
                    <div class="achievement-notice-icon">🏆</div>
                    <div class="achievement-notice-content">
                        <h3>Achievements Unlocked!</h3>
                        <div class="achievements-list" id="unlockedAchievementsList">
                            ${newAchievements.map(a => 
                                `<div class="result-achievement">${a.icon} ${a.name}</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="result-actions">
                    <button class="btn btn-primary result-action-btn" onclick="playAgain()">
                        🔄 Play Again
                    </button>
                    <button class="btn btn-secondary result-action-btn" onclick="exitToHome()">
                        🏠 Main Menu
                    </button>
                </div>
                
                <div class="result-tip">
                    <span>💡 Tip:</span> Complete missions daily to maintain your streak!
                </div>
            </div>
        </div>
    `;
    
    // Add CSS for new elements
    const dynamicStyle = document.createElement('style');
    dynamicStyle.textContent = `
        .result-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .result-icon {
            font-size: 4rem;
            margin-bottom: 15px;
        }
        
        .result-title {
            font-family: var(--font-gaming);
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .result-title.perfect {
            color: var(--neon-yellow);
            text-shadow: 0 0 20px var(--neon-yellow);
        }
        
        .result-title.victory {
            color: var(--neon-green);
            text-shadow: 0 0 20px var(--neon-green);
        }
        
        .result-title.defeat {
            color: var(--neon-red);
            text-shadow: 0 0 20px var(--neon-red);
        }
        
        .result-subtitle {
            color: var(--text-secondary);
            font-size: 1.2rem;
        }
        
        .result-stats {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .stat-row:last-child {
            border-bottom: none;
        }
        
        .stat-row span {
            color: var(--text-secondary);
        }
        
        .stat-row strong {
            font-family: var(--font-gaming);
            font-size: 1.2rem;
        }
        
        .xp-earned {
            color: var(--neon-green);
        }
        
        .level-up-notice, .new-rank-notice, .achievement-notice {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(255, 107, 53, 0.2));
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            animation: pulse 2s infinite;
        }
        
        .level-up-icon, .new-rank-icon, .achievement-notice-icon {
            font-size: 3rem;
        }
        
        .level-up-text h3, .new-rank-text h3, .achievement-notice-content h3 {
            color: var(--neon-purple);
            margin-bottom: 5px;
            font-family: var(--font-gaming);
        }
        
        .new-level {
            font-family: var(--font-gaming);
            color: var(--neon-yellow);
            font-size: 1.5rem;
        }
        
        .achievement-notice-content {
            flex: 1;
        }
        
        .achievements-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
        }
        
        .result-achievement {
            background: rgba(0,0,0,0.3);
            padding: 8px 15px;
            border-radius: 10px;
            font-size: 0.9rem;
        }
        
        .result-tip {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        /* Scrollbar styling */
        #gameResults::-webkit-scrollbar {
            width: 8px;
        }
        
        #gameResults::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        
        #gameResults::-webkit-scrollbar-thumb {
            background: var(--neon-purple);
            border-radius: 4px;
        }
        
        #gameResults::-webkit-scrollbar-thumb:hover {
            background: var(--neon-blue);
        }
        
        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
            .results-close-btn {
                width: 60px;
                height: 60px;
                font-size: 2rem;
                top: 15px;
                right: 15px;
            }
            
            .result-action-btn {
                padding: 20px;
                font-size: 1.1rem;
            }
        }
    `;
    document.head.appendChild(dynamicStyle);
    
    // Ensure scrolling works
    setTimeout(() => {
        gameResults.scrollTop = 0;
    }, 100);
}

// ============================================
// 🎮 PLAY AGAIN FUNCTION
// ============================================

function playAgain() {
    Sound.play('click');
    
    // Hide results screen
    document.getElementById('gameResults').style.display = 'none';
    document.getElementById('gameResults').classList.remove('active');
    
    // Restart the same mission
    startMission(Game.mission);
}

// ============================================
// 🏠 EXIT TO HOME (UPDATED)
// ============================================

function exitToHome() {
    Sound.play('click');
    
    // Hide all game screens
    document.getElementById('gameArena').style.display = 'none';
    document.getElementById('gameArena').classList.remove('active');
    document.getElementById('gameResults').style.display = 'none';
    document.getElementById('gameResults').classList.remove('active');
    
    // Stop any active timers
    stopTimer();
    
    // Reset game state
    Game.isActive = false;
    
    // Show main content with smooth transition
    const mainContent = document.getElementById('mainContent');
    mainContent.style.display = 'block';
    mainContent.style.opacity = '0';
    mainContent.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        mainContent.style.opacity = '1';
    }, 50);
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Update UI
    updateAllUI();
    
    // Show welcome back message
    showToast('🏠 Welcome Back!', 'Ready for another mission?', 'info');
}

// ============================================
// 📱 UPDATE EVENT LISTENERS
// ============================================

// Add this to your existing DOMContentLoaded event listener
// Replace the existing exitToHome calls with these updates:

// In the Game Buttons section, update the exit game button:
document.getElementById('exitGameBtn').addEventListener('click', function() {
    if (Game.isActive) {
        showConfirm(
            '⚠️',
            'Exit Mission?',
            'Your progress will be lost!',
            function() {
                stopTimer();
                Game.isActive = false;
                exitToHome();
            }
        );
    } else {
        exitToHome();
    }
});

// Update the go home button (already exists):
document.getElementById('goHomeBtn').addEventListener('click', exitToHome);

// Add escape key support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // If results screen is visible, exit to home
        if (document.getElementById('gameResults').classList.contains('active')) {
            exitToHome();
        }
        // If game arena is active, show confirm dialog
        else if (Game.isActive) {
            showConfirm(
                '⚠️',
                'Exit Mission?',
                'Your progress will be lost!',
                function() {
                    stopTimer();
                    Game.isActive = false;
                    exitToHome();
                }
            );
        }
    }
});

// ============================================
// 📱 TOUCH GESTURE SUPPORT FOR EXIT
// ============================================

// Add swipe down to exit on mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    if (document.getElementById('gameResults').classList.contains('active')) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (document.getElementById('gameResults').classList.contains('active')) {
        touchEndY = e.changedTouches[0].screenY;
        
        // Swipe down to exit (minimum 100px swipe)
        if (touchEndY - touchStartY > 100) {
            exitToHome();
        }
    }
}, { passive: true });

// ============================================
// 🎨 ADD SCROLL INDICATOR FOR LONG RESULTS
// ============================================

const scrollIndicatorStyle = document.createElement('style');
scrollIndicatorStyle.textContent = `
    .scroll-indicator {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--text-muted);
        font-size: 0.8rem;
        text-align: center;
        animation: bounce 2s infinite;
        pointer-events: none;
        z-index: 10002;
        background: rgba(0,0,0,0.5);
        padding: 8px 15px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
    }
    
    .scroll-indicator span {
        display: block;
        margin-bottom: 5px;
        font-size: 1.2rem;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
        40% { transform: translateX(-50%) translateY(-10px); }
        60% { transform: translateX(-50%) translateY(-5px); }
    }
    
    @media (max-height: 700px) {
        .scroll-indicator {
            display: none;
        }
    }
`;
document.head.appendChild(scrollIndicatorStyle);

// Add scroll indicator to results screen
function addScrollIndicator() {
    const gameResults = document.getElementById('gameResults');
    if (!gameResults.querySelector('.scroll-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = `
            <span>👇</span>
            Scroll for more
        `;
        gameResults.appendChild(indicator);
        
        // Remove indicator when user scrolls
        gameResults.addEventListener('scroll', function() {
            if (gameResults.scrollTop > 50) {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }
        }, { once: true });
    }
}

// ============================================
// 🎯 MISSION CONTENT LOADER (Placeholder)
// ============================================

function loadMissionContent(missionId) {
    const content = document.getElementById('gameContent');
    if (!content) return;

    // This will be replaced by specific mission loaders in next parts
    switch(missionId) {
        case 'trial-balance':
            loadTrialBalanceGame();
            break;
        case 'brs':
            loadBRSGame();
            break;
        case 'depreciation':
            loadDepreciationGame();
            break;
        case 'rectification':
            loadRectificationGame();
            break;
        default:
            content.innerHTML = '<p>Mission not found!</p>';
    }
}

// Placeholder functions - will be defined in next parts
function loadTrialBalanceGame() {
    document.getElementById('gameContent').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2>🎯 Trial Balance Game</h2>
            <p style="color: var(--text-secondary);">Loading in Part 3...</p>
        </div>
    `;
}

function loadBRSGame() {
    document.getElementById('gameContent').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2>🕵️ BRS Game</h2>
            <p style="color: var(--text-secondary);">Loading in Part 4...</p>
        </div>
    `;
}

function loadDepreciationGame() {
    document.getElementById('gameContent').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2>📉 Depreciation Game</h2>
            <p style="color: var(--text-secondary);">Loading in Part 5...</p>
        </div>
    `;
}

function loadRectificationGame() {
    document.getElementById('gameContent').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2>🛠️ Rectification Game</h2>
            <p style="color: var(--text-secondary);">Loading in Part 6...</p>
        </div>
    `;
}

// ============================================
// 📱 EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧙‍♂️ Accounts Wizard Loading...');

    // Initialize sound
    Sound.init();

    // Load saved data
    Storage.load();

    // Update all UI
    updateAllUI();

    // Create particles
    createParticles();

    // ========== NAVBAR ==========
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            Sound.play('click');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Nav links active state
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
                l.classList.remove('active');
            });
            // Find matching links
            const href = this.getAttribute('href');
            document.querySelectorAll(`[href="${href}"]`).forEach(l => {
                l.classList.add('active');
            });
            Sound.play('click');
        });
    });

    // ========== GAME BUTTONS ==========
    
    // Exit game button
    document.getElementById('exitGameBtn').addEventListener('click', function() {
        if (Game.isActive) {
            showConfirm(
                '⚠️',
                'Exit Mission?',
                'Your progress will be lost!',
                function() {
                    stopTimer();
                    Game.isActive = false;
                    exitToHome();
                }
            );
        } else {
            exitToHome();
        }
    });

    // Go home button (results screen)
    document.getElementById('goHomeBtn').addEventListener('click', exitToHome);

    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', function() {
        document.getElementById('gameResults').style.display = 'none';
        document.getElementById('gameResults').classList.remove('active');
        startMission(Game.mission);
    });

    // ========== SETTINGS ==========
    
    // Open settings
    document.getElementById('profileBtn').addEventListener('click', function() {
        document.getElementById('settingsName').value = Player.name;
        document.getElementById('soundToggle').checked = Sound.enabled;
        document.getElementById('settingsModal').classList.add('active');
        Sound.play('click');
    });

    // Close settings
    document.getElementById('closeSettings').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.remove('active');
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', function() {
        Player.name = document.getElementById('settingsName').value || 'New Warrior';
        Sound.enabled = document.getElementById('soundToggle').checked;
        Player.settings.name = Player.name;
        Player.settings.sound = Sound.enabled;
        
        Storage.save();
        updateAllUI();
        
        document.getElementById('settingsModal').classList.remove('active');
        showToast('✅ Saved!', 'Settings updated!', 'success');
    });

    // Reset button
    document.getElementById('resetAllBtn').addEventListener('click', function() {
        showConfirm(
            '🗑️',
            'Reset Everything?',
            'All progress, XP, achievements will be deleted. Cannot undo!',
            function() {
                Storage.reset();
            }
        );
    });

    // ========== SOUND INDICATOR ==========
    document.getElementById('soundIndicator').addEventListener('click', function() {
        Sound.toggle();
        showToast(Sound.enabled ? '🔊 Sound On' : '🔇 Sound Off', '', 'info');
    });

    // ========== MODALS ==========
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Confirm modal buttons
    document.getElementById('confirmCancel').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
    });

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ========== DONE ==========
    console.log('🎮 Accounts Wizard Ready!');
    console.log('⚡ Player:', Player.name, '| Level:', Player.level, '| XP:', Player.xp);
});

// ============================================
// 🔔 CONFIRM MODAL HELPER
// ============================================

function showConfirm(icon, title, message, onConfirm) {
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmOk = document.getElementById('confirmOk');
    
    // Remove old listener
    const newConfirmOk = confirmOk.cloneNode(true);
    confirmOk.parentNode.replaceChild(newConfirmOk, confirmOk);
    
    newConfirmOk.addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
        if (onConfirm) onConfirm();
    });

    document.getElementById('confirmModal').classList.add('active');
}

// ============================================
// ✨ PARTICLE SYSTEM
// ============================================

function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;

    const colors = ['green', 'blue', 'purple', 'orange', 'gold'];
    const count = window.innerWidth < 768 ? 20 : 40;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${colors[i % colors.length]}`;
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${10 + Math.random() * 10}s;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
        `;
        container.appendChild(particle);
    }
}

// ============================================
// 🌐 EXPOSE FOR DEBUGGING
// ============================================

window.AccountsWizard = {
    Player,
    Game,
    Ranks,
    Achievements,
    Storage,
    Sound,
    addXP,
    checkAchievements,
    updateAllUI
};

console.log('%c🧙‍♂️ ACCOUNTS WIZARD', 'font-size: 20px; font-weight: bold; color: #a855f7;');
console.log('%c"Tum sirf student nahi… ek Accounting Warrior ho!"', 'color: #00ff88;');

/* ================================================================
   🎯 ACCOUNTS WIZARD - TRIAL BALANCE GAME
   Part 3: Drag & Drop Debit/Credit Sorting Game
   "Balance karo warna Boom!" 💥
================================================================ */

// ============================================
// 📚 TRIAL BALANCE QUESTION BANK (EXPANDED)
// ============================================

const TrialBalanceEntries = [
    // DEBIT ITEMS (Assets & Expenses) - 25 items
    {
        id: 1,
        text: 'Machinery purchased',
        amount: 50000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Machinery ek Fixed Asset hai. Assets ka balance Debit hota hai kyunki ye business ke resources hain.'
    },
    {
        id: 2,
        text: 'Cash in hand',
        amount: 25000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Cash ek Current Asset hai. Jab cash hota hai, wo Debit side mein dikhta hai.'
    },
    {
        id: 3,
        text: 'Furniture & Fixtures',
        amount: 35000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Furniture bhi Fixed Asset hai. Saare assets Debit side mein aate hain.'
    },
    {
        id: 4,
        text: 'Stock/Inventory',
        amount: 45000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Stock business ka Current Asset hai. Ye Debit balance rakhta hai.'
    },
    {
        id: 5,
        text: 'Bank Balance',
        amount: 80000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Bank mein rakha paisa Asset hai. Debit side mein show hoga.'
    },
    {
        id: 6,
        text: 'Debtors (Rahul)',
        amount: 15000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Debtors wo log hain jinse paisa lena hai. Ye Asset hai, toh Debit mein aayega.'
    },
    {
        id: 7,
        text: 'Prepaid Insurance',
        amount: 8000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Prepaid expenses future ka benefit hai - Current Asset. Debit side!'
    },
    {
        id: 8,
        text: 'Land & Building',
        amount: 200000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Land & Building sabse bada Fixed Asset hai. Obviously Debit!'
    },
    {
        id: 9,
        text: 'Rent Expense',
        amount: 12000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Rent ek Expense hai. Expenses hamesha Debit hote hain kyunki ye losses hain.'
    },
    {
        id: 10,
        text: 'Salary Expense',
        amount: 30000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Salary bhi Expense hai. Jab paisa jaata hai expense ke liye, Debit karo!'
    },
    {
        id: 11,
        text: 'Electricity Bill',
        amount: 5000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Electricity Bill ek Expense hai. Saare expenses Debit side mein!'
    },
    {
        id: 12,
        text: 'Wages Paid',
        amount: 18000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Wages bhi Expense category mein aata hai. Debit!'
    },
    {
        id: 13,
        text: 'Purchases',
        amount: 75000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Goods ki purchase Trading Expense hai. Debit side mein jaati hai.'
    },
    {
        id: 14,
        text: 'Carriage Inward',
        amount: 3000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Goods lane ka kharcha (Carriage Inward) Direct Expense hai. Debit!'
    },
    {
        id: 15,
        text: 'Advertisement Expense',
        amount: 10000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Advertising ka kharcha Indirect Expense hai. Debit mein jaayega.'
    },
    {
        id: 31,
        text: 'Office Equipment',
        amount: 45000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Office equipment like computers, printers are Fixed Assets. Always Debit!'
    },
    {
        id: 32,
        text: 'Vehicles (Delivery Van)',
        amount: 300000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Vehicles used for business are Fixed Assets. Debit side!'
    },
    {
        id: 33,
        text: 'Trade Expenses',
        amount: 7500,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Trade expenses like packaging, transportation are Direct Expenses. Debit!'
    },
    {
        id: 34,
        text: 'Depreciation on Machinery',
        amount: 8000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Depreciation is an expense that reduces asset value. Always Debit!'
    },
    {
        id: 35,
        text: 'Commission Paid',
        amount: 6000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Commission paid to agents is an expense. Expenses = Debit!'
    },
    {
        id: 36,
        text: 'Goodwill',
        amount: 100000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Goodwill is an intangible asset. Assets have debit balance.'
    },
    {
        id: 37,
        text: 'Patents & Trademarks',
        amount: 50000,
        correctSide: 'debit',
        type: 'Asset',
        explanation: 'Intellectual property assets have debit balance.'
    },
    {
        id: 38,
        text: 'Drawings',
        amount: 25000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Owner\'s drawings reduce capital, so it\'s debit.'
    },
    {
        id: 39,
        text: 'Bad Debts',
        amount: 5000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Bad debts are losses, so debit balance.'
    },
    {
        id: 40,
        text: 'Interest on Loan',
        amount: 15000,
        correctSide: 'debit',
        type: 'Expense',
        explanation: 'Interest paid is an expense, debit side.'
    },

    // CREDIT ITEMS (Liabilities, Capital & Income) - 25 items
    {
        id: 16,
        text: 'Capital (Owner)',
        amount: 150000,
        correctSide: 'credit',
        type: 'Capital',
        explanation: 'Capital owner ka investment hai - ye Liability hai business ki. Credit side!'
    },
    {
        id: 17,
        text: 'Bank Loan',
        amount: 100000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Loan ek Liability hai - paisa wapas karna hai. Credit balance!'
    },
    {
        id: 18,
        text: 'Creditors (Supplier)',
        amount: 25000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Creditors wo hain jinhe paisa dena hai. Liability = Credit side.'
    },
    {
        id: 19,
        text: 'Outstanding Salary',
        amount: 8000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Outstanding expenses bhi Liability hai - abhi pay nahi kiya. Credit!'
    },
    {
        id: 20,
        text: 'Sales Revenue',
        amount: 120000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Sales se Income aati hai. Income hamesha Credit side mein!'
    },
    {
        id: 21,
        text: 'Commission Received',
        amount: 5000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Commission Received ek Income hai. Income = Credit!'
    },
    {
        id: 22,
        text: 'Interest Received',
        amount: 3000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Interest mila hai toh Income hai. Credit mein likho!'
    },
    {
        id: 23,
        text: 'Rent Received',
        amount: 6000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Rent receive kiya hai toh Income hai. Credit side!'
    },
    {
        id: 24,
        text: 'Discount Received',
        amount: 2000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Discount receive karna Income hai (paise bache). Credit!'
    },
    {
        id: 25,
        text: 'Bills Payable',
        amount: 20000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Bills Payable matlab paisa dena hai - Liability hai. Credit!'
    },
    {
        id: 26,
        text: 'Reserves & Surplus',
        amount: 40000,
        correctSide: 'credit',
        type: 'Capital',
        explanation: 'Reserves are accumulated profits - part of owners equity. Credit!'
    },
    {
        id: 27,
        text: 'Provision for Doubtful Debts',
        amount: 3000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Provision is a liability - expected loss from bad debts. Credit side.'
    },
    {
        id: 28,
        text: 'Unearned Revenue',
        amount: 15000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Money received in advance for future services. Liability = Credit!'
    },
    {
        id: 29,
        text: 'Interest on Loan Payable',
        amount: 5000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Interest payable on loans is a liability. Credit side!'
    },
    {
        id: 30,
        text: 'Gains from Asset Sale',
        amount: 12000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Profit from selling assets is income. All incomes = Credit!'
    },
    {
        id: 41,
        text: 'Mortgage Payable',
        amount: 250000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Mortgage is a long-term loan for property. Liabilities = Credit!'
    },
    {
        id: 42,
        text: 'Accrued Interest Income',
        amount: 4500,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Interest earned but not yet received is still income. Credit!'
    },
    {
        id: 43,
        text: 'Deferred Tax Liability',
        amount: 18000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Taxes payable in future are liabilities. Credit side!'
    },
    {
        id: 44,
        text: 'Donations Received',
        amount: 25000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Donations received are non-operating income. Income = Credit!'
    },
    {
        id: 45,
        text: 'Retained Earnings',
        amount: 75000,
        correctSide: 'credit',
        type: 'Capital',
        explanation: 'Accumulated profits not distributed. Part of equity = Credit!'
    },
    {
        id: 46,
        text: 'Bank Overdraft',
        amount: 30000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Bank overdraft is a liability, credit balance.'
    },
    {
        id: 47,
        text: 'Trade Discount',
        amount: 5000,
        correctSide: 'credit',
        type: 'Income',
        explanation: 'Trade discount received is income.'
    },
    {
        id: 48,
        text: 'Provision for Tax',
        amount: 15000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Tax provision is a liability, credit balance.'
    },
    {
        id: 49,
        text: 'Capital Reserve',
        amount: 35000,
        correctSide: 'credit',
        type: 'Capital',
        explanation: 'Capital reserve is part of equity, credit balance.'
    },
    {
        id: 50,
        text: 'Sundry Creditors',
        amount: 28000,
        correctSide: 'credit',
        type: 'Liability',
        explanation: 'Sundry creditors are liabilities, credit side.'
    }
];

// ============================================
// 🎮 TRIAL BALANCE GAME STATE
// ============================================

const TBGame = {
    entries: [],
    debitEntries: [],
    creditEntries: [],
    currentEntryIndex: 0,
    debitTotal: 0,
    creditTotal: 0,
    draggedEntry: null,
    isComplete: false
};

// ============================================
// 🎯 LOAD TRIAL BALANCE GAME
// ============================================

function loadTrialBalanceGame() {
    // Reset state
    TBGame.entries = [];
    TBGame.debitEntries = [];
    TBGame.creditEntries = [];
    TBGame.currentEntryIndex = 0;
    TBGame.debitTotal = 0;
    TBGame.creditTotal = 0;
    TBGame.isComplete = false;

    // Select random entries (6 debit + 6 credit for balance)
    const debitItems = shuffleArray(
        TrialBalanceEntries.filter(e => e.correctSide === 'debit')
    ).slice(0, 6);
    
    const creditItems = shuffleArray(
        TrialBalanceEntries.filter(e => e.correctSide === 'credit')
    ).slice(0, 6);

    // Adjust amounts to make them balance
    let debitSum = debitItems.reduce((sum, e) => sum + e.amount, 0);
    let creditSum = creditItems.reduce((sum, e) => sum + e.amount, 0);
    
    // Adjust last credit item to balance
    const diff = debitSum - creditSum;
    if (creditItems.length > 0) {
        creditItems[creditItems.length - 1].amount += diff;
    }

    // Combine and shuffle all entries
    TBGame.entries = shuffleArray([...debitItems, ...creditItems]);
    Game.totalQuestions = TBGame.entries.length;

    // Render game UI
    renderTrialBalanceUI();
}

// ============================================
// 🖥️ RENDER TRIAL BALANCE UI
// ============================================

function renderTrialBalanceUI() {
    const content = document.getElementById('gameContent');
    
    content.innerHTML = `
        <div class="tb-game-container">
            <!-- Instructions -->
            <div class="tb-instructions">
                <h3>🎯 Mission: Balance the Trial Balance!</h3>
                <p>Entries ko sahi side mein <strong>Drag & Drop</strong> karo. Debit = Credit hona chahiye!</p>
                <div class="tb-hint-box">
                    <span>💡 Hint:</span>
                    <span><strong>DEBIT:</strong> Assets + Expenses + Drawings + Losses</span>
                    <span><strong>CREDIT:</strong> Liabilities + Capital + Income + Gains</span>
                </div>
            </div>

            <!-- Progress -->
            <div class="tb-progress">
                <span>Progress: <strong id="tbProgress">0</strong> / ${TBGame.entries.length}</span>
                <div class="progress-bar" style="flex: 1; margin-left: 15px;">
                    <div class="progress-fill progress-fill-green" id="tbProgressBar" style="width: 0%;"></div>
                </div>
            </div>

            <!-- Main Game Area -->
            <div class="tb-game-area">
                <!-- Entries to Sort -->
                <div class="tb-entries-container">
                    <h4>📋 Entries to Sort</h4>
                    <div class="tb-entries-list" id="tbEntriesList">
                        ${TBGame.entries.map((entry, index) => `
                            <div class="tb-entry-card" 
                                 draggable="true" 
                                 data-id="${entry.id}"
                                 data-index="${index}"
                                 id="entry-${entry.id}">
                                <div class="tb-entry-icon">${entry.type === 'Asset' ? '🏢' : entry.type === 'Expense' ? '💸' : entry.type === 'Income' ? '💰' : entry.type === 'Liability' ? '📝' : entry.type === 'Capital' ? '👤' : '📊'}</div>
                                <div class="tb-entry-details">
                                    <span class="tb-entry-name">${entry.text}</span>
                                    <span class="tb-entry-type">${entry.type}</span>
                                </div>
                                <div class="tb-entry-amount">₹${entry.amount.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Drop Zones -->
                <div class="tb-drop-zones">
                    <!-- Debit Zone -->
                    <div class="tb-drop-zone debit-zone" id="debitZone">
                        <div class="tb-zone-header">
                            <h4>📥 DEBIT</h4>
                            <span class="tb-zone-hint">Assets & Expenses</span>
                        </div>
                        <div class="tb-zone-entries" id="debitZoneEntries">
                            <div class="tb-zone-placeholder">
                                <span>🎯</span>
                                <span>Drop Debit items here</span>
                            </div>
                        </div>
                        <div class="tb-zone-total">
                            <span>Total:</span>
                            <span id="debitTotal">₹0</span>
                        </div>
                    </div>

                    <!-- Credit Zone -->
                    <div class="tb-drop-zone credit-zone" id="creditZone">
                        <div class="tb-zone-header">
                            <h4>📤 CREDIT</h4>
                            <span class="tb-zone-hint">Liabilities, Capital & Income</span>
                        </div>
                        <div class="tb-zone-entries" id="creditZoneEntries">
                            <div class="tb-zone-placeholder">
                                <span>🎯</span>
                                <span>Drop Credit items here</span>
                            </div>
                        </div>
                        <div class="tb-zone-total">
                            <span>Total:</span>
                            <span id="creditTotal">₹0</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Balance Check -->
            <div class="tb-balance-check" id="tbBalanceCheck">
                <div class="tb-balance-status" id="tbBalanceStatus">
                    <span class="tb-balance-icon">⚖️</span>
                    <span class="tb-balance-text">Sort all entries to check balance!</span>
                </div>
            </div>

            <!-- Explanation Panel -->
            <div class="tb-explanation-panel" id="tbExplanation" style="display: none;">
                <div class="tb-explanation-header">
                    <span class="tb-explanation-icon" id="tbExpIcon">✅</span>
                    <span class="tb-explanation-title" id="tbExpTitle">Correct!</span>
                </div>
                <p class="tb-explanation-text" id="tbExpText"></p>
            </div>

            <!-- Action Buttons -->
            <div class="tb-actions">
                <button class="btn btn-secondary" onclick="resetTrialBalance()">
                    🔄 Reset
                </button>
                <button class="btn btn-primary" id="tbCheckBtn" onclick="checkTrialBalance()" disabled>
                    ✅ Check Balance
                </button>
            </div>
        </div>
    `;

    // Add styles
    addTrialBalanceStyles();

    // Setup drag and drop
    setupDragAndDrop();
}

// ============================================
// 🎨 ADD TRIAL BALANCE STYLES
// ============================================

function addTrialBalanceStyles() {
    if (document.getElementById('tb-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'tb-styles';
    styles.textContent = `
        .tb-game-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .tb-instructions {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(168, 85, 247, 0.3);
            text-align: center;
        }

        .tb-instructions h3 {
            font-family: var(--font-gaming);
            color: var(--neon-purple);
            margin-bottom: 10px;
        }

        .tb-instructions p {
            color: var(--text-secondary);
            margin-bottom: 15px;
        }

        .tb-hint-box {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 0.9rem;
        }

        .tb-hint-box span {
            background: rgba(0,0,0,0.3);
            padding: 8px 15px;
            border-radius: 20px;
            color: var(--text-secondary);
        }

        .tb-hint-box span:first-child {
            background: rgba(255, 215, 0, 0.2);
            color: var(--neon-yellow);
        }

        .tb-progress {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            font-family: var(--font-gaming);
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .tb-game-area {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 25px;
            margin-bottom: 25px;
        }

        @media (max-width: 900px) {
            .tb-game-area {
                grid-template-columns: 1fr;
            }
        }

        .tb-entries-container {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .tb-entries-container h4 {
            font-family: var(--font-gaming);
            font-size: 1rem;
            margin-bottom: 15px;
            color: var(--neon-blue);
        }

        .tb-entries-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        }

        .tb-entry-card {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 12px 15px;
            cursor: grab;
            transition: all 0.2s ease;
            user-select: none;
        }

        .tb-entry-card:hover {
            border-color: var(--neon-purple);
            transform: translateX(5px);
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
        }

        .tb-entry-card.dragging {
            opacity: 0.5;
            cursor: grabbing;
        }

        .tb-entry-card.placed {
            display: none;
        }

        .tb-entry-card.correct {
            border-color: var(--neon-green);
            background: rgba(0, 255, 136, 0.1);
        }

        .tb-entry-card.wrong {
            border-color: var(--neon-red);
            background: rgba(255, 51, 102, 0.1);
        }

        .tb-entry-icon {
            font-size: 1.5rem;
            width: 40px;
            text-align: center;
        }

        .tb-entry-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .tb-entry-name {
            font-weight: 600;
            color: var(--text-primary);
        }

        .tb-entry-type {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .tb-entry-amount {
            font-family: var(--font-gaming);
            font-size: 1rem;
            color: var(--neon-yellow);
            background: rgba(255, 215, 0, 0.1);
            padding: 5px 12px;
            border-radius: 20px;
        }

        .tb-drop-zones {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .tb-drop-zone {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            border: 2px dashed rgba(255,255,255,0.2);
            min-height: 200px;
            transition: all 0.3s ease;
        }

        .tb-drop-zone.debit-zone {
            border-color: rgba(0, 212, 255, 0.3);
        }

        .tb-drop-zone.credit-zone {
            border-color: rgba(0, 255, 136, 0.3);
        }

        .tb-drop-zone.drag-over {
            border-style: solid;
            transform: scale(1.02);
        }

        .tb-drop-zone.debit-zone.drag-over {
            border-color: var(--neon-blue);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }

        .tb-drop-zone.credit-zone.drag-over {
            border-color: var(--neon-green);
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        }

        .tb-zone-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .tb-zone-header h4 {
            font-family: var(--font-gaming);
            font-size: 1.1rem;
        }

        .debit-zone .tb-zone-header h4 {
            color: var(--neon-blue);
        }

        .credit-zone .tb-zone-header h4 {
            color: var(--neon-green);
        }

        .tb-zone-hint {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .tb-zone-entries {
            min-height: 100px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .tb-zone-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80px;
            color: var(--text-muted);
            font-size: 0.9rem;
            gap: 8px;
        }

        .tb-zone-placeholder span:first-child {
            font-size: 1.5rem;
            opacity: 0.5;
        }

        .tb-zone-entry {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 10px 15px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .debit-zone .tb-zone-entry {
            border-left: 3px solid var(--neon-blue);
        }

        .credit-zone .tb-zone-entry {
            border-left: 3px solid var(--neon-green);
        }

        .tb-zone-entry-name {
            flex: 1;
            font-size: 0.9rem;
        }

        .tb-zone-entry-amount {
            font-family: var(--font-gaming);
            font-size: 0.9rem;
            color: var(--neon-yellow);
        }

        .tb-zone-entry-remove {
            background: none;
            border: none;
            color: var(--neon-red);
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .tb-zone-entry-remove:hover {
            opacity: 1;
        }

        .tb-zone-total {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-family: var(--font-gaming);
        }

        .debit-zone .tb-zone-total span:last-child {
            color: var(--neon-blue);
            font-size: 1.2rem;
        }

        .credit-zone .tb-zone-total span:last-child {
            color: var(--neon-green);
            font-size: 1.2rem;
        }

        .tb-balance-check {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }

        .tb-balance-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            font-size: 1.1rem;
        }

        .tb-balance-icon {
            font-size: 2rem;
        }

        .tb-balance-status.balanced {
            color: var(--neon-green);
        }

        .tb-balance-status.unbalanced {
            color: var(--neon-red);
        }

        .tb-explanation-panel {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .tb-explanation-panel.wrong {
            border-color: rgba(255, 51, 102, 0.3);
        }

        .tb-explanation-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .tb-explanation-icon {
            font-size: 1.5rem;
        }

        .tb-explanation-title {
            font-family: var(--font-gaming);
            font-size: 1.1rem;
            color: var(--neon-green);
        }

        .tb-explanation-panel.wrong .tb-explanation-title {
            color: var(--neon-red);
        }

        .tb-explanation-text {
            color: var(--text-secondary);
            line-height: 1.7;
        }

        .tb-actions {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        /* Mobile Touch Friendly */
        @media (max-width: 600px) {
            .tb-entry-card {
                padding: 15px;
            }

            .tb-entry-amount {
                font-size: 0.85rem;
                padding: 4px 10px;
            }

            .tb-drop-zone {
                padding: 15px;
                min-height: 150px;
            }
        }
    `;

    document.head.appendChild(styles);
}

// ============================================
// 🖱️ DRAG AND DROP SETUP
// ============================================

function setupDragAndDrop() {
    const entries = document.querySelectorAll('.tb-entry-card');
    const debitZone = document.getElementById('debitZone');
    const creditZone = document.getElementById('creditZone');

    // Setup draggable entries
    entries.forEach(entry => {
        // Mouse events
        entry.addEventListener('dragstart', handleDragStart);
        entry.addEventListener('dragend', handleDragEnd);

        // Touch events for mobile
        entry.addEventListener('touchstart', handleTouchStart, { passive: false });
        entry.addEventListener('touchmove', handleTouchMove, { passive: false });
        entry.addEventListener('touchend', handleTouchEnd);
    });

    // Setup drop zones
    [debitZone, creditZone].forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

// ============================================
// 🖱️ DRAG HANDLERS
// ============================================

function handleDragStart(e) {
    TBGame.draggedEntry = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    TBGame.draggedEntry = null;

    document.querySelectorAll('.tb-drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (!TBGame.draggedEntry) return;

    const entryId = parseInt(TBGame.draggedEntry.dataset.id);
    const entry = TBGame.entries.find(e => e.id === entryId);
    if (!entry) return;

    const isDebitZone = this.id === 'debitZone';
    const droppedSide = isDebitZone ? 'debit' : 'credit';

    // Process the drop
    processEntryDrop(entry, droppedSide, isDebitZone);
}

// ============================================
// 📱 TOUCH HANDLERS (Mobile)
// ============================================

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    TBGame.draggedEntry = this;
    this.classList.add('dragging');

    // Create visual clone
    touchClone = this.cloneNode(true);
    touchClone.style.cssText = `
        position: fixed;
        left: ${touch.clientX - 100}px;
        top: ${touch.clientY - 30}px;
        width: 200px;
        opacity: 0.9;
        pointer-events: none;
        z-index: 9999;
        transform: scale(0.9);
    `;
    document.body.appendChild(touchClone);
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (!touchClone) return;

    const touch = e.touches[0];
    touchClone.style.left = `${touch.clientX - 100}px`;
    touchClone.style.top = `${touch.clientY - 30}px`;

    // Check which zone we're over
    const debitZone = document.getElementById('debitZone');
    const creditZone = document.getElementById('creditZone');
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    debitZone.classList.remove('drag-over');
    creditZone.classList.remove('drag-over');

    if (element) {
        if (element.closest('#debitZone')) {
            debitZone.classList.add('drag-over');
        } else if (element.closest('#creditZone')) {
            creditZone.classList.add('drag-over');
        }
    }
}

function handleTouchEnd(e) {
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }

    if (!TBGame.draggedEntry) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    TBGame.draggedEntry.classList.remove('dragging');

    document.querySelectorAll('.tb-drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });

    if (element) {
        const debitZone = element.closest('#debitZone');
        const creditZone = element.closest('#creditZone');

        if (debitZone || creditZone) {
            const entryId = parseInt(TBGame.draggedEntry.dataset.id);
            const entry = TBGame.entries.find(e => e.id === entryId);

            if (entry) {
                const isDebitZone = !!debitZone;
                const droppedSide = isDebitZone ? 'debit' : 'credit';
                processEntryDrop(entry, droppedSide, isDebitZone);
            }
        }
    }

    TBGame.draggedEntry = null;
}

// ============================================
// 🎯 PROCESS ENTRY DROP
// ============================================

function processEntryDrop(entry, droppedSide, isDebitZone) {
    const isCorrect = entry.correctSide === droppedSide;
    const originalCard = document.getElementById(`entry-${entry.id}`);

    // Show explanation
    showTBExplanation(entry, isCorrect);

    if (isCorrect) {
        // Correct placement
        handleCorrect(15);
        
        if (originalCard) {
            originalCard.classList.add('correct', 'placed');
        }

        // Add to zone
        addEntryToZone(entry, isDebitZone);

        // Update totals
        if (isDebitZone) {
            TBGame.debitEntries.push(entry);
            TBGame.debitTotal += entry.amount;
        } else {
            TBGame.creditEntries.push(entry);
            TBGame.creditTotal += entry.amount;
        }

        updateTBTotals();
    } else {
        // Wrong placement
        handleWrong();
        
        if (originalCard) {
            originalCard.classList.add('wrong');
            setTimeout(() => {
                originalCard.classList.remove('wrong');
            }, 1000);
        }

        // Shake the wrong zone
        const zone = document.getElementById(isDebitZone ? 'debitZone' : 'creditZone');
        zone.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            zone.style.animation = '';
        }, 300);
    }

    // Update progress
    updateTBProgress();

    // Check if all entries placed
    checkTBCompletion();
}

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

function addEntryToZone(entry, isDebitZone) {
    const zoneEntries = document.getElementById(isDebitZone ? 'debitZoneEntries' : 'creditZoneEntries');
    
    // Remove placeholder if exists
    const placeholder = zoneEntries.querySelector('.tb-zone-placeholder');
    if (placeholder) placeholder.remove();

    // Add entry
    const entryEl = document.createElement('div');
    entryEl.className = 'tb-zone-entry';
    entryEl.dataset.id = entry.id;
    entryEl.innerHTML = `
        <span class="tb-zone-entry-name">${entry.text}</span>
        <span class="tb-zone-entry-amount">₹${entry.amount.toLocaleString()}</span>
        <button class="tb-zone-entry-remove" onclick="removeEntryFromZone(${entry.id}, ${isDebitZone})">✕</button>
    `;
    zoneEntries.appendChild(entryEl);
}

function removeEntryFromZone(entryId, isDebitZone) {
    const entry = TBGame.entries.find(e => e.id === entryId);
    if (!entry) return;

    // Remove from zone arrays
    if (isDebitZone) {
        TBGame.debitEntries = TBGame.debitEntries.filter(e => e.id !== entryId);
        TBGame.debitTotal -= entry.amount;
    } else {
        TBGame.creditEntries = TBGame.creditEntries.filter(e => e.id !== entryId);
        TBGame.creditTotal -= entry.amount;
    }

    // Remove from UI
    const zoneEntries = document.getElementById(isDebitZone ? 'debitZoneEntries' : 'creditZoneEntries');
    const entryEl = zoneEntries.querySelector(`[data-id="${entryId}"]`);
    if (entryEl) entryEl.remove();

    // Show placeholder if empty
    if (zoneEntries.children.length === 0) {
        zoneEntries.innerHTML = `
            <div class="tb-zone-placeholder">
                <span>🎯</span>
                <span>Drop ${isDebitZone ? 'Debit' : 'Credit'} items here</span>
            </div>
        `;
    }

    // Show original card again
    const originalCard = document.getElementById(`entry-${entryId}`);
    if (originalCard) {
        originalCard.classList.remove('placed', 'correct');
    }

    // Update totals
    updateTBTotals();
    updateTBProgress();

    Sound.play('click');
}

function updateTBTotals() {
    document.getElementById('debitTotal').textContent = `₹${TBGame.debitTotal.toLocaleString()}`;
    document.getElementById('creditTotal').textContent = `₹${TBGame.creditTotal.toLocaleString()}`;

    // Update balance status
    const status = document.getElementById('tbBalanceStatus');
    const placed = TBGame.debitEntries.length + TBGame.creditEntries.length;

    if (placed === TBGame.entries.length) {
        if (TBGame.debitTotal === TBGame.creditTotal) {
            status.className = 'tb-balance-status balanced';
            status.innerHTML = `
                <span class="tb-balance-icon">✅</span>
                <span class="tb-balance-text">BALANCED! Debit = Credit = ₹${TBGame.debitTotal.toLocaleString()}</span>
            `;
        } else {
            const diff = Math.abs(TBGame.debitTotal - TBGame.creditTotal);
            status.className = 'tb-balance-status unbalanced';
            status.innerHTML = `
                <span class="tb-balance-icon">❌</span>
                <span class="tb-balance-text">NOT BALANCED! Difference: ₹${diff.toLocaleString()}</span>
            `;
        }
    }
}

function updateTBProgress() {
    const placed = TBGame.debitEntries.length + TBGame.creditEntries.length;
    const total = TBGame.entries.length;
    const percent = (placed / total) * 100;

    document.getElementById('tbProgress').textContent = placed;
    document.getElementById('tbProgressBar').style.width = `${percent}%`;

    // Enable check button when all placed
    document.getElementById('tbCheckBtn').disabled = placed !== total;
}

function showTBExplanation(entry, isCorrect) {
    const panel = document.getElementById('tbExplanation');
    const icon = document.getElementById('tbExpIcon');
    const title = document.getElementById('tbExpTitle');
    const text = document.getElementById('tbExpText');

    panel.style.display = 'block';
    panel.className = `tb-explanation-panel ${isCorrect ? '' : 'wrong'}`;

    if (isCorrect) {
        icon.textContent = '✅';
        title.textContent = 'Sahi Jawab! (Correct!)';
    } else {
        icon.textContent = '❌';
        title.textContent = `Galat! Yeh ${entry.correctSide.toUpperCase()} mein jaata hai.`;
    }

    text.textContent = entry.explanation;

    // Auto hide after 4 seconds
    setTimeout(() => {
        panel.style.display = 'none';
    }, 4000);
}

function checkTBCompletion() {
    const placed = TBGame.debitEntries.length + TBGame.creditEntries.length;

    if (placed === TBGame.entries.length) {
        TBGame.isComplete = true;
        
        // Check if balanced
        const isBalanced = TBGame.debitTotal === TBGame.creditTotal;
        
        if (isBalanced) {
            // Bonus for perfect balance
            addScore(100);
            showToast('⚖️ Perfect Balance!', '+100 Bonus Points!', 'xp');
        }
    }
}

function checkTrialBalance() {
    if (!TBGame.isComplete) return;

    const isBalanced = TBGame.debitTotal === TBGame.creditTotal;

    if (isBalanced) {
        // Add completion bonus
        handleCorrect(50);
        
        // End game successfully
        setTimeout(() => {
            endGame(true);
        }, 1500);
    } else {
        showToast('❌ Not Balanced!', 'Check your entries and try again!', 'error');
    }
}

function resetTrialBalance() {
    // Reset game state
    TBGame.debitEntries = [];
    TBGame.creditEntries = [];
    TBGame.debitTotal = 0;
    TBGame.creditTotal = 0;
    TBGame.isComplete = false;

    // Re-render UI
    renderTrialBalanceUI();
    
    Sound.play('click');
    showToast('🔄 Reset!', 'Start fresh!', 'info');
}

// ============================================
// 🌐 EXPOSE FUNCTIONS
// ============================================

window.loadTrialBalanceGame = loadTrialBalanceGame;
window.resetTrialBalance = resetTrialBalance;
window.checkTrialBalance = checkTrialBalance;
window.removeEntryFromZone = removeEntryFromZone;

/* ================================================================
   🕵️ ACCOUNTS WIZARD - BRS DETECTIVE GAME
   Part 4: Bank Reconciliation Statement Matching Game
   "Bank vs Books Showdown! Find the differences!" 💳
================================================================ */

// ============================================
// 📚 BRS QUESTION BANK (EXPANDED WITH DEBIT/CREDIT OPTIONS)
// ============================================

const BRSItems = [
    // CHEQUES ISSUED BUT NOT PRESENTED
    {
        id: 1,
        situation: 'Cheque of ₹5,000 issued to Ramesh but not yet presented to bank for payment.',
        shortText: 'Cheque issued ₹5,000 - not presented',
        amount: 5000,
        type: 'cheque-issued-not-presented',
        action: 'add-passbook', // When starting from Cash Book balance
        actionFromPassbook: 'deduct-passbook', // When starting from Pass Book balance
        explanation: 'Cash Book mein already minus ho gaya hai (Credit), but Bank ne abhi payment nahi ki. Isliye Pass Book balance zyada hai. Pass Book se start karein toh minus karo.',
        hindiTip: 'Cheque issue kiya = Cash Book mein minus. Bank ne pay nahi kiya = Pass Book mein abhi bhi hai.',
        debitCredit: 'debit'
    },
    {
        id: 2,
        situation: 'A cheque for ₹8,500 was issued to supplier on 28th March but presented on 5th April.',
        shortText: 'Cheque ₹8,500 - presented late',
        amount: 8500,
        type: 'cheque-issued-not-presented',
        action: 'add-passbook',
        actionFromPassbook: 'deduct-passbook',
        explanation: 'March end tak Bank ne pay nahi kiya. Cash Book mein March mein minus hai, but Pass Book mein April mein minus hoga.',
        hindiTip: 'Late presentation = Bank balance temporarily zyada dikhega.',
        debitCredit: 'debit'
    },
    {
        id: 31,
        situation: 'Cheque of ₹15,000 issued to contractor on 30th June, cleared on 5th July.',
        shortText: 'Cheque ₹15,000 - cleared next month',
        amount: 15000,
        type: 'cheque-issued-not-presented',
        action: 'add-passbook',
        actionFromPassbook: 'deduct-passbook',
        explanation: 'June ke end tak cheque pending tha. Cash Book mein deduct, Pass Book mein nahi.',
        hindiTip: 'Month-end timing difference = Temporary mismatch.',
        debitCredit: 'debit'
    },
    {
        id: 32,
        situation: 'Salary cheques totalling ₹75,000 issued on last working day, cleared next week.',
        shortText: 'Salary cheques ₹75,000',
        amount: 75000,
        type: 'cheque-issued-not-presented',
        action: 'add-passbook',
        actionFromPassbook: 'deduct-passbook',
        explanation: 'Employee cheques not yet cashed. Bank balance appears higher than books.',
        hindiTip: 'Uncashed salary cheques = Bank shows extra money.',
        debitCredit: 'debit'
    },

    // CHEQUES DEPOSITED BUT NOT CREDITED
    {
        id: 4,
        situation: 'Cheque of ₹15,000 deposited in bank but not yet credited by bank.',
        shortText: 'Cheque deposited ₹15,000 - not credited',
        amount: 15000,
        type: 'cheque-deposited-not-credited',
        action: 'deduct-cashbook',
        actionFromPassbook: 'add-passbook',
        explanation: 'Cash Book mein add ho gaya (Debit), but Bank ne abhi credit nahi kiya. Isliye Cash Book balance zyada hai.',
        hindiTip: 'Deposit kiya but Bank ne nahi maana = Cash Book mein extra.',
        debitCredit: 'credit'
    },
    {
        id: 5,
        situation: 'Cheques amounting to ₹7,500 deposited on 31st March, credited by bank on 2nd April.',
        shortText: 'Cheque ₹7,500 - credited later',
        amount: 7500,
        type: 'cheque-deposited-not-credited',
        action: 'deduct-cashbook',
        actionFromPassbook: 'add-passbook',
        explanation: 'March mein deposit kiya but April mein credit hua. March ke BRS mein difference aayega.',
        hindiTip: 'Bank processing time = Temporary difference.',
        debitCredit: 'credit'
    },
    {
        id: 33,
        situation: 'Final day collection of ₹45,000 deposited at 4 PM, processed next day.',
        shortText: 'Late deposit ₹45,000',
        amount: 45000,
        type: 'cheque-deposited-not-credited',
        action: 'deduct-cashbook',
        actionFromPassbook: 'add-passbook',
        explanation: 'Bank cutoff time missed. Shows in books but not in bank statement.',
        hindiTip: 'After-hours deposit = Next day processing.',
        debitCredit: 'credit'
    },
    {
        id: 34,
        situation: 'Outstation cheque of ₹22,000 deposited, awaiting clearance (3-5 days).',
        shortText: 'Outstation cheque ₹22,000',
        amount: 22000,
        type: 'cheque-deposited-not-credited',
        action: 'deduct-cashbook',
        actionFromPassbook: 'add-passbook',
        explanation: 'Outstation cheques take longer to clear. Temporary difference.',
        hindiTip: 'Different city cheque = Longer clearing time.',
        debitCredit: 'credit'
    },

    // BANK CHARGES
    {
        id: 35,
        situation: 'Monthly SMS alert charges ₹30 debited by bank.',
        shortText: 'SMS charges ₹30',
        amount: 30,
        type: 'bank-charges',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Bank service charge. Debit Bank Charges, Credit Bank A/c.',
        hindiTip: 'Small charges often missed! Record them.',
        debitCredit: 'debit'
    },
    {
        id: 36,
        situation: 'Annual debit card charges ₹500 debited.',
        shortText: 'Card charges ₹500',
        amount: 500,
        type: 'bank-charges',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Card maintenance fee. Bank already deducted, books need update.',
        hindiTip: 'Annual charges = Easy to forget!',
        debitCredit: 'debit'
    },
    {
        id: 37,
        situation: 'RTGS/NEFT charges ₹25 per transaction.',
        shortText: 'Transfer charges ₹25',
        amount: 25,
        type: 'bank-charges',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Electronic transfer fees. Bank deducted, books not updated.',
        hindiTip: 'Online transfer charges add up!',
        debitCredit: 'debit'
    },
    {
        id: 38,
        situation: 'Penalty for minimum balance not maintained ₹200.',
        shortText: 'Min balance penalty ₹200',
        amount: 200,
        type: 'bank-charges',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Bank penalty for low balance. Record as expense.',
        hindiTip: 'Check minimum balance requirements!',
        debitCredit: 'debit'
    },
    {
        id: 39,
        situation: 'Stop payment charges ₹100 for cancelled cheque.',
        shortText: 'Stop payment ₹100',
        amount: 100,
        type: 'bank-charges',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Fee for stopping cheque payment. Bank already charged.',
        hindiTip: 'Cheque cancellation has costs!',
        debitCredit: 'debit'
    },

    // INTEREST CREDITED
    {
        id: 40,
        situation: 'Monthly interest on savings account ₹350 credited.',
        shortText: 'Savings interest ₹350',
        amount: 350,
        type: 'interest-credited',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Regular interest income. Bank credited, books need entry.',
        hindiTip: 'Savings interest = Passive income!',
        debitCredit: 'credit'
    },
    {
        id: 41,
        situation: 'Interest on tax refund ₹1,250 credited.',
        shortText: 'Tax refund interest ₹1,250',
        amount: 1250,
        type: 'interest-credited',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Government pays interest on delayed refunds. Bank got it.',
        hindiTip: 'Even government pays interest sometimes!',
        debitCredit: 'credit'
    },
    {
        id: 42,
        situation: 'Fixed deposit interest ₹5,000 credited.',
        shortText: 'FD Interest ₹5,000',
        amount: 5000,
        type: 'interest-credited',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'FD interest received. Bank credited, books need update.',
        hindiTip: 'FD interest = Extra income!',
        debitCredit: 'credit'
    },

    // DIRECT DEPOSITS
    {
        id: 43,
        situation: 'Insurance claim settlement ₹50,000 directly deposited.',
        shortText: 'Insurance claim ₹50,000',
        amount: 50000,
        type: 'direct-deposit',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Insurance company paid directly to bank. Books unaware.',
        hindiTip: 'Direct settlements need recording!',
        debitCredit: 'credit'
    },
    {
        id: 44,
        situation: 'GST refund ₹28,500 directly credited to bank.',
        shortText: 'GST refund ₹28,500',
        amount: 28500,
        type: 'direct-deposit',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Government refund via direct credit. Update books.',
        hindiTip: 'Tax refunds are happy surprises!',
        debitCredit: 'credit'
    },
    {
        id: 45,
        situation: 'Dividend income ₹10,000 directly deposited.',
        shortText: 'Dividend income ₹10,000',
        amount: 10000,
        type: 'direct-deposit',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Dividend from investments directly credited.',
        hindiTip: 'Investment returns need recording!',
        debitCredit: 'credit'
    },

    // DIRECT PAYMENTS
    {
        id: 46,
        situation: 'GST payment ₹15,000 via auto-debit.',
        shortText: 'GST auto-debit ₹15,000',
        amount: 15000,
        type: 'direct-payment',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Tax payment via auto-debit. Bank paid, books not updated.',
        hindiTip: 'Auto-debit for taxes = Convenient but track!',
        debitCredit: 'debit'
    },
    {
        id: 47,
        situation: 'Monthly software subscription ₹2,500 auto-debited.',
        shortText: 'Software subscription ₹2,500',
        amount: 2500,
        type: 'direct-payment',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'SaaS payment via bank auto-debit. Record as expense.',
        hindiTip: 'Recurring payments = Watch out!',
        debitCredit: 'debit'
    },
    {
        id: 48,
        situation: 'Electricity bill ₹3,200 auto-debited.',
        shortText: 'Electricity bill ₹3,200',
        amount: 3200,
        type: 'direct-payment',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Utility bill auto-debit. Bank paid, books need update.',
        hindiTip: 'Auto-debit utilities = Check regularly!',
        debitCredit: 'debit'
    },

    // DISHONOURED CHEQUES
    {
        id: 49,
        situation: 'Cheque of ₹12,000 deposited but returned due to signature mismatch.',
        shortText: 'Signature mismatch ₹12,000',
        amount: 12000,
        type: 'dishonoured',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Cheque bounced due to signature issue. Reverse earlier entry.',
        hindiTip: 'Signature must match exactly!',
        debitCredit: 'credit'
    },
    {
        id: 50,
        situation: 'Cheque ₹8,000 returned due to insufficient funds.',
        shortText: 'Insufficient funds ₹8,000',
        amount: 8000,
        type: 'dishonoured',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Cheque bounced - NSF. Reverse earlier deposit entry.',
        hindiTip: 'NSF = Not Sufficient Funds!',
        debitCredit: 'credit'
    },

    // BANK ERRORS
    {
        id: 51,
        situation: 'Bank credited ₹8,000 twice by mistake.',
        shortText: 'Double credit error ₹8,000',
        amount: 8000,
        type: 'bank-error-credit',
        action: 'no-action',
        actionFromPassbook: 'deduct-passbook',
        explanation: 'Bank error - extra credit. Inform bank to reverse.',
        hindiTip: 'Bank errors happen too! Report them.',
        debitCredit: 'debit'
    },
    {
        id: 52,
        situation: 'Bank debited ₹3,000 for another account\'s transaction.',
        shortText: 'Wrong account debit ₹3,000',
        amount: 3000,
        type: 'bank-error-debit',
        action: 'no-action',
        actionFromPassbook: 'add-passbook',
        explanation: 'Wrong account charged. Bank needs to correct.',
        hindiTip: 'Check statements for wrong charges!',
        debitCredit: 'credit'
    },
    {
        id: 53,
        situation: 'Bank charged ₹150 for cheque book but not in our account.',
        shortText: 'Wrong charge ₹150',
        amount: 150,
        type: 'bank-error-debit',
        action: 'no-action',
        actionFromPassbook: 'add-passbook',
        explanation: 'Bank charged wrong account. Need correction.',
        hindiTip: 'Verify all bank charges!',
        debitCredit: 'credit'
    },

    // OMITTED ENTRIES
    {
        id: 54,
        situation: 'Bank interest credited but entry omitted in cash book.',
        shortText: 'Interest omitted ₹900',
        amount: 900,
        type: 'omission',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Bank credited interest, books missed it. Add to cash book.',
        hindiTip: 'Interest income often forgotten!',
        debitCredit: 'credit'
    },
    {
        id: 55,
        situation: 'Standing instruction for charity donation ₹1,000 omitted.',
        shortText: 'Donation omitted ₹1,000',
        amount: 1000,
        type: 'omission',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Auto charity donation. Bank paid, books missed.',
        hindiTip: 'Charity donations need recording too!',
        debitCredit: 'debit'
    },
    {
        id: 56,
        situation: 'Loan EMI ₹12,500 omitted from cash book.',
        shortText: 'Loan EMI omitted ₹12,500',
        amount: 12500,
        type: 'omission',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Loan EMI auto-debit. Bank deducted, books missed.',
        hindiTip: 'Loan payments must be recorded!',
        debitCredit: 'debit'
    },

    // ADDITIONAL NEW ENTRIES
    {
        id: 57,
        situation: 'Credit card payment ₹25,000 debited by bank.',
        shortText: 'Credit card payment ₹25,000',
        amount: 25000,
        type: 'direct-payment',
        action: 'deduct-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Credit card auto-payment. Bank paid, books need entry.',
        hindiTip: 'Credit card payments = Liability reduction!',
        debitCredit: 'debit'
    },
    {
        id: 58,
        situation: 'Rent received directly in bank ₹20,000.',
        shortText: 'Direct rent ₹20,000',
        amount: 20000,
        type: 'direct-deposit',
        action: 'add-cashbook',
        actionFromPassbook: 'no-action',
        explanation: 'Tenant paid rent directly to bank. Update books.',
        hindiTip: 'Direct receipts = Easy but track!',
        debitCredit: 'credit'
    },
    {
        id: 59,
        situation: 'Cheque issued to employee ₹5,000 but lost and not presented.',
        shortText: 'Lost cheque ₹5,000',
        amount: 5000,
        type: 'cheque-issued-not-presented',
        action: 'add-passbook',
        actionFromPassbook: 'deduct-passbook',
        explanation: 'Cheque lost, will never be presented. Bank balance higher.',
        hindiTip: 'Lost cheques = Stop payment needed!',
        debitCredit: 'debit'
    },
    {
        id: 60,
        situation: 'Post-dated cheque ₹15,000 deposited, will be credited later.',
        shortText: 'Post-dated cheque ₹15,000',
        amount: 15000,
        type: 'cheque-deposited-not-credited',
        action: 'deduct-cashbook',
        actionFromPassbook: 'add-passbook',
        explanation: 'Post-dated cheque - bank will credit on future date.',
        hindiTip: 'Post-dated = Future credit!',
        debitCredit: 'credit'
    }
];

// ============================================
// 🎮 BRS GAME STATE
// ============================================

const BRSGame = {
    items: [],
    currentIndex: 0,
    startingFrom: 'cashbook', // 'cashbook' or 'passbook'
    cashBookBalance: 0,
    passBookBalance: 0,
    adjustedBalance: 0,
    answers: [],
    isComplete: false
};

// ============================================
// 🎯 LOAD BRS GAME (UPDATED FOR DEBIT/CREDIT)
// ============================================

function loadBRSGame() {
    // Reset state
    BRSGame.items = [];
    BRSGame.currentIndex = 0;
    BRSGame.answers = [];
    BRSGame.isComplete = false;

    // Randomly decide starting point
    BRSGame.startingFrom = Math.random() > 0.5 ? 'cashbook' : 'passbook';

    // Generate random balances
    BRSGame.cashBookBalance = randomBetween(45000, 55000);
    
    // Select 8 random items
    BRSGame.items = shuffleArray([...BRSItems]).slice(0, 8);

    // Calculate what Pass Book balance should be
    let difference = 0;
    BRSGame.items.forEach(item => {
        if (item.type === 'cheque-issued-not-presented') {
            difference += item.amount; // PB > CB
        } else if (item.type === 'cheque-deposited-not-credited') {
            difference -= item.amount; // CB > PB
        } else if (item.type === 'bank-charges' || item.type === 'direct-payment' || item.type === 'dishonoured') {
            difference += item.amount; // PB < CB (bank already deducted)
        } else if (item.type === 'interest-credited' || item.type === 'direct-deposit') {
            difference -= item.amount; // PB > CB (bank already added)
        }
    });

    BRSGame.passBookBalance = BRSGame.cashBookBalance + difference;
    BRSGame.adjustedBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.cashBookBalance : BRSGame.passBookBalance;

    Game.totalQuestions = BRSGame.items.length;

    // Render UI with Debit/Credit options
    renderBRSUI();
}

// ============================================
// 🖥️ RENDER BRS UI (UPDATED FOR DEBIT/CREDIT)
// ============================================

function renderBRSUI() {
    const content = document.getElementById('gameContent');

    const startingBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.cashBookBalance : BRSGame.passBookBalance;
    const startingName = BRSGame.startingFrom === 'cashbook' ? 'Cash Book' : 'Pass Book';
    const targetName = BRSGame.startingFrom === 'cashbook' ? 'Pass Book' : 'Cash Book';
    const targetBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.passBookBalance : BRSGame.cashBookBalance;

    content.innerHTML = `
        <div class="brs-game-container">
            <!-- Header Info -->
            <div class="brs-header">
                <div class="brs-header-box starting">
                    <span class="brs-header-label">Starting From</span>
                    <span class="brs-header-title">${startingName} Balance</span>
                    <span class="brs-header-amount">₹${startingBalance.toLocaleString()}</span>
                </div>
                <div class="brs-header-arrow">
                    <span>🔄</span>
                    <span>Reconcile</span>
                </div>
                <div class="brs-header-box target">
                    <span class="brs-header-label">Target</span>
                    <span class="brs-header-title">${targetName} Balance</span>
                    <span class="brs-header-amount">₹${targetBalance.toLocaleString()}</span>
                </div>
            </div>

            <!-- Instructions -->
            <div class="brs-instructions">
                <h3>🕵️ Mission: Reconcile the Balances!</h3>
                <p>Har item ke liye decide karo: <strong>DEBIT ₹</strong> karein ya <strong>CREDIT ₹</strong> karein ya <strong>NO ACTION</strong>.</p>
                <p class="brs-starting-hint">📌 Tum <strong>${startingName}</strong> balance se start kar rahe ho.</p>
                <p class="brs-debit-credit-hint">
                    💡 <strong>DEBIT ₹:</strong> Balance badhao | <strong>CREDIT ₹:</strong> Balance ghatao
                </p>
            </div>

            <!-- Progress -->
            <div class="brs-progress">
                <span>Item: <strong id="brsCurrentItem">1</strong> / ${BRSGame.items.length}</span>
                <div class="progress-bar" style="flex: 1; margin-left: 15px;">
                    <div class="progress-fill progress-fill-purple" id="brsProgressBar" style="width: 0%;"></div>
                </div>
            </div>

            <!-- Current Balance Display -->
            <div class="brs-balance-display">
                <div class="brs-current-balance">
                    <span class="brs-bal-label">Adjusted Balance</span>
                    <span class="brs-bal-amount" id="brsAdjustedBalance">₹${startingBalance.toLocaleString()}</span>
                </div>
                <div class="brs-difference">
                    <span class="brs-diff-label">Difference Remaining</span>
                    <span class="brs-diff-amount" id="brsDifference">₹${Math.abs(targetBalance - startingBalance).toLocaleString()}</span>
                </div>
            </div>

            <!-- Question Card -->
            <div class="brs-question-card" id="brsQuestionCard">
                <div class="brs-question-header">
                    <span class="brs-question-num">Item <span id="brsQuestionNum">1</span></span>
                    <span class="brs-question-type" id="brsQuestionType">Timing Difference</span>
                </div>
                <p class="brs-question-text" id="brsQuestionText">Loading...</p>
                <div class="brs-question-amount">
                    Amount: <strong id="brsQuestionAmount">₹0</strong>
                </div>
            </div>

            <!-- Answer Options (DEBIT/CREDIT) -->
            <div class="brs-options">
                <button class="brs-option-btn debit" onclick="submitBRSAnswer('debit')">
                    <span class="brs-option-icon">📥</span>
                    <span class="brs-option-text">DEBIT ₹</span>
                    <span class="brs-option-hint">Balance mein jodo</span>
                </button>
                <button class="brs-option-btn credit" onclick="submitBRSAnswer('credit')">
                    <span class="brs-option-icon">📤</span>
                    <span class="brs-option-text">CREDIT ₹</span>
                    <span class="brs-option-hint">Balance se ghatao</span>
                </button>
                <button class="brs-option-btn no-action" onclick="submitBRSAnswer('no-action')">
                    <span class="brs-option-icon">⏸️</span>
                    <span class="brs-option-text">NO ACTION</span>
                    <span class="brs-option-hint">Kuch mat karo</span>
                </button>
            </div>

            <!-- Explanation Panel -->
            <div class="brs-explanation" id="brsExplanation" style="display: none;">
                <div class="brs-exp-header">
                    <span class="brs-exp-icon" id="brsExpIcon">✅</span>
                    <span class="brs-exp-title" id="brsExpTitle">Correct!</span>
                </div>
                <p class="brs-exp-text" id="brsExpText"></p>
                <p class="brs-exp-tip" id="brsExpTip"></p>
            </div>

            <!-- Summary (shown at end) -->
            <div class="brs-summary" id="brsSummary" style="display: none;">
                <h3>📊 Reconciliation Summary</h3>
                <div class="brs-summary-table" id="brsSummaryTable"></div>
            </div>
        </div>
    `;

    // Add styles (updated for debit/credit)
    addBRSStyles();

    // Load first question
    loadBRSQuestion();
}

// ============================================
// 🎨 ADD BRS STYLES (UPDATED FOR DEBIT/CREDIT)
// ============================================

function addBRSStyles() {
    if (document.getElementById('brs-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'brs-styles';
    styles.textContent = `
        .brs-game-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .brs-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }

        .brs-header-box {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px 30px;
            text-align: center;
            border: 2px solid rgba(255,255,255,0.1);
            min-width: 180px;
        }

        .brs-header-box.starting {
            border-color: rgba(0, 212, 255, 0.5);
        }

        .brs-header-box.target {
            border-color: rgba(0, 255, 136, 0.5);
        }

        .brs-header-label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .brs-header-title {
            display: block;
            font-family: var(--font-gaming);
            font-size: 0.9rem;
            margin-bottom: 8px;
        }

        .brs-header-box.starting .brs-header-title {
            color: var(--neon-blue);
        }

        .brs-header-box.target .brs-header-title {
            color: var(--neon-green);
        }

        .brs-header-amount {
            font-family: var(--font-gaming);
            font-size: 1.3rem;
            color: var(--neon-yellow);
        }

        .brs-header-arrow {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        .brs-header-arrow span:first-child {
            font-size: 1.5rem;
            animation: spin 3s linear infinite;
        }

        .brs-instructions {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .brs-instructions h3 {
            font-family: var(--font-gaming);
            color: var(--neon-purple);
            margin-bottom: 10px;
        }

        .brs-instructions p {
            color: var(--text-secondary);
            margin-bottom: 8px;
        }

        .brs-starting-hint {
            background: rgba(0, 212, 255, 0.1);
            padding: 10px 20px;
            border-radius: 10px;
            display: inline-block;
            color: var(--neon-blue) !important;
        }

        .brs-debit-credit-hint {
            background: rgba(255, 215, 0, 0.1);
            padding: 10px 20px;
            border-radius: 10px;
            margin-top: 10px;
            color: var(--neon-yellow) !important;
            font-size: 0.9rem;
        }

        .brs-progress {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            font-family: var(--font-gaming);
            font-size: 0.9rem;
        }

        .brs-balance-display {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }

        .brs-current-balance, .brs-difference {
            text-align: center;
            padding: 15px 30px;
            border-radius: 12px;
            background: var(--bg-card);
        }

        .brs-current-balance {
            border: 2px solid rgba(0, 255, 136, 0.3);
        }

        .brs-difference {
            border: 2px solid rgba(255, 107, 53, 0.3);
        }

        .brs-bal-label, .brs-diff-label {
            display: block;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 5px;
        }

        .brs-bal-amount {
            font-family: var(--font-gaming);
            font-size: 1.5rem;
            color: var(--neon-green);
        }

        .brs-diff-amount {
            font-family: var(--font-gaming);
            font-size: 1.5rem;
            color: var(--neon-orange);
        }

        .brs-question-card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            border: 2px solid rgba(255,255,255,0.1);
            text-align: center;
        }

        .brs-question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .brs-question-num {
            font-family: var(--font-gaming);
            font-size: 0.85rem;
            color: var(--neon-purple);
            background: rgba(168, 85, 247, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
        }

        .brs-question-type {
            font-size: 0.8rem;
            color: var(--text-muted);
            background: rgba(255,255,255,0.05);
            padding: 5px 15px;
            border-radius: 20px;
        }

        .brs-question-text {
            font-size: 1.2rem;
            color: var(--text-primary);
            line-height: 1.7;
            margin-bottom: 20px;
        }

        .brs-question-amount {
            font-size: 1rem;
            color: var(--text-secondary);
        }

        .brs-question-amount strong {
            font-family: var(--font-gaming);
            font-size: 1.3rem;
            color: var(--neon-yellow);
        }

        .brs-options {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }

        .brs-option-btn {
            background: var(--bg-card);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            min-width: 140px;
        }

        .brs-option-btn:hover {
            transform: translateY(-5px);
        }

        .brs-option-btn.debit:hover {
            border-color: var(--neon-blue);
            box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
        }

        .brs-option-btn.credit:hover {
            border-color: var(--neon-green);
            box-shadow: 0 0 25px rgba(0, 255, 136, 0.3);
        }

        .brs-option-btn.no-action:hover {
            border-color: var(--neon-yellow);
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.3);
        }

        .brs-option-btn.selected {
            transform: scale(1.05);
        }

        .brs-option-btn.selected.debit {
            background: rgba(0, 212, 255, 0.2);
            border-color: var(--neon-blue);
        }

        .brs-option-btn.selected.credit {
            background: rgba(0, 255, 136, 0.2);
            border-color: var(--neon-green);
        }

        .brs-option-btn.selected.no-action {
            background: rgba(255, 215, 0, 0.2);
            border-color: var(--neon-yellow);
        }

        .brs-option-btn.correct {
            background: rgba(0, 255, 136, 0.2);
            border-color: var(--neon-green);
        }

        .brs-option-btn.wrong {
            background: rgba(255, 51, 102, 0.2);
            border-color: var(--neon-red);
        }

        .brs-option-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
        }

        .brs-option-icon {
            font-size: 2rem;
        }

        .brs-option-text {
            font-family: var(--font-gaming);
            font-size: 1rem;
        }

        .brs-option-btn.debit .brs-option-text { color: var(--neon-blue); }
        .brs-option-btn.credit .brs-option-text { color: var(--neon-green); }
        .brs-option-btn.no-action .brs-option-text { color: var(--neon-yellow); }

        .brs-option-hint {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .brs-explanation {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            animation: fadeIn 0.3s ease;
        }

        .brs-explanation.wrong {
            border-color: rgba(255, 51, 102, 0.3);
        }

        .brs-exp-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
        }

        .brs-exp-icon {
            font-size: 1.5rem;
        }

        .brs-exp-title {
            font-family: var(--font-gaming);
            font-size: 1.1rem;
            color: var(--neon-green);
        }

        .brs-explanation.wrong .brs-exp-title {
            color: var(--neon-red);
        }

        .brs-exp-text {
            color: var(--text-secondary);
            line-height: 1.7;
            margin-bottom: 10px;
        }

        .brs-exp-tip {
            background: rgba(255, 215, 0, 0.1);
            padding: 12px 18px;
            border-radius: 10px;
            font-size: 0.9rem;
            color: var(--neon-yellow);
        }

        .brs-exp-tip::before {
            content: '💡 ';
        }

        .brs-summary {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .brs-summary h3 {
            font-family: var(--font-gaming);
            color: var(--neon-purple);
            text-align: center;
            margin-bottom: 20px;
        }

        .brs-summary-table {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .brs-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }

        .brs-summary-row.header {
            background: rgba(168, 85, 247, 0.2);
            font-family: var(--font-gaming);
            font-size: 0.85rem;
        }

        .brs-summary-row.debit {
            border-left: 3px solid var(--neon-blue);
        }

        .brs-summary-row.credit {
            border-left: 3px solid var(--neon-green);
        }

        .brs-summary-row.total {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            font-family: var(--font-gaming);
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
            .brs-header {
                flex-direction: column;
            }

            .brs-options {
                flex-direction: column;
                align-items: center;
            }

            .brs-option-btn {
                width: 100%;
                max-width: 250px;
            }

            .brs-balance-display {
                flex-direction: column;
                align-items: center;
            }
        }
    `;

    document.head.appendChild(styles);
}

// ============================================
// 🎯 LOAD BRS QUESTION
// ============================================

function loadBRSQuestion() {
    if (BRSGame.currentIndex >= BRSGame.items.length) {
        showBRSSummary();
        return;
    }

    const item = BRSGame.items[BRSGame.currentIndex];

    // Update UI
    setText('brsCurrentItem', BRSGame.currentIndex + 1);
    setText('brsQuestionNum', BRSGame.currentIndex + 1);
    setText('brsQuestionText', item.situation);
    setText('brsQuestionAmount', `₹${item.amount.toLocaleString()}`);
    setText('brsQuestionType', getItemTypeName(item.type));

    // Update progress bar
    const progress = (BRSGame.currentIndex / BRSGame.items.length) * 100;
    document.getElementById('brsProgressBar').style.width = `${progress}%`;

    // Hide explanation
    document.getElementById('brsExplanation').style.display = 'none';

    // Enable all buttons
    document.querySelectorAll('.brs-option-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected', 'correct', 'wrong');
    });
}

function getItemTypeName(type) {
    const names = {
        'cheque-issued-not-presented': '🏦 Cheque Issued Not Presented',
        'cheque-deposited-not-credited': '📥 Cheque Deposited Not Credited',
        'bank-charges': '💳 Bank Charges',
        'interest-credited': '💰 Interest Credited',
        'direct-deposit': '📥 Direct Deposit',
        'direct-payment': '📤 Direct Payment',
        'dishonoured': '❌ Cheque Dishonoured',
        'bank-error-credit': '⚠️ Bank Error (Credit)',
        'bank-error-debit': '⚠️ Bank Error (Debit)',
        'omission': '🚫 Omission'
    };
    return names[type] || 'Unknown';
}

// ============================================
// 🎯 SUBMIT BRS ANSWER (UPDATED FOR DEBIT/CREDIT)
// ============================================

function submitBRSAnswer(answer) {
    const item = BRSGame.items[BRSGame.currentIndex];

    // Determine correct action based on starting point
    let correctAction;
    if (BRSGame.startingFrom === 'cashbook') {
        correctAction = item.action;
    } else {
        correctAction = item.actionFromPassbook;
    }

    // Map action to debit/credit
    let correctAnswer;
    if (correctAction.includes('add')) {
        correctAnswer = 'debit'; // Add to balance = Debit
    } else if (correctAction.includes('deduct')) {
        correctAnswer = 'credit'; // Deduct from balance = Credit
    } else {
        correctAnswer = 'no-action';
    }

    const isCorrect = answer === correctAnswer;

    // Disable buttons
    document.querySelectorAll('.brs-option-btn').forEach(btn => {
        btn.disabled = true;
    });

    // Highlight selected and correct
    const selectedBtn = document.querySelector(`.brs-option-btn.${answer}`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    if (!isCorrect) {
        // Show correct answer
        const correctBtn = document.querySelector(`.brs-option-btn.${correctAnswer}`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
    }

    // Update adjusted balance based on answer
    if (answer === 'debit') {
        BRSGame.adjustedBalance += item.amount;
    } else if (answer === 'credit') {
        BRSGame.adjustedBalance -= item.amount;
    }

    setText('brsAdjustedBalance', `₹${BRSGame.adjustedBalance.toLocaleString()}`);

    // Calculate remaining difference
    const targetBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.passBookBalance : BRSGame.cashBookBalance;
    const difference = Math.abs(targetBalance - BRSGame.adjustedBalance);
    setText('brsDifference', `₹${difference.toLocaleString()}`);

    // Show explanation
    showBRSExplanation(item, isCorrect);

    // Handle scoring
    if (isCorrect) {
        handleCorrect(20);
    } else {
        handleWrong();
    }

    // Save answer
    BRSGame.answers.push({
        item: item,
        userAnswer: answer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    });

    // Move to next question after delay
    setTimeout(() => {
        BRSGame.currentIndex++;
        loadBRSQuestion();
    }, 3000);
}

// ============================================
// 📖 SHOW BRS EXPLANATION
// ============================================

function showBRSExplanation(item, isCorrect) {
    const panel = document.getElementById('brsExplanation');
    const icon = document.getElementById('brsExpIcon');
    const title = document.getElementById('brsExpTitle');
    const text = document.getElementById('brsExpText');
    const tip = document.getElementById('brsExpTip');

    panel.style.display = 'block';
    panel.className = `brs-explanation ${isCorrect ? '' : 'wrong'}`;

    if (isCorrect) {
        icon.textContent = '✅';
        title.textContent = 'Sahi Jawab! Well done!';
    } else {
        icon.textContent = '❌';
        title.textContent = 'Galat! Dhyan se samjho:';
    }

    text.textContent = item.explanation;
    tip.textContent = item.hindiTip;
}

// ============================================
// 📊 SHOW BRS SUMMARY
// ============================================

function showBRSSummary() {
    BRSGame.isComplete = true;

    // Hide question card and options
    document.getElementById('brsQuestionCard').style.display = 'none';
    document.querySelector('.brs-options').style.display = 'none';
    document.getElementById('brsExplanation').style.display = 'none';

    // Show summary
    const summary = document.getElementById('brsSummary');
    const table = document.getElementById('brsSummaryTable');
    summary.style.display = 'block';

    const startingName = BRSGame.startingFrom === 'cashbook' ? 'Cash Book' : 'Pass Book';
    const targetName = BRSGame.startingFrom === 'cashbook' ? 'Pass Book' : 'Cash Book';
    const startingBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.cashBookBalance : BRSGame.passBookBalance;
    const targetBalance = BRSGame.startingFrom === 'cashbook' ? BRSGame.passBookBalance : BRSGame.cashBookBalance;

    let html = `
        <div class="brs-summary-row header">
            <span>${startingName} Balance (Starting)</span>
            <span>₹${startingBalance.toLocaleString()}</span>
        </div>
    `;

    // List all adjustments
    let runningBalance = startingBalance;
    BRSGame.answers.forEach(ans => {
        const sign = ans.correctAnswer === 'debit' ? '+' : ans.correctAnswer === 'credit' ? '-' : '±';
        const rowClass = ans.correctAnswer === 'debit' ? 'debit' : ans.correctAnswer === 'credit' ? 'credit' : '';
        const status = ans.isCorrect ? '✅' : '❌';

        if (ans.correctAnswer === 'debit') {
            runningBalance += ans.item.amount;
        } else if (ans.correctAnswer === 'credit') {
            runningBalance -= ans.item.amount;
        }

        html += `
            <div class="brs-summary-row ${rowClass}">
                <span>${status} ${ans.item.shortText}</span>
                <span>${sign} ₹${ans.item.amount.toLocaleString()}</span>
            </div>
        `;
    });

    html += `
        <div class="brs-summary-row total">
            <span>Adjusted Balance (Should match ${targetName})</span>
            <span>₹${runningBalance.toLocaleString()}</span>
        </div>
        <div class="brs-summary-row total">
            <span>${targetName} Balance (Target)</span>
            <span>₹${targetBalance.toLocaleString()}</span>
        </div>
    `;

    const isBalanced = runningBalance === targetBalance;
    if (isBalanced) {
        html += `
            <div class="brs-summary-row" style="background: rgba(0,255,136,0.2); justify-content: center; gap: 10px;">
                <span style="color: var(--neon-green); font-family: var(--font-gaming);">
                    ✅ RECONCILED! Balances Match!
                </span>
            </div>
        `;
        addScore(100);
        showToast('⚖️ Perfect Reconciliation!', '+100 Bonus Points!', 'xp');
    } else {
        html += `
            <div class="brs-summary-row" style="background: rgba(255,51,102,0.2); justify-content: center;">
                <span style="color: var(--neon-red); font-family: var(--font-gaming);">
                    ❌ Difference: ₹${Math.abs(runningBalance - targetBalance).toLocaleString()}
                </span>
            </div>
        `;
    }

    table.innerHTML = html;

    // End game after 3 seconds
    setTimeout(() => {
        endGame(true);
    }, 4000);
}

// ============================================
// 🌐 EXPOSE FUNCTIONS
// ============================================

window.loadBRSGame = loadBRSGame;
window.submitBRSAnswer = submitBRSAnswer;

/* ================================================================
   📉 ACCOUNTS WIZARD - DEPRECIATION SURVIVAL GAME
   Part 5: Calculate Depreciation & Watch Assets Degrade!
   "Assets ki value girti hai... Save them!" 💀
================================================================ */

// ============================================
// 📚 DEPRECIATION ASSETS BANK (EXPANDED)
// ============================================

const DepreciationAssets = [
    {
        id: 1,
        name: 'Machinery',
        emoji: '⚙️',
        description: 'Factory mein lagayi gayi heavy machinery',
        cost: 100000,
        scrapValue: 10000,
        lifeYears: 10,
        ratePercent: 10,
        method: 'both',
        category: 'Plant & Machinery'
    },
    {
        id: 2,
        name: 'Computer',
        emoji: '💻',
        description: 'Office ke liye naya computer system',
        cost: 50000,
        scrapValue: 5000,
        lifeYears: 5,
        ratePercent: 20,
        method: 'both',
        category: 'Office Equipment'
    },
    {
        id: 3,
        name: 'Delivery Van',
        emoji: '🚐',
        description: 'Goods delivery ke liye vehicle',
        cost: 400000,
        scrapValue: 40000,
        lifeYears: 8,
        ratePercent: 15,
        method: 'both',
        category: 'Vehicles'
    },
    {
        id: 4,
        name: 'Office Furniture',
        emoji: '🪑',
        description: 'Tables, chairs, cabinets for office',
        cost: 80000,
        scrapValue: 8000,
        lifeYears: 10,
        ratePercent: 10,
        method: 'both',
        category: 'Furniture & Fixtures'
    },
    {
        id: 5,
        name: 'Air Conditioner',
        emoji: '❄️',
        description: 'Central AC system for office',
        cost: 150000,
        scrapValue: 15000,
        lifeYears: 10,
        ratePercent: 15,
        method: 'both',
        category: 'Plant & Machinery'
    },
    {
        id: 11,
        name: 'Server Rack',
        emoji: '🖥️',
        description: 'Data center server equipment',
        cost: 250000,
        scrapValue: 25000,
        lifeYears: 6,
        ratePercent: 25,
        method: 'both',
        category: 'IT Equipment'
    },
    {
        id: 12,
        name: 'Forklift',
        emoji: '🚜',
        description: 'Warehouse material handling equipment',
        cost: 350000,
        scrapValue: 35000,
        lifeYears: 7,
        ratePercent: 20,
        method: 'both',
        category: 'Plant & Machinery'
    },
    {
        id: 13,
        name: 'Photocopier',
        emoji: '📠',
        description: 'High-speed office photocopy machine',
        cost: 65000,
        scrapValue: 6500,
        lifeYears: 5,
        ratePercent: 25,
        method: 'both',
        category: 'Office Equipment'
    },
    {
        id: 14,
        name: 'Security System',
        emoji: '🚨',
        description: 'Complete office security with cameras, alarms',
        cost: 120000,
        scrapValue: 12000,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Security Equipment'
    },
    {
        id: 15,
        name: 'Coffee Machine',
        emoji: '☕',
        description: 'Commercial coffee machine for office',
        cost: 45000,
        scrapValue: 4500,
        lifeYears: 5,
        ratePercent: 30,
        method: 'both',
        category: 'Kitchen Equipment'
    },
    {
        id: 16,
        name: 'Projector',
        emoji: '📽️',
        description: 'Conference room projector system',
        cost: 55000,
        scrapValue: 5500,
        lifeYears: 6,
        ratePercent: 25,
        method: 'both',
        category: 'Audio-Visual Equipment'
    },
    {
        id: 17,
        name: 'Gym Equipment',
        emoji: '🏋️',
        description: 'Office gym equipment for employees',
        cost: 85000,
        scrapValue: 8500,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Recreation Equipment'
    },
    {
        id: 18,
        name: 'Landscaping Equipment',
        emoji: '🌿',
        description: 'Lawn mowers, trimmers for office garden',
        cost: 40000,
        scrapValue: 4000,
        lifeYears: 5,
        ratePercent: 30,
        method: 'both',
        category: 'Grounds Equipment'
    },
    {
        id: 19,
        name: 'Telephone System',
        emoji: '📞',
        description: 'Office PBX telephone system',
        cost: 75000,
        scrapValue: 7500,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Communication Equipment'
    },
    {
        id: 20,
        name: 'Library Books',
        emoji: '📚',
        description: 'Technical books for office library',
        cost: 30000,
        scrapValue: 3000,
        lifeYears: 4,
        ratePercent: 40,
        method: 'slm',
        category: 'Library Assets'
    },
    {
        id: 21,
        name: 'Industrial Robot',
        emoji: '🤖',
        description: 'Automated manufacturing robot',
        cost: 500000,
        scrapValue: 50000,
        lifeYears: 7,
        ratePercent: 20,
        method: 'both',
        category: 'Advanced Machinery'
    },
    {
        id: 22,
        name: 'Company Car',
        emoji: '🚗',
        description: 'Executive company car',
        cost: 800000,
        scrapValue: 80000,
        lifeYears: 5,
        ratePercent: 25,
        method: 'both',
        category: 'Vehicles'
    },
    {
        id: 23,
        name: '3D Printer',
        emoji: '🖨️',
        description: 'Industrial 3D printing machine',
        cost: 300000,
        scrapValue: 30000,
        lifeYears: 5,
        ratePercent: 30,
        method: 'both',
        category: 'Manufacturing Equipment'
    },
    {
        id: 24,
        name: 'Solar Panels',
        emoji: '☀️',
        description: 'Roof-top solar power system',
        cost: 200000,
        scrapValue: 20000,
        lifeYears: 15,
        ratePercent: 10,
        method: 'both',
        category: 'Green Energy'
    },
    {
        id: 25,
        name: 'Medical Equipment',
        emoji: '🏥',
        description: 'Clinic medical examination equipment',
        cost: 150000,
        scrapValue: 15000,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Medical Equipment'
    },
    {
        id: 26,
        name: 'CCTV System',
        emoji: '📹',
        description: 'Complete CCTV surveillance system',
        cost: 90000,
        scrapValue: 9000,
        lifeYears: 6,
        ratePercent: 25,
        method: 'both',
        category: 'Security Equipment'
    },
    {
        id: 27,
        name: 'Industrial Oven',
        emoji: '🔥',
        description: 'Bakery industrial baking oven',
        cost: 250000,
        scrapValue: 25000,
        lifeYears: 10,
        ratePercent: 15,
        method: 'both',
        category: 'Food Processing'
    },
    {
        id: 28,
        name: 'Water Purifier',
        emoji: '💧',
        description: 'Industrial water purification system',
        cost: 120000,
        scrapValue: 12000,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Utilities'
    },
    {
        id: 29,
        name: 'Conference System',
        emoji: '🎤',
        description: 'Audio conference system with microphones',
        cost: 75000,
        scrapValue: 7500,
        lifeYears: 6,
        ratePercent: 25,
        method: 'both',
        category: 'Audio-Visual'
    },
    {
        id: 30,
        name: 'Industrial Fan',
        emoji: '💨',
        description: 'Large industrial cooling fan',
        cost: 60000,
        scrapValue: 6000,
        lifeYears: 8,
        ratePercent: 20,
        method: 'both',
        category: 'Plant & Machinery'
    }
];

// ============================================
// 🎮 DEPRECIATION GAME STATE
// ============================================

const DepGame = {
    currentAsset: null,
    selectedMethod: null,
    currentYear: 1,
    totalYears: 5,
    calculations: [],
    userAnswers: [],
    isComplete: false,
    openingValue: 0,
    currentWDV: 0
};

// ============================================
// 🎯 LOAD DEPRECIATION GAME
// ============================================

function loadDepreciationGame() {
    // Reset state
    DepGame.currentAsset = null;
    DepGame.selectedMethod = null;
    DepGame.currentYear = 1;
    DepGame.calculations = [];
    DepGame.userAnswers = [];
    DepGame.isComplete = false;

    // Select random asset
    DepGame.currentAsset = DepreciationAssets[Math.floor(Math.random() * DepreciationAssets.length)];
    DepGame.openingValue = DepGame.currentAsset.cost;
    DepGame.currentWDV = DepGame.currentAsset.cost;

    // Randomly select years to calculate (3-5 years)
    DepGame.totalYears = randomBetween(3, 5);
    Game.totalQuestions = DepGame.totalYears + 1; // +1 for method selection

    // Render UI
    renderDepreciationUI();
}

// ============================================
// 🖥️ RENDER DEPRECIATION UI
// ============================================

function renderDepreciationUI() {
    const content = document.getElementById('gameContent');
    const asset = DepGame.currentAsset;

    content.innerHTML = `
        <div class="dep-game-container">
            <!-- Asset Card -->
            <div class="dep-asset-card">
                <div class="dep-asset-visual">
                    <div class="dep-asset-emoji" id="depAssetEmoji">${asset.emoji}</div>
                    <div class="dep-asset-health">
                        <div class="dep-health-bar">
                            <div class="dep-health-fill" id="depHealthFill" style="width: 100%;"></div>
                        </div>
                        <span class="dep-health-text" id="depHealthText">100% Condition</span>
                    </div>
                </div>
                <div class="dep-asset-info">
                    <h3 class="dep-asset-name">${asset.name}</h3>
                    <p class="dep-asset-desc">${asset.description}</p>
                    <div class="dep-asset-stats">
                        <div class="dep-stat">
                            <span class="dep-stat-label">Original Cost</span>
                            <span class="dep-stat-value">₹${asset.cost.toLocaleString()}</span>
                        </div>
                        <div class="dep-stat">
                            <span class="dep-stat-label">Scrap Value</span>
                            <span class="dep-stat-value">₹${asset.scrapValue.toLocaleString()}</span>
                        </div>
                        <div class="dep-stat">
                            <span class="dep-stat-label">Useful Life</span>
                            <span class="dep-stat-value">${asset.lifeYears} Years</span>
                        </div>
                        <div class="dep-stat">
                            <span class="dep-stat-label">Rate</span>
                            <span class="dep-stat-value">${asset.ratePercent}% p.a.</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Current Value Display -->
            <div class="dep-value-display">
                <div class="dep-value-box">
                    <span class="dep-value-label">Current Book Value</span>
                    <span class="dep-value-amount" id="depCurrentValue">₹${asset.cost.toLocaleString()}</span>
                </div>
                <div class="dep-value-box">
                    <span class="dep-value-label">Total Depreciation</span>
                    <span class="dep-value-amount dep-loss" id="depTotalDep">₹0</span>
                </div>
            </div>

            <!-- Game Area -->
            <div class="dep-game-area" id="depGameArea">
                <!-- Step 1: Method Selection -->
                <div class="dep-step dep-method-selection" id="depMethodStep">
                    <h3 class="dep-step-title">📊 Step 1: Choose Depreciation Method</h3>
                    <p class="dep-step-desc">Konsa method use karoge is asset ke liye?</p>
                    
                    <div class="dep-method-options">
                        <div class="dep-method-card" onclick="selectDepMethod('slm')">
                            <div class="dep-method-icon">📏</div>
                            <h4>Straight Line Method (SLM)</h4>
                            <p>Fixed amount every year</p>
                            <div class="dep-method-formula">
                                <strong>Formula:</strong><br>
                                (Cost - Scrap) ÷ Life Years
                            </div>
                            <ul class="dep-method-points">
                                <li>✓ Simple calculation</li>
                                <li>✓ Same depreciation yearly</li>
                                <li>✓ Good for stable assets</li>
                            </ul>
                        </div>

                        <div class="dep-method-card" onclick="selectDepMethod('wdv')">
                            <div class="dep-method-icon">📉</div>
                            <h4>Written Down Value (WDV)</h4>
                            <p>Reducing balance every year</p>
                            <div class="dep-method-formula">
                                <strong>Formula:</strong><br>
                                WDV × Rate%
                            </div>
                            <ul class="dep-method-points">
                                <li>✓ Higher depreciation initially</li>
                                <li>✓ Decreases each year</li>
                                <li>✓ Good for tech assets</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Year-wise Calculation -->
                <div class="dep-step dep-calculation-step" id="depCalcStep" style="display: none;">
                    <div class="dep-year-header">
                        <h3 class="dep-step-title">📅 Year <span id="depYearNum">1</span> Depreciation</h3>
                        <span class="dep-method-badge" id="depMethodBadge">SLM</span>
                    </div>

                    <div class="dep-calc-info">
                        <div class="dep-calc-row">
                            <span>Opening Value:</span>
                            <strong id="depOpeningVal">₹0</strong>
                        </div>
                        <div class="dep-calc-row" id="depRateRow">
                            <span>Rate:</span>
                            <strong id="depRateVal">10%</strong>
                        </div>
                    </div>

                    <div class="dep-question">
                        <p class="dep-question-text">
                            Year <span id="depYearNumQ">1</span> ka depreciation amount kitna hoga?
                        </p>
                        
                        <div class="dep-input-group">
                            <span class="dep-input-prefix">₹</span>
                            <input type="number" 
                                   class="dep-input" 
                                   id="depAnswerInput" 
                                   placeholder="Enter amount"
                                   min="0"
                                   step="1">
                        </div>

                        <div class="dep-hint-box" id="depHintBox" style="display: none;">
                            <span class="dep-hint-icon">💡</span>
                            <span class="dep-hint-text" id="depHintText"></span>
                        </div>

                        <div class="dep-actions">
                            <button class="btn btn-secondary" onclick="showDepHint()">
                                💡 Hint
                            </button>
                            <button class="btn btn-primary" onclick="submitDepAnswer()">
                                ✅ Submit
                            </button>
                        </div>
                    </div>

                    <!-- Result Panel -->
                    <div class="dep-result" id="depResult" style="display: none;">
                        <div class="dep-result-header">
                            <span class="dep-result-icon" id="depResultIcon">✅</span>
                            <span class="dep-result-title" id="depResultTitle">Correct!</span>
                        </div>
                        <div class="dep-result-calculation" id="depResultCalc"></div>
                        <div class="dep-result-summary">
                            <div class="dep-result-row">
                                <span>Depreciation for Year <span id="depResYear">1</span>:</span>
                                <strong id="depResAmount">₹0</strong>
                            </div>
                            <div class="dep-result-row">
                                <span>Closing Value (WDV):</span>
                                <strong id="depResClosing">₹0</strong>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="depNextBtn" onclick="nextDepYear()">
                            Next Year ➡️
                        </button>
                    </div>
                </div>

                <!-- Final Summary -->
                <div class="dep-step dep-summary-step" id="depSummaryStep" style="display: none;">
                    <h3 class="dep-step-title">📊 Depreciation Schedule Complete!</h3>
                    
                    <div class="dep-summary-table" id="depSummaryTable">
                        <!-- Filled by JS -->
                    </div>

                    <div class="dep-final-stats">
                        <div class="dep-final-stat">
                            <span class="dep-final-icon">💰</span>
                            <span class="dep-final-label">Original Cost</span>
                            <span class="dep-final-value" id="depFinalCost">₹0</span>
                        </div>
                        <div class="dep-final-stat">
                            <span class="dep-final-icon">📉</span>
                            <span class="dep-final-label">Total Depreciation</span>
                            <span class="dep-final-value dep-loss" id="depFinalTotalDep">₹0</span>
                        </div>
                        <div class="dep-final-stat">
                            <span class="dep-final-icon">📦</span>
                            <span class="dep-final-label">Final Book Value</span>
                            <span class="dep-final-value" id="depFinalWDV">₹0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add styles
    addDepreciationStyles();
}

// ============================================
// 🎨 ADD DEPRECIATION STYLES
// ============================================

function addDepreciationStyles() {
    if (document.getElementById('dep-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'dep-styles';
    styles.textContent = `
        .dep-game-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }

        .dep-asset-card {
            display: flex;
            gap: 30px;
            background: var(--bg-card);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            border: 2px solid rgba(255, 107, 53, 0.3);
            flex-wrap: wrap;
        }

        .dep-asset-visual {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            min-width: 150px;
        }

        .dep-asset-emoji {
            font-size: 5rem;
            filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.5));
            transition: all 0.5s ease;
        }

        .dep-asset-emoji.degraded-1 { filter: grayscale(20%) drop-shadow(0 0 10px rgba(255, 200, 0, 0.5)); }
        .dep-asset-emoji.degraded-2 { filter: grayscale(40%) drop-shadow(0 0 10px rgba(255, 150, 0, 0.5)); }
        .dep-asset-emoji.degraded-3 { filter: grayscale(60%) drop-shadow(0 0 10px rgba(255, 100, 0, 0.5)); }
        .dep-asset-emoji.degraded-4 { filter: grayscale(80%) drop-shadow(0 0 10px rgba(255, 50, 0, 0.3)); }
        .dep-asset-emoji.degraded-5 { filter: grayscale(90%) opacity(0.7); }

        .dep-asset-health {
            width: 100%;
            text-align: center;
        }

        .dep-health-bar {
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 5px;
        }

        .dep-health-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--neon-red), var(--neon-yellow), var(--neon-green));
            border-radius: 10px;
            transition: width 0.5s ease;
        }

        .dep-health-text {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .dep-asset-info {
            flex: 1;
            min-width: 250px;
        }

        .dep-asset-name {
            font-family: var(--font-gaming);
            font-size: 1.5rem;
            color: var(--neon-orange);
            margin-bottom: 8px;
        }

        .dep-asset-desc {
            color: var(--text-secondary);
            margin-bottom: 20px;
        }

        .dep-asset-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .dep-stat {
            background: rgba(0,0,0,0.3);
            padding: 12px 15px;
            border-radius: 10px;
        }

        .dep-stat-label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 5px;
        }

        .dep-stat-value {
            font-family: var(--font-gaming);
            font-size: 1rem;
            color: var(--neon-yellow);
        }

        .dep-value-display {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .dep-value-box {
            background: var(--bg-card);
            padding: 20px 40px;
            border-radius: 15px;
            text-align: center;
            border: 2px solid rgba(0, 255, 136, 0.3);
        }

        .dep-value-label {
            display: block;
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .dep-value-amount {
            font-family: var(--font-gaming);
            font-size: 1.5rem;
            color: var(--neon-green);
        }

        .dep-value-amount.dep-loss {
            color: var(--neon-red);
        }

        .dep-step {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .dep-step-title {
            font-family: var(--font-gaming);
            font-size: 1.2rem;
            color: var(--neon-purple);
            margin-bottom: 10px;
            text-align: center;
        }

        .dep-step-desc {
            text-align: center;
            color: var(--text-secondary);
            margin-bottom: 25px;
        }

        /* Method Selection */
        .dep-method-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
        }

        @media (max-width: 700px) {
            .dep-method-options {
                grid-template-columns: 1fr;
            }
        }

        .dep-method-card {
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .dep-method-card:hover {
            border-color: var(--neon-purple);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2);
        }

        .dep-method-card.selected {
            border-color: var(--neon-green);
            background: rgba(0, 255, 136, 0.1);
        }

        .dep-method-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        .dep-method-card h4 {
            font-family: var(--font-gaming);
            font-size: 1rem;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .dep-method-card > p {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 15px;
        }

        .dep-method-formula {
            background: rgba(168, 85, 247, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .dep-method-formula strong {
            color: var(--neon-purple);
        }

        .dep-method-points {
            text-align: left;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .dep-method-points li {
            margin-bottom: 5px;
        }

        /* Calculation Step */
        .dep-year-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .dep-method-badge {
            background: var(--gradient-purple);
            padding: 8px 20px;
            border-radius: 20px;
            font-family: var(--font-gaming);
            font-size: 0.85rem;
            color: white;
        }

        .dep-calc-info {
            background: rgba(0,0,0,0.3);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
        }

        .dep-calc-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .dep-calc-row:last-child {
            border-bottom: none;
        }

        .dep-calc-row span {
            color: var(--text-secondary);
        }

        .dep-calc-row strong {
            color: var(--neon-yellow);
            font-family: var(--font-gaming);
        }

        .dep-question {
            text-align: center;
        }

        .dep-question-text {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 20px;
        }

        .dep-input-group {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-bottom: 20px;
        }

        .dep-input-prefix {
            font-family: var(--font-gaming);
            font-size: 1.3rem;
            color: var(--neon-yellow);
        }

        .dep-input {
            width: 200px;
            padding: 15px 20px;
            font-size: 1.2rem;
            font-family: var(--font-gaming);
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: var(--text-primary);
            text-align: center;
        }

        .dep-input:focus {
            border-color: var(--neon-green);
            outline: none;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        .dep-input.correct {
            border-color: var(--neon-green);
            background: rgba(0, 255, 136, 0.1);
        }

        .dep-input.wrong {
            border-color: var(--neon-red);
            background: rgba(255, 51, 102, 0.1);
            animation: shake 0.3s ease;
        }

        .dep-hint-box {
            background: rgba(255, 215, 0, 0.1);
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .dep-hint-icon {
            font-size: 1.3rem;
        }

        .dep-hint-text {
            color: var(--neon-yellow);
            font-size: 0.95rem;
        }

        .dep-actions {
            display: flex;
            justify-content: center;
            gap: 20px;
        }

        .dep-result {
            margin-top: 25px;
            padding: 25px;
            background: rgba(0, 255, 136, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .dep-result.wrong {
            background: rgba(255, 51, 102, 0.05);
            border-color: rgba(255, 51, 102, 0.3);
        }

        .dep-result-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .dep-result-icon {
            font-size: 2rem;
        }

        .dep-result-title {
            font-family: var(--font-gaming);
            font-size: 1.2rem;
            color: var(--neon-green);
        }

        .dep-result.wrong .dep-result-title {
            color: var(--neon-red);
        }

        .dep-result-calculation {
            background: rgba(0,0,0,0.3);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-family: var(--font-body);
            color: var(--text-secondary);
            line-height: 1.8;
            text-align: center;
        }

        .dep-result-calculation strong {
            color: var(--neon-yellow);
        }

        .dep-result-summary {
            margin-bottom: 20px;
        }

        .dep-result-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            margin-bottom: 8px;
        }

        .dep-result-row span {
            color: var(--text-secondary);
        }

        .dep-result-row strong {
            font-family: var(--font-gaming);
            color: var(--neon-green);
        }

        /* Summary */
        .dep-summary-table {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 25px;
        }

        .dep-summary-row {
            display: grid;
            grid-template-columns: 80px 1fr 1fr 1fr;
            gap: 15px;
            padding: 15px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .dep-summary-row:last-child {
            border-bottom: none;
        }

        .dep-summary-row.header {
            background: rgba(168, 85, 247, 0.2);
            font-family: var(--font-gaming);
            font-size: 0.8rem;
            color: var(--neon-purple);
        }

        .dep-summary-row span {
            text-align: center;
        }

        .dep-final-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }

        .dep-final-stat {
            background: rgba(0,0,0,0.3);
            padding: 20px 30px;
            border-radius: 15px;
            text-align: center;
            min-width: 150px;
        }

        .dep-final-icon {
            font-size: 2rem;
            display: block;
            margin-bottom: 10px;
        }

        .dep-final-label {
            display: block;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .dep-final-value {
            font-family: var(--font-gaming);
            font-size: 1.2rem;
            color: var(--neon-green);
        }

        .dep-final-value.dep-loss {
            color: var(--neon-red);
        }

        @media (max-width: 600px) {
            .dep-asset-card {
                flex-direction: column;
                text-align: center;
            }

            .dep-asset-stats {
                grid-template-columns: 1fr 1fr;
            }

            .dep-summary-row {
                grid-template-columns: 1fr 1fr;
                font-size: 0.85rem;
            }

            .dep-summary-row.header span:nth-child(3),
            .dep-summary-row.header span:nth-child(4),
            .dep-summary-row span:nth-child(3),
            .dep-summary-row span:nth-child(4) {
                display: none;
            }
        }
    `;

    document.head.appendChild(styles);
}

// ============================================
// 🎯 SELECT DEPRECIATION METHOD
// ============================================

function selectDepMethod(method) {
    DepGame.selectedMethod = method;

    // Highlight selected
    document.querySelectorAll('.dep-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    Sound.play('click');

    // Handle as correct answer (method selection)
    handleCorrect(10);
    showToast('✅ Method Selected!', method === 'slm' ? 'Straight Line Method' : 'Written Down Value', 'success');

    // Show calculation step after delay
    setTimeout(() => {
        document.getElementById('depMethodStep').style.display = 'none';
        document.getElementById('depCalcStep').style.display = 'block';
        loadDepYear();
    }, 1000);
}

// ============================================
// 📅 LOAD DEPRECIATION YEAR
// ============================================

function loadDepYear() {
    const asset = DepGame.currentAsset;
    const year = DepGame.currentYear;
    const method = DepGame.selectedMethod;

    // Update UI
    document.getElementById('depYearNum').textContent = year;
    document.getElementById('depYearNumQ').textContent = year;
    document.getElementById('depMethodBadge').textContent = method === 'slm' ? 'SLM' : 'WDV';

    // Calculate opening value
    let openingValue;
    if (year === 1) {
        openingValue = asset.cost;
    } else {
        openingValue = DepGame.currentWDV;
    }

    DepGame.openingValue = openingValue;

    document.getElementById('depOpeningVal').textContent = `₹${openingValue.toLocaleString()}`;

    if (method === 'slm') {
        document.getElementById('depRateRow').innerHTML = `
            <span>Life:</span>
            <strong>${asset.lifeYears} Years</strong>
        `;
    } else {
        document.getElementById('depRateRow').innerHTML = `
            <span>Rate:</span>
            <strong>${asset.ratePercent}%</strong>
        `;
    }

    // Reset input and result
    document.getElementById('depAnswerInput').value = '';
    document.getElementById('depAnswerInput').className = 'dep-input';
    document.getElementById('depAnswerInput').disabled = false;
    document.getElementById('depResult').style.display = 'none';
    document.getElementById('depHintBox').style.display = 'none';
}

// ============================================
// 💡 SHOW DEPRECIATION HINT
// ============================================

function showDepHint() {
    const asset = DepGame.currentAsset;
    const method = DepGame.selectedMethod;
    let hintText;

    if (method === 'slm') {
        const depAmount = (asset.cost - asset.scrapValue) / asset.lifeYears;
        hintText = `SLM: (₹${asset.cost.toLocaleString()} - ₹${asset.scrapValue.toLocaleString()}) ÷ ${asset.lifeYears} = ?`;
    } else {
        hintText = `WDV: ₹${DepGame.openingValue.toLocaleString()} × ${asset.ratePercent}% = ?`;
    }

    document.getElementById('depHintText').textContent = hintText;
    document.getElementById('depHintBox').style.display = 'flex';

    // Deduct points for hint
    Game.score = Math.max(0, Game.score - 5);
    setText('gameScore', Game.score);
    showToast('💡 Hint Used', '-5 Points', 'info');
}

// ============================================
// ✅ SUBMIT DEPRECIATION ANSWER
// ============================================

function submitDepAnswer() {
    const input = document.getElementById('depAnswerInput');
    const userAnswer = parseFloat(input.value);

    if (isNaN(userAnswer) || userAnswer < 0) {
        showToast('❌ Invalid!', 'Please enter a valid amount', 'error');
        return;
    }

    const asset = DepGame.currentAsset;
    const method = DepGame.selectedMethod;

    // Calculate correct answer
    let correctAnswer;
    if (method === 'slm') {
        correctAnswer = (asset.cost - asset.scrapValue) / asset.lifeYears;
    } else {
        correctAnswer = DepGame.openingValue * (asset.ratePercent / 100);
    }

    // Round to nearest integer for comparison
    correctAnswer = Math.round(correctAnswer);
    const userAnswerRounded = Math.round(userAnswer);

    // Check if correct (allow 1% tolerance)
    const tolerance = correctAnswer * 0.01;
    const isCorrect = Math.abs(userAnswerRounded - correctAnswer) <= tolerance;

    // Disable input
    input.disabled = true;

    // Show result
    const resultPanel = document.getElementById('depResult');
    const resultIcon = document.getElementById('depResultIcon');
    const resultTitle = document.getElementById('depResultTitle');
    const resultCalc = document.getElementById('depResultCalc');

    resultPanel.style.display = 'block';

    if (isCorrect) {
        input.classList.add('correct');
        resultPanel.classList.remove('wrong');
        resultIcon.textContent = '✅';
        resultTitle.textContent = 'Sahi Jawab! Correct!';
        handleCorrect(25);
    } else {
        input.classList.add('wrong');
        resultPanel.classList.add('wrong');
        resultIcon.textContent = '❌';
        resultTitle.textContent = `Galat! Correct answer: ₹${correctAnswer.toLocaleString()}`;
        handleWrong();
    }

    // Show calculation
    if (method === 'slm') {
        resultCalc.innerHTML = `
            <strong>SLM Formula:</strong> (Cost - Scrap Value) ÷ Life<br>
            = (₹${asset.cost.toLocaleString()} - ₹${asset.scrapValue.toLocaleString()}) ÷ ${asset.lifeYears}<br>
            = ₹${(asset.cost - asset.scrapValue).toLocaleString()} ÷ ${asset.lifeYears}<br>
            = <strong>₹${correctAnswer.toLocaleString()}</strong>
        `;
    } else {
        resultCalc.innerHTML = `
            <strong>WDV Formula:</strong> Opening Value × Rate%<br>
            = ₹${DepGame.openingValue.toLocaleString()} × ${asset.ratePercent}%<br>
            = ₹${DepGame.openingValue.toLocaleString()} × ${asset.ratePercent}/100<br>
            = <strong>₹${correctAnswer.toLocaleString()}</strong>
        `;
    }

    // Calculate closing value
    const closingValue = DepGame.openingValue - correctAnswer;
    DepGame.currentWDV = closingValue;

    document.getElementById('depResYear').textContent = DepGame.currentYear;
    document.getElementById('depResAmount').textContent = `₹${correctAnswer.toLocaleString()}`;
    document.getElementById('depResClosing').textContent = `₹${closingValue.toLocaleString()}`;

    // Save calculation
    DepGame.calculations.push({
        year: DepGame.currentYear,
        opening: DepGame.openingValue,
        depreciation: correctAnswer,
        closing: closingValue,
        userAnswer: userAnswerRounded,
        isCorrect: isCorrect
    });

    // Update displays
    updateDepDisplays();

    // Check if last year
    if (DepGame.currentYear >= DepGame.totalYears) {
        document.getElementById('depNextBtn').textContent = 'View Summary 📊';
        document.getElementById('depNextBtn').onclick = showDepSummary;
    }
}

// ============================================
// 📊 UPDATE DEPRECIATION DISPLAYS
// ============================================

function updateDepDisplays() {
    const asset = DepGame.currentAsset;
    
    // Update current value
    document.getElementById('depCurrentValue').textContent = `₹${DepGame.currentWDV.toLocaleString()}`;

    // Update total depreciation
    const totalDep = asset.cost - DepGame.currentWDV;
    document.getElementById('depTotalDep').textContent = `₹${totalDep.toLocaleString()}`;

    // Update asset visual
    const healthPercent = (DepGame.currentWDV / asset.cost) * 100;
    document.getElementById('depHealthFill').style.width = `${healthPercent}%`;
    document.getElementById('depHealthText').textContent = `${Math.round(healthPercent)}% Value Remaining`;

    // Degrade asset emoji
    const emoji = document.getElementById('depAssetEmoji');
    emoji.classList.remove('degraded-1', 'degraded-2', 'degraded-3', 'degraded-4', 'degraded-5');
    
    if (healthPercent < 20) {
        emoji.classList.add('degraded-5');
    } else if (healthPercent < 40) {
        emoji.classList.add('degraded-4');
    } else if (healthPercent < 60) {
        emoji.classList.add('degraded-3');
    } else if (healthPercent < 80) {
        emoji.classList.add('degraded-2');
    } else if (healthPercent < 95) {
        emoji.classList.add('degraded-1');
    }
}

// ============================================
// ➡️ NEXT DEPRECIATION YEAR
// ============================================

function nextDepYear() {
    DepGame.currentYear++;
    
    if (DepGame.currentYear > DepGame.totalYears) {
        showDepSummary();
    } else {
        loadDepYear();
    }
}

// ============================================
// 📊 SHOW DEPRECIATION SUMMARY
// ============================================

function showDepSummary() {
    DepGame.isComplete = true;

    // Hide calc step, show summary
    document.getElementById('depCalcStep').style.display = 'none';
    document.getElementById('depSummaryStep').style.display = 'block';

    const asset = DepGame.currentAsset;
    const table = document.getElementById('depSummaryTable');

    let html = `
        <div class="dep-summary-row header">
            <span>Year</span>
            <span>Opening (₹)</span>
            <span>Depreciation (₹)</span>
            <span>Closing (₹)</span>
        </div>
    `;

    let totalDep = 0;
    DepGame.calculations.forEach(calc => {
        totalDep += calc.depreciation;
        const status = calc.isCorrect ? '✅' : '❌';
        html += `
            <div class="dep-summary-row">
                <span>${status} Year ${calc.year}</span>
                <span>${calc.opening.toLocaleString()}</span>
                <span>${calc.depreciation.toLocaleString()}</span>
                <span>${calc.closing.toLocaleString()}</span>
            </div>
        `;
    });

    table.innerHTML = html;

    // Final stats
    document.getElementById('depFinalCost').textContent = `₹${asset.cost.toLocaleString()}`;
    document.getElementById('depFinalTotalDep').textContent = `₹${totalDep.toLocaleString()}`;
    document.getElementById('depFinalWDV').textContent = `₹${DepGame.currentWDV.toLocaleString()}`;

    // Bonus for all correct
    const allCorrect = DepGame.calculations.every(c => c.isCorrect);
    if (allCorrect) {
        addScore(100);
        showToast('🏆 Perfect Calculations!', '+100 Bonus Points!', 'xp');
    }

    // End game after delay
    setTimeout(() => {
        endGame(true);
    }, 4000);
}

// ============================================
// 🌐 EXPOSE FUNCTIONS
// ============================================

window.loadDepreciationGame = loadDepreciationGame;
window.selectDepMethod = selectDepMethod;
window.showDepHint = showDepHint;
window.submitDepAnswer = submitDepAnswer;
window.nextDepYear = nextDepYear;
window.showDepSummary = showDepSummary;

/* ================================================================
   🛠️ ACCOUNTS WIZARD - RECTIFICATION GLITCH FIXER GAME
   Part 6: Find & Fix Accounting Errors!
   "Galtiyan dhundho aur fix karo!" 🔧
================================================================ */

// ============================================
// 📚 RECTIFICATION ERRORS BANK (EXPANDED)
// ============================================

const RectificationErrors = [
    // ERROR OF OMISSION (5 more)
    {
        id: 1,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Transaction not recorded at all',
        situation: 'Goods worth ₹5,000 sold to Ramesh on credit was completely omitted from books.',
        amount: 5000,
        correctingEntry: {
            debit: 'Ramesh A/c',
            credit: 'Sales A/c',
            amount: 5000
        },
        options: [
            { debit: 'Ramesh A/c', credit: 'Sales A/c', amount: 5000, isCorrect: true },
            { debit: 'Sales A/c', credit: 'Ramesh A/c', amount: 5000, isCorrect: false },
            { debit: 'Cash A/c', credit: 'Sales A/c', amount: 5000, isCorrect: false },
            { debit: 'Ramesh A/c', credit: 'Purchase A/c', amount: 5000, isCorrect: false }
        ],
        explanation: 'Transaction miss ho gayi thi, ab original entry pass karo. Credit sale thi toh Ramesh (Debtor) Debit, Sales Credit.',
        hindiTip: 'Omission = Entry hi nahi hui. Ab normal entry karo jo honi chahiye thi!'
    },
    {
        id: 2,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Rent payment not recorded',
        situation: 'Rent paid ₹8,000 by cheque was not recorded in the books.',
        amount: 8000,
        correctingEntry: {
            debit: 'Rent A/c',
            credit: 'Bank A/c',
            amount: 8000
        },
        options: [
            { debit: 'Rent A/c', credit: 'Bank A/c', amount: 8000, isCorrect: true },
            { debit: 'Bank A/c', credit: 'Rent A/c', amount: 8000, isCorrect: false },
            { debit: 'Rent A/c', credit: 'Cash A/c', amount: 8000, isCorrect: false },
            { debit: 'Landlord A/c', credit: 'Bank A/c', amount: 8000, isCorrect: false }
        ],
        explanation: 'Rent expense miss ho gaya. Rent Debit (expense badha), Bank Credit (paisa gaya).',
        hindiTip: 'Expense pay kiya = Expense Debit, Cash/Bank Credit.'
    },
    {
        id: 16,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Cash purchase omitted',
        situation: 'Purchase of goods ₹12,000 for cash was completely omitted.',
        amount: 12000,
        correctingEntry: {
            debit: 'Purchase A/c',
            credit: 'Cash A/c',
            amount: 12000
        },
        options: [
            { debit: 'Purchase A/c', credit: 'Cash A/c', amount: 12000, isCorrect: true },
            { debit: 'Cash A/c', credit: 'Purchase A/c', amount: 12000, isCorrect: false },
            { debit: 'Purchase A/c', credit: 'Creditor A/c', amount: 12000, isCorrect: false },
            { debit: 'Stock A/c', credit: 'Cash A/c', amount: 12000, isCorrect: false }
        ],
        explanation: 'Cash purchase miss ho gaya. Purchase Debit (expense badha), Cash Credit (paisa gaya).',
        hindiTip: 'Cash purchase = Purchase Debit, Cash Credit.'
    },
    {
        id: 17,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Capital introduced not recorded',
        situation: 'Owner introduced additional capital ₹50,000 but not recorded.',
        amount: 50000,
        correctingEntry: {
            debit: 'Cash A/c',
            credit: 'Capital A/c',
            amount: 50000
        },
        options: [
            { debit: 'Cash A/c', credit: 'Capital A/c', amount: 50000, isCorrect: true },
            { debit: 'Capital A/c', credit: 'Cash A/c', amount: 50000, isCorrect: false },
            { debit: 'Cash A/c', credit: 'Loan A/c', amount: 50000, isCorrect: false },
            { debit: 'Bank A/c', credit: 'Capital A/c', amount: 50000, isCorrect: false }
        ],
        explanation: 'Capital introduced but not recorded. Cash Debit (paisa aaya), Capital Credit (owner ka hissa badha).',
        hindiTip: 'Capital introduction = Cash/Bank Debit, Capital Credit.'
    },
    {
        id: 18,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Drawings omitted',
        situation: 'Owner withdrew ₹10,000 for personal use but not recorded.',
        amount: 10000,
        correctingEntry: {
            debit: 'Drawings A/c',
            credit: 'Cash A/c',
            amount: 10000
        },
        options: [
            { debit: 'Drawings A/c', credit: 'Cash A/c', amount: 10000, isCorrect: true },
            { debit: 'Cash A/c', credit: 'Drawings A/c', amount: 10000, isCorrect: false },
            { debit: 'Drawings A/c', credit: 'Capital A/c', amount: 10000, isCorrect: false },
            { debit: 'Personal A/c', credit: 'Cash A/c', amount: 10000, isCorrect: false }
        ],
        explanation: 'Drawings miss ho gaye. Drawings Debit (capital kam hua), Cash Credit (paisa gaya).',
        hindiTip: 'Drawings = Drawings Debit, Cash/Bank Credit.'
    },
    {
        id: 19,
        type: 'omission',
        typeName: 'Error of Omission',
        typeEmoji: '🚫',
        originalEntry: null,
        wrongEntry: 'Commission earned omitted',
        situation: 'Commission earned ₹3,000 was not recorded in books.',
        amount: 3000,
        correctingEntry: {
            debit: 'Cash A/c',
            credit: 'Commission A/c',
            amount: 3000
        },
        options: [
            { debit: 'Cash A/c', credit: 'Commission A/c', amount: 3000, isCorrect: true },
            { debit: 'Commission A/c', credit: 'Cash A/c', amount: 3000, isCorrect: false },
            { debit: 'Bank A/c', credit: 'Commission A/c', amount: 3000, isCorrect: false },
            { debit: 'Commission A/c', credit: 'Income A/c', amount: 3000, isCorrect: false }
        ],
        explanation: 'Commission income miss ho gaya. Cash Debit (paisa aaya), Commission Credit (income badha).',
        hindiTip: 'Income omission = Cash/Bank Debit, Income Credit.'
    },

    // ERROR OF COMMISSION (5 more)
    {
        id: 3,
        type: 'commission',
        typeName: 'Error of Commission',
        typeEmoji: '🔄',
        originalEntry: 'Debited Mohan A/c ₹3,000',
        wrongEntry: 'Amount posted to wrong person (Sohan instead of Mohan)',
        situation: 'Goods sold to Mohan ₹3,000 was wrongly debited to Sohan A/c.',
        amount: 3000,
        correctingEntry: {
            debit: 'Mohan A/c',
            credit: 'Sohan A/c',
            amount: 3000
        },
        options: [
            { debit: 'Mohan A/c', credit: 'Sohan A/c', amount: 3000, isCorrect: true },
            { debit: 'Sohan A/c', credit: 'Mohan A/c', amount: 3000, isCorrect: false },
            { debit: 'Mohan A/c', credit: 'Sales A/c', amount: 3000, isCorrect: false },
            { debit: 'Sales A/c', credit: 'Sohan A/c', amount: 3000, isCorrect: false }
        ],
        explanation: 'Galat person ko debit kiya. Sohan ko credit karo (uska balance kam karo), Mohan ko debit karo (uska balance badao).',
        hindiTip: 'Wrong person → Right person. Credit wrong, Debit right!'
    },
    {
        id: 4,
        type: 'commission',
        typeName: 'Error of Commission',
        typeEmoji: '🔄',
        originalEntry: 'Credited Supplier A ₹7,000',
        wrongEntry: 'Posted to Supplier B instead of Supplier A',
        situation: 'Purchase from Supplier A ₹7,000 was wrongly credited to Supplier B.',
        amount: 7000,
        correctingEntry: {
            debit: 'Supplier B A/c',
            credit: 'Supplier A A/c',
            amount: 7000
        },
        options: [
            { debit: 'Supplier B A/c', credit: 'Supplier A A/c', amount: 7000, isCorrect: true },
            { debit: 'Supplier A A/c', credit: 'Supplier B A/c', amount: 7000, isCorrect: false },
            { debit: 'Purchase A/c', credit: 'Supplier A A/c', amount: 7000, isCorrect: false },
            { debit: 'Supplier B A/c', credit: 'Purchase A/c', amount: 7000, isCorrect: false }
        ],
        explanation: 'Wrong supplier ko credit mila. Supplier B Debit (reverse karo), Supplier A Credit (sahi jagah daalo).',
        hindiTip: 'Creditor galat hai? Galat wale ko Debit, Sahi wale ko Credit!'
    },
    {
        id: 20,
        type: 'commission',
        typeName: 'Error of Commission',
        typeEmoji: '🔄',
        originalEntry: 'Debited Furniture ₹25,000',
        wrongEntry: 'Wrongly debited to Machinery A/c',
        situation: 'Furniture purchased ₹25,000 was debited to Machinery A/c instead of Furniture A/c.',
        amount: 25000,
        correctingEntry: {
            debit: 'Furniture A/c',
            credit: 'Machinery A/c',
            amount: 25000
        },
        options: [
            { debit: 'Furniture A/c', credit: 'Machinery A/c', amount: 25000, isCorrect: true },
            { debit: 'Machinery A/c', credit: 'Furniture A/c', amount: 25000, isCorrect: false },
            { debit: 'Furniture A/c', credit: 'Cash A/c', amount: 25000, isCorrect: false },
            { debit: 'Machinery A/c', credit: 'Cash A/c', amount: 25000, isCorrect: false }
        ],
        explanation: 'Furniture ka amount Machinery mein daal diya. Furniture Debit (sahi asset), Machinery Credit (galat se nikalo).',
        hindiTip: 'Wrong asset account? Debit correct asset, Credit wrong asset.'
    },
    {
        id: 21,
        type: 'commission',
        typeName: 'Error of Commission',
        typeEmoji: '🔄',
        originalEntry: 'Credited Rent ₹15,000',
        wrongEntry: 'Wrongly credited to Salary A/c',
        situation: 'Rent received ₹15,000 was credited to Salary A/c instead of Rent A/c.',
        amount: 15000,
        correctingEntry: {
            debit: 'Salary A/c',
            credit: 'Rent A/c',
            amount: 15000
        },
        options: [
            { debit: 'Salary A/c', credit: 'Rent A/c', amount: 15000, isCorrect: true },
            { debit: 'Rent A/c', credit: 'Salary A/c', amount: 15000, isCorrect: false },
            { debit: 'Salary A/c', credit: 'Cash A/c', amount: 15000, isCorrect: false },
            { debit: 'Rent A/c', credit: 'Income A/c', amount: 15000, isCorrect: false }
        ],
        explanation: 'Rent income galat account mein credit hua. Salary Debit (wrong se nikalo), Rent Credit (sahi mein daalo).',
        hindiTip: 'Wrong income account? Debit wrong, Credit right income.'
    },
    {
        id: 22,
        type: 'commission',
        typeName: 'Error of Commission',
        typeEmoji: '🔄',
        originalEntry: 'Debited Telephone ₹2,500',
        wrongEntry: 'Wrongly debited to Electricity A/c',
        situation: 'Telephone bill ₹2,500 was debited to Electricity A/c.',
        amount: 2500,
        correctingEntry: {
            debit: 'Telephone A/c',
            credit: 'Electricity A/c',
            amount: 2500
        },
        options: [
            { debit: 'Telephone A/c', credit: 'Electricity A/c', amount: 2500, isCorrect: true },
            { debit: 'Electricity A/c', credit: 'Telephone A/c', amount: 2500, isCorrect: false },
            { debit: 'Telephone A/c', credit: 'Bank A/c', amount: 2500, isCorrect: false },
            { debit: 'Utilities A/c', credit: 'Electricity A/c', amount: 2500, isCorrect: false }
        ],
        explanation: 'Telephone expense Electricity mein daal diya. Telephone Debit (sahi expense), Electricity Credit (galat se nikalo).',
        hindiTip: 'Wrong expense account? Debit correct expense, Credit wrong expense.'
    },

    // ERROR OF PRINCIPLE (5 more)
    {
        id: 6,
        type: 'principle',
        typeName: 'Error of Principle',
        typeEmoji: '⚖️',
        originalEntry: 'Debited Repairs A/c ₹25,000',
        wrongEntry: 'Capital expenditure treated as Revenue expenditure',
        situation: 'New machinery purchased ₹25,000 was wrongly debited to Repairs A/c instead of Machinery A/c.',
        amount: 25000,
        correctingEntry: {
            debit: 'Machinery A/c',
            credit: 'Repairs A/c',
            amount: 25000
        },
        options: [
            { debit: 'Machinery A/c', credit: 'Repairs A/c', amount: 25000, isCorrect: true },
            { debit: 'Repairs A/c', credit: 'Machinery A/c', amount: 25000, isCorrect: false },
            { debit: 'Machinery A/c', credit: 'Cash A/c', amount: 25000, isCorrect: false },
            { debit: 'Machinery A/c', credit: 'Purchase A/c', amount: 25000, isCorrect: false }
        ],
        explanation: 'Asset ko expense mein daal diya - WRONG! Machinery Debit (sahi account), Repairs Credit (galat se nikalo).',
        hindiTip: 'Capital vs Revenue confusion? Asset ≠ Expense. Correct the account type!'
    },
    {
        id: 23,
        type: 'principle',
        typeName: 'Error of Principle',
        typeEmoji: '⚖️',
        originalEntry: 'Debited Stationery ₹8,000',
        wrongEntry: 'Purchase of printer treated as expense',
        situation: 'Printer purchased ₹8,000 for office was debited to Stationery A/c.',
        amount: 8000,
        correctingEntry: {
            debit: 'Office Equipment A/c',
            credit: 'Stationery A/c',
            amount: 8000
        },
        options: [
            { debit: 'Office Equipment A/c', credit: 'Stationery A/c', amount: 8000, isCorrect: true },
            { debit: 'Stationery A/c', credit: 'Office Equipment A/c', amount: 8000, isCorrect: false },
            { debit: 'Office Equipment A/c', credit: 'Cash A/c', amount: 8000, isCorrect: false },
            { debit: 'Assets A/c', credit: 'Stationery A/c', amount: 8000, isCorrect: false }
        ],
        explanation: 'Printer ek asset hai, stationery expense nahi. Office Equipment Debit, Stationery Credit.',
        hindiTip: 'Durable asset = Capital expenditure, not expense!'
    },
    {
        id: 24,
        type: 'principle',
        typeName: 'Error of Principle',
        typeEmoji: '⚖️',
        originalEntry: 'Credited Sales ₹12,000',
        wrongEntry: 'Sale of fixed asset treated as sales',
        situation: 'Old vehicle sold ₹12,000 was credited to Sales A/c instead of Vehicle A/c.',
        amount: 12000,
        correctingEntry: {
            debit: 'Sales A/c',
            credit: 'Vehicle A/c',
            amount: 12000
        },
        options: [
            { debit: 'Sales A/c', credit: 'Vehicle A/c', amount: 12000, isCorrect: true },
            { debit: 'Vehicle A/c', credit: 'Sales A/c', amount: 12000, isCorrect: false },
            { debit: 'Sales A/c', credit: 'Cash A/c', amount: 12000, isCorrect: false },
            { debit: 'Asset Sale A/c', credit: 'Vehicle A/c', amount: 12000, isCorrect: false }
        ],
        explanation: 'Asset sale normal sales nahi hai. Sales Debit (reverse), Vehicle Credit (asset value kam karo).',
        hindiTip: 'Asset sale ≠ Trading sale. Treat as asset disposal!'
    },
    {
        id: 25,
        type: 'principle',
        typeName: 'Error of Principle',
        typeEmoji: '⚖️',
        originalEntry: 'Debited Travel ₹5,000',
        wrongEntry: 'Business travel for asset installation treated as expense',
        situation: 'Travel expenses ₹5,000 for machinery installation was debited to Travel A/c.',
        amount: 5000,
        correctingEntry: {
            debit: 'Machinery A/c',
            credit: 'Travel A/c',
            amount: 5000
        },
        options: [
            { debit: 'Machinery A/c', credit: 'Travel A/c', amount: 5000, isCorrect: true },
            { debit: 'Travel A/c', credit: 'Machinery A/c', amount: 5000, isCorrect: false },
            { debit: 'Installation A/c', credit: 'Travel A/c', amount: 5000, isCorrect: false },
            { debit: 'Machinery A/c', credit: 'Cash A/c', amount: 5000, isCorrect: false }
        ],
        explanation: 'Asset installation ka travel cost asset ka part hai. Machinery Debit, Travel Credit.',
        hindiTip: 'Costs to make asset usable = Add to asset cost!'
    },
    {
        id: 26,
        type: 'principle',
        typeName: 'Error of Principle',
        typeEmoji: '⚖️',
        originalEntry: 'Debited Advertisement ₹50,000',
        wrongEntry: 'Brand development cost treated as expense',
        situation: 'Brand development cost ₹50,000 was debited to Advertisement A/c instead of Goodwill A/c.',
        amount: 50000,
        correctingEntry: {
            debit: 'Goodwill A/c',
            credit: 'Advertisement A/c',
            amount: 50000
        },
        options: [
            { debit: 'Goodwill A/c', credit: 'Advertisement A/c', amount: 50000, isCorrect: true },
            { debit: 'Advertisement A/c', credit: 'Goodwill A/c', amount: 50000, isCorrect: false },
            { debit: 'Goodwill A/c', credit: 'Cash A/c', amount: 50000, isCorrect: false },
            { debit: 'Brand A/c', credit: 'Advertisement A/c', amount: 50000, isCorrect: false }
        ],
        explanation: 'Brand development creates intangible asset. Goodwill Debit, Advertisement Credit.',
        hindiTip: 'Long-term brand value = Intangible asset!'
    },

    // ERROR OF POSTING (5 more)
    {
        id: 9,
        type: 'posting',
        typeName: 'Error of Posting',
        typeEmoji: '↔️',
        originalEntry: 'Cash received ₹6,000',
        wrongEntry: 'Posted to wrong side (Credit instead of Debit)',
        situation: 'Cash received ₹6,000 was wrongly credited to Cash A/c instead of being debited.',
        amount: 6000,
        correctingEntry: {
            debit: 'Cash A/c',
            credit: 'Suspense A/c',
            amount: 12000
        },
        options: [
            { debit: 'Cash A/c', credit: 'Suspense A/c', amount: 12000, isCorrect: true },
            { debit: 'Cash A/c', credit: 'Suspense A/c', amount: 6000, isCorrect: false },
            { debit: 'Suspense A/c', credit: 'Cash A/c', amount: 12000, isCorrect: false },
            { debit: 'Cash A/c', credit: 'Customer A/c', amount: 12000, isCorrect: false }
        ],
        explanation: 'Wrong side post hua! Credit kiya but Debit hona chahiye tha. DOUBLE amount lagega: 6000 (reverse) + 6000 (correct) = 12000.',
        hindiTip: 'Wrong side = Double amount! Ek reverse + ek correct karne ke liye.'
    },
    {
        id: 27,
        type: 'posting',
        typeName: 'Error of Posting',
        typeEmoji: '↔️',
        originalEntry: 'Purchase ₹15,000',
        wrongEntry: 'Posted to wrong side (Debit instead of Credit)',
        situation: 'Purchase from supplier ₹15,000 was debited to Supplier A/c instead of being credited.',
        amount: 15000,
        correctingEntry: {
            debit: 'Suspense A/c',
            credit: 'Supplier A/c',
            amount: 30000
        },
        options: [
            { debit: 'Suspense A/c', credit: 'Supplier A/c', amount: 30000, isCorrect: true },
            { debit: 'Supplier A/c', credit: 'Suspense A/c', amount: 30000, isCorrect: false },
            { debit: 'Suspense A/c', credit: 'Supplier A/c', amount: 15000, isCorrect: false },
            { debit: 'Purchase A/c', credit: 'Supplier A/c', amount: 30000, isCorrect: false }
        ],
        explanation: 'Supplier account ko debit kiya but credit hona chahiye tha. Double amount: 15000 (reverse) + 15000 (correct).',
        hindiTip: 'Creditor account always has credit balance. Wrong side = Double correction!'
    },
    {
        id: 28,
        type: 'posting',
        typeName: 'Error of Posting',
        typeEmoji: '↔️',
        originalEntry: 'Salary paid ₹25,000',
        wrongEntry: 'Debited twice in ledger',
        situation: 'Salary paid ₹25,000 was debited twice to Salary A/c in ledger.',
        amount: 25000,
        correctingEntry: {
            debit: 'Suspense A/c',
            credit: 'Salary A/c',
            amount: 25000
        },
        options: [
            { debit: 'Suspense A/c', credit: 'Salary A/c', amount: 25000, isCorrect: true },
            { debit: 'Salary A/c', credit: 'Suspense A/c', amount: 25000, isCorrect: false },
            { debit: 'Suspense A/c', credit: 'Cash A/c', amount: 25000, isCorrect: false },
            { debit: 'Salary A/c', credit: 'Bank A/c', amount: 25000, isCorrect: false }
        ],
        explanation: 'Ek baar extra debit ho gaya. Suspense Debit (balance karne ke liye), Salary Credit (extra debit reverse).',
        hindiTip: 'Double debit? Reverse the extra one!'
    },
    {
        id: 29,
        type: 'posting',
        typeName: 'Error of Posting',
        typeEmoji: '↔️',
        originalEntry: 'Interest received ₹3,000',
        wrongEntry: 'Credited to Interest Paid A/c',
        situation: 'Interest received ₹3,000 was wrongly credited to Interest Paid A/c.',
        amount: 3000,
        correctingEntry: {
            debit: 'Interest Paid A/c',
            credit: 'Interest Received A/c',
            amount: 3000
        },
        options: [
            { debit: 'Interest Paid A/c', credit: 'Interest Received A/c', amount: 3000, isCorrect: true },
            { debit: 'Interest Received A/c', credit: 'Interest Paid A/c', amount: 3000, isCorrect: false },
            { debit: 'Interest Paid A/c', credit: 'Cash A/c', amount: 3000, isCorrect: false },
            { debit: 'Interest A/c', credit: 'Interest Received A/c', amount: 3000, isCorrect: false }
        ],
        explanation: 'Interest received ko interest paid mein daal diya. Interest Paid Debit (reverse), Interest Received Credit (sahi jagah).',
        hindiTip: 'Received ≠ Paid! Received is income, Paid is expense.'
    },
    {
        id: 30,
        type: 'posting',
        typeName: 'Error of Posting',
        typeEmoji: '↔️',
        originalEntry: 'Discount allowed ₹2,000',
        wrongEntry: 'Debited to Discount Received A/c',
        situation: 'Discount allowed to customer ₹2,000 was debited to Discount Received A/c.',
        amount: 2000,
        correctingEntry: {
            debit: 'Discount Received A/c',
            credit: 'Discount Allowed A/c',
            amount: 2000
        },
        options: [
            { debit: 'Discount Received A/c', credit: 'Discount Allowed A/c', amount: 2000, isCorrect: true },
            { debit: 'Discount Allowed A/c', credit: 'Discount Received A/c', amount: 2000, isCorrect: false },
            { debit: 'Discount Received A/c', credit: 'Cash A/c', amount: 2000, isCorrect: false },
            { debit: 'Discount A/c', credit: 'Discount Allowed A/c', amount: 2000, isCorrect: false }
        ],
        explanation: 'Discount allowed (expense) ko discount received (income) mein daal diya. Discount Received Debit (reverse), Discount Allowed Credit (sahi jagah).',
        hindiTip: 'Allowed = Expense, Received = Income. Don\'t mix!'
    },

    // COMPENSATING ERROR (2 more)
    {
        id: 31,
        type: 'compensating',
        typeName: 'Compensating Error',
        typeEmoji: '🔁',
        originalEntry: 'Two errors cancelling each other',
        wrongEntry: 'Sales overcast ₹2,000, Purchase overcast ₹2,000',
        situation: 'Sales Book was overcast by ₹2,000 and Purchase Book was also overcast by ₹2,000.',
        amount: 2000,
        correctingEntry: {
            debit: 'Sales A/c',
            credit: 'Purchase A/c',
            amount: 2000
        },
        options: [
            { debit: 'Sales A/c', credit: 'Purchase A/c', amount: 2000, isCorrect: true },
            { debit: 'Purchase A/c', credit: 'Sales A/c', amount: 2000, isCorrect: false },
            { debit: 'Sales A/c', credit: 'Suspense A/c', amount: 2000, isCorrect: false },
            { debit: 'Purchase A/c', credit: 'Suspense A/c', amount: 2000, isCorrect: false }
        ],
        explanation: 'Dono overcast the. Sales zyada record hui toh Debit karo (kam karo). Purchase zyada record hui toh Credit karo (kam karo).',
        hindiTip: 'Overcast = Zyada likha. Reduce both by same amount!'
    },
    {
        id: 32,
        type: 'compensating',
        typeName: 'Compensating Error',
        typeEmoji: '🔁',
        originalEntry: 'Errors in Sales Returns and Purchase Returns',
        wrongEntry: 'Sales Returns undercast ₹1,500, Purchase Returns undercast ₹1,500',
        situation: 'Sales Returns Book was undercast by ₹1,500 and Purchase Returns Book was also undercast by ₹1,500.',
        amount: 1500,
        correctingEntry: {
            debit: 'Purchase Returns A/c',
            credit: 'Sales Returns A/c',
            amount: 1500
        },
        options: [
            { debit: 'Purchase Returns A/c', credit: 'Sales Returns A/c', amount: 1500, isCorrect: true },
            { debit: 'Sales Returns A/c', credit: 'Purchase Returns A/c', amount: 1500, isCorrect: false },
            { debit: 'Purchase Returns A/c', credit: 'Suspense A/c', amount: 1500, isCorrect: false },
            { debit: 'Sales Returns A/c', credit: 'Suspense A/c', amount: 1500, isCorrect: false }
        ],
        explanation: 'Dono returns undercast. Sales Returns kam record hui toh Credit karo (badao). Purchase Returns kam record hui toh Debit karo (badao).',
        hindiTip: 'Returns undercast? Increase both returns accounts!'
    },

    // TRANSPOSITION ERROR (3 more)
    {
        id: 33,
        type: 'transposition',
        typeName: 'Transposition Error',
        typeEmoji: '🔢',
        originalEntry: 'Amount ₹3,780',
        wrongEntry: 'Recorded as ₹3,870',
        situation: 'Rent paid ₹3,780 was recorded as ₹3,870 in Cash Book.',
        amount: 90,
        correctingEntry: {
            debit: 'Cash A/c',
            credit: 'Rent A/c',
            amount: 90
        },
        options: [
            { debit: 'Cash A/c', credit: 'Rent A/c', amount: 90, isCorrect: true },
            { debit: 'Rent A/c', credit: 'Cash A/c', amount: 90, isCorrect: false },
            { debit: 'Cash A/c', credit: 'Rent A/c', amount: 3780, isCorrect: false },
            { debit: 'Cash A/c', credit: 'Suspense A/c', amount: 90, isCorrect: false }
        ],
        explanation: '₹90 zyada record hua (3870-3780). Cash Debit (kam show hua toh badao), Rent Credit (zyada show hua toh kam karo).',
        hindiTip: 'Transposition error difference is divisible by 9! (90÷9=10)'
    },
    {
        id: 34,
        type: 'transposition',
        typeName: 'Transposition Error',
        typeEmoji: '🔢',
        originalEntry: 'Amount ₹6,540',
        wrongEntry: 'Recorded as ₹6,450',
        situation: 'Sales ₹6,540 was recorded as ₹6,450 in Sales Book.',
        amount: 90,
        correctingEntry: {
            debit: 'Sales A/c',
            credit: 'Debtor A/c',
            amount: 90
        },
        options: [
            { debit: 'Sales A/c', credit: 'Debtor A/c', amount: 90, isCorrect: true },
            { debit: 'Debtor A/c', credit: 'Sales A/c', amount: 90, isCorrect: false },
            { debit: 'Sales A/c', credit: 'Cash A/c', amount: 90, isCorrect: false },
            { debit: 'Debtor A/c', credit: 'Suspense A/c', amount: 90, isCorrect: false }
        ],
        explanation: '₹90 kam record hua (6540-6450). Sales Debit (kam show hui toh badao), Debtor Credit (kam show hua toh badao).',
        hindiTip: 'Undercast by transposition? Increase both affected accounts!'
    },
    {
        id: 35,
        type: 'transposition',
        typeName: 'Transposition Error',
        typeEmoji: '🔢',
        originalEntry: 'Amount ₹9,280',
        wrongEntry: 'Recorded as ₹9,820',
        situation: 'Purchase ₹9,280 was recorded as ₹9,820 in Purchase Book.',
        amount: 540,
        correctingEntry: {
            debit: 'Creditor A/c',
            credit: 'Purchase A/c',
            amount: 540
        },
        options: [
            { debit: 'Creditor A/c', credit: 'Purchase A/c', amount: 540, isCorrect: true },
            { debit: 'Purchase A/c', credit: 'Creditor A/c', amount: 540, isCorrect: false },
            { debit: 'Creditor A/c', credit: 'Cash A/c', amount: 540, isCorrect: false },
            { debit: 'Purchase A/c', credit: 'Suspense A/c', amount: 540, isCorrect: false }
        ],
        explanation: '₹540 zyada record hua (9820-9280). Purchase Credit (kam karo), Creditor Debit (kam karo).',
        hindiTip: '540÷9=60. Transposition errors always divisible by 9!'
    }
];

// ============================================
// 🎮 RECTIFICATION GAME STATE
// ============================================

const RectGame = {
    errors: [],
    currentIndex: 0,
    isComplete: false,
    answers: [],
    streak: 0
};

// ============================================
// 🎯 LOAD RECTIFICATION GAME
// ============================================

function loadRectificationGame() {
    // Reset state
    RectGame.errors = [];
    RectGame.currentIndex = 0;
    RectGame.isComplete = false;
    RectGame.answers = [];
    RectGame.streak = 0;

    // Select 8 random errors
    RectGame.errors = shuffleArray([...RectificationErrors]).slice(0, 8);
    Game.totalQuestions = RectGame.errors.length;

    // Render UI
    renderRectificationUI();
}

// ============================================
// 🖥️ RENDER RECTIFICATION UI
// ============================================

function renderRectificationUI() {
    const content = document.getElementById('gameContent');

    content.innerHTML = `
        <div class="rect-game-container">
            <!-- Header -->
            <div class="rect-header">
                <div class="rect-header-info">
                    <h3>🛠️ Glitch Fixer Mode</h3>
                    <p>Find the error and select the correct rectifying entry!</p>
                </div>
                <div class="rect-streak-display">
                    <span class="rect-streak-icon">🔥</span>
                    <span class="rect-streak-count" id="rectStreak">0</span>
                    <span class="rect-streak-label">Streak</span>
                </div>
            </div>

            <!-- Progress -->
            <div class="rect-progress">
                <span>Error: <strong id="rectCurrentNum">1</strong> / ${RectGame.errors.length}</span>
                <div class="progress-bar" style="flex: 1; margin-left: 15px;">
                    <div class="progress-fill progress-fill-green" id="rectProgressBar" style="width: 0%;"></div>
                </div>
            </div>

            <!-- Error Card -->
            <div class="rect-error-card" id="rectErrorCard">
                <div class="rect-error-header">
                    <span class="rect-error-type" id="rectErrorType">
                        <span class="rect-type-emoji">🚫</span>
                        <span class="rect-type-name">Error of Omission</span>
                    </span>
                    <span class="rect-error-num">Error #<span id="rectErrorNum">1</span></span>
                </div>

                <div class="rect-error-body">
                    <div class="rect-situation">
                        <h4>📋 Situation:</h4>
                        <p id="rectSituation">Loading...</p>
                    </div>

                    <div class="rect-wrong-entry">
                        <h4>❌ What went wrong:</h4>
                        <p id="rectWrongEntry">Loading...</p>
                    </div>

                    <div class="rect-amount">
                        <span>Amount Involved:</span>
                        <strong id="rectAmount">₹0</strong>
                    </div>
                </div>
            </div>

            <!-- Question -->
            <div class="rect-question">
                <h4>✏️ Select the correct RECTIFYING ENTRY:</h4>
            </div>

            <!-- Options -->
            <div class="rect-options" id="rectOptions">
                <!-- Filled by JS -->
            </div>

            <!-- Explanation -->
            <div class="rect-explanation" id="rectExplanation" style="display: none;">
                <div class="rect-exp-header">
                    <span class="rect-exp-icon" id="rectExpIcon">✅</span>
                    <span class="rect-exp-title" id="rectExpTitle">Correct!</span>
                </div>
                <div class="rect-correct-entry" id="rectCorrectEntry">
                    <h5>✅ Correct Entry:</h5>
                    <div class="rect-entry-display" id="rectEntryDisplay"></div>
                </div>
                <p class="rect-exp-text" id="rectExpText"></p>
                <p class="rect-exp-tip" id="rectExpTip"></p>
                <button class="btn btn-primary rect-next-btn" id="rectNextBtn" onclick="nextRectError()">
                    Next Error ➡️
                </button>
            </div>
        </div>
    `;

    // Add styles
    addRectificationStyles();

    // Load first error
    loadRectError();
}

// ============================================
// 🎨 ADD RECTIFICATION STYLES
// ============================================

function addRectificationStyles() {
    if (document.getElementById('rect-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'rect-styles';
    styles.textContent = `
        .rect-game-container {
            max-width: 850px;
            margin: 0 auto;
            padding: 20px;
        }

        .rect-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-card);
            border-radius: 15px;
            padding: 20px 25px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            flex-wrap: wrap;
            gap: 15px;
        }

        .rect-header-info h3 {
            font-family: var(--font-gaming);
            color: var(--neon-green);
            margin-bottom: 5px;
        }

        .rect-header-info p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .rect-streak-display {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 107, 53, 0.1);
            padding: 12px 25px;
            border-radius: 12px;
            border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .rect-streak-icon {
            font-size: 1.5rem;
        }

        .rect-streak-count {
            font-family: var(--font-gaming);
            font-size: 1.8rem;
            color: var(--neon-orange);
        }

        .rect-streak-label {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .rect-progress {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            font-family: var(--font-gaming);
            font-size: 0.9rem;
        }

        .rect-error-card {
            background: var(--bg-card);
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 25px;
            border: 2px solid rgba(255, 51, 102, 0.3);
        }

        .rect-error-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            background: rgba(255, 51, 102, 0.1);
            border-bottom: 1px solid rgba(255, 51, 102, 0.2);
        }

        .rect-error-type {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .rect-type-emoji {
            font-size: 1.5rem;
        }

        .rect-type-name {
            font-family: var(--font-gaming);
            font-size: 0.9rem;
            color: var(--neon-red);
        }

        .rect-error-num {
            font-size: 0.85rem;
            color: var(--text-muted);
            background: rgba(0,0,0,0.3);
            padding: 5px 15px;
            border-radius: 20px;
        }

        .rect-error-body {
            padding: 25px;
        }

        .rect-situation, .rect-wrong-entry {
            margin-bottom: 20px;
        }

        .rect-situation h4, .rect-wrong-entry h4 {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 10px;
        }

        .rect-situation p {
            font-size: 1.1rem;
            color: var(--text-primary);
            line-height: 1.7;
            background: rgba(0,0,0,0.2);
            padding: 15px 20px;
            border-radius: 12px;
            border-left: 3px solid var(--neon-purple);
        }

        .rect-wrong-entry p {
            font-size: 1rem;
            color: var(--neon-red);
            background: rgba(255, 51, 102, 0.1);
            padding: 12px 18px;
            border-radius: 10px;
        }

        .rect-amount {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 1rem;
        }

        .rect-amount span {
            color: var(--text-secondary);
        }

        .rect-amount strong {
            font-family: var(--font-gaming);
            font-size: 1.3rem;
            color: var(--neon-yellow);
            background: rgba(255, 215, 0, 0.1);
            padding: 8px 20px;
            border-radius: 10px;
        }

        .rect-question {
            text-align: center;
            margin-bottom: 20px;
        }

        .rect-question h4 {
            font-family: var(--font-gaming);
            font-size: 1rem;
            color: var(--neon-blue);
        }

        .rect-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 25px;
        }

        .rect-option {
            background: var(--bg-card);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .rect-option:hover {
            border-color: var(--neon-purple);
            transform: translateX(10px);
            box-shadow: 0 5px 20px rgba(168, 85, 247, 0.2);
        }

        .rect-option.selected {
            border-color: var(--neon-purple);
            background: rgba(168, 85, 247, 0.1);
        }

        .rect-option.correct {
            border-color: var(--neon-green);
            background: rgba(0, 255, 136, 0.1);
        }

        .rect-option.wrong {
            border-color: var(--neon-red);
            background: rgba(255, 51, 102, 0.1);
        }

        .rect-option.disabled {
            pointer-events: none;
            opacity: 0.6;
        }

        .rect-option-content {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .rect-option-letter {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-gaming);
            font-size: 1rem;
            color: var(--text-primary);
            flex-shrink: 0;
        }

        .rect-option.correct .rect-option-letter {
            background: var(--neon-green);
            color: #000;
        }

        .rect-option.wrong .rect-option-letter {
            background: var(--neon-red);
            color: white;
        }

        .rect-option-entry {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr auto 1fr auto;
            gap: 10px;
            align-items: center;
        }

        @media (max-width: 600px) {
            .rect-option-entry {
                grid-template-columns: 1fr;
                text-align: center;
            }
        }

        .rect-entry-account {
            font-size: 0.95rem;
            color: var(--text-primary);
        }

        .rect-entry-side {
            font-family: var(--font-gaming);
            font-size: 0.75rem;
            padding: 4px 12px;
            border-radius: 20px;
        }

        .rect-entry-side.debit {
            background: rgba(0, 212, 255, 0.2);
            color: var(--neon-blue);
        }

        .rect-entry-side.credit {
            background: rgba(0, 255, 136, 0.2);
            color: var(--neon-green);
        }

        .rect-entry-amount {
            font-family: var(--font-gaming);
            font-size: 0.95rem;
            color: var(--neon-yellow);
        }

        .rect-option-indicator {
            font-size: 1.5rem;
            margin-left: 10px;
        }

        .rect-explanation {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            animation: fadeIn 0.3s ease;
        }

        .rect-explanation.wrong {
            border-color: rgba(255, 51, 102, 0.3);
        }

        .rect-exp-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .rect-exp-icon {
            font-size: 2rem;
        }

        .rect-exp-title {
            font-family: var(--font-gaming);
            font-size: 1.3rem;
            color: var(--neon-green);
        }

        .rect-explanation.wrong .rect-exp-title {
            color: var(--neon-red);
        }

        .rect-correct-entry {
            background: rgba(0, 255, 136, 0.05);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 136, 0.2);
        }

        .rect-correct-entry h5 {
            color: var(--neon-green);
            margin-bottom: 15px;
            font-size: 0.9rem;
        }

        .rect-entry-display {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .rect-entry-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }

        .rect-entry-line.debit {
            border-left: 3px solid var(--neon-blue);
        }

        .rect-entry-line.credit {
            border-left: 3px solid var(--neon-green);
            padding-left: 30px;
        }

        .rect-exp-text {
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: 15px;
        }

        .rect-exp-tip {
            background: rgba(255, 215, 0, 0.1);
            padding: 15px 20px;
            border-radius: 12px;
            color: var(--neon-yellow);
            font-size: 0.95rem;
            margin-bottom: 20px;
        }

        .rect-exp-tip::before {
            content: '💡 Tip: ';
            font-weight: 600;
        }

        .rect-next-btn {
            width: 100%;
        }

        /* Streak Animation */
        @keyframes streakPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }

        .rect-streak-display.pulse {
            animation: streakPulse 0.5s ease;
        }

        .rect-streak-display.on-fire {
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 51, 102, 0.3));
            border-color: var(--neon-orange);
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
        }
    `;

    document.head.appendChild(styles);
}

// ============================================
// 🎯 LOAD RECTIFICATION ERROR
// ============================================

function loadRectError() {
    if (RectGame.currentIndex >= RectGame.errors.length) {
        completeRectGame();
        return;
    }

    const error = RectGame.errors[RectGame.currentIndex];

    // Update progress
    setText('rectCurrentNum', RectGame.currentIndex + 1);
    setText('rectErrorNum', RectGame.currentIndex + 1);
    const progress = (RectGame.currentIndex / RectGame.errors.length) * 100;
    document.getElementById('rectProgressBar').style.width = `${progress}%`;

    // Update error type
    document.getElementById('rectErrorType').innerHTML = `
        <span class="rect-type-emoji">${error.typeEmoji}</span>
        <span class="rect-type-name">${error.typeName}</span>
    `;

    // Update situation
    document.getElementById('rectSituation').textContent = error.situation;
    document.getElementById('rectWrongEntry').textContent = error.wrongEntry;
    document.getElementById('rectAmount').textContent = `₹${error.amount.toLocaleString()}`;

    // Generate options
    const optionsContainer = document.getElementById('rectOptions');
    const shuffledOptions = shuffleArray([...error.options]);
    const letters = ['A', 'B', 'C', 'D'];

    optionsContainer.innerHTML = shuffledOptions.map((opt, index) => `
        <div class="rect-option" data-index="${index}" data-correct="${opt.isCorrect}" onclick="selectRectOption(this)">
            <div class="rect-option-content">
                <span class="rect-option-letter">${letters[index]}</span>
                <div class="rect-option-entry">
                    <span class="rect-entry-account">${opt.debit}</span>
                    <span class="rect-entry-side debit">Dr.</span>
                    <span class="rect-entry-account">${opt.credit}</span>
                    <span class="rect-entry-side credit">Cr.</span>
                </div>
                <span class="rect-entry-amount">₹${opt.amount.toLocaleString()}</span>
                <span class="rect-option-indicator"></span>
            </div>
        </div>
    `).join('');

    // Hide explanation
    document.getElementById('rectExplanation').style.display = 'none';
}

// ============================================
// 🎯 SELECT RECTIFICATION OPTION
// ============================================

function selectRectOption(element) {
    const isCorrect = element.dataset.correct === 'true';
    const error = RectGame.errors[RectGame.currentIndex];

    // Disable all options
    document.querySelectorAll('.rect-option').forEach(opt => {
        opt.classList.add('disabled');
    });

    // Mark selected
    element.classList.add('selected');

    // Show correct/wrong
    if (isCorrect) {
        element.classList.add('correct');
        element.querySelector('.rect-option-indicator').textContent = '✅';
        
        RectGame.streak++;
        handleCorrect(20);
        updateRectStreak();
    } else {
        element.classList.add('wrong');
        element.querySelector('.rect-option-indicator').textContent = '❌';
        
        // Show correct answer
        document.querySelectorAll('.rect-option').forEach(opt => {
            if (opt.dataset.correct === 'true') {
                opt.classList.add('correct');
                opt.querySelector('.rect-option-indicator').textContent = '✅';
            }
        });

        RectGame.streak = 0;
        handleWrong();
        updateRectStreak();
    }

    // Save answer
    RectGame.answers.push({
        error: error,
        isCorrect: isCorrect
    });

    // Show explanation
    showRectExplanation(error, isCorrect);
}

// ============================================
// 🔥 UPDATE STREAK DISPLAY
// ============================================

function updateRectStreak() {
    const streakDisplay = document.querySelector('.rect-streak-display');
    const streakCount = document.getElementById('rectStreak');

    streakCount.textContent = RectGame.streak;

    // Pulse animation
    streakDisplay.classList.remove('pulse');
    void streakDisplay.offsetWidth; // Trigger reflow
    streakDisplay.classList.add('pulse');

    // On fire effect for 3+ streak
    if (RectGame.streak >= 3) {
        streakDisplay.classList.add('on-fire');
    } else {
        streakDisplay.classList.remove('on-fire');
    }

    // Toast for milestones
    if (RectGame.streak === 3) {
        showToast('🔥 3x Streak!', 'On fire! Keep going!', 'xp');
    } else if (RectGame.streak === 5) {
        showToast('🌟 5x Streak!', 'Mistake Killer! +50 Bonus!', 'achievement');
        addScore(50);
        unlockAchievement('mistake-killer');
    }
}

// ============================================
// 📖 SHOW RECTIFICATION EXPLANATION
// ============================================

function showRectExplanation(error, isCorrect) {
    const panel = document.getElementById('rectExplanation');
    const icon = document.getElementById('rectExpIcon');
    const title = document.getElementById('rectExpTitle');
    const entryDisplay = document.getElementById('rectEntryDisplay');
    const expText = document.getElementById('rectExpText');
    const expTip = document.getElementById('rectExpTip');

    panel.style.display = 'block';
    panel.className = `rect-explanation ${isCorrect ? '' : 'wrong'}`;

    if (isCorrect) {
        icon.textContent = '✅';
        title.textContent = 'Sahi Jawab! Excellent!';
    } else {
        icon.textContent = '❌';
        title.textContent = 'Galat! Correct entry dekho:';
    }

    // Show correct entry
    const correct = error.correctingEntry;
    entryDisplay.innerHTML = `
        <div class="rect-entry-line debit">
            <span>${correct.debit} A/c</span>
            <span style="color: var(--neon-blue); font-family: var(--font-gaming);">Dr. ₹${correct.amount.toLocaleString()}</span>
        </div>
        <div class="rect-entry-line credit">
            <span>To ${correct.credit} A/c</span>
            <span style="color: var(--neon-green); font-family: var(--font-gaming);">₹${correct.amount.toLocaleString()}</span>
        </div>
    `;

    expText.textContent = error.explanation;
    expTip.textContent = error.hindiTip;

    // Update button text
    const nextBtn = document.getElementById('rectNextBtn');
    if (RectGame.currentIndex >= RectGame.errors.length - 1) {
        nextBtn.textContent = 'View Results 📊';
    } else {
        nextBtn.textContent = 'Next Error ➡️';
    }
}

// ============================================
// ➡️ NEXT RECTIFICATION ERROR
// ============================================

function nextRectError() {
    RectGame.currentIndex++;

    if (RectGame.currentIndex >= RectGame.errors.length) {
        completeRectGame();
    } else {
        loadRectError();
    }
}

// ============================================
// 🏆 COMPLETE RECTIFICATION GAME
// ============================================

function completeRectGame() {
    RectGame.isComplete = true;

    // Calculate results
    const correct = RectGame.answers.filter(a => a.isCorrect).length;
    const total = RectGame.answers.length;
    const accuracy = Math.round((correct / total) * 100);

    // Bonus for high accuracy
    if (accuracy >= 80) {
        addScore(75);
        showToast('🏆 Great Accuracy!', `${accuracy}% correct! +75 Bonus!`, 'xp');
    }

    // End game
    setTimeout(() => {
        endGame(true);
    }, 1500);
}

// ============================================
// 🌐 EXPOSE FUNCTIONS
// ============================================

window.loadRectificationGame = loadRectificationGame;
window.selectRectOption = selectRectOption;
window.nextRectError = nextRectError;