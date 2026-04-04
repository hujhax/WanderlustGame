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
    CAR_BLUE: '#00008B'
};

const PHASES = {
    INTRO: 'INTRO',
    TITLE: 'TITLE',
    CHOOSE_TRAVELLER: 'CHOOSE_TRAVELLER',
    PARTNER_ANNOUNCEMENT: 'PARTNER_ANNOUNCEMENT',
    DEPARTURE_CUTSCENE: 'DEPARTURE_CUTSCENE',
    CLOSING_CREDITS: 'CLOSING_CREDITS'
};

const TRAVELLERS = [
    { name: 'Krystal', imgPath: 'images/krystal.jpg' },
    { name: 'Patrice', imgPath: 'images/patrice.jpg' },
    { name: 'Peter', imgPath: 'images/peter.png' },
    { name: 'Velvet', imgPath: 'images/velvet.jpg' },
    { name: 'Jason', imgPath: 'images/jason.jpg' },
    { name: 'Sam', imgPath: 'images/sam.jpg' },
    { name: 'Claire', imgPath: 'images/claire.jpg' },
    { name: 'Gilbert', imgPath: 'images/gilbert.jpg' }
];

const PARTNER_PAIRS = {
    'Jason': 'Peter', 'Peter': 'Jason',
    'Patrice': 'Gilbert', 'Gilbert': 'Patrice',
    'Velvet': 'Claire', 'Claire': 'Velvet',
    'Sam': 'Krystal', 'Krystal': 'Sam'
};

// Preload images
TRAVELLERS.forEach(t => {
    t.img = new Image();
    t.img.src = t.imgPath;
});

let currentPhase = PHASES.INTRO;
let selectedIndex = 0;
let creditsY = canvas.height;
let creditsFinished = false;
let cutsceneStartTime = 0;
let partnerAnnouncementStartTime = 0;
const CUTSCENE_DURATION = 6000; // 6 seconds

// Audio Management
class AudioManager {
    constructor() {
        this.tracks = {
            CHICAGO: new Audio('music/chicago.mp3'),
            ZELDA_VICTORY: new Audio('music/zelda_victory.mp3'),
            MK2: new Audio('music/mk2.mp3'),
            MOON: new Audio('music/moon.mp3')
        };
        // Set all to loop (except Zelda victory)
        for (let key in this.tracks) {
            this.tracks[key].loop = (key !== 'ZELDA_VICTORY');
        }
        this.currentTrack = null;
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

    stop() {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
    }
}

const audio = new AudioManager();

// Input handling
window.addEventListener('mousedown', (e) => {
    if (currentPhase === PHASES.INTRO) {
        currentPhase = PHASES.TITLE;
        audio.play('CHICAGO', 12);
    }
});

window.addEventListener('keydown', (e) => {
    if (currentPhase === PHASES.TITLE) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.CHOOSE_TRAVELLER;
            audio.play('MK2');
        }
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        if (e.key === 'ArrowRight') {
            selectedIndex = (selectedIndex + 1) % TRAVELLERS.length;
        } else if (e.key === 'ArrowLeft') {
            selectedIndex = (selectedIndex - 1 + TRAVELLERS.length) % TRAVELLERS.length;
        } else if (e.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 4) % TRAVELLERS.length;
        } else if (e.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 4 + TRAVELLERS.length) % TRAVELLERS.length;
        } else if (e.key === 'Enter') {
            currentPhase = PHASES.PARTNER_ANNOUNCEMENT;
            partnerAnnouncementStartTime = Date.now();
            audio.play('ZELDA_VICTORY');
        }
    } else if (currentPhase === PHASES.PARTNER_ANNOUNCEMENT) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.DEPARTURE_CUTSCENE;
            cutsceneStartTime = Date.now();
            audio.play('CHICAGO', 30);
        }
    } else if (currentPhase === PHASES.CLOSING_CREDITS) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.TITLE;
            creditsY = canvas.height;
            creditsFinished = false;
            audio.play('CHICAGO', 12);
        }
    }
});

