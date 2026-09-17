// Hardcoded grid based on images/backgrounds/fishing-bg.png
const WATER_GRID = [
    ["LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "NORMAL", "SHALLOW", "LAND", "SHALLOW", "SHALLOW", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "SHALLOW", "LAND", "DEEP", "DEEP", "NORMAL", "SHALLOW", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "SHALLOW", "DEEP", "DEEP", "DEEP", "SHALLOW", "SHALLOW", "SHALLOW", "SHALLOW", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "NORMAL", "DEEP", "DEEP", "NORMAL", "NORMAL", "DEEP", "SHALLOW", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "NORMAL", "DEEP", "DEEP", "NORMAL", "SHALLOW", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "DEEP", "DEEP", "SHALLOW", "LAND", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "NORMAL", "DEEP", "DEEP", "DEEP", "DEEP", "NORMAL", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "SHALLOW", "NORMAL", "DEEP", "DEEP", "NORMAL", "SHALLOW", "SHALLOW", "DEEP", "SHALLOW", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "DEEP", "DEEP", "NORMAL", "SHALLOW", "SHALLOW", "SHALLOW", "SHALLOW", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "SHALLOW", "LAND", "SHALLOW", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND"],
    ["LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND", "LAND"]
];

const getWaterProbabilities = function(waterType) {
    const type = (waterType || '').toUpperCase();
    if (type === 'DEEP') {
        return { fishRate: 0.9, junkRate: 0.1 };
    } else if (type === 'NORMAL') {
        return { fishRate: 0.7, junkRate: 0.3 };
    } else { // SHALLOW
        return { fishRate: 0.5, junkRate: 0.5 };
    }
};

function initFishGame() {
    minigameState.grid = [];
    const rows = 12;
    const cols = 16;

    for (let r = 0; r < rows; r++) {
        minigameState.grid[r] = [];
        for (let c = 0; c < cols; c++) {
            minigameState.grid[r][c] = 0;
        }
    }

    let startX = 8;
    let startY = 6;
    let minDist = 1000;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (WATER_GRID[r][c] !== "LAND") {
                const dist = Math.sqrt(Math.pow(c - 8, 2) + Math.pow(r - 6, 2));
                if (dist < minDist) {
                    minDist = dist;
                    startX = c;
                    startY = r;
                }
            }
        }
    }

    minigameState.boat = { gridX: startX, gridY: startY, dir: 'north' };
    minigameState.fishWindow = null;
    minigameState.fishModal = {
        active: false,
        introShown: false,
        timer: 20.0,
        catchMeter: 0,
        hookX: 225,
        hookY: 180,
        hookVx: 0,
        hookVy: 0,
        fishX: 225,
        fishY: 180,
        fishVx: 0,
        fishVy: 0,
        waterType: 'SHALLOW'
    };
    minigameState.lastFrameTime = Date.now();
}

function startFishingModal(waterType) {
    const state = minigameState;
    const uvW = isMobileMode ? 520 : 450;
    const uvH = isMobileMode ? 360 : 380;
    const startX = uvW / 2;
    const startY = uvH / 2;

    const introWasShown = state.fishModal ? state.fishModal.introShown : true;
    const angle = Math.random() * Math.PI * 2;
    const speed = waterType === 'DEEP' ? 143 : (waterType === 'NORMAL' ? 99 : 66);

    state.fishModal = {
        active: true,
        introShown: introWasShown,
        timer: 20.0,
        catchMeter: 0,
        waterType: waterType || 'SHALLOW',
        hookX: startX,
        hookY: startY,
        hookVx: 0,
        hookVy: 0,
        fishX: startX,
        fishY: startY,
        fishVx: Math.cos(angle) * speed,
        fishVy: Math.sin(angle) * speed
    };
    state.lastFrameTime = Date.now();
}

