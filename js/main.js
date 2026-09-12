const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceParam = urlParams.get('device');
    if (deviceParam === 'mobile') {
        isMobileMode = true;
    } else if (deviceParam === 'desktop') {
        isMobileMode = false;
    } else {
        isMobileMode = (typeof navigator !== 'undefined' && navigator.userAgentData && navigator.userAgentData.mobile) || 
                       (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) || 
                       (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && window.innerWidth < 768);
    }
}

if (isMobileMode) {
    canvas.width = 600;
    canvas.height = 800;
} else {
    canvas.width = 800;
    canvas.height = 600;
}

window.touchState = {
    bumpSteerLeft: false,
    bumpSteerRight: false,
    bumpGas: false,
    bumpReverse: false,
    fightingLeft: false,
    fightingRight: false,
    fightingPunch: false,
    fightingKick: false
};

function updateTouchState(e) {
    if (!isMobileMode) return;
    touchState.bumpSteerLeft = false;
    touchState.bumpSteerRight = false;
    touchState.bumpGas = false;
    touchState.bumpReverse = false;
    touchState.fightingLeft = false;
    touchState.fightingRight = false;
    touchState.fightingPunch = false;
    touchState.fightingKick = false;

    const activePointers = e.touches ? Array.from(e.touches) : (e.buttons === 1 || e.type === 'mousedown' ? [e] : []);
    activePointers.forEach(pointer => {
        const pos = getCanvasPointerPos(pointer);
        const x = pos.x, y = pos.y;
        
        if (currentPhase === PHASES.MINIGAME_PLAY && minigameState && minigameState.type === 'bump') {
            if (x >= 20 && x <= 130 && y >= 680 && y <= 770) touchState.bumpSteerLeft = true;
            if (x >= 145 && x <= 255 && y >= 680 && y <= 770) touchState.bumpSteerRight = true;
            if (x >= 345 && x <= 455 && y >= 680 && y <= 770) touchState.bumpGas = true;
            if (x >= 470 && x <= 580 && y >= 680 && y <= 770) touchState.bumpReverse = true;
        }
        if (currentPhase === PHASES.CONFRONTATION_PLAY) {
            if (x >= 20 && x <= 135 && y >= 660 && y <= 780) touchState.fightingLeft = true;
            if (x >= 145 && x <= 260 && y >= 660 && y <= 780) touchState.fightingRight = true;
            if (x >= 340 && x <= 455 && y >= 660 && y <= 780) touchState.fightingPunch = true;
            if (x >= 465 && x <= 580 && y >= 660 && y <= 780) touchState.fightingKick = true;
        }
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', updateTouchState, { passive: true });
    window.addEventListener('touchmove', updateTouchState, { passive: true });
    window.addEventListener('touchend', updateTouchState, { passive: true });
    window.addEventListener('touchcancel', updateTouchState, { passive: true });
    window.addEventListener('mousedown', updateTouchState);
    window.addEventListener('mousemove', updateTouchState);
    window.addEventListener('mouseup', updateTouchState);
}

let selectedIndex = 0;
let score = 0;
let currentMinigameIndex = 0;
let minigameOrder = [];
let playedMinigames = []; // Tracks {name, won} for confrontation

function generateMinigameOrder() {
    if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const override = urlParams.get('minigame');
        if (override) {
            if (override === 'debug') return;
            if (['chicken', 'math', 'karaoke', 'cheese', 'bump', 'fish', 'golf', 'jeopardy', 'goose', 'climb'].includes(override)) {
                minigameOrder = [override];
                return;
            }
        }
    }

    const count = typeof getPlaythroughCount === 'function' ? getPlaythroughCount() : 0;
    const standard8 = ['chicken', 'math', 'karaoke', 'cheese', 'bump', 'fish', 'golf', 'goose'];
    const all10 = ['chicken', 'math', 'karaoke', 'cheese', 'bump', 'fish', 'golf', 'goose', 'jeopardy', 'climb'];

    if (count === 0) {
        // First playthrough: jeopardy and climbatorium aren't available
        const shuffled = [...standard8].sort(() => Math.random() - 0.5);
        minigameOrder = shuffled.slice(0, 3);
    } else if (count === 1) {
        // Second playthrough: two of the minigames are jeopardy and climbatorium
        const mandatory = ['jeopardy', 'climb'];
        const remaining = [...standard8].sort(() => Math.random() - 0.5);
        const third = remaining[0];
        minigameOrder = [...mandatory, third].sort(() => Math.random() - 0.5);
    } else {
        // Subsequent playthroughs: all minigames available for random choice
        const shuffled = [...all10].sort(() => Math.random() - 0.5);
        minigameOrder = shuffled.slice(0, 3);
    }
}
generateMinigameOrder();

let currentPhase = PHASES.INTRO;
let keysPressed = new Set();
let keysJustPressed = new Set();
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

let intimacy = 4;
let intimacySparks = [];
const gooseImg = new Image();
const oceanSheetImg = new Image();
const gooseTilesetImg = new Image();
const boulderImg = new Image();

// Image Objects
const canadaMapImg = new Image();
const golfGreenImgs = [];
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
const bumperCarLotImg = new Image();
const greenCarImg = new Image();
const coinImg = new Image();
const fishingBgImg = new Image();
const fishingMaskImg = new Image();
const fishingBoatImg = new Image();
const fishingBoatLargeImg = new Image();
const fishImages = {
    cod: new Image(),
    walleye: new Image(),
    'rainbow trout': new Image(),
    boot: new Image(),
    'soda can': new Image(),
    accordion: new Image()
};

const slashSprites = {}, idleSprites = {}, walkSprites = {}, runSprites = {}, jumpSprites = {}, sitSprites = {}, combatSprites = {}, halfSlashSprites = {}, backSlashSprites = {}, waveSprites = {}, kickSprites = {}, climbSprites = {};

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
    confrontationBgImg.src = 'images/backgrounds/battledome.webp';
    onYourOwnBgImg.src = 'images/backgrounds/on_your_own_bg.jpg';
    stationWagonRawImg.src = 'images/elements/station_wagon.png';
    marketStallImg.src = 'images/backgrounds/market_stall.png';
    gClefImg.src = 'images/elements/g-clef.png';
    countryRoadImg.src = 'images/elements/country_road.png';
    bumperCarLotImg.src = 'images/backgrounds/bumper-car-lot.png';
    greenCarImg.src = 'images/sprites/cars/PixelWheels_Ferrari_Green.png';
    const redCarImg = new Image(); redCarImg.src = 'images/sprites/cars/PixelWheels_Ferrari_Red.png';
    const yellowCarImg = new Image(); yellowCarImg.src = 'images/sprites/cars/PixelWheels_Ferrari_Yellow.png';
    const purpleCarImg = new Image(); purpleCarImg.src = 'images/sprites/cars/PixelWheels_Ferrari_Purple.png';
    const whiteCarImg = new Image(); whiteCarImg.src = 'images/sprites/cars/PixelWheels_Ferrari_White.png';
    window.carImgs = { green: greenCarImg, red: redCarImg, yellow: yellowCarImg, purple: purpleCarImg, white: whiteCarImg };
    coinImg.src = 'images/sprites/coin.png';

    fishingBgImg.src = 'images/backgrounds/fishing-bg.png';
    fishingMaskImg.src = 'images/backgrounds/fishing-bg-mask.png';
    fishingBoatImg.src = 'images/sprites/fishing-boat.png';
    fishingBoatLargeImg.src = 'images/elements/fishing/fishing-boat.webp';
    fishImages.cod.src = 'images/elements/fishing/cod.jpg';
    fishImages.walleye.src = 'images/elements/fishing/walleye.webp';
    fishImages['rainbow trout'].src = 'images/elements/fishing/rainbow-trout.png';
    fishImages.boot.src = 'images/elements/fishing/boot.jpg';
    fishImages['soda can'].src = 'images/elements/fishing/soda-can.jpg';
    fishImages.accordion.src = 'images/elements/fishing/accordion.jpg';

    gooseImg.src = 'images/sprites/goose.png';
    oceanSheetImg.src = 'images/elements/ocean_sheet.png';
    gooseTilesetImg.src = 'images/elements/goose_tileset.png';
    boulderImg.src = 'images/elements/boulder.png';

    for (let i = 1; i <= 6; i++) {
        golfGreenImgs[i] = new Image();
        golfGreenImgs[i].src = `images/elements/golf/greens/golf_${i}.png`;
    }

    CAST.forEach(c => {
        c.img = new Image(); c.img.src = c.imgPath;
        if (!c.noSprites) {
            c.invertedImg = new Image(); c.invertedImg.src = c.imgPath.replace('images/cast/', 'images/cast/inverted/');
        }
        if (!c.noSprites) {
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
            waveSprites[actor] = new Image(); waveSprites[actor].src = `images/sprites/cast/${actor}/standard/wave.png`;
            kickSprites[actor] = new Image(); kickSprites[actor].src = `images/sprites/cast/${actor}/standard/kick.png`;
            climbSprites[actor] = new Image(); climbSprites[actor].src = `images/sprites/cast/${actor}/standard/climb.png`;
        }
    });
}

