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

function initFishGame() {
    minigameState.grid = [];
    const rows = 12;
    const cols = 16;
    const cellW = 800 / cols;
    const cellH = 600 / rows;

    for (let r = 0; r < rows; r++) {
        minigameState.grid[r] = [];
        for (let c = 0; c < cols; c++) {
            minigameState.grid[r][c] = 0;
        }
    }

    const findValidPos = () => {
        for (let i = 0; i < 100; i++) {
            const rx = Math.random() * cols;
            const ry = Math.random() * rows;
            const gc = Math.floor(rx);
            const gr = Math.floor(ry);
            if (WATER_GRID[gr][gc] !== "LAND") return { x: rx, y: ry };
        }
        // Default to first valid water cell if random fails
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (WATER_GRID[r][c] !== "LAND") return { x: c + 0.5, y: r + 0.5 };
            }
        }
        return { x: cols / 2, y: rows / 2 };
    };

    // Start in the center of the screen
    let startX = 8;
    let startY = 6;
    // Find nearest valid water cell to center
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
}

function drawFishGame() {
    const state = minigameState;

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

            // Use second column (sx = 64)
            const pw = 48; 
            const ph = 48;
            ctx.drawImage(sitSheet, 64, playerRow * 64, 64, 64, bx - pw / 2, by - ph / 2 - 20, pw, ph);
        }
    }

    if (isMobileMode && !state.fishWindow) {
        // Render touch D-pad and CAST button
        drawTouchButton(20, 680, 70, 70, '▲', { bgColor: '#222244' });
        drawTouchButton(20, 755, 70, 40, '▼', { bgColor: '#222244' });
        drawTouchButton(95, 715, 70, 70, '◄', { bgColor: '#222244' });
        drawTouchButton(170, 715, 70, 70, '►', { bgColor: '#222244' });

        drawTouchButton(360, 680, 210, 100, 'CAST HOOK', { bgColor: '#004400', font: '14px "Press Start 2P"' });
    }

    if (state.fishWindow) {
        drawFishingWindow();
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
    if (!isMobileMode) return;
    const state = minigameState;
    if (state.fishWindow) {
        state.fishWindow = null;
        return;
    }

    if (x >= 20 && x <= 90 && y >= 680 && y <= 750) handleFishInput('ArrowUp');
    else if (x >= 20 && x <= 90 && y >= 755 && y <= 795) handleFishInput('ArrowDown');
    else if (x >= 95 && x <= 165 && y >= 715 && y <= 785) handleFishInput('ArrowLeft');
    else if (x >= 170 && x <= 240 && y >= 715 && y <= 785) handleFishInput('ArrowRight');
    else if (x >= 360 && x <= 570 && y >= 680 && y <= 780) attemptFish();
}


function attemptFish() {
    const state = minigameState;
    const waterType = WATER_GRID[state.boat.gridY][state.boat.gridX];

    let catchProb = 0;
    let fishProb = 0;

    if (waterType === "DEEP") {
        catchProb = 0.2;
        fishProb = 1.0;
    } else if (waterType === "NORMAL") {
        catchProb = 0.5;
        fishProb = 1.0;
    } else if (waterType === "SHALLOW") {
        catchProb = 1.0;
        fishProb = 0.2;
    }

    const caughtAnything = Math.random() < catchProb;
    
    if (!caughtAnything) {
        state.fishWindow = { type: 'nothing', title: 'NOTHING!', desc: 'The hook came up empty...' };
        failure();
        showDialog('Blair the Stylish Pirate', 'Patrice', "Yarr, ye cast ye hook and ye got back bupkus! I'd call that a fail.");
    } else {
        const isFish = Math.random() < fishProb;
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
}