function updateFishingModal(dt) {
    const state = minigameState;
    const modal = state.fishModal;
    if (!modal || !modal.active) return;

    if (dt === undefined || dt <= 0 || isNaN(dt)) {
        const now = Date.now();
        dt = Math.min(0.1, (now - (state.lastFrameTime || now)) / 1000);
        state.lastFrameTime = now;
    }

    const uvW = isMobileMode ? 520 : 450;
    const uvH = isMobileMode ? 360 : 380;

    modal.timer = (typeof modal.timer === 'number' && !isNaN(modal.timer)) ? modal.timer : 20.0;
    modal.catchMeter = (typeof modal.catchMeter === 'number' && !isNaN(modal.catchMeter)) ? modal.catchMeter : 0;
    modal.hookX = (typeof modal.hookX === 'number' && !isNaN(modal.hookX)) ? modal.hookX : (uvW / 2);
    modal.hookY = (typeof modal.hookY === 'number' && !isNaN(modal.hookY)) ? modal.hookY : (uvH / 2);
    modal.hookVx = (typeof modal.hookVx === 'number' && !isNaN(modal.hookVx)) ? modal.hookVx : 0;
    modal.hookVy = (typeof modal.hookVy === 'number' && !isNaN(modal.hookVy)) ? modal.hookVy : 0;
    modal.fishX = (typeof modal.fishX === 'number' && !isNaN(modal.fishX)) ? modal.fishX : (uvW / 2);
    modal.fishY = (typeof modal.fishY === 'number' && !isNaN(modal.fishY)) ? modal.fishY : (uvH / 2);
    modal.fishVx = (typeof modal.fishVx === 'number' && !isNaN(modal.fishVx)) ? modal.fishVx : 0;
    modal.fishVy = (typeof modal.fishVy === 'number' && !isNaN(modal.fishVy)) ? modal.fishVy : 0;

    modal.timer = Math.max(0, modal.timer - dt);

    let fishSpeed = 66;
    let changeProb = 0.0165;
    if (modal.waterType === 'DEEP') {
        fishSpeed = 143;
        changeProb = 0.044;
    } else if (modal.waterType === 'NORMAL') {
        fishSpeed = 99;
        changeProb = 0.0275;
    }

    if (Math.random() < changeProb) {
        const angle = Math.random() * Math.PI * 2;
        modal.fishVx = Math.cos(angle) * fishSpeed;
        modal.fishVy = Math.sin(angle) * fishSpeed;
    }

    let currentFacingLeft = modal.lastFacingLeft;
    if (modal.fishVx < -5) {
        currentFacingLeft = true;
    } else if (modal.fishVx > 5) {
        currentFacingLeft = false;
    } else if (typeof currentFacingLeft === 'undefined') {
        currentFacingLeft = true;
    }

    if (typeof modal.lastFacingLeft !== 'undefined' && currentFacingLeft !== modal.lastFacingLeft) {
        modal.turningTimer = 0.35;
    }
    modal.lastFacingLeft = currentFacingLeft;

    if (modal.turningTimer > 0) {
        modal.turningTimer = Math.max(0, modal.turningTimer - dt);
    }

    modal.fishX += modal.fishVx * dt;
    modal.fishY += modal.fishVy * dt;

    const pad = 25;
    if (modal.fishX < pad) { modal.fishX = pad; modal.fishVx = Math.abs(modal.fishVx); }
    if (modal.fishX > uvW - pad) { modal.fishX = uvW - pad; modal.fishVx = -Math.abs(modal.fishVx); }
    if (modal.fishY < pad) { modal.fishY = pad; modal.fishVy = Math.abs(modal.fishVy); }
    if (modal.fishY > uvH - pad) { modal.fishY = uvH - pad; modal.fishVy = -Math.abs(modal.fishVy); }

    // Spongy Hook Controls (Inertia & Drag)
    const accel = 700;
    const drag = 3.5;
    let moveX = 0, moveY = 0;
    if (typeof keysPressed !== 'undefined') {
        if (keysPressed.has('ArrowUp') || keysPressed.has('w') || keysPressed.has('W')) moveY -= 1;
        if (keysPressed.has('ArrowDown') || keysPressed.has('s') || keysPressed.has('S')) moveY += 1;
        if (keysPressed.has('ArrowLeft') || keysPressed.has('a') || keysPressed.has('A')) moveX -= 1;
        if (keysPressed.has('ArrowRight') || keysPressed.has('d') || keysPressed.has('D')) moveX += 1;
    }
    if (modal.touchMoveX) moveX = modal.touchMoveX;
    if (modal.touchMoveY) moveY = modal.touchMoveY;

    if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        modal.hookVx += (moveX / len) * accel * dt;
        modal.hookVy += (moveY / len) * accel * dt;
    }

    // Apply drag / friction so impulse gradually wears off
    modal.hookVx -= modal.hookVx * drag * dt;
    modal.hookVy -= modal.hookVy * drag * dt;

    modal.hookX += modal.hookVx * dt;
    modal.hookY += modal.hookVy * dt;

    if (modal.hookX < 15) { modal.hookX = 15; modal.hookVx = 0; }
    if (modal.hookX > uvW - 15) { modal.hookX = uvW - 15; modal.hookVx = 0; }
    if (modal.hookY < 15) { modal.hookY = 15; modal.hookVy = 0; }
    if (modal.hookY > uvH - 15) { modal.hookY = uvH - 15; modal.hookVy = 0; }

    // Reach Circle (radius 55) vs Fish (radius 15) Collision Detection
    const reachRadius = 55;
    const dist = Math.hypot(modal.fishX - modal.hookX, modal.fishY - modal.hookY);
    const inReach = dist <= (reachRadius + 15);

    if (inReach) {
        modal.catchMeter = Math.min(100, modal.catchMeter + 28 * dt);
    } else {
        modal.catchMeter = Math.max(0, modal.catchMeter - 10 * dt);
    }

    if (modal.catchMeter >= 100) {
        modal.active = false;
        resolveFishingCatch(modal.waterType);
    } else if (modal.timer <= 0) {
        modal.active = false;
        resolveFishingTimeout();
    }
}