// Background Videos
const companionSitsBg = document.createElement('video');
companionSitsBg.src = 'images/backgrounds/companion_alone.mp4';
companionSitsBg.loop = true; companionSitsBg.muted = true;
companionSitsBg.playsInline = true;
companionSitsBg.setAttribute('playsinline', '');
companionSitsBg.setAttribute('webkit-playsinline', '');
companionSitsBg.controls = false;
companionSitsBg.setAttribute('disablePictureInPicture', '');

const playerSitsBg = document.createElement('video');
playerSitsBg.src = 'images/backgrounds/player_alone.mp4';
playerSitsBg.loop = true; playerSitsBg.muted = true;
playerSitsBg.playsInline = true;
playerSitsBg.setAttribute('playsinline', '');
playerSitsBg.setAttribute('webkit-playsinline', '');
playerSitsBg.controls = false;
playerSitsBg.setAttribute('disablePictureInPicture', '');

function showDialog(character, actor, text, callback, style = null, illustration = null, options = null) {
    const castMember = CAST.find(c => c.actor === actor);
    currentDialog = { name: character, castMember, fullText: text, chunks: wrapText(text, 400), chunkIndex: 0, style, illustration, options, selectedOption: 0 };
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
        case PHASES.MINIGAME_DEBUG_MENU: drawMinigameDebugMenu(); break;
        case PHASES.THE_CONFRONTATION: drawConfrontationTitle(); break;
        case PHASES.ON_YOUR_OWN: drawOnYourOwnTitle(); break;
        case PHASES.CONFRONTATION_PLAY: updateFighting(); drawConfrontationPlay(); break;
        case PHASES.NEXT_DAY: drawNextDay(); break;
        case PHASES.SEPARATE_WAYS: drawSeparateWays(); break;
        case PHASES.TOGETHER_AGAIN: drawTogetherAgain(); break;
        case PHASES.CLOSING_INTERVIEW: drawClosingInterview(); break;
        case PHASES.UNLOCK_MASTERS: drawUnlockMasters(); break;
        case PHASES.CLOSING_CREDITS: drawCredits(); break;
    }
    if (currentDialog) drawDialogBox();
    keysJustPressed.clear();
    requestAnimationFrame(gameLoop);
}

