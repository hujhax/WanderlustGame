const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    SKY_BLUE: '#30A0FF',
    LAND_BROWN: '#8B4513',
    SELECTION_YELLOW: '#FFFF00',
    TEXT_GREY: '#BBBBBB',
    HOUSE_RED: '#A52A2A',
    CAR_BLUE: '#00008B',
    SUNSET_ORANGE: '#FF4500',
    SUNSET_PURPLE: '#4B0082',
    GOLD: '#FFD700',
    ORANGE_GLOW: '#FFA500'
};

const PHASES = {
    INTRO: 'INTRO',
    TITLE: 'TITLE',
    CHOOSE_TRAVELLER: 'CHOOSE_TRAVELLER',
    PARTNER_ANNOUNCEMENT: 'PARTNER_ANNOUNCEMENT',
    DEPARTURE_CUTSCENE: 'DEPARTURE_CUTSCENE',
    MINIGAME_MAP: 'MINIGAME_MAP',
    MINIGAME_PLAY: 'MINIGAME_PLAY',
    MINIGAME_POST: 'MINIGAME_POST',
    CLOSING_CREDITS: 'CLOSING_CREDITS'
};

const CAST = [
    { name: 'Claire Biddiscombe', actor: 'Claire', imgPath: 'images/claire.png' },
    { name: 'Gilbert El-Dick', actor: 'Gilbert', imgPath: 'images/gilbert.png' },
    { name: 'Jason Summers', actor: 'Jason', imgPath: 'images/jason.png' },
    { name: 'Krystal Merrells', actor: 'Krystal', imgPath: 'images/krystal.png' },
    { name: 'Patrice Forbes', actor: 'Patrice', imgPath: 'images/patrice.png' },
    { name: 'Peter Rogers', actor: 'Peter', imgPath: 'images/peter.png' },
    { name: 'Sam Allen', actor: 'Sam', imgPath: 'images/sam.png' },
    { name: 'The Velvet Duke', actor: 'Velvet', imgPath: 'images/velvet.png' }
];

const PARTNER_PAIRS = {
    'Jason Summers': 'Peter Rogers', 'Peter Rogers': 'Jason Summers',
    'Patrice Forbes': 'Gilbert El-Dick', 'Gilbert El-Dick': 'Patrice Forbes',
    'The Velvet Duke': 'Claire Biddiscombe', 'Claire Biddiscombe': 'The Velvet Duke',
    'Sam Allen': 'Krystal Merrells', 'Krystal Merrells': 'Sam Allen'
};

// Preload images
CAST.forEach(c => {
    c.img = new Image();
    c.img.src = c.imgPath;
});
const canadaMapImg = new Image();
canadaMapImg.src = 'images/canada map.jpg';
const cloudImg = new Image();
cloudImg.src = 'images/cloud.png';

let currentPhase = PHASES.INTRO;
let selectedIndex = 0;
let score = 0;
let currentMinigameIndex = 0;
let minigameOrder = ['chicken', 'math', 'karaoke'];
minigameOrder.sort(() => Math.random() - 0.5);

// Debug override
const urlParams = new URLSearchParams(window.location.search);
const minigameOverride = urlParams.get('minigame');
if (minigameOverride) {
    minigameOrder = [minigameOverride];
    currentPhase = PHASES.MINIGAME_MAP;
}

let creditsY = canvas.height;
let creditsFinished = false;
let cutsceneStartTime = 0;
const CUTSCENE_DURATION = 6000;

// Dialog state
let currentDialog = null;
let dialogCallback = null;

function showDialog(character, actor, text, callback) {
    const castMember = CAST.find(c => c.actor === actor);
    currentDialog = {
        name: character,
        castMember: castMember,
        fullText: text,
        chunks: wrapText(text, 400),
        chunkIndex: 0
    };
    dialogCallback = callback;
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    ctx.font = '12px "Press Start 2P"';
    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine.trim());
    
    const chunks = [];
    for (let i = 0; i < lines.length; i += 3) {
        chunks.push(lines.slice(i, i + 3).join('\n'));
    }
    return chunks;
}