function resolveFishingCatch(waterType) {
    const state = minigameState;
    const probs = getWaterProbabilities(waterType);
    const isFish = Math.random() < probs.fishRate;
    if (isFish) {
        const types = ['cod', 'walleye', 'rainbow trout'];
        const type = types[Math.floor(Math.random() * types.length)];
        state.fishWindow = { type: 'fish', title: type.toUpperCase(), desc: `You caught a ${type}!`, img: fishImages[type] };
        success();
        showDialog('Blair the Stylish Pirate', 'Patrice', `Amazing fishing! That be a fine ${type}!`);
    } else {
        const types = ['boot', 'soda can', 'accordion'];
        const type = types[Math.floor(Math.random() * types.length)];
        state.fishWindow = { type: 'trash', title: type.toUpperCase(), desc: `It's just a ${type}...`, img: fishImages[type] };
        showDialog('Blair the Stylish Pirate', 'Patrice', `Bah, another curséd ${type}. Try again, matey!`);
    }
}

function resolveFishingTimeout() {
    const state = minigameState;
    state.fishWindow = { type: 'nothing', title: 'NOTHING!', desc: 'The hook came up empty...' };
    failure();
    showDialog('Blair the Stylish Pirate', 'Patrice', "Yarr, ye cast ye hook and ye got back bupkus! I'd call that a fail.");
}

function handleFishingOutcome(type) {
    const state = minigameState;
    if (type === 'fish') {
        const types = ['cod', 'walleye', 'rainbow trout'];
        const fishName = types[Math.floor(Math.random() * types.length)];
        state.fishWindow = { type: 'fish', title: fishName.toUpperCase(), desc: `You caught a ${fishName}!`, img: fishImages[fishName] };
        success();
        showDialog('Blair the Stylish Pirate', 'Patrice', `Amazing fishing! That be a fine ${fishName}!`);
    } else if (type === 'nothing') {
        state.fishWindow = { type: 'nothing', title: 'NOTHING!', desc: 'The hook came up empty...' };
        failure();
        showDialog('Blair the Stylish Pirate', 'Patrice', "Yarr, ye cast ye hook and ye got back bupkus! I'd call that a fail.");
    } else if (type === 'trash') {
        const types = ['boot', 'soda can', 'accordion'];
        const trashName = types[Math.floor(Math.random() * types.length)];
        state.fishWindow = { type: 'trash', title: trashName.toUpperCase(), desc: `It's just a ${trashName}...`, img: fishImages[trashName] };
        showDialog('Blair the Stylish Pirate', 'Patrice', `Bah, another curséd ${trashName}. Try again, matey!`);
    }
}