function startInTheCar() {
    currentPhase = PHASES.IN_THE_CAR; inTheCarState.cycle = 0; inTheCarState.usedInsults.clear(); inTheCarState.usedBlands.clear(); inTheCarState.usedTruths.clear(); inTheCarState.waitingForResponse = false;
    intimacy = 4;
    intimacySparks = [];
    audio.play('IN_THE_CAR', 45); nextCarCycle();
}

let lastPointerTime = 0;
function handleCanvasPointerDown(e) {
    if (audio) audio.unlockAudio();
    const now = Date.now();
    if (now - lastPointerTime < 150) return;
    lastPointerTime = now;

    const pos = getCanvasPointerPos(e);
    const x = pos.x, y = pos.y;

    if (currentDialog) {
        if (currentDialog.options && Array.isArray(currentDialog.options)) {
            const isTop = currentDialog.style === 'top';
            const boxH = isMobileMode ? 220 : 185;
            const boxX = isMobileMode ? 25 : 50;
            const boxY = isTop ? 20 : canvas.height - boxH - 20;
            const optY = boxY + boxH - 52;
            const opts = currentDialog.options;
            const pad = 15; // Generous touch padding

            opts.forEach((optText, idx) => {
                const optX = isMobileMode ? (boxX + 210 + idx * 125) : (440 + idx * 120);
                const optW = isMobileMode ? 115 : 110;
                const optH = isMobileMode ? 44 : 40;

                if (x >= optX - pad && x <= optX + optW + pad && y >= optY - pad && y <= optY + optH + pad) {
                    const cb = dialogCallback; currentDialog = null; dialogCallback = null;
                    audio.playSFX('ui');
                    if (cb) cb(idx === 0 ? 'yes' : 'no');
                }
            });
            return;
        } else {
            audio.playSFX('ui');
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback; currentDialog = null; dialogCallback = null; if (cb) cb();
            }
            return;
        }
    }

    if (currentPhase === PHASES.INTRO) {
        currentPhase = PHASES.TITLE; audio.play('CHICAGO', 12);
        companionSitsBg.play().catch(err => {}); playerSitsBg.play().catch(err => {});
    } else if (currentPhase === PHASES.TITLE) {
        if (isMobileMode) {
            currentPhase = PHASES.CHOOSE_TRAVELLER; audio.play('BEST_FRIEND');
        }
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        if (isMobileMode) {
            for (let i = 0; i < 8; i++) {
                const col = i % 2, row = Math.floor(i / 2);
                const bx = 80 + col * 260, by = 110 + row * 165;
                if (x >= bx && x <= bx + 180 && y >= by && y <= by + 125) { selectedIndex = i; audio.playSFX('ui'); selectTraveller(); break; }
            }
        } else {
            for (let i = 0; i < 8; i++) {
                const bx = 100 + (i % 4) * 150, by = 150 + Math.floor(i / 4) * 200;
                if (x >= bx && x <= bx + 120 && y >= by && y <= by + 120) { selectedIndex = i; audio.playSFX('ui'); selectTraveller(); break; }
            }
        }
    } else if (currentPhase === PHASES.PARTNER_ANNOUNCEMENT) {
        if (isMobileMode) {
            currentPhase = PHASES.DEPARTURE_CUTSCENE; cutsceneStartTime = Date.now(); audio.play('CHICAGO', 30);
        }
    } else if (currentPhase === PHASES.DEPARTURE_CUTSCENE) {
        if (isMobileMode) {
            startInTheCar();
        }
    } else if (currentPhase === PHASES.IN_THE_CAR) {
        if (inTheCarState.waitingForResponse && isMobileMode) {
            const boxX = 25, boxY = 200, boxW = 490;
            inTheCarState.options.forEach((opt, i) => {
                const cardY = boxY + 55 + i * 110;
                if (x >= boxX + 15 && x <= boxX + 15 + (boxW - 30) && y >= cardY && y <= cardY + 95) {
                    inTheCarState.selectedIndex = i;
                    const choice = inTheCarState.options[i];
                    inTheCarState.waitingForResponse = false;
                    if (choice.type === 'insult') {
                        score -= 100; audio.playSFX('SAD_TROMBONE'); intimacy = Math.max(0, intimacy - 1);
                    } else if (choice.type === 'truth') {
                        score += 200; audio.playSFX('TADA'); intimacy = Math.min(8, intimacy + 1);
                    }
                    showDialog(CAST[selectedIndex].firstName, CAST[selectedIndex].actor, choice.text, () => {
                        inTheCarState.cycle++; nextCarCycle();
                    }, 'top');
                }
            });
        }
    } else if (currentPhase === PHASES.MINIGAME_MAP) {
        if (isMobileMode) {
            startMinigame();
        }
    } else if (currentPhase === PHASES.MINIGAME_PLAY && minigameState) {
        const type = minigameState.type;
        if (type === 'chicken') {
            if (!minigameState.isJumping) {
                minigameState.isJumping = true;
                minigameState.jumpVel = -14;
                audio.playSFX('jump');
            }
        } else if (type === 'math') {
            handleMathTouch(x, y);
        } else if (type === 'karaoke') {
            handleKaraokeTouch(x, y);
        } else if (type === 'cheese') {
            handleCheeseClick(x, y);
        } else if (type === 'fish') {
            handleFishTouch(x, y);
        } else if (type === 'golf') {
            handleGolfMouseDown(e);
        } else if (type === 'jeopardy') {
            handleJeopardyClick(x, y);
        } else if (type === 'goose') {
            handleGooseTouch(x, y);
        } else if (type === 'climb') {
            handleClimbClick(x, y);
        }
    } else if (currentPhase === PHASES.MINIGAME_DEBUG_MENU) {
        for (let i = 0; i < DEBUG_MINIGAMES.length; i++) {
            const { x: bx, y: by, w: bw, h: bh } = getDebugMenuBounds(i);
            if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
                debugMinigameIndex = i;
                selectDebugMinigame(i);
                break;
            }
        }
    } else if (currentPhase === PHASES.MINIGAME_POST) {
        playedMinigames.push({ name: minigameState.type, won: minigameState.won });
        currentMinigameIndex++;
        if (typeof minigameOverride !== 'undefined' && minigameOverride === 'debug') {
            currentPhase = PHASES.MINIGAME_DEBUG_MENU;
            audio.stop();
        } else if (currentMinigameIndex < minigameOrder.length) {
            currentPhase = PHASES.MINIGAME_MAP;
        } else {
            startFightingGame(PHASES.SEPARATE_WAYS);
        }
    } else if (currentPhase === PHASES.THE_CONFRONTATION || currentPhase === PHASES.ON_YOUR_OWN) {
        if (isMobileMode) {
            currentPhase = PHASES.CONFRONTATION_PLAY;
        }
    } else if (currentPhase === PHASES.CONFRONTATION_PLAY) {
        if (fightingState.gameOver && isMobileMode) {
            audio.stop();
            if (fightingState.nextPhase === PHASES.SEPARATE_WAYS) {
                currentPhase = PHASES.NEXT_DAY;
            } else {
                startTogetherAgain();
            }
        }
    } else if (currentPhase === PHASES.NEXT_DAY) {
        if (isMobileMode) {
            currentPhase = PHASES.SEPARATE_WAYS;
            separateWaysState.startTime = Date.now();
            companionSitsBg.play().catch(err => {});
            playerSitsBg.play().catch(err => {});
            audio.play('KARAOKE_BGM');
        }
    } else if (currentPhase === PHASES.SEPARATE_WAYS) {
        if (isMobileMode && Date.now() - separateWaysState.startTime >= 30000) {
            startFightingGame(PHASES.TOGETHER_AGAIN, true);
        }
    } else if (currentPhase === PHASES.UNLOCK_MASTERS) {
        currentPhase = PHASES.CLOSING_CREDITS;
        creditsY = canvas.height; creditsFinished = false; audio.play('MOON');
    } else if (currentPhase === PHASES.CLOSING_CREDITS) {
        if (isMobileMode && (creditsFinished || (creditsStartTime > 0 && Date.now() - creditsStartTime > 3000))) {
            currentPhase = PHASES.TITLE;
            currentMinigameIndex = 0; score = 0; playedMinigames = [];
            generateMinigameOrder();
            audio.play('CHICAGO', 12); creditsStartTime = 0;
        }
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', handleCanvasPointerDown);
    window.addEventListener('mousedown', handleCanvasPointerDown);
}