function gameLoop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentPhase) {
        case PHASES.INTRO:
            drawIntro();
            break;
        case PHASES.TITLE:
            drawTitle();
            break;
        case PHASES.CHOOSE_TRAVELLER:
            drawTravellerSelect();
            break;
        case PHASES.PARTNER_ANNOUNCEMENT:
            drawPartnerAnnouncement();
            break;
        case PHASES.DEPARTURE_CUTSCENE:
            drawDepartureCutscene();
            if (Date.now() - cutsceneStartTime > CUTSCENE_DURATION) {
                currentPhase = PHASES.CLOSING_CREDITS;
                creditsY = canvas.height;
                creditsFinished = false;
                audio.play('MOON');
            }
            break;
        case PHASES.CLOSING_CREDITS:
            drawCredits();
            break;
    }

    requestAnimationFrame(gameLoop);
}

// Phase Drawing Functions
function drawIntro() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
}

function drawTitle() {
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    // Clouds
    ctx.fillStyle = COLORS.WHITE;
    for (let i = 0; i < 4; i++) {
        const cx = (i * 250 + time * 20) % (canvas.width + 100) - 50;
        const cy = 80 + Math.sin(time + i) * 15;
        ctx.fillRect(cx, cy, 60, 20);
        ctx.fillRect(cx + 10, cy - 10, 40, 10);
    }

    // Far background trees (parallax)
    ctx.fillStyle = '#228B22'; // Forest Green
    for (let i = 0; i < 8; i++) {
        const tx = (i * 150 - time * 40) % (canvas.width + 100);
        const realTx = tx < -50 ? tx + canvas.width + 100 : tx;
        const ty = canvas.height * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(realTx, ty);
        ctx.lineTo(realTx + 30, ty - 60);
        ctx.lineTo(realTx + 60, ty);
        ctx.fill();
    }

    // Highway
    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, 100);
    ctx.fillStyle = COLORS.LAND_BROWN;
    ctx.fillRect(0, canvas.height * 0.6 + 100, canvas.width, canvas.height * 0.4 - 100);

    // Highway lines (moving)
    ctx.fillStyle = '#FFF';
    const lineOffset = (time * 150) % 60;
    for (let i = canvas.width; i > -60; i -= 60) {
        ctx.fillRect(i - lineOffset, canvas.height * 0.6 + 45, 30, 10);
    }

    // Station Wagon - Centered
    const carX = canvas.width / 2 - 60;
    const carY = canvas.height * 0.6 + 20 + Math.sin(time * 10) * 2; // Slight bounce
    
    // Car body (wood paneled station wagon style)
    ctx.fillStyle = '#8B4513'; // Wood panel
    ctx.fillRect(carX, carY, 120, 40);
    ctx.fillStyle = '#DAA520'; // Top/trim
    ctx.fillRect(carX, carY - 20, 80, 20);
    
    // Windows
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(carX + 10, carY - 15, 30, 15);
    ctx.fillRect(carX + 45, carY - 15, 25, 15);

    // Wheels (spinning effect)
    ctx.fillStyle = '#000';
    ctx.fillRect(carX + 15, carY + 35, 20, 10);
    ctx.fillRect(carX + 85, carY + 35, 20, 10);
    ctx.fillStyle = '#444';
    if (Math.floor(time * 20) % 2 === 0) {
        ctx.fillRect(carX + 18, carY + 35, 5, 10);
        ctx.fillRect(carX + 88, carY + 35, 5, 10);
    }

    // Logo Text
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText('WANDERLUST', canvas.width / 2, 100);
    ctx.shadowBlur = 0;

    // Press Enter to Start (flashing)
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height - 50);
    }
}

function drawPartnerAnnouncement() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';

    const playerChar = TRAVELLERS[selectedIndex].name;
    const partnerName = PARTNER_PAIRS[playerChar];
    const partner = TRAVELLERS.find(t => t.name === partnerName);

    ctx.fillText('Your traveling companion is... ', canvas.width / 2, 100);
    
    ctx.font = '30px "Press Start 2P"';
    ctx.fillText(partnerName + "!", canvas.width / 2, 160);

    // Large Box with headshot
    const boxSize = 250;
    const bx = canvas.width / 2 - boxSize / 2;
    const by = 220;

    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, boxSize, boxSize);

    if (partner && partner.img.complete) {
        ctx.imageSmoothingEnabled = false;
        const size = Math.min(partner.img.width, partner.img.height);
        const sx = (partner.img.width - size) / 2;
        const sy = (partner.img.height - size) / 2;
        ctx.drawImage(partner.img, sx, sy, size, size, bx + 10, by + 10, boxSize - 20, boxSize - 20);
    }

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height - 50);
    }
}