function drawFishGame() {
    const state = minigameState;

    const now = Date.now();
    const dt = Math.min(0.1, (now - (state.lastFrameTime || now)) / 1000);
    state.lastFrameTime = now;

    // Draw background
    if (fishingBgImg.complete) ctx.drawImage(fishingBgImg, 0, 0, canvas.width, canvas.height);

    // Draw boat
    const cellW = canvas.width / 16;
    const cellH = canvas.height / 12;
    const bx = state.boat.gridX * cellW + cellW / 2;
    const by = state.boat.gridY * cellH + cellH / 2;
    
    if (fishingBoatImg.complete) {
        let spriteIdx = 0; // default North
        if (state.boat.dir === 'south') spriteIdx = 1;
        else if (state.boat.dir === 'east') spriteIdx = 2;
        else if (state.boat.dir === 'west') spriteIdx = 3;

        const sw = 465;
        const sh = fishingBoatImg.height;
        const dw = 64; 
        const dh = (sh / sw) * dw;

        ctx.drawImage(fishingBoatImg, spriteIdx * sw, 0, sw, sh, bx - dw / 2, by - dh / 2, dw, dh);

        // Draw player sprite in boat
        const actorName = CAST[selectedIndex].actor.toLowerCase();
        const sitSheet = sitSprites[actorName];
        if (sitSheet && sitSheet.complete) {
            let playerRow = 0; // north
            if (state.boat.dir === 'west') playerRow = 1;
            else if (state.boat.dir === 'south') playerRow = 2;
            else if (state.boat.dir === 'east') playerRow = 3;

            const pw = 48; 
            const ph = 48;
            ctx.drawImage(sitSheet, 64, playerRow * 64, 64, 64, bx - pw / 2, by - ph / 2 - 20, pw, ph);
        }
    }

    if (state.fishModal && state.fishModal.active) {
        updateFishingModal(dt);
        drawFishingModal();
    } else if (state.fishWindow) {
        drawFishingWindow();
    } else if (isMobileMode) {
        // Render touch D-pad and CAST button
        drawTouchButton(20, 680, 70, 70, '▲', { bgColor: '#222244' });
        drawTouchButton(20, 755, 70, 40, '▼', { bgColor: '#222244' });
        drawTouchButton(95, 715, 70, 70, '◄', { bgColor: '#222244' });
        drawTouchButton(170, 715, 70, 70, '►', { bgColor: '#222244' });

        drawTouchButton(360, 680, 210, 100, 'CAST HOOK', { bgColor: '#004400', font: '14px "Press Start 2P"' });
    }
}

const fishSprites = {
    normalswim: new Image(),
    normalswimup: new Image(),
    normalswimdown: new Image(),
    normalturning: new Image()
};

fishSprites.normalswim.src = 'images/sprites/fish/Normal Actions/normalswim.png';
fishSprites.normalswimup.src = 'images/sprites/fish/Normal Actions/normalswimdiagup.png';
fishSprites.normalswimdown.src = 'images/sprites/fish/Normal Actions/normalswimdiagdown.png';
fishSprites.normalturning.src = 'images/sprites/fish/Normal Actions/NormalTurning.png';

