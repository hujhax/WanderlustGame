const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let selectedIndex = 0;
let score = 0;
let currentMinigameIndex = 0;
let minigameOrder = ['chicken', 'math', 'karaoke', 'cheese'].sort(() => Math.random() - 0.5).slice(0, 3);
let playedMinigames = []; // Tracks {name, won} for confrontation

let currentPhase = PHASES.INTRO;
let keysPressed = new Set();
let creditsY = canvas.height;
let creditsFinished = false;
let screenCaptures = [];
let lastCaptureTime = 0;
let cutsceneStartTime = 0;
const CUTSCENE_DURATION = 6000;
let currentDialog = null;
let dialogCallback = null;
let inTheCarState = { cycle: 0, usedInsults: new Set(), usedBlands: new Set(), usedTruths: new Set(), options: [], waitingForResponse: false, selectedIndex: 0 };
let separateWaysState = { startTime: 0 };
let togetherAgainState = { startTime: 0, playerX: -100, state: 'walking' };
let creditsStartTime = 0;
let polaroids = [];

// Image Objects
const canadaMapImg = new Image();
const cloudImg = new Image();
const chickenSheetImg = new Image();
const skullImg = new Image();
const barnImg = new Image();
const treeImg = new Image();
const farmBgImg = new Image();
const wagonImg = new Image();
const departureBgImg = new Image();
const confrontationBgImg = new Image();
const onYourOwnBgImg = new Image();
const stationWagonRawImg = new Image();
const marketStallImg = new Image();
const gClefImg = new Image();
const countryRoadImg = new Image();

const slashSprites = {}, idleSprites = {}, walkSprites = {}, runSprites = {}, jumpSprites = {}, sitSprites = {}, combatSprites = {}, halfSlashSprites = {}, backSlashSprites = {};

function preloadAssets() {
    canadaMapImg.src = 'images/backgrounds/canada map.jpg';
    cloudImg.src = 'images/elements/cloud.png';
    chickenSheetImg.src = 'images/sprites/chicken.png';
    skullImg.src = 'images/elements/cow-skull.png';
    barnImg.src = 'images/elements/barn.png';
    treeImg.src = 'images/elements/tree.png';
    farmBgImg.src = 'images/backgrounds/farm_background.jpg';
    wagonImg.src = 'images/elements/station_wagon.png';
    departureBgImg.src = 'images/backgrounds/departure_bg.jpg';
    confrontationBgImg.src = 'images/backgrounds/gas_station.webp';
    onYourOwnBgImg.src = 'images/backgrounds/rainy-pixel-city-stockcake.jpg';
    stationWagonRawImg.src = 'images/elements/station_wagon.png';
    marketStallImg.src = 'images/backgrounds/market-stall.jpg';
    gClefImg.src = 'images/elements/g-clef.png';
    countryRoadImg.src = 'images/elements/country_road.png';

    CAST.forEach(c => {
        c.img = new Image(); c.img.src = c.imgPath;
        c.invertedImg = new Image(); c.invertedImg.src = c.imgPath.replace('images/cast/', 'images/cast/inverted/');
        const actor = c.actor.toLowerCase();
        slashSprites[actor] = new Image(); slashSprites[actor].src = `images/sprites/cast/${actor}/standard/slash.png`;
        idleSprites[actor] = new Image(); idleSprites[actor].src = `images/sprites/cast/${actor}/standard/idle.png`;
        walkSprites[actor] = new Image(); walkSprites[actor].src = `images/sprites/cast/${actor}/standard/walk.png`;
        runSprites[actor] = new Image(); runSprites[actor].src = `images/sprites/cast/${actor}/standard/run.png`;
        jumpSprites[actor] = new Image(); jumpSprites[actor].src = `images/sprites/cast/${actor}/standard/jump.png`;
        sitSprites[actor] = new Image(); sitSprites[actor].src = `images/sprites/cast/${actor}/standard/sit.png`;
        combatSprites[actor] = new Image(); combatSprites[actor].src = `images/sprites/cast/${actor}/standard/combat.png`;
        halfSlashSprites[actor] = new Image(); halfSlashSprites[actor].src = `images/sprites/cast/${actor}/standard/1h_halfslash.png`;
        backSlashSprites[actor] = new Image(); backSlashSprites[actor].src = `images/sprites/cast/${actor}/standard/1h_backslash.png`;
    });
}

// Background Videos
const companionSitsBg = document.createElement('video');
companionSitsBg.src = 'images/backgrounds/companion_alone.mp4';
companionSitsBg.loop = true; companionSitsBg.muted = true;
const playerSitsBg = document.createElement('video');
playerSitsBg.src = 'images/backgrounds/player_alone.mp4';
playerSitsBg.loop = true; playerSitsBg.muted = true;

function showDialog(character, actor, text, callback, style = null) {
    const castMember = CAST.find(c => c.actor === actor);
    currentDialog = { name: character, castMember, fullText: text, chunks: wrapText(text, 400), chunkIndex: 0, style };
    dialogCallback = callback;
}

