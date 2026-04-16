const CHEESE_TYPES = 8;
const GRID_SIZE = 8;

function initCheeseGrid() {
    minigameState.grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        minigameState.grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            minigameState.grid[r][c] = Math.floor(Math.random() * CHEESE_TYPES) + 1;
        }
    }
    // Initial clear of any random matches
    let iterations = 0;
    while (checkMatches(false) && iterations < 10) {
        dropCheeses(false);
        iterations++;
    }
}

function drawCheese(type, x, y, size) {
    if (type === 0 || !type) return;
    ctx.save();
    ctx.translate(x, y);
    const s = size / 32;
    ctx.scale(s, s);

    switch(type) {
        case 1: // Swiss
            ctx.fillStyle = '#FFD860'; ctx.beginPath(); ctx.moveTo(4, 28); ctx.lineTo(28, 28); ctx.lineTo(28, 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#F7B23B'; [ [10, 24, 3], [18, 22, 2], [24, 18, 3] ].forEach(h => { ctx.beginPath(); ctx.arc(h[0], h[1], h[2], 0, Math.PI * 2); ctx.fill(); });
            break;
        case 2: // Cheddar Wheel
            ctx.fillStyle = '#A82200'; ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFD860'; ctx.beginPath(); ctx.moveTo(16, 16); ctx.lineTo(28, 16); ctx.lineTo(24, 24); ctx.closePath(); ctx.fill();
            break;
        case 3: // Brie
            ctx.fillStyle = '#DFD6CA'; ctx.beginPath(); ctx.moveTo(4, 28); ctx.lineTo(28, 28); ctx.lineTo(28, 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#FFF594'; ctx.beginPath(); ctx.moveTo(8, 26); ctx.lineTo(26, 26); ctx.lineTo(26, 16); ctx.closePath(); ctx.fill();
            break;
        case 4: // Blue Cheese
            ctx.fillStyle = '#FFF594'; ctx.fillRect(6, 6, 20, 20);
            ctx.fillStyle = '#679185'; for(let i=0; i<10; i++) ctx.fillRect(8 + (i*7)%18, 8 + (i*13)%18, 2, 2);
            break;
        case 5: // Gouda
            ctx.fillStyle = '#F7B23B'; ctx.beginPath(); ctx.moveTo(8, 28); ctx.lineTo(24, 28); ctx.lineTo(16, 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#FFD860'; ctx.beginPath(); ctx.moveTo(10, 26); ctx.lineTo(22, 26); ctx.lineTo(16, 8); ctx.closePath(); ctx.fill();
            break;
        case 6: // Parmesan
            ctx.fillStyle = '#DFD6CA'; ctx.beginPath(); ctx.moveTo(4, 28); ctx.lineTo(28, 28); ctx.lineTo(16, 10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#F7B23B'; for(let i=0; i<8; i++) ctx.fillRect(8 + (i*5)%16, 22 + (i*3)%6, 1, 1);
            break;
        case 7: // Mozzarella
            ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#DFD6CA'; ctx.lineWidth = 1; ctx.stroke();
            break;
        case 8: // Cheese String
            ctx.fillStyle = '#FFF594'; ctx.fillRect(12, 8, 8, 20);
            ctx.strokeStyle = '#FFF594'; ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(8, 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(20, 8); ctx.lineTo(24, 4); ctx.stroke();
            break;
    }
    ctx.restore();
}

function drawCheeseGame() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    
    if (marketStallImg.complete) {
        ctx.drawImage(marketStallImg, 10, 150, 220, 220);
    }

    const barX = 240, barY = 150, barW = 20, barH = 300;
    ctx.strokeStyle = COLORS.WHITE; ctx.strokeRect(barX, barY, barW, barH);
    const fillH = (minigameState.progress / 500) * barH;
    ctx.fillStyle = COLORS.GREEN; ctx.fillRect(barX + 2, barY + barH - fillH, barW - 4, fillH);

    const btnX = 225, btnY = 80, btnSize = 50;
    ctx.fillStyle = COLORS.RED; ctx.fillRect(btnX, btnY, btnSize, btnSize);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("EAT", btnX + 25, btnY + 30);

    const fieldX = 280, fieldY = 100, cellSize = 55;
    ctx.strokeStyle = COLORS.WHITE; ctx.strokeRect(fieldX, fieldY, GRID_SIZE * cellSize, GRID_SIZE * cellSize);

    if (minigameState.grid) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!minigameState.grid[r]) continue;
                const type = minigameState.grid[r][c];
                const x = fieldX + c * cellSize, y = fieldY + r * cellSize;
                if (minigameState.selected && minigameState.selected.r === r && minigameState.selected.c === c) {
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)'; ctx.fillRect(x, y, cellSize, cellSize);
                }
                if (type) drawCheese(type, x + 5, y + 5, cellSize - 10);
            }
        }
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("Click two adjacent cheeses to exchange positions.", canvas.width / 2, canvas.height - 40);
    ctx.fillText("Generate groups of three cheeses to win!", canvas.width / 2, canvas.height - 25);
}