class AudioManager {
    constructor() {
        this.tracks = {
            CHICAGO: new Audio('music/chicago.mp3'),
            ZELDA_VICTORY: new Audio('music/zelda_victory.mp3'),
            BEST_FRIEND: new Audio('music/best_friend.mp3'),
            MOON: new Audio('music/moon.mp3'),
            CHICKEN_BGM: new Audio('music/chicken_bgm.mp3'),
            MATH_BGM: new Audio('music/math_bgm.mp3'),
            KARAOKE_BGM: new Audio('music/karaoke_bgm.mp3'),
            SUCCESS: new Audio('music/success.mp3'),
            FAILURE: new Audio('music/failure.mp3'),
            TADA: new Audio('music/tada.mp3'),
            SAD_TROMBONE: new Audio('music/sad_trombone.mp3')
        };
        for (let key in this.tracks) {
            this.tracks[key].loop = (key === 'CHICAGO' || key === 'BEST_FRIEND' || key === 'MOON' || key.endsWith('_BGM'));
        }
        this.currentTrack = null;
        this.audioCtx = null;
    }

    play(trackName, startTime = 0) {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
        this.currentTrack = this.tracks[trackName];
        if (this.currentTrack) {
            this.currentTrack.currentTime = startTime;
            this.currentTrack.play().catch(e => console.error("Audio playback failed:", e));
        }
    }

    playSFX(name) {
        const sfx = this.tracks[name];
        if (sfx && sfx.readyState >= 2) {
            sfx.currentTime = 0;
            sfx.play().catch(e => this.synthSFX(name));
        } else {
            this.synthSFX(name);
        }
    }

    synthSFX(name) {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;
        if (name === 'SUCCESS') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (name === 'FAILURE') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (name === 'TADA') {
            [440, 554, 659, 880].forEach((f, i) => {
                const o = this.audioCtx.createOscillator();
                o.connect(gain);
                o.frequency.setValueAtTime(f, now + i * 0.1);
                o.start(now + i * 0.1);
                o.stop(now + i * 0.1 + 0.2);
            });
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        } else if (name === 'SAD_TROMBONE') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(110, now + 1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
        }
    }

    stop() {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
            this.currentTrack = null;
        }
    }
}

const audio = new AudioManager();

// Input handling
window.addEventListener('mousedown', (e) => {
    if (currentPhase === PHASES.INTRO) {
        currentPhase = PHASES.TITLE;
        audio.play('CHICAGO', 12);
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Check 4x2 grid boxes
        for (let i = 0; i < 8; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const bx = 50 + col * 180;
            const by = 150 + row * 180;
            if (x > bx && x < bx + 150 && y > by && y < by + 150) {
                selectedIndex = i;
                selectTraveller();
            }
        }
    }
});

function selectTraveller() {
    currentPhase = PHASES.PARTNER_ANNOUNCEMENT;
    audio.play('ZELDA_VICTORY');
}

window.addEventListener('keydown', (e) => {
    if (currentDialog) {
        if (e.key === 'Enter') {
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback;
                currentDialog = null;
                dialogCallback = null;
                if (cb) cb();
            }
        }
        return;
    }

    if (currentPhase === PHASES.TITLE) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.CHOOSE_TRAVELLER;
            audio.play('BEST_FRIEND');
        }
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        if (e.key === 'ArrowRight') selectedIndex = (selectedIndex + 1) % 8;
        else if (e.key === 'ArrowLeft') selectedIndex = (selectedIndex - 1 + 8) % 8;
        else if (e.key === 'ArrowDown') selectedIndex = (selectedIndex + 4) % 8;
        else if (e.key === 'ArrowUp') selectedIndex = (selectedIndex - 4 + 8) % 8;
        else if (e.key === 'Enter') selectTraveller();
    } else if (currentPhase === PHASES.PARTNER_ANNOUNCEMENT) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.DEPARTURE_CUTSCENE;
            cutsceneStartTime = Date.now();
            audio.play('CHICAGO', 30);
        }
    } else if (currentPhase === PHASES.MINIGAME_MAP) {
        if (e.key === 'Enter') {
            startMinigame();
        }
    } else if (currentPhase === PHASES.MINIGAME_PLAY) {
        handleMinigameInput(e.key);
    } else if (currentPhase === PHASES.MINIGAME_POST) {
        if (e.key === 'Enter') {
            if (urlParams.get('minigame')) {
                currentPhase = PHASES.MINIGAME_MAP;
            } else {
                currentMinigameIndex++;
                if (currentMinigameIndex < 3) {
                    currentPhase = PHASES.MINIGAME_MAP;
                    audio.stop();
                } else {
                    currentPhase = PHASES.CLOSING_CREDITS;
                    creditsY = canvas.height;
                    creditsFinished = false;
                    audio.play('MOON');
                }
            }
        }
    } else if (currentPhase === PHASES.CLOSING_CREDITS) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.TITLE;
            currentMinigameIndex = 0;
            score = 0;
            audio.play('CHICAGO', 12);
        }
    }
});

