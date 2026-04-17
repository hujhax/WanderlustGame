const CHEESE_TYPES = 8;
const GRID_SIZE = 8;
const CELL_SIZE = 55;
const FIELD_X = 280;
const FIELD_Y = 100;

function initCheeseGrid() {
    minigameState.grid = [];
    minigameState.visualGrid = [];
    minigameState.isAnimating = false;
    minigameState.fadingMatches = [];
    minigameState.chainLevel = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
        minigameState.grid[r] = [];
        minigameState.visualGrid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            const type = Math.floor(Math.random() * CHEESE_TYPES) + 1;
            minigameState.grid[r][c] = type;
            minigameState.visualGrid[r][c] = { 
                type, 
                x: FIELD_X + c * CELL_SIZE, 
                y: FIELD_Y + r * CELL_SIZE, 
                wobble: 0 
            };
        }
    }
    // Initial clear of any random matches
    let iterations = 0;
    while (checkMatches(false) && iterations < 10) {
        dropCheeses(false);
        iterations++;
    }
}

function drawCheese(type, x, y, size, wobble = 0) {
    if (type === 0 || !type) return;
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    if (wobble) ctx.rotate(Math.sin(Date.now() * 0.02) * wobble);
    ctx.translate(-size/2, -size/2);
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

function updateVisuals() {
    let anyMoving = false;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const v = minigameState.visualGrid[r][c];
            const targetX = FIELD_X + c * CELL_SIZE;
            const targetY = FIELD_Y + r * CELL_SIZE;
            const speed = 0.2;
            
            if (Math.abs(v.x - targetX) > 1) { v.x += (targetX - v.x) * speed; anyMoving = true; } 
            else { v.x = targetX; }
            
            if (Math.abs(v.y - targetY) > 1) { v.y += (targetY - v.y) * speed; v.wobble = 0.2; anyMoving = true; } 
            else { v.y = targetY; if (v.wobble > 0) v.wobble -= 0.01; }
            v.type = minigameState.grid[r][c];
        }
    }
    minigameState.isAnimating = anyMoving;
    return anyMoving;
}