function drawPixelFish(ctx, x, y, vx, vy, isTurning) {
    if (isNaN(x) || isNaN(y)) return;
    
    // Support legacy call signature: drawPixelFish(ctx, x, y, facingLeft, isDeep)
    if (typeof vx === 'boolean') {
        const facingLeft = vx;
        vx = facingLeft ? -100 : 100;
        vy = 0;
    }

    let facingLeft = true;
    if (typeof vx === 'number') {
        if (vx < -5) {
            facingLeft = true;
        } else if (vx > 5) {
            facingLeft = false;
        } else if (typeof minigameState !== 'undefined' && minigameState.fishModal && typeof minigameState.fishModal.lastFacingLeft !== 'undefined') {
            facingLeft = minigameState.fishModal.lastFacingLeft;
        }
    }

    // Exclusively select from the 4 requested animation files:
    // normalswim, normalswimdown, normalswimup, and normalturning
    let sheet = fishSprites.normalswim;
    let isStrip = false; // 2x2 grid (128x128) vs 1x4 horizontal strip (256x64)

    const turningActive = isTurning || (typeof minigameState !== 'undefined' && minigameState.fishModal && minigameState.fishModal.turningTimer > 0);

    if (turningActive && fishSprites.normalturning.complete && fishSprites.normalturning.width > 0) {
        sheet = fishSprites.normalturning;
        isStrip = true;
    } else if (vy < -20 && fishSprites.normalswimup.complete && fishSprites.normalswimup.width > 0) {
        sheet = fishSprites.normalswimup;
    } else if (vy > 20 && fishSprites.normalswimdown.complete && fishSprites.normalswimdown.width > 0) {
        sheet = fishSprites.normalswimdown;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (sheet && sheet.complete && sheet.width > 0) {
        // 4-frame animation loop (8 FPS)
        const frameIdx = Math.floor(Date.now() / 125) % 4;
        
        let srcX = 0;
        let srcY = 0;
        if (isStrip) {
            srcX = frameIdx * 64;
            srcY = 0;
        } else {
            srcX = (frameIdx % 2) * 64;
            srcY = Math.floor(frameIdx / 2) * 64;
        }

        const snapX = Math.floor(x);
        const snapY = Math.floor(y);

        ctx.translate(snapX, snapY);
        // Raw sprite PNGs natively face LEFT.
        // If facing right (!facingLeft), flip horizontally.
        if (!facingLeft) {
            ctx.scale(-1, 1);
        }

        // Draw 64x64 fish sprite centered at (x, y)
        ctx.drawImage(sheet, srcX, srcY, 64, 64, -32, -32, 64, 64);
    } else {
        // Fallback procedural fish matrix if images are not yet loaded
        const px = 4;
        const snapX = Math.floor(x / px) * px;
        const snapY = Math.floor(y / px) * px;

        ctx.translate(snapX, snapY);
        if (!facingLeft) ctx.scale(-1, 1);

        const bodyColor = isDeep ? '#ff2a6d' : '#ff9f1c';
        const bellyColor = isDeep ? '#ff758f' : '#ffe6a7';

        const fishMap = [
            [0,0,0,0,1,1,1,1,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,1,2,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,3,3,3,3,1,1,1,1],
            [0,1,1,1,3,3,3,3,1,1,0,0],
            [0,0,1,1,0,0,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,1,1,0,0]
        ];

        for (let r = 0; r < fishMap.length; r++) {
            for (let c = 0; c < fishMap[r].length; c++) {
                const val = fishMap[r][c];
                if (val === 0) continue;
                const bx = (c - 6) * px;
                const by = (r - 4) * px;

                if (val === 1) ctx.fillStyle = bodyColor;
                else if (val === 2) ctx.fillStyle = '#ffffff';
                else if (val === 3) ctx.fillStyle = bellyColor;

                ctx.fillRect(bx, by, px, px);
            }
        }
        ctx.fillStyle = '#000000';
        ctx.fillRect(2 * px, -2 * px, px, px);
    }

    ctx.restore();
}

function drawPixelReachCircle(ctx, centerX, centerY, radius) {
    if (isNaN(centerX) || isNaN(centerY) || isNaN(radius)) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const px = 4;
    const cx = Math.floor(centerX / px) * px;
    const cy = Math.floor(centerY / px) * px;
    const r2 = radius * radius;
    const innerR2 = (radius - px * 1.5) * (radius - px * 1.5);

    for (let dy = -radius; dy <= radius; dy += px) {
        for (let dx = -radius; dx <= radius; dx += px) {
            const d2 = dx * dx + dy * dy;
            if (d2 <= r2) {
                const pxX = cx + dx;
                const pxY = cy + dy;
                if (d2 >= innerR2) {
                    ctx.fillStyle = '#4cc9f0';
                    ctx.fillRect(pxX, pxY, px, px);
                } else if ((Math.floor((pxX + pxY) / px) % 2) === 0) {
                    ctx.fillStyle = 'rgba(46, 196, 182, 0.4)';
                    ctx.fillRect(pxX, pxY, px, px);
                }
            }
        }
    }
    ctx.restore();
}

function drawPixelHookAndLine(ctx, hookX, hookY, topY) {
    if (isNaN(hookX) || isNaN(hookY) || isNaN(topY)) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const px = 4;
    const hx = Math.floor(hookX / px) * px;
    const hy = Math.floor(hookY / px) * px;
    const ty = Math.floor(topY / px) * px;

    // Line (4px thick blocky pixel line)
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(hx, ty, px, hy - ty);

    // Pixel Hook (J-shape)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx, hy, px, px * 3);
    ctx.fillRect(hx - px, hy + px * 2, px, px);
    ctx.fillRect(hx - px * 2, hy + px, px, px);
    ctx.restore();
}

function drawPixelUnderwaterBg(ctx, uvX, uvY, uvW, uvH) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 4 horizontal 8-bit NES color bands
    const bandH = Math.floor(uvH / 4);
    const colors = ['#001845', '#002855', '#003566', '#004b23'];
    colors.forEach((c, i) => {
        ctx.fillStyle = c;
        const y = uvY + i * bandH;
        const h = (i === 3) ? (uvY + uvH - y) : bandH;
        ctx.fillRect(uvX, y, uvW, h);
    });

    // Blocky pixel sand at bottom
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(uvX, uvY + uvH - 24, uvW, 24);
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(uvX, uvY + uvH - 12, uvW, 12);
    // Sand pixel details
    ctx.fillStyle = '#9a7b56';
    for (let x = uvX; x < uvX + uvW; x += 16) {
        ctx.fillRect(x + 4, uvY + uvH - 8, 4, 4);
    }

    // 4x4 square pixel bubbles
    const t = Math.floor(Date.now() / 150);
    ctx.fillStyle = '#8ecae6';
    for (let i = 0; i < 6; i++) {
        const bx = uvX + Math.floor(((i * 85 + t * 12) % (uvW - 10)) / 4) * 4;
        const by = uvY + uvH - 28 - Math.floor(((i * 60 + t * 24) % (uvH - 50)) / 4) * 4;
        ctx.fillRect(bx, by, 4, 4);
    }

    ctx.restore();
}