// Minigame States
let minigameState = {};

function startMinigame() {
    const gameType = minigameOrder[currentMinigameIndex];
    minigameState = {
        type: gameType,
        successes: 0,
        failures: 0,
        startTime: Date.now(),
        entities: [],
        gameOver: false,
        won: false
    };
    
    if (gameType === 'chicken') {
        audio.play('CHICKEN_BGM');
        showDialog('Farmer Lucky', 'Jason', "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            minigameState.playerY = canvas.height * 0.7 - 50;
            minigameState.isJumping = false;
            minigameState.jumpVel = 0;
            for (let i = 0; i < 100; i++) {
                minigameState.entities.push({
                    type: 'chicken',
                    x: 800 + i * 250 + Math.random() * 100,
                    y: canvas.height * 0.7 - 30,
                    speed: 1 + Math.random() * 2
                });
                if (i % 4 === 0) {
                    minigameState.entities.push({
                        type: 'skull',
                        x: 1000 + i * 250 + Math.random() * 100,
                        y: canvas.height * 0.7 - 20
                    });
                }
            }
        });
    } else if (gameType === 'math') {
        audio.play('MATH_BGM');
        showDialog('Mr. Bergemot', 'Peter', "Well if it isn't our favorite former mathlete! Welcome back to your old school — wanna see if you've still got what it takes?", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            minigameState.difficulty = 1;
            minigameState.answer = "";
            generateMathQuestion();
        });
    } else if (gameType === 'karaoke') {
        audio.play('KARAOKE_BGM');
        showDialog('Lord Karaoke', 'Velvet', "It's Karaoke Night at Tappers! Sure, you can come up and sing, just make sure you hit all the notes on-key! Use the up and down buttons to adjust your pitch!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            minigameState.diamondPos = 3; // Start at G (2nd line from bottom)
            minigameState.notes = [];
            for (let i = 0; i < 60; i++) {
                minigameState.notes.push({
                    x: 800 + i * 180,
                    pitch: Math.floor(Math.random() * 11), // 0 to 10
                    color: 'red',
                    hit: false
                });
            }
        });
    }
}

function generateMathQuestion() {
    const d = minigameState.difficulty;
    let a, b, op;
    if (d === 1) { a = Math.floor(Math.random() * 10); b = Math.floor(Math.random() * 10); op = '+'; }
    else if (d === 2) { a = Math.floor(Math.random() * 90) + 10; b = Math.floor(Math.random() * 90) + 10; op = '+'; }
    else if (d === 3) { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10; op = '-'; }
    else if (d === 4) { a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * 20) + 5; op = 'x'; }
    else { a = Math.floor(Math.random() * 100) + 10; b = Math.floor(Math.random() * 10) + 2; op = 'x'; }
    
    minigameState.question = `${a} ${op} ${b} = ?`;
    minigameState.correctAnswer = (op === '+') ? (a + b) : (op === '-') ? (a - b) : (a * b);
    minigameState.timer = 10;
    minigameState.lastTimerUpdate = Date.now();
    minigameState.answer = "";
}

function handleMinigameInput(key) {
    if (minigameState.type === 'chicken') {
        if (key === 'Enter' && !minigameState.isJumping) {
            minigameState.isJumping = true;
            minigameState.jumpVel = -15;
        }
    } else if (minigameState.type === 'math') {
        if (key >= '0' && key <= '9') {
            minigameState.answer += key;
        } else if (key === 'Backspace') {
            minigameState.answer = minigameState.answer.slice(0, -1);
        } else if (key === 'Enter') {
            if (parseInt(minigameState.answer) === minigameState.correctAnswer) {
                success();
                minigameState.difficulty++;
            } else {
                failure();
                minigameState.difficulty = Math.max(1, minigameState.difficulty - 1);
            }
            if (!minigameState.gameOver) generateMathQuestion();
        }
    } else if (minigameState.type === 'karaoke') {
        if (key === 'ArrowUp') minigameState.diamondPos = Math.min(10, minigameState.diamondPos + 1);
        else if (key === 'ArrowDown') minigameState.diamondPos = Math.max(0, minigameState.diamondPos - 1);
    }
}