function handleCheeseClick(x, y) {
    const btnX = 225, btnY = 80, btnSize = 50;
    if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) {
        minigameState.eatMode = true; return;
    }

    const fieldX = 280, fieldY = 100, cellSize = 55;
    const c = Math.floor((x - fieldX) / cellSize);
    const r = Math.floor((y - fieldY) / cellSize);

    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && minigameState.grid) {
        if (minigameState.eatMode) {
            if (minigameState.grid[r]) {
                minigameState.grid[r][c] = 0; audio.playSFX('chomp'); minigameState.eatMode = false;
                failure(); dropCheeses(); 
            }
            return;
        }
        if (!minigameState.selected) {
            minigameState.selected = { r, c };
        } else {
            const s = minigameState.selected;
            if (Math.abs(s.r - r) + Math.abs(s.c - c) === 1) {
                swapCheeses(s.r, s.c, r, c); minigameState.selected = null;
            } else {
                minigameState.selected = { r, c };
            }
        }
    }
}

function swapCheeses(r1, c1, r2, c2) {
    if (!minigameState.grid || !minigameState.grid[r1] || !minigameState.grid[r2]) return;
    const temp = minigameState.grid[r1][c1];
    minigameState.grid[r1][c1] = minigameState.grid[r2][c2];
    minigameState.grid[r2][c2] = temp;
    if (!checkMatches()) {
        setTimeout(() => {
            if (minigameState.grid && minigameState.grid[r1] && minigameState.grid[r2]) {
                const t = minigameState.grid[r1][c1];
                minigameState.grid[r1][c1] = minigameState.grid[r2][c2];
                minigameState.grid[r2][c2] = t;
                audio.playSFX('alarm');
            }
        }, 300);
    }
}

function checkMatches(award = true) {
    if (!minigameState.grid) return false;
    let found = false, toRemove = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        let count = 1;
        if (!minigameState.grid[r]) continue;
        for (let c = 1; c <= GRID_SIZE; c++) {
            if (c < GRID_SIZE && minigameState.grid[r][c] === minigameState.grid[r][c-1] && minigameState.grid[r][c] !== 0) count++;
            else { if (count >= 3) { found = true; for (let i = 0; i < count; i++) toRemove.push({r, c: c-1-i}); if (award) awardCheesePoints(count); } count = 1; }
        }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        let count = 1;
        for (let r = 1; r <= GRID_SIZE; r++) {
            if (r < GRID_SIZE && minigameState.grid[r] && minigameState.grid[r-1] && minigameState.grid[r][c] === minigameState.grid[r-1][c] && minigameState.grid[r][c] !== 0) count++;
            else { if (count >= 3) { found = true; for (let i = 0; i < count; i++) toRemove.push({r: r-1-i, c}); if (award) awardCheesePoints(count); } count = 1; }
        }
    }
    if (found) {
        toRemove.forEach(p => { if (minigameState.grid[p.r]) minigameState.grid[p.r][p.c] = 0; });
        if (award) { audio.playSFX('chomp'); dropCheeses(); }
    }
    return found;
}

function awardCheesePoints(count) {
    let pts = (count === 3) ? 100 : (count === 4) ? 200 : 400;
    minigameState.progress += pts;
    if (minigameState.progress >= 500) { success(); minigameState.progress -= 500; }
}

function dropCheeses(award = true) {
    if (!minigameState.grid) return;
    for (let c = 0; c < GRID_SIZE; c++) {
        let empty = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (minigameState.grid[r][c] === 0) empty++;
            else if (empty > 0) { minigameState.grid[r + empty][c] = minigameState.grid[r][c]; minigameState.grid[r][c] = 0; }
        }
        for (let r = 0; r < empty; r++) {
            if (minigameState.grid[r]) minigameState.grid[r][c] = Math.floor(Math.random() * CHEESE_TYPES) + 1;
        }
    }
    if (award) setTimeout(() => checkMatches(), 200);
}