function drawFishingModal() {
    const state = minigameState;
    const modal = state.fishModal;
    if (!modal || !modal.active) return;

    ctx.save();
    try {
        ctx.imageSmoothingEnabled = false;

        const winX = isMobileMode ? 20 : 50;
        const winY = isMobileMode ? 80 : 60;
        const winW = isMobileMode ? 560 : 700;
        const winH = isMobileMode ? 680 : 480;

        // Outer modal container
        ctx.fillStyle = 'rgba(10, 20, 40, 0.95)';
        ctx.fillRect(winX, winY, winW, winH);
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 4;
        ctx.strokeRect(winX, winY, winW, winH);

        // Layout configuration
        const uvX = winX + 20;
        const uvY = winY + 20;
        const uvW = isMobileMode ? 520 : 450;
        const uvH = isMobileMode ? 360 : 440;

        const rpX = isMobileMode ? (winX + 20) : (winX + 490);
        const rpY = isMobileMode ? (winY + 400) : (winY + 20);
        const rpW = isMobileMode ? 520 : 190;
        const rpH = isMobileMode ? 140 : 440;

        // Sanitized coordinates & values
        const timerVal = (typeof modal.timer === 'number' && !isNaN(modal.timer)) ? modal.timer : 15.0;
        const meterVal = (typeof modal.catchMeter === 'number' && !isNaN(modal.catchMeter)) ? modal.catchMeter : 0;
        const hookXVal = (typeof modal.hookX === 'number' && !isNaN(modal.hookX)) ? modal.hookX : (uvW / 2);
        const hookYVal = (typeof modal.hookY === 'number' && !isNaN(modal.hookY)) ? modal.hookY : (uvH / 2);
        const fishXVal = (typeof modal.fishX === 'number' && !isNaN(modal.fishX)) ? modal.fishX : (uvW / 2);
        const fishYVal = (typeof modal.fishY === 'number' && !isNaN(modal.fishY)) ? modal.fishY : (uvH / 2);
        const fishVxVal = (typeof modal.fishVx === 'number' && !isNaN(modal.fishVx)) ? modal.fishVx : 0;
        const fishVyVal = (typeof modal.fishVy === 'number' && !isNaN(modal.fishVy)) ? modal.fishVy : 0;
        const distToHook = Math.hypot(fishXVal - hookXVal, fishYVal - hookYVal);
        const inReach = distToHook <= (55 + 15);

        // --- Underwater Viewport ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(uvX, uvY, uvW, uvH);
        ctx.clip();

        // Banded 8-bit underwater background & sand
        drawPixelUnderwaterBg(ctx, uvX, uvY, uvW, uvH);

        // Hook & line
        const hookAbsX = uvX + hookXVal;
        const hookAbsY = uvY + hookYVal;
        drawPixelHookAndLine(ctx, hookAbsX, hookAbsY, uvY);

        // Reach circle around hook (Chunky 8-bit pixel circle)
        const reachRadius = 55;
        drawPixelReachCircle(ctx, hookAbsX, hookAbsY, reachRadius);

        // 8-Bit Animated Pixel Fish (using normalswim, normalswimdown, normalswimup, normalturning)
        const fishAbsX = uvX + fishXVal;
        const fishAbsY = uvY + fishYVal;
        const isTurning = modal.turningTimer > 0;
        drawPixelFish(ctx, fishAbsX, fishAbsY, fishVxVal, fishVyVal, isTurning);

        ctx.restore(); // end clip

        // Viewport border
        ctx.strokeStyle = '#4895ef';
        ctx.lineWidth = 4;
        ctx.strokeRect(uvX, uvY, uvW, uvH);

        // --- Right / Panel Section (Stopwatch & Segmented Catch Meter) ---
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(rpX, rpY, rpW, rpH);
        ctx.strokeStyle = '#3a0ca3';
        ctx.lineWidth = 3;
        ctx.strokeRect(rpX, rpY, rpW, rpH);

        // Stopwatch countdown display
        ctx.fillStyle = '#ffd166';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('STOPWATCH', rpX + rpW / 2, rpY + (isMobileMode ? 25 : 35));

        ctx.fillStyle = '#ffffff';
        ctx.font = isMobileMode ? '16px "Press Start 2P"' : '20px "Press Start 2P"';
        ctx.fillText(`${timerVal.toFixed(1)}s`, rpX + rpW / 2, rpY + (isMobileMode ? 55 : 75));

        // Segmented 8-bit NES Catch Meter
        ctx.fillStyle = '#2ec4b6';
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('CATCH METER', rpX + rpW / 2, rpY + (isMobileMode ? 85 : 140));

        const barW = isMobileMode ? 220 : 160;
        const barH = 26;
        const barX = rpX + (rpW - barW) / 2;
        const barY = rpY + (isMobileMode ? 95 : 155);

        ctx.fillStyle = '#111122';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barW, barH);

        const filledSegments = Math.floor(meterVal / 10);
        const segW = (barW - 12) / 10;
        const segColor = meterVal > 70 ? '#00ff66' : (meterVal > 30 ? '#ffb703' : '#e63946');

        for (let s = 0; s < 10; s++) {
            const sx = barX + 6 + s * segW;
            if (s < filledSegments) {
                ctx.fillStyle = segColor;
                ctx.fillRect(sx, barY + 4, segW - 2, barH - 8);
            } else {
                ctx.fillStyle = '#222244';
                ctx.fillRect(sx, barY + 4, segW - 2, barH - 8);
            }
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText(`${Math.floor(meterVal)}%`, rpX + rpW / 2, barY + barH + 18);

        // Directional touch buttons for hook navigation
        const btnY = (isMobileMode ? 80 : 60) + winH - 60;
        drawTouchButton(winX + 40, btnY, 45, 45, '▲', { bgColor: '#222244' });
        drawTouchButton(winX + 90, btnY, 45, 45, '▼', { bgColor: '#222244' });
        drawTouchButton(winX + 140, btnY, 45, 45, '◄', { bgColor: '#222244' });
        drawTouchButton(winX + 190, btnY, 45, 45, '►', { bgColor: '#222244' });

        ctx.fillStyle = '#cccccc';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('WASD / ARROWS / TOUCH BUTTONS', winX + 250, btnY + 28);
    } catch (err) {
        if (typeof console !== 'undefined' && console.error) {
            console.error("Error drawing fishing modal:", err);
        }
    } finally {
        ctx.restore();
    }
}