function success() {
    minigameState.successes++;
    score += 100;
    audio.playSFX('SUCCESS');
    if (minigameState.successes >= 4) {
        score += 1000;
        minigameState.gameOver = true;
        minigameState.won = true;
        audio.playSFX('TADA');
        endMinigame();
    }
}

function failure() {
    minigameState.failures++;
    audio.playSFX('FAILURE');
    if (minigameState.failures >= 3) {
        minigameState.gameOver = true;
        minigameState.won = false;
        audio.playSFX('SAD_TROMBONE');
        endMinigame();
    }
}

function endMinigame() {
    currentPhase = PHASES.MINIGAME_POST;
    let msg = "";
    let actor = "";
    let char = "";
    if (minigameState.type === 'chicken') {
        actor = 'Jason'; char = 'Farmer Lucky';
        msg = minigameState.won ? "Thanks for catching my chickens!" : "You have failed this farm. Never return here again.";
    } else if (minigameState.type === 'math') {
        actor = 'Peter'; char = 'Mr. Bergemot';
        msg = minigameState.won ? "Wow! You're still a top-tier mathlete!" : "That's too bad. *sigh* Really I blame myself.";
    } else if (minigameState.type === 'karaoke') {
        actor = 'Velvet'; char = 'Lord Karaoke';
        msg = minigameState.won ? "Killer performance! Your next round of drinks is on me!" : "You have failed karaoke night. Leave here, and take your dishonor with you.";
    }
    showDialog(char, actor, msg, null);
}

function gameLoop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentPhase) {
        case PHASES.INTRO: drawIntro(); break;
        case PHASES.TITLE: drawTitle(); break;
        case PHASES.CHOOSE_TRAVELLER: drawTravellerSelect(); break;
        case PHASES.PARTNER_ANNOUNCEMENT: drawPartnerAnnouncement(); break;
        case PHASES.DEPARTURE_CUTSCENE: 
            drawDepartureCutscene();
            if (Date.now() - cutsceneStartTime > CUTSCENE_DURATION) {
                currentPhase = PHASES.MINIGAME_MAP;
                audio.stop();
            }
            break;
        case PHASES.MINIGAME_MAP: drawMinigameMap(); break;
        case PHASES.MINIGAME_PLAY: drawMinigamePlay(); break;
        case PHASES.MINIGAME_POST: drawMinigamePost(); break;
        case PHASES.CLOSING_CREDITS: drawCredits(); break;
    }

    if (currentDialog) drawDialogBox();

    requestAnimationFrame(gameLoop);
}

function drawPixelatedImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawDialogBox() {
    const boxY = canvas.height - 200;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(50, boxY, 700, 150);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, boxY, 700, 150);

    // Cast image
    if (currentDialog.castMember && currentDialog.castMember.img.complete) {
        const img = currentDialog.castMember.img;
        const size = Math.min(img.width, img.height);
        const ox = (img.width - size) / 2;
        const oy = (img.height - size) / 2;
        drawPixelatedImage(img, ox, oy, size, size, 70, boxY + 10, 100, 100);
    }
    
    // Character name centered and wrapped below square
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    
    const nameWords = currentDialog.name.split(' ');
    const nameLines = [];
    let currentNameLine = '';
    const maxNameWidth = 100;
    nameWords.forEach(word => {
        const testLine = currentNameLine + word + ' ';
        if (ctx.measureText(testLine).width > maxNameWidth) {
            nameLines.push(currentNameLine.trim());
            currentNameLine = word + ' ';
        } else {
            currentNameLine = testLine;
        }
    });
    nameLines.push(currentNameLine.trim());
    
    nameLines.forEach((line, i) => {
        ctx.fillText(line, 120, boxY + 125 + i * 15);
    });

    // Text
    ctx.textAlign = 'left';
    ctx.font = '12px "Press Start 2P"';
    const lines = currentDialog.chunks[currentDialog.chunkIndex].split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, 200, boxY + 40 + i * 30);
    });

    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Continue', 400, boxY + 175);
    }
}