window.addEventListener('mousemove', (e) => {
    if (currentPhase === PHASES.MINIGAME_PLAY && minigameState && minigameState.type === 'golf') {
        handleGolfMouseMove(e);
    }
});

window.addEventListener('mouseup', (e) => {
    if (currentPhase === PHASES.MINIGAME_PLAY && minigameState && minigameState.type === 'golf') {
        handleGolfMouseUp(e);
    }
});

window.addEventListener('keydown', (e) => {
    if (!keysPressed.has(e.key)) keysJustPressed.add(e.key);
    keysPressed.add(e.key);
    if (e.key === '>') {
        const phases = Object.values(PHASES);
        const idx = phases.indexOf(currentPhase);
        let nextPhase = phases[(idx + 1) % phases.length];
        
        // Special case: Fighting games share a 'PLAY' phase
        if (currentPhase === PHASES.CONFRONTATION_PLAY && fightingState.nextPhase) {
            nextPhase = fightingState.nextPhase;
            // If next is Separate Ways, we actually want to go to the 'Next Day' title card first
            if (nextPhase === PHASES.SEPARATE_WAYS) nextPhase = PHASES.NEXT_DAY;
        }

        audio.stop();
        currentDialog = null; // Clear any active dialog

        // Handle specific initializations
        if (nextPhase === PHASES.IN_THE_CAR) {
            startInTheCar();
        } else if (nextPhase === PHASES.DEPARTURE_CUTSCENE) {
            currentPhase = nextPhase;
            cutsceneStartTime = Date.now();
            audio.play('CHICAGO', 30);
        } else if (nextPhase === PHASES.THE_CONFRONTATION) {
            startFightingGame(PHASES.SEPARATE_WAYS);
        } else if (nextPhase === PHASES.ON_YOUR_OWN) {
            startFightingGame(PHASES.TOGETHER_AGAIN, true);
        } else if (nextPhase === PHASES.TOGETHER_AGAIN) {
            if (selectedIndex === undefined) selectedIndex = 5;
            startTogetherAgain();
        } else if (nextPhase === PHASES.CLOSING_INTERVIEW) {
            startClosingInterview();
        } else if (nextPhase === PHASES.UNLOCK_MASTERS) {
            startUnlockMasters();
        } else if (nextPhase === PHASES.TITLE) {
            currentPhase = nextPhase;
            audio.play('CHICAGO', 12);
        } else {
            currentPhase = nextPhase;
        }
        return;
    }
    if (currentDialog) {
        if (currentDialog.options && Array.isArray(currentDialog.options)) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                currentDialog.selectedOption = 0;
                audio.playSFX('ui');
                return;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                currentDialog.selectedOption = 1;
                audio.playSFX('ui');
                return;
            } else if (e.key === 'Enter') {
                const choiceIdx = currentDialog.selectedOption || 0;
                const cb = dialogCallback;
                currentDialog = null;
                dialogCallback = null;
                if (cb) cb(choiceIdx === 0 ? 'yes' : 'no');
                return;
            }
        } else if (e.key === 'Enter') {
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
                if (choice.type === 'insult') { 
                    score -= 100; 
                    audio.playSFX('SAD_TROMBONE'); 
                    intimacy = Math.max(0, intimacy - 1);
                }
                else if (choice.type === 'truth') { 
                    score += 200; 
                    audio.playSFX('TADA'); 
                    intimacy = Math.min(8, intimacy + 1);
                }
                showDialog(CAST[selectedIndex].firstName, CAST[selectedIndex].actor, choice.text, () => { inTheCarState.cycle++; nextCarCycle(); }, 'top');
            }
        }
    } else if (currentPhase === PHASES.MINIGAME_DEBUG_MENU) {
        if (e.key === 'ArrowRight') {
            if (debugMinigameIndex < 6 && debugMinigameIndex + 6 < DEBUG_MINIGAMES.length) debugMinigameIndex += 6;
            else if (debugMinigameIndex < 6) debugMinigameIndex = DEBUG_MINIGAMES.length - 1;
            audio.playSFX('ui');
        } else if (e.key === 'ArrowLeft') {
            if (debugMinigameIndex >= 6) debugMinigameIndex -= 6;
            audio.playSFX('ui');
        } else if (e.key === 'ArrowDown') {
            debugMinigameIndex = (debugMinigameIndex + 1) % DEBUG_MINIGAMES.length;
            audio.playSFX('ui');
        } else if (e.key === 'ArrowUp') {
            debugMinigameIndex = (debugMinigameIndex - 1 + DEBUG_MINIGAMES.length) % DEBUG_MINIGAMES.length;
            audio.playSFX('ui');
        } else if (e.key === 'Enter') {
            selectDebugMinigame(debugMinigameIndex);
        }
    } else if (currentPhase === PHASES.MINIGAME_MAP) { if (e.key === 'Enter') startMinigame(); }
    else if (currentPhase === PHASES.MINIGAME_PLAY) { handleMinigameInput(e.key); }
    else if (currentPhase === PHASES.MINIGAME_POST) {
        if (e.key === 'Enter') {
            playedMinigames.push({ name: minigameState.type, won: minigameState.won });
            currentMinigameIndex++;
            if (minigameOverride === 'debug') {
                currentPhase = PHASES.MINIGAME_DEBUG_MENU;
                audio.stop();
            } else if (currentMinigameIndex < minigameOrder.length) currentPhase = PHASES.MINIGAME_MAP;
            else startFightingGame(PHASES.SEPARATE_WAYS);
        }
    } else if (currentPhase === PHASES.THE_CONFRONTATION || currentPhase === PHASES.ON_YOUR_OWN) {
        if (e.key === 'Enter') currentPhase = PHASES.CONFRONTATION_PLAY;
    } else if (currentPhase === PHASES.CONFRONTATION_PLAY) {
        if (fightingState.gameOver) { if (e.key === 'Enter') { audio.stop(); if (fightingState.nextPhase === PHASES.SEPARATE_WAYS) { currentPhase = PHASES.NEXT_DAY; } else { startTogetherAgain(); } } }
        else handleFightingInput(e.key);
    } else if (currentPhase === PHASES.NEXT_DAY) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.SEPARATE_WAYS;
            separateWaysState.startTime = Date.now();
            companionSitsBg.play().catch(e => {});
            playerSitsBg.play().catch(e => {});
            audio.play('KARAOKE_BGM');
        }
    } else if (currentPhase === PHASES.SEPARATE_WAYS) {
        if (e.key === 'Enter') {
            const elapsed = Date.now() - separateWaysState.startTime;
            if (elapsed >= 30000) {
                startFightingGame(PHASES.TOGETHER_AGAIN, true);
            }
        }
    } else if (currentPhase === PHASES.UNLOCK_MASTERS) {
        if (e.key === 'Enter') {
            currentPhase = PHASES.CLOSING_CREDITS;
            creditsY = canvas.height; creditsFinished = false; audio.play('MOON');
        }
    }
    else if (currentPhase === PHASES.CLOSING_CREDITS) { if (e.key === 'Enter') { currentPhase = PHASES.TITLE; currentMinigameIndex = 0; score = 0; playedMinigames = []; generateMinigameOrder(); audio.play('CHICAGO', 12); creditsStartTime = 0; } }
});