function nextCarCycle() {
    if (inTheCarState.cycle >= 4) { currentPhase = PHASES.MINIGAME_MAP; return; }
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partner = CAST.find(c => c.name === partnerName);
    const partnerActor = partner.actor;
    const partnerFirstName = partner.firstName;
    const bland = getUnusedDialog(CAR_DIALOG.BLANDS, inTheCarState.usedBlands);
    showDialog(partnerFirstName, partnerActor, bland, () => {
        inTheCarState.waitingForResponse = true;
        inTheCarState.options = [
            { text: getUnusedDialog(CAR_DIALOG.INSULTS, inTheCarState.usedInsults), type: 'insult' },
            { text: getUnusedDialog(CAR_DIALOG.BLANDS, inTheCarState.usedBlands), type: 'bland' },
            { text: getUnusedDialog(CAR_DIALOG.TRUTHS, inTheCarState.usedTruths), type: 'truth' }
        ].sort(() => Math.random() - 0.5);
        inTheCarState.selectedIndex = 0;
    }, 'top');
}

function getUnusedDialog(list, usedSet) {
    const available = list.filter(item => !usedSet.has(item));
    const chosen = (available.length === 0) ? list[Math.floor(Math.random() * list.length)] : available[Math.floor(Math.random() * available.length)];
    usedSet.add(chosen); return chosen;
}