function drawIntro() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
}

function drawTitle() {
    const time = Date.now() * 0.001;
    // Sunset sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    gradient.addColorStop(0, COLORS.SUNSET_PURPLE);
    gradient.addColorStop(1, COLORS.SUNSET_ORANGE);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Clouds
    for (let i = 0; i < 4; i++) {
        const cx = (i * 250 + time * 20) % (canvas.width + 100) - 50;
        const cy = 80 + Math.sin(time + i) * 15;
        if (cloudImg.complete) {
            drawPixelatedImage(cloudImg, 0, 0, cloudImg.width, cloudImg.height, cx, cy, 100, 60);
        }
    }

    // Parallax trees
    ctx.fillStyle = '#1a471a';
    for (let i = 0; i < 8; i++) {
        const tx = (i * 150 - time * 40) % (canvas.width + 100);
        const realTx = tx < -50 ? tx + canvas.width + 100 : tx;
        const ty = canvas.height * 0.6;
        ctx.beginPath();
        ctx.moveTo(realTx, ty);
        ctx.lineTo(realTx + 20, ty - 40);
        ctx.lineTo(realTx + 40, ty);
        ctx.fill();
    }

    // Highway
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, 100);
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(0, canvas.height * 0.6 + 100, canvas.width, canvas.height * 0.4 - 100);

    // Highway lines
    ctx.fillStyle = '#FFF';
    const lineOffset = (time * 150) % 60;
    for (let i = canvas.width; i > -60; i -= 60) {
        ctx.fillRect(i - lineOffset, canvas.height * 0.6 + 45, 30, 10);
    }

    // Centered Car
    const carX = canvas.width / 2 - 60;
    const carY = canvas.height * 0.6 + 20 + Math.sin(time * 15) * 2;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(carX, carY, 120, 40);
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(carX, carY - 15, 80, 15);
    ctx.fillStyle = '#000';
    ctx.fillRect(carX + 15, carY + 35, 20, 10);
    ctx.fillRect(carX + 85, carY + 35, 20, 10);

    // WANDERLUST title with faint drop shadow
    ctx.textAlign = 'center';
    ctx.font = '40px "Press Start 2P"';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('WANDERLUST', canvas.width / 2 + 4, 154);
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText('WANDERLUST', canvas.width / 2, 150);

    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height - 50);
    }
}

function drawTravellerSelect() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('CHOOSE YOUR TRAVELER', canvas.width / 2, 80);

    CAST.forEach((c, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 50 + col * 180;
        const y = 150 + row * 180;

        ctx.strokeStyle = (i === selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 150, 150);

        if (c.img.complete) {
            const size = Math.min(c.img.width, c.img.height);
            const ox = (c.img.width - size) / 2;
            const oy = (c.img.height - size) / 2;
            drawPixelatedImage(c.img, ox, oy, size, size, x + 10, y + 10, 130, 130);
        }
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(c.actor, x + 75, y + 165);
    });
}

function drawPartnerAnnouncement() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';

    const playerChar = CAST[selectedIndex].name;
    const partnerFullName = PARTNER_PAIRS[playerChar];
    let partnerFirstName = partnerFullName.split(' ')[0];
    if (partnerFullName === 'The Velvet Duke') partnerFirstName = 'Velvet';
    const partner = CAST.find(c => c.name === partnerFullName);

    ctx.fillText('Your traveling companion is...', canvas.width / 2, 100);
    ctx.font = '30px "Press Start 2P"';
    ctx.fillText(partnerFirstName + "!", canvas.width / 2, 160);

    const boxSize = 250;
    const bx = canvas.width / 2 - boxSize / 2;
    const by = 220;
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, boxSize, boxSize);

    if (partner && partner.img.complete) {
        const size = Math.min(partner.img.width, partner.img.height);
        const ox = (partner.img.width - size) / 2;
        const oy = (partner.img.height - size) / 2;
        drawPixelatedImage(partner.img, ox, oy, size, size, bx + 10, by + 10, boxSize - 20, boxSize - 20);
    }

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height - 50);
    }
}