function drawFishingWindow() {
    const win = minigameState.fishWindow;
    const winX = isMobileMode ? 30 : 50;
    const winY = isMobileMode ? 100 : 50;
    const winW = isMobileMode ? 540 : 700;
    const winH = isMobileMode ? 600 : 500;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 4;
    ctx.strokeRect(winX, winY, winW, winH);

    if (isMobileMode) {
        if (fishingBoatLargeImg.complete) {
            ctx.drawImage(fishingBoatLargeImg, winX + 30, winY + 40, 220, 165);
        }
        if (win.img && win.img.complete) {
            ctx.drawImage(win.img, winX + 280, winY + 40, 180, 180);
        } else if (win.type === 'nothing') {
            ctx.strokeStyle = COLORS.RED; ctx.lineWidth = 12; ctx.beginPath();
            ctx.moveTo(winX + 280, winY + 40); ctx.lineTo(winX + 460, winY + 220);
            ctx.moveTo(winX + 460, winY + 40); ctx.lineTo(winX + 280, winY + 220);
            ctx.stroke();
        }

        ctx.fillStyle = COLORS.WHITE; ctx.font = '20px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(win.title, winX + winW / 2, winY + 270);
        
        ctx.font = '12px "Press Start 2P"';
        const lines = wrapTextLines(win.desc, winW - 60, '12px "Press Start 2P"');
        lines.forEach((line, i) => ctx.fillText(line, winX + winW / 2, winY + 330 + i * 24));

        if (Math.floor(Date.now() / 500) % 2 === 0) {
            drawTouchButton(winX + (winW - 240) / 2, winY + 480, 240, 65, 'TAP TO CLOSE', { bgColor: '#004400', font: '10px "Press Start 2P"' });
        }
    } else {
        if (fishingBoatLargeImg.complete) {
            ctx.drawImage(fishingBoatLargeImg, 100, 100, 300, 225);
        }

        if (win.img && win.img.complete) {
            ctx.drawImage(win.img, 450, 100, 200, 200);
        } else if (win.type === 'nothing') {
            ctx.strokeStyle = COLORS.RED;
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.moveTo(450, 100); ctx.lineTo(650, 300);
            ctx.moveTo(650, 100); ctx.lineTo(450, 300);
            ctx.stroke();
        }

        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(win.title, 400, 380);
        
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(win.desc, 400, 430);

        ctx.font = '14px "Press Start 2P"';
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            const prompt = isMobileMode ? 'Tap to Continue' : 'Press Enter to Continue';
            const promptX = isMobileMode ? (canvas.width / 2) : 400;
            ctx.fillText(prompt, promptX, 520);
        }
    }
}