function gameLoop() {
    if (Date.now() - lastCaptureTime > 30000 && currentPhase !== PHASES.INTRO && currentPhase !== PHASES.TITLE && currentPhase !== PHASES.CLOSING_CREDITS) {
        captureScreen(); lastCaptureTime = Date.now();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (currentPhase) {
        case PHASES.INTRO: drawIntro(); break;
        case PHASES.TITLE: drawTitle(); break;
        case PHASES.CHOOSE_TRAVELLER: drawTravellerSelect(); break;
        case PHASES.PARTNER_ANNOUNCEMENT: drawPartnerAnnouncement(); break;
        case PHASES.DEPARTURE_CUTSCENE: drawDepartureCutscene(); if (Date.now() - cutsceneStartTime > CUTSCENE_DURATION) { startInTheCar(); } break;
        case PHASES.IN_THE_CAR: drawInTheCar(); break;
        case PHASES.MINIGAME_MAP: drawMinigameMap(); break;
        case PHASES.MINIGAME_PLAY: drawMinigamePlay(); break;
        case PHASES.MINIGAME_POST: drawMinigamePost(); break;
        case PHASES.THE_CONFRONTATION: drawConfrontationTitle(); break;
        case PHASES.ON_YOUR_OWN: drawOnYourOwnTitle(); break;
        case PHASES.CONFRONTATION_PLAY: drawConfrontationPlay(); break;
        case PHASES.SEPARATE_WAYS: drawSeparateWays(); break;
        case PHASES.TOGETHER_AGAIN: drawTogetherAgain(); break;
        case PHASES.CLOSING_INTERVIEW: drawClosingInterview(); break;
        case PHASES.CLOSING_CREDITS: drawCredits(); break;
    }
    if (currentDialog) drawDialogBox();
    requestAnimationFrame(gameLoop);
}

function startInTheCar() {
    currentPhase = PHASES.IN_THE_CAR; inTheCarState.cycle = 0; inTheCarState.usedInsults.clear(); inTheCarState.usedBlands.clear(); inTheCarState.usedTruths.clear(); inTheCarState.waitingForResponse = false;
    audio.play('IN_THE_CAR', 45); nextCarCycle();
}

window.addEventListener('mousedown', (e) => {
    if (currentPhase === PHASES.INTRO) {
        currentPhase = PHASES.TITLE; audio.play('CHICAGO', 12);
        companionSitsBg.play().catch(e => {}); playerSitsBg.play().catch(e => {});
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        for (let i = 0; i < 8; i++) {
            const bx = 100 + (i % 4) * 150, by = 150 + Math.floor(i / 4) * 200;
            if (x >= bx && x <= bx + 120 && y >= by && y <= by + 120) { selectedIndex = i; audio.playSFX('ui'); selectTraveller(); break; }
        }
    } else if (currentPhase === PHASES.MINIGAME_PLAY && minigameState.type === 'cheese') {
        const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        handleCheeseClick(x, y);
    }
});

window.addEventListener('keydown', (e) => {
    keysPressed.add(e.key);
    if (e.key === '>') {
        const phases = Object.values(PHASES), idx = phases.indexOf(currentPhase);
        currentPhase = phases[(idx + 1) % phases.length]; audio.stop();
        if (currentPhase === PHASES.DEPARTURE_CUTSCENE) cutsceneStartTime = Date.now();
        if (currentPhase === PHASES.TOGETHER_AGAIN && selectedIndex === undefined) selectedIndex = 5;
        return;
    }
    if (currentDialog) {
        if (e.key === 'Enter') {
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback; currentDialog = null; dialogCallback = null; if (cb) cb();
            }
        }
        return;
    }
    if (currentPhase === PHASES.TITLE) { if (e.key === 'Enter') { currentPhase = PHASES.CHOOSE_TRAVELLER; audio.play('BEST_FRIEND'); } }
    else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        if (e.key === 'ArrowRight') { selectedIndex = (selectedIndex + 1) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowLeft') { selectedIndex = (selectedIndex - 1 + 8) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowDown') { selectedIndex = (selectedIndex + 4) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowUp') { selectedIndex = (selectedIndex - 4 + 8) % 8; audio.playSFX('ui'); }
        else if (e.key === 'Enter') { audio.playSFX('ui'); selectTraveller(); }
    } else if (currentPhase === PHASES.PARTNER_ANNOUNCEMENT) { if (e.key === 'Enter') { currentPhase = PHASES.DEPARTURE_CUTSCENE; cutsceneStartTime = Date.now(); audio.play('CHICAGO', 30); } }
    else if (currentPhase === PHASES.DEPARTURE_CUTSCENE) { if (e.key === 'Enter') { startInTheCar(); } }
    else if (currentPhase === PHASES.IN_THE_CAR) {
        if (inTheCarState.waitingForResponse) {
            if (e.key === 'ArrowUp') { inTheCarState.selectedIndex = (inTheCarState.selectedIndex - 1 + 3) % 3; audio.playSFX('ui'); }
            else if (e.key === 'ArrowDown') { inTheCarState.selectedIndex = (inTheCarState.selectedIndex + 1) % 3; audio.playSFX('ui'); }
            else if (e.key === 'Enter') {
                const choice = inTheCarState.options[inTheCarState.selectedIndex]; inTheCarState.waitingForResponse = false;
                if (choice.type === 'insult') { score -= 100; audio.playSFX('SAD_TROMBONE'); }
                else if (choice.type === 'truth') { score += 200; audio.playSFX('TADA'); }
                showDialog(CAST[selectedIndex].firstName, CAST[selectedIndex].actor, choice.text, () => { inTheCarState.cycle++; nextCarCycle(); }, 'top');
            }
        }
    } else if (currentPhase === PHASES.MINIGAME_MAP) { if (e.key === 'Enter') startMinigame(); }
    else if (currentPhase === PHASES.MINIGAME_PLAY) { handleMinigameInput(e.key); }
    else if (currentPhase === PHASES.MINIGAME_POST) {
        if (e.key === 'Enter') {
            playedMinigames.push({ name: minigameState.type, won: minigameState.won });
            currentMinigameIndex++;
            if (currentMinigameIndex < minigameOrder.length) currentPhase = PHASES.MINIGAME_MAP;
            else startFightingGame(PHASES.SEPARATE_WAYS);
        }
    } else if (currentPhase === PHASES.THE_CONFRONTATION || currentPhase === PHASES.ON_YOUR_OWN) {
        if (e.key === 'Enter') currentPhase = PHASES.CONFRONTATION_PLAY;
    } else if (currentPhase === PHASES.CONFRONTATION_PLAY) {
        if (fightingState.gameOver) { if (e.key === 'Enter') { audio.stop(); if (fightingState.nextPhase === PHASES.SEPARATE_WAYS) { currentPhase = PHASES.SEPARATE_WAYS; separateWaysState.startTime = Date.now(); audio.play('KARAOKE_BGM'); } else { startTogetherAgain(); } } }
        else handleFightingInput(e.key);
    } else if (currentPhase === PHASES.SEPARATE_WAYS) { if (e.key === 'Enter') startFightingGame(PHASES.TOGETHER_AGAIN, true); }
    else if (currentPhase === PHASES.CLOSING_CREDITS) { if (e.key === 'Enter') { currentPhase = PHASES.TITLE; currentMinigameIndex = 0; score = 0; playedMinigames = []; audio.play('CHICAGO', 12); creditsStartTime = 0; } }
});

window.addEventListener('keyup', (e) => { keysPressed.delete(e.key); });

function selectTraveller() { currentPhase = PHASES.PARTNER_ANNOUNCEMENT; audio.play('ZELDA_VICTORY'); }

const urlParams = new URLSearchParams(window.location.search);
const minigameOverride = urlParams.get('minigame');
if (minigameOverride) {
    selectedIndex = 5;
    if (minigameOverride === 'confrontation') currentPhase = PHASES.THE_CONFRONTATION;
    else if (minigameOverride === 'separate') { currentPhase = PHASES.SEPARATE_WAYS; separateWaysState.startTime = Date.now(); audio.play('KARAOKE_BGM'); }
    else if (minigameOverride === 'alone' || minigameOverride === 'own') startFightingGame(PHASES.TOGETHER_AGAIN, true);
    else if (minigameOverride === 'reunited') startTogetherAgain();
    else if (['chicken', 'math', 'karaoke', 'cheese'].includes(minigameOverride)) { minigameOrder = [minigameOverride]; currentPhase = PHASES.MINIGAME_MAP; }
}

preloadAssets();
gameLoop();