function drawDepartureCutscene() {
    const elapsed = Date.now() - cutsceneStartTime;
    const progress = elapsed / CUTSCENE_DURATION;
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.LAND_BROWN;
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

    ctx.fillStyle = COLORS.HOUSE_RED;
    ctx.fillRect(100, canvas.height * 0.4, 200, 180);
    ctx.beginPath();
    ctx.moveTo(80, canvas.height * 0.4);
    ctx.lineTo(320, canvas.height * 0.4);
    ctx.lineTo(200, canvas.height * 0.25);
    ctx.fillStyle = '#555';
    ctx.fill();

    for (let i = 0; i < 5; i++) {
        const px = 150 + i * 30;
        const py = canvas.height * 0.7 - 40;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(px, py, 15, 30);
        ctx.fillRect(px, py - 15, 15, 15);
        const wave = Math.sin(Date.now() * 0.01) * 10;
        ctx.fillRect(px + 15, py + wave, 10, 5);
    }

    const carX = 350 + progress * canvas.width;
    const carY = canvas.height * 0.7 - 40;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(carX, carY, 80, 40);
}

function drawMinigameMap() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`Stop #${currentMinigameIndex + 1}`, canvas.width / 2, 80);
    
    const gameType = minigameOrder[currentMinigameIndex];
    ctx.font = '30px "Press Start 2P"';
    const titles = { chicken: 'CATCH THE CHICKEN', math: 'MATHEMAGIC!', karaoke: 'KARAOKE NIGHT' };
    ctx.fillText(titles[gameType], canvas.width / 2, 140);

    // Draw Canada Map Image
    if (canadaMapImg.complete) {
        ctx.imageSmoothingEnabled = false;
        const imgWidth = 500;
        const imgHeight = 300;
        const ix = (canvas.width - imgWidth) / 2;
        const iy = 200;
        ctx.drawImage(canadaMapImg, ix, iy, imgWidth, imgHeight);
        
        // Ottawa to Vancouver wiggly dotted line relative to image
        const ox = ix + imgWidth * 0.85;
        const oy = iy + imgHeight * 0.75;
        const vx = ix + imgWidth * 0.15;
        const vy = iy + imgHeight * 0.45;

        // Orange dotted line with glow
        ctx.save();
        ctx.strokeStyle = COLORS.SUNSET_ORANGE;
        ctx.lineWidth = 4;
        ctx.shadowColor = COLORS.ORANGE_GLOW;
        ctx.shadowBlur = 10;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.bezierCurveTo(ix + imgWidth * 0.6, iy + imgHeight * 0.3, ix + imgWidth * 0.4, iy + imgHeight * 0.3, vx, vy);
        ctx.stroke();
        ctx.restore();

        // X position calculation along the path
        const xPos = [0.25, 0.5, 0.75][currentMinigameIndex];
        const tx = ox + (vx - ox) * xPos;
        const ty = oy + (vy - oy) * xPos - Math.sin(xPos * Math.PI) * 40;
        ctx.fillStyle = COLORS.RED;
        ctx.font = '30px "Press Start 2P"';
        ctx.fillText('X', tx, ty);
    } else {
        // Fallback placeholder
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(150, 200, 500, 300);
    }

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText('Press Enter to Continue', canvas.width / 2, 550);
    }
}

function drawMinigamePlay() {
    const gameType = minigameOrder[currentMinigameIndex];
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
    
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(200 + i * 30, 25, 10, 0, Math.PI * 2);
        if (i < minigameState.successes) { ctx.fillStyle = COLORS.GREEN; ctx.fill(); }
        else { ctx.strokeStyle = COLORS.GREEN; ctx.stroke(); }
    }

    for (let i = 0; i < 3; i++) {
        const fx = 400 + i * 30;
        if (i < minigameState.failures) { ctx.fillStyle = COLORS.RED; ctx.fillRect(fx, 15, 20, 20); }
        else { ctx.strokeStyle = COLORS.RED; ctx.strokeRect(fx, 15, 20, 20); }
    }

    if (gameType === 'chicken') drawChickenGame();
    else if (gameType === 'math') drawMathGame();
    else if (gameType === 'karaoke') drawKaraokeGame();
}