window.addEventListener('keyup', (e) => { keysPressed.delete(e.key); });

function selectTraveller() { currentPhase = PHASES.PARTNER_ANNOUNCEMENT; audio.play('ZELDA_VICTORY'); generateMinigameOrder(); }

function selectDebugMinigame(index) {
    if (typeof audio !== 'undefined' && audio.playSFX) audio.playSFX('ui');
    const selectedKey = DEBUG_MINIGAMES[index].key;
    if (selectedKey === 'unlock') {
        startUnlockMasters();
    } else {
        minigameOrder = [selectedKey];
        currentMinigameIndex = 0;
        currentPhase = PHASES.MINIGAME_MAP;
    }
}

const urlParams = new URLSearchParams(window.location.search);
const minigameOverride = urlParams.get('minigame');
if (minigameOverride) {
    selectedIndex = 5;
    if (minigameOverride === 'debug') currentPhase = PHASES.MINIGAME_DEBUG_MENU;
    else if (minigameOverride === 'confrontation') currentPhase = PHASES.THE_CONFRONTATION;
    else if (minigameOverride === 'separate') { currentPhase = PHASES.NEXT_DAY; }
    else if (minigameOverride === 'alone' || minigameOverride === 'own') startFightingGame(PHASES.TOGETHER_AGAIN, true);
    else if (minigameOverride === 'reunited') startTogetherAgain();
    else if (minigameOverride === 'interview') startClosingInterview();
    else if (minigameOverride === 'unlock') startUnlockMasters();
    else if (minigameOverride === 'credits') { currentPhase = PHASES.CLOSING_CREDITS; creditsY = canvas.height; creditsFinished = false; audio.play('MOON'); }
    else if (['chicken', 'math', 'karaoke', 'cheese', 'bump', 'fish', 'golf', 'jeopardy', 'goose', 'climb'].includes(minigameOverride)) { minigameOrder = [minigameOverride]; currentPhase = PHASES.MINIGAME_MAP; }
}

preloadAssets();
gameLoop();