function drawCheeseGame() {
    updateVisuals();
    
    // Handle fading matches
    if (minigameState.fadingMatches && minigameState.fadingMatches.length > 0) {
        let allDone = true;
        minigameState.fadingMatches.forEach(m => {
            m.alpha -= 0.08;
            if (m.alpha > 0) allDone = false;
        });
        if (allDone) {
            const matches = minigameState.fadingMatches;
            const chainLevel = minigameState.chainLevel;
            minigameState.fadingMatches = [];
            matches.forEach(m => {
                m.cells.forEach(p => { if (minigameState.grid[p.r]) minigameState.grid[p.r][p.c] = 0; });
            });
            audio.playSFX('chomp');
            setTimeout(() => dropCheeses(true, chainLevel + 1), 100);
        }
    }

    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    if (marketStallImg.complete) ctx.drawImage(marketStallImg, 10, 150, 220, 220);
    const barX = 240, barY = 150, barW = 20, barH = 300;
    ctx.strokeStyle = COLORS.WHITE; ctx.strokeRect(barX, barY, barW, barH);
    const fillH = (minigameState.progress / 500) * barH;
    ctx.fillStyle = COLORS.GREEN; ctx.fillRect(barX + 2, barY + barH - fillH, barW - 4, fillH);
    const btnX = 225, btnY = 80, btnSize = 50;
    ctx.fillStyle = COLORS.RED; ctx.fillRect(btnX, btnY, btnSize, btnSize);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("EAT", btnX + 25, btnY + 30);
    ctx.strokeStyle = COLORS.WHITE; ctx.strokeRect(FIELD_X, FIELD_Y, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = FIELD_X + c * CELL_SIZE, y = FIELD_Y + r * CELL_SIZE;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            if (minigameState.selected && minigameState.selected.r === r && minigameState.selected.c === c) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.4)'; ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Draw Cheeses using their visual positions
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const v = minigameState.visualGrid[r][c];
            if (v.type) {
                let alpha = 1;
                if (minigameState.fadingMatches) {
                    minigameState.fadingMatches.forEach(m => {
                        if (m.cells.some(p => p.r === r && p.c === c)) alpha = Math.max(0, m.alpha);
                    });
                }
                
                if (alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    drawCheese(v.type, v.x + 5, v.y + 5, CELL_SIZE - 10, v.wobble);
                    ctx.restore();
                }
            }
        }
    }

    // Draw boxes around fading matches
    if (minigameState.fadingMatches) {
        minigameState.fadingMatches.forEach(m => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, m.alpha)})`;
            ctx.lineWidth = 4;
            m.cells.forEach(p => {
                ctx.strokeRect(FIELD_X + p.c * CELL_SIZE + 4, FIELD_Y + p.r * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
            });
        });
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("Click two adjacent cheeses to exchange positions.", canvas.width / 2, canvas.height - 40);
    ctx.fillText("Generate groups of three cheeses to win!", canvas.width / 2, canvas.height - 25);
}

function handleCheeseClick(x, y) {
    if (minigameState.isAnimating || (minigameState.fadingMatches && minigameState.fadingMatches.length > 0)) return;
    const btnX = 225, btnY = 80, btnSize = 50;
    if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) { minigameState.eatMode = true; return; }
    const c = Math.floor((x - FIELD_X) / CELL_SIZE), r = Math.floor((y - FIELD_Y) / CELL_SIZE);
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && minigameState.grid) {
        if (minigameState.eatMode) {
            if (minigameState.grid[r]) {
                minigameState.grid[r][c] = 0; audio.playSFX('chomp'); minigameState.eatMode = false; failure(); dropCheeses(); 
            }
            return;
        }
        if (!minigameState.selected) {
            minigameState.selected = { r, c };
        } else {
            const s = minigameState.selected;
            if (Math.abs(s.r - r) + Math.abs(s.c - c) === 1) { swapCheeses(s.r, s.c, r, c); minigameState.selected = null; } 
            else { minigameState.selected = { r, c }; }
        }
    }
}

function swapCheeses(r1, c1, r2, c2) {
    const temp = minigameState.grid[r1][c1], vTemp = minigameState.visualGrid[r1][c1];
    minigameState.grid[r1][c1] = minigameState.grid[r2][c2]; minigameState.visualGrid[r1][c1] = minigameState.visualGrid[r2][c2];
    minigameState.grid[r2][c2] = temp; minigameState.visualGrid[r2][c2] = vTemp;
    
    setTimeout(() => {
        if (!checkMatches()) {
            const t = minigameState.grid[r1][c1], vt = minigameState.visualGrid[r1][c1];
            minigameState.grid[r1][c1] = minigameState.grid[r2][c2]; minigameState.visualGrid[r1][c1] = minigameState.visualGrid[r2][c2];
            minigameState.grid[r2][c2] = t; minigameState.visualGrid[r2][c2] = vt;
            audio.playSFX('alarm');
        }
    }, 500);
}

function checkMatches(award = true, chainLevel = 0) {
    if (!minigameState.grid) return false;
    let found = false;
    let newMatches = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        let count = 1;
        for (let c = 1; c <= GRID_SIZE; c++) {
            if (c < GRID_SIZE && minigameState.grid[r][c] === minigameState.grid[r][c-1] && minigameState.grid[r][c] !== 0) count++;
            else { 
                if (count >= 3) { 
                    found = true; 
                    let cells = [];
                    for (let i = 0; i < count; i++) cells.push({r, c: c-1-i}); 
                    newMatches.push({cells, alpha: 1});
                    if (award) awardCheesePoints(count, chainLevel); 
                } 
                count = 1; 
            }
        }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        let count = 1;
        for (let r = 1; r <= GRID_SIZE; r++) {
            if (r < GRID_SIZE && minigameState.grid[r][c] === minigameState.grid[r-1][c] && minigameState.grid[r][c] !== 0) count++;
            else { 
                if (count >= 3) { 
                    found = true; 
                    let cells = [];
                    for (let i = 0; i < count; i++) cells.push({r: r-1-i, c}); 
                    newMatches.push({cells, alpha: 1});
                    if (award) awardCheesePoints(count, chainLevel); 
                } 
                count = 1; 
            }
        }
    }

    if (found) {
        if (award) {
            minigameState.fadingMatches = newMatches;
            minigameState.chainLevel = chainLevel;
        } else {
            newMatches.forEach(m => {
                m.cells.forEach(p => { if (minigameState.grid[p.r]) minigameState.grid[p.r][p.c] = 0; });
            });
        }
    }
    return found;
}

function awardCheesePoints(count, chainLevel) {
    let pts = (count === 3) ? 100 : (count === 4) ? 200 : 400;
    if (chainLevel > 0) pts += (chainLevel * 100);
    minigameState.progress += pts;
    if (minigameState.progress >= 500) { success(); minigameState.progress -= 500; }
}

function dropCheeses(award = true, chainLevel = 0) {
    if (!minigameState.grid) return;
    for (let c = 0; c < GRID_SIZE; c++) {
        let emptyCount = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (minigameState.grid[r][c] === 0) emptyCount++;
            else if (emptyCount > 0) {
                minigameState.grid[r + emptyCount][c] = minigameState.grid[r][c]; minigameState.grid[r][c] = 0;
                const v = minigameState.visualGrid[r][c]; minigameState.visualGrid[r + emptyCount][c] = v;
            }
        }
        for (let r = 0; r < emptyCount; r++) {
            const type = Math.floor(Math.random() * CHEESE_TYPES) + 1;
            minigameState.grid[r][c] = type;
            minigameState.visualGrid[r][c] = { type: type, x: FIELD_X + c * CELL_SIZE, y: FIELD_Y - (emptyCount - r) * CELL_SIZE, wobble: 0.2 };
        }
    }
    if (award) setTimeout(() => checkMatches(true, chainLevel), 500);
}