function drawChickenGame() {
    const state = minigameState;
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, 100);

    if (state.isJumping) {
        state.playerY += state.jumpVel;
        state.jumpVel += 0.8;
        if (state.playerY >= canvas.height * 0.7 - 50) {
            state.playerY = canvas.height * 0.7 - 50;
            state.isJumping = false;
        }
    }

    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(50, state.playerY, 20, 40);
    ctx.fillRect(50, state.playerY - 15, 20, 15);

    state.entities.forEach(ent => {
        ent.x -= 5;
        if (ent.type === 'chicken') {
            ent.x += ent.speed;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(ent.x, ent.y, 20, 20);
            ctx.fillStyle = COLORS.RED;
            ctx.fillRect(ent.x + 15, ent.y + 2, 5, 5);
        } else {
            ctx.fillStyle = '#eee';
            ctx.fillRect(ent.x, ent.y, 25, 15);
        }

        if (Math.abs(ent.x - 50) < 30 && Math.abs(ent.y - state.playerY) < 40) {
            if (ent.type === 'chicken') success();
            else failure();
            ent.x = -1000;
        }
    });
}

function drawMathGame() {
    ctx.fillStyle = '#004400';
    ctx.fillRect(50, 100, 700, 400);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 100, 700, 400);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '30px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(minigameState.question, 400, 250);
    ctx.fillText(minigameState.answer + "_", 400, 350);

    const elapsed = Date.now() - minigameState.lastTimerUpdate;
    if (elapsed > 1000) {
        minigameState.timer--;
        minigameState.lastTimerUpdate = Date.now();
        if (minigameState.timer <= 0) {
            failure();
            generateMathQuestion();
        }
    }
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`Time: ${minigameState.timer}`, 400, 450);
}

function drawKaraokeGame() {
    const state = minigameState;
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 50, canvas.width, canvas.height - 50);

    // Staff - 5 lines
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 2;
    const staffTop = 250;
    const lineSpacing = 40;
    for (let i = 0; i < 5; i++) {
        const y = staffTop + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(750, y);
        ctx.stroke();
    }

    // getY mapping: 0=below bottom line, 1=bottom line, ..., 9=top line, 10=above top line
    const getY = (p) => staffTop + (9 - p) * 0.5 * lineSpacing;

    // Golden Diamond
    ctx.fillStyle = COLORS.GOLD;
    const dy = getY(state.diamondPos);
    ctx.beginPath();
    ctx.moveTo(100, dy - 15);
    ctx.lineTo(115, dy);
    ctx.lineTo(100, dy + 15);
    ctx.lineTo(85, dy);
    ctx.fill();

    state.notes.forEach(note => {
        note.x -= 4;
        if (note.x < 100 && note.color === 'red') note.color = 'white';
        
        ctx.fillStyle = note.color;
        ctx.beginPath();
        ctx.arc(note.x, getY(note.pitch), 12, 0, Math.PI * 2);
        ctx.fill();

        if (Math.abs(note.x - 100) < 20 && !note.hit) {
            if (note.pitch === state.diamondPos) {
                success();
                note.hit = true;
                note.color = COLORS.GREEN;
            }
        }
        if (note.x < 50 && !note.hit) {
            failure();
            note.hit = true;
        }
    });
}

function drawMinigamePost() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(minigameState.won ? "Great job!" : "Too bad!", canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 150);
    }
}

function drawCredits() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const CREDITS_TEXT = [
        "Wanderlust", "",
        "Director & Tech", "Lindsey McGowen", "",
        "Assistant Director & Understudy", "Leichelle Little", "",
        "Cast",
        "Claire Biddiscombe", "Gilbert El-Dick", "Jason Summers",
        "Krystal Merrells", "Patrice Forbes", "Peter Rogers",
        "Sam Allen", "The Velvet Duke", "",
        "Presented By", "Wayward Improvised Theatre &", "Videogaming Concern"
    ];

    ctx.fillStyle = COLORS.WHITE;
    ctx.textAlign = 'center';
    ctx.font = '18px "Press Start 2P"';

    CREDITS_TEXT.forEach((line, i) => {
        const y = creditsY + i * 40;
        if (y > -40 && y < canvas.height + 40) {
            ctx.fillText(line, canvas.width / 2, y);
        }
    });

    if (!creditsFinished) {
        creditsY -= 2;
        if (creditsY < -(CREDITS_TEXT.length * 40)) {
            creditsFinished = true;
        }
    } else {
        ctx.fillText('Click Enter to Replay', canvas.width / 2, canvas.height / 2);
    }
}

requestAnimationFrame(gameLoop);