function handleFishInput(key) {
    const state = minigameState;
    if (state.fishWindow) {
        if (key === 'Enter') {
            state.fishWindow = null;
        }
        return;
    }

    if (state.fishModal && state.fishModal.active) {
        const modal = state.fishModal;
        const nudge = 180;
        if (key === 'ArrowUp' || key === 'w' || key === 'W') modal.hookVy = (modal.hookVy || 0) - nudge;
        else if (key === 'ArrowDown' || key === 's' || key === 'S') modal.hookVy = (modal.hookVy || 0) + nudge;
        else if (key === 'ArrowLeft' || key === 'a' || key === 'A') modal.hookVx = (modal.hookVx || 0) - nudge;
        else if (key === 'ArrowRight' || key === 'd' || key === 'D') modal.hookVx = (modal.hookVx || 0) + nudge;
        return;
    }

    let nextX = state.boat.gridX;
    let nextY = state.boat.gridY;
    let nextDir = state.boat.dir;

    if (key === 'ArrowUp') { nextY--; nextDir = 'north'; }
    else if (key === 'ArrowDown') { nextY++; nextDir = 'south'; }
    else if (key === 'ArrowLeft') { nextX--; nextDir = 'west'; }
    else if (key === 'ArrowRight') { nextX++; nextDir = 'east'; }
    else if (key === 'Enter') {
        attemptFish();
        return;
    } else {
        return;
    }

    if (nextX >= 0 && nextX < 16 && nextY >= 0 && nextY < 12) {
        if (WATER_GRID[nextY][nextX] !== "LAND") {
            state.boat.gridX = nextX;
            state.boat.gridY = nextY;
            state.boat.dir = nextDir;
        }
    }
}

function handleFishTouch(x, y) {
    const state = minigameState;
    if (state.fishWindow) {
        state.fishWindow = null;
        return;
    }

    if (state.fishModal && state.fishModal.active) {
        const modal = state.fishModal;
        const winX = isMobileMode ? 20 : 50;
        const winH = isMobileMode ? 680 : 480;
        const btnY = (isMobileMode ? 80 : 60) + winH - 60;
        const nudge = 180;

        if (x >= winX + 40 && x <= winX + 85 && y >= btnY && y <= btnY + 45) modal.hookVy = (modal.hookVy || 0) - nudge;
        else if (x >= winX + 90 && x <= winX + 135 && y >= btnY && y <= btnY + 45) modal.hookVy = (modal.hookVy || 0) + nudge;
        else if (x >= winX + 140 && x <= winX + 185 && y >= btnY && y <= btnY + 45) modal.hookVx = (modal.hookVx || 0) - nudge;
        else if (x >= winX + 190 && x <= winX + 235 && y >= btnY && y <= btnY + 45) modal.hookVx = (modal.hookVx || 0) + nudge;
        return;
    }

    if (!isMobileMode) return;

    if (x >= 20 && x <= 90 && y >= 680 && y <= 750) handleFishInput('ArrowUp');
    else if (x >= 20 && x <= 90 && y >= 755 && y <= 795) handleFishInput('ArrowDown');
    else if (x >= 95 && x <= 165 && y >= 715 && y <= 785) handleFishInput('ArrowLeft');
    else if (x >= 170 && x <= 240 && y >= 715 && y <= 785) handleFishInput('ArrowRight');
    else if (x >= 360 && x <= 570 && y >= 680 && y <= 780) attemptFish();
}

function attemptFish() {
    const state = minigameState;
    if (!state.boat) return;
    const waterType = WATER_GRID[state.boat.gridY][state.boat.gridX];

    const launchModal = () => {
        startFishingModal(waterType);
    };

    if (!state.fishModal) {
        state.fishModal = { active: false, introShown: false };
    }

    if (!state.fishModal.introShown) {
        state.fishModal.introShown = true;
        showDialog('Blair the Stylish Pirate', 'Patrice',
            "Move the hook around to track the fish.\nIf you stay on target long enough, you'll bring 'er in!\nIf you're unlucky, \"'er\" will be a shoe or sumthin'.",
            launchModal
        );
    } else {
        launchModal();
    }
}