function drawTravellerSelect() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('CHOOSE YOUR TRAVELER', canvas.width / 2, 80);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 40;
    const radius = 180;

    TRAVELLERS.forEach((t, i) => {
        const angle = (i / TRAVELLERS.length) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius - 50;
        const y = centerY + Math.sin(angle) * radius - 50;

        // Box
        ctx.strokeStyle = (i === selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 100, 100);

        // Draw character image
        if (t.img.complete) {
            ctx.imageSmoothingEnabled = false;
            // Crop to center square
            const size = Math.min(t.img.width, t.img.height);
            const sx = (t.img.width - size) / 2;
            const sy = (t.img.height - size) / 2;
            ctx.drawImage(t.img, sx, sy, size, size, x + 5, y + 5, 90, 90);
        } else {
            // Fallback while loading
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 5, y + 5, 90, 90);
        }

        // Name
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText(t.name, x + 50, y + 115);
    });
}

function drawDepartureCutscene() {
    const elapsed = Date.now() - cutsceneStartTime;
    const progress = elapsed / CUTSCENE_DURATION;

    // Background
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.LAND_BROWN;
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

    // Suburban House
    ctx.fillStyle = COLORS.HOUSE_RED;
    ctx.fillRect(100, canvas.height * 0.4, 200, 180);
    // Roof
    ctx.beginPath();
    ctx.moveTo(80, canvas.height * 0.4);
    ctx.lineTo(320, canvas.height * 0.4);
    ctx.lineTo(200, canvas.height * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#555';
    ctx.fill();

    // Waving People
    const waveOffset = Math.sin(Date.now() / 200) * 10;
    for (let i = 0; i < 5; i++) {
        const px = 150 + (i * 30);
        const py = canvas.height * 0.7 - 50;
        
        // Body
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillRect(px, py, 15, 30);
        // Head
        ctx.fillRect(px, py - 15, 15, 15);
        // Waving Arm
        ctx.fillRect(px + 15, py + waveOffset, 10, 5);
    }

    // Car moving away
    const carX = 350 + (progress * (canvas.width));
    const carY = canvas.height * 0.7 - 40;
    
    ctx.fillStyle = COLORS.CAR_BLUE;
    ctx.fillRect(carX, carY, 80, 40);
    ctx.fillStyle = '#000'; // Wheels
    ctx.fillRect(carX + 10, carY + 35, 15, 10);
    ctx.fillRect(carX + 55, carY + 35, 15, 10);
    // Window
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(carX + 50, carY + 5, 20, 15);
}

const CREDITS_TEXT = [
    "Wanderlust",
    "",
    "Director & Tech",
    "Lindsey McGowen",
    "",
    "Assistant Director & Understudy",
    "Leichelle Little",
    "",
    "Cast",
    "Claire",
    "Gilbert",
    "Jason",
    "Krystal",
    "Patrice",
    "Peter",
    "Sam",
    "Velvet",
    "",
    "Presented By",
    "Wayward Improvised Theatre &",
    "Videogaming Concern"
];

function drawCredits() {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.WHITE;
    ctx.textAlign = 'center';

    CREDITS_TEXT.forEach((line, i) => {
        const y = creditsY + (i * 40);
        if (y > -40 && y < canvas.height + 40) {
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText(line, canvas.width / 2, y);
        }
    });

    if (!creditsFinished) {
        creditsY -= 2; // Scroll faster
        if (creditsY < -(CREDITS_TEXT.length * 40)) {
            creditsFinished = true;
        }
    } else {
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText('Click Enter to Replay', canvas.width / 2, canvas.height / 2);
    }
}

// Start Game
requestAnimationFrame(gameLoop);
