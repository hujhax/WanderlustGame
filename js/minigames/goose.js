// ============================================================
// UNPLEASANT GOOSE GAME
// Turn-based grid puzzle: navigate to target without getting
// caught by geese. Geese have a cone-of-recognition AI.
// ============================================================

// ── Tile types ───────────────────────────────────────────────
const GOOSE_TILE = { GRASS: 'G', WATER: 'W', BOULDER: 'B' };

// ── Direction helpers ────────────────────────────────────────
const GOOSE_DIR = { N: 'N', S: 'S', E: 'E', W: 'W' };

function gooseDelta(dir) {
    if (dir === GOOSE_DIR.N) return { dx: 0, dy: -1 };
    if (dir === GOOSE_DIR.S) return { dx: 0, dy: 1 };
    if (dir === GOOSE_DIR.E) return { dx: 1, dy: 0 };
    if (dir === GOOSE_DIR.W) return { dx: -1, dy: 0 };
    return { dx: 0, dy: 0 };
}

function gooseReverse(dir) {
    if (dir === GOOSE_DIR.N) return GOOSE_DIR.S;
    if (dir === GOOSE_DIR.S) return GOOSE_DIR.N;
    if (dir === GOOSE_DIR.E) return GOOSE_DIR.W;
    if (dir === GOOSE_DIR.W) return GOOSE_DIR.E;
}

// ── Level definitions ────────────────────────────────────────
// Each level: { cols, rows, grid (array of strings, top-to-bottom),
//   player: {x,y}, target: {x,y}, geese: [{x,y,dir}] }
// Grid chars: G=grass, W=water, B=boulder
const GOOSE_LEVELS = [
    // Level 1 – 7×7, one goose, vertical barrier
    {
        cols: 7, rows: 7,
        grid: [
            'GGGGGGG',
            'GGGGGGG',
            'GGGBGGG',
            'GGGBGGG',
            'GGGBGGG',
            'GGGGGGG',
            'GGGGGGG'
        ],
        player: { x: 0, y: 6 },
        target:  { x: 6, y: 0 },
        geese: [
            { x: 5, y: 1, dir: GOOSE_DIR.S }
        ]
    },

    // Level 2 – 8×7, two geese
    {
        cols: 8, rows: 7,
        grid: [
            'GGGGGGGG',
            'GGGBGGGG',
            'GGGBGBGG',
            'GGGBGBGG',
            'GGGBGBGG',
            'GGGGGGGG',
            'GGGGGGGG'
        ],
        player: { x: 0, y: 6 },
        target:  { x: 7, y: 0 },
        geese: [
            { x: 1, y: 1, dir: GOOSE_DIR.E },
            { x: 6, y: 2, dir: GOOSE_DIR.W }
        ]
    },

    // Level 3 – 8×8, three geese, tighter corridors
    {
        cols: 8, rows: 8,
        grid: [
            'GGGGGGGG',
            'GGGBGGGG',
            'GGGBGGGG',
            'GGGBWGGG',
            'GGGGWGGG',
            'GGGGBGGG',
            'GGGGBGGG',
            'GGGGGGGG'
        ],
        player: { x: 0, y: 7 },
        target:  { x: 7, y: 0 },
        geese: [
            { x: 5, y: 2, dir: GOOSE_DIR.W },
            { x: 2, y: 5, dir: GOOSE_DIR.E },
            { x: 6, y: 5, dir: GOOSE_DIR.N }
        ]
    },

    // Level 4 – 9×9, four geese, complex layout
    {
        cols: 9, rows: 9,
        grid: [
            'GGGGGGGGG',
            'GGGBGGGGG',
            'GGGBGGGGG',
            'GGGBWGGGG',
            'GGGGWGGGG',
            'GGGGBGGGG',
            'GGGGBGGGG',
            'GGGGGGGGG',
            'GGGGGGGGG'
        ],
        player: { x: 0, y: 8 },
        target:  { x: 8, y: 0 },
        geese: [
            { x: 6, y: 1, dir: GOOSE_DIR.W },
            { x: 2, y: 4, dir: GOOSE_DIR.E },
            { x: 7, y: 5, dir: GOOSE_DIR.N },
            { x: 4, y: 7, dir: GOOSE_DIR.W }
        ]
    }
];

// ── State initialiser ─────────────────────────────────────────
function initGooseGame() {
    const levelIdx = Math.min(minigameState.successes, GOOSE_LEVELS.length - 1);
    const level = GOOSE_LEVELS[levelIdx];

    // Deep-copy geese so original definitions are not mutated
    const geese = level.geese.map(g => ({ x: g.x, y: g.y, dir: g.dir, active: true }));

    minigameState.goose = {
        levelIdx,
        cols:   level.cols,
        rows:   level.rows,
        grid:   level.grid,
        player: { x: level.player.x, y: level.player.y, dir: GOOSE_DIR.S },
        target: { x: level.target.x,  y: level.target.y  },
        geese,
        animTime:     0,
        showResult:   null,   // 'success' | 'failure' | null
        resultTimer:  0,
        waitingForDialog: false,
        introShown: typeof minigameState.gooseIntroShown !== 'undefined'
                    ? minigameState.gooseIntroShown : false,
        // Used success/failure message pools (no repeats until exhausted)
        usedSuccessLines: new Set(),
        usedFailureLines: new Set()
    };
}

// ── Line of sight helper ──────────────────────────────────────
// Returns true if the line from center of goose cell to center of player cell
// does not pass through any boulder tiles.
function gooseSpots(g, px, py, grid, cols, rows) {
    if (g.x === px && g.y === py) return true;

    const x0 = g.x + 0.5;
    const y0 = g.y + 0.5;
    const x1 = px + 0.5;
    const y1 = py + 0.5;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const distance = Math.hypot(dx, dy);

    // Step in small increments along the line segment
    const steps = Math.ceil(distance * 20);
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const cx = Math.floor(x0 + t * dx);
        const cy = Math.floor(y0 + t * dy);

        // Skip the start (goose) and end (player) squares
        if (cx === g.x && cy === g.y) continue;
        if (cx === px && cy === py) continue;

        if (gooseTileAt(grid, cx, cy) === GOOSE_TILE.BOULDER) {
            return false;
        }
    }
    return true;
}

function canGooseEnter(nx, ny, grid, cols, rows) {
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return false;
    const tile = gooseTileAt(grid, nx, ny);
    return tile !== GOOSE_TILE.BOULDER && tile !== GOOSE_TILE.WATER;
}

function getClosestCardinalDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? GOOSE_DIR.E : GOOSE_DIR.W;
    } else {
        return dy >= 0 ? GOOSE_DIR.S : GOOSE_DIR.N;
    }
}

function gooseTileAt(grid, x, y) {
    if (!grid[y] || grid[y][x] === undefined) return GOOSE_TILE.GRASS;
    return grid[y][x];
}

// ── Goose move logic ─────────────────────────────────────────
function stepGeese(prevPlayerX, prevPlayerY) {
    const gs = minigameState.goose;
    const { grid, cols, rows, player, geese } = gs;

    geese.forEach(g => {
        if (!g.active) return;

        // Check LOS at start of turn (before player moves) and at end of player move
        const startHasLOS = gooseSpots(g, prevPlayerX, prevPlayerY, grid, cols, rows);
        const currentHasLOS = gooseSpots(g, player.x, player.y, grid, cols, rows);

        if (startHasLOS) {
            if (currentHasLOS) {
                // Rotate to track player
                g.dir = getClosestCardinalDirection(g.x, g.y, player.x, player.y);
            } else {
                // Lost LOS during player move: rotate to closest cardinal direction when player disappeared
                g.dir = getClosestCardinalDirection(g.x, g.y, prevPlayerX, prevPlayerY);
            }
        }

        if (currentHasLOS) {
            // Chase: move one square closer (allowing diagonal)
            const dx = Math.sign(player.x - g.x);
            const dy = Math.sign(player.y - g.y);
            let nx = g.x + dx;
            let ny = g.y + dy;

            if (canGooseEnter(nx, ny, grid, cols, rows)) {
                g.x = nx;
                g.y = ny;
            } else {
                // Fallback to cardinal moves towards player if diagonal is blocked
                const absDx = Math.abs(player.x - g.x);
                const absDy = Math.abs(player.y - g.y);
                if (absDx >= absDy) {
                    if (canGooseEnter(g.x + dx, g.y, grid, cols, rows)) {
                        g.x = g.x + dx;
                    } else if (canGooseEnter(g.x, g.y + dy, grid, cols, rows)) {
                        g.y = g.y + dy;
                    }
                } else {
                    if (canGooseEnter(g.x, g.y + dy, grid, cols, rows)) {
                        g.y = g.y + dy;
                    } else if (canGooseEnter(g.x + dx, g.y, grid, cols, rows)) {
                        g.x = g.x + dx;
                    }
                }
            }

            // Post-movement LOS update
            if (gooseSpots(g, player.x, player.y, grid, cols, rows)) {
                g.dir = getClosestCardinalDirection(g.x, g.y, player.x, player.y);
            }
        } else {
            // Normal behavior: move forward and bounce on boulder or water
            const { dx, dy } = gooseDelta(g.dir);
            const nx = g.x + dx;
            const ny = g.y + dy;
            const inBounds = nx >= 0 && nx < cols && ny >= 0 && ny < rows;
            if (!inBounds) {
                g.dir = gooseReverse(g.dir);
            } else {
                const tile = gooseTileAt(grid, nx, ny);
                if (tile === GOOSE_TILE.BOULDER || tile === GOOSE_TILE.WATER) {
                    g.dir = gooseReverse(g.dir);
                } else {
                    g.x = nx;
                    g.y = ny;
                }
            }
        }
    });
}

// ── Resolution after move ────────────────────────────────────
function resolveGooseOutcomes() {
    const gs = minigameState.goose;
    const { player, target, geese } = gs;

    // Check if player reached target
    if (player.x === target.x && player.y === target.y) {
        gs.showResult = 'success';
        gs.resultTimer = Date.now();
        return;
    }

    // Check if any goose caught the player
    let caught = false;
    geese.forEach(g => {
        if (g.active && g.x === player.x && g.y === player.y) {
            g.active = false;
            caught = true;
        }
    });

    if (caught) {
        gs.showResult = 'failure';
        gs.resultTimer = Date.now();
    }
}

// ── Handle player input ──────────────────────────────────────
function handleGooseInput(key) {
    const gs = minigameState.goose;
    if (!gs) return;
    if (gs.showResult || gs.waitingForDialog) return;

    let nx = gs.player.x;
    let ny = gs.player.y;

    if (key === 'ArrowUp')         { ny--; gs.player.dir = GOOSE_DIR.N; }
    else if (key === 'ArrowDown')  { ny++; gs.player.dir = GOOSE_DIR.S; }
    else if (key === 'ArrowLeft')  { nx--; gs.player.dir = GOOSE_DIR.W; }
    else if (key === 'ArrowRight') { nx++; gs.player.dir = GOOSE_DIR.E; }
    else return;

    // Bounds check
    if (nx < 0 || nx >= gs.cols || ny < 0 || ny >= gs.rows) return;
    // Can't step onto boulder or water
    const tile = gooseTileAt(gs.grid, nx, ny);
    if (tile === GOOSE_TILE.BOULDER || tile === GOOSE_TILE.WATER) return;

    const prevPlayerX = gs.player.x;
    const prevPlayerY = gs.player.y;

    gs.player.x = nx;
    gs.player.y = ny;

    stepGeese(prevPlayerX, prevPlayerY);
    resolveGooseOutcomes();

    if (gs.showResult === 'success') {
        gs.waitingForDialog = true;
        const line = getGooseRandomLine('success', gs);
        showDialog('Ranger Willis', 'Sam', line, () => {
            gs.waitingForDialog = false;
            gs.showResult = null;
            success();
            if (minigameState.successes < 4) initGooseGame();
        });
    } else if (gs.showResult === 'failure') {
        gs.waitingForDialog = true;
        const line = getGooseRandomLine('failure', gs);
        showDialog('Ranger Willis', 'Sam', line, () => {
            gs.waitingForDialog = false;
            gs.showResult = null;
            failure();
            if (minigameState.failures < 3) initGooseGame();
        });
    }
}

// ── Random dialog helpers ─────────────────────────────────────
const GOOSE_SUCCESS_LINES = [
    "Hey, looks like you've yet again eluded death!",
    "That was looking dicey there, but here you are, ungoosed!",
    "Glad to see you not getting killed in this public park!",
    "Doin' some good bobbin' and weavin' there, friend!"
];

const GOOSE_FAILURE_LINES = [
    "Ouch! That had to hurt.",
    "Yeah, they got teeth on their tongues, is the thing.",
    "Yeah, looks like ol' Bitey McBiterson did what he does best.",
    "That's nature for you — violent in tooth and claw.",
    "Oof, it's always the goose you don't see comin', isn't it?",
    "Ouch, that was some nightmare fodder.  For me, anyway."
];

function getGooseRandomLine(type, gs) {
    const lines = (type === 'success') ? GOOSE_SUCCESS_LINES : GOOSE_FAILURE_LINES;
    const usedSet = (type === 'success') ? gs.usedSuccessLines : gs.usedFailureLines;
    const available = lines.filter(l => !usedSet.has(l));
    const pool = (available.length === 0) ? lines : available;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedSet.add(chosen);
    if (usedSet.size >= lines.length) usedSet.clear();
    return chosen;
}

// ── Drawing ──────────────────────────────────────────────────
function drawGooseGame() {
    const gs = minigameState.goose;
    if (!gs) return;

    const { cols, rows, grid, player, target, geese } = gs;

    // Compute cell size to fit board inside canvas (leaving room for HUD at top)
    const HUD_HEIGHT = 50;
    const PAD = 20;
    const availW = 800 - PAD * 2;
    const availH = 600 - HUD_HEIGHT - PAD * 2;
    const cellW = Math.floor(Math.min(availW / cols, availH / rows));
    const cellH = cellW;
    const boardW = cols * cellW;
    const boardH = rows * cellH;
    const ox = Math.floor((800 - boardW) / 2);
    const oy = HUD_HEIGHT + Math.floor((600 - HUD_HEIGHT - boardH) / 2);

    // ── Background ──
    ctx.fillStyle = '#1a3300';
    ctx.fillRect(0, 0, 800, 600);

    // ── Draw tiles ──
    for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
            const tile = gooseTileAt(grid, gx, gy);
            const rx = ox + gx * cellW;
            const ry = oy + gy * cellH;
            drawGooseTile(tile, rx, ry, cellW, cellH);
        }
    }

    // ── Grid lines ──
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= cols; gx++) {
        ctx.beginPath();
        ctx.moveTo(ox + gx * cellW, oy);
        ctx.lineTo(ox + gx * cellW, oy + boardH);
        ctx.stroke();
    }
    for (let gy = 0; gy <= rows; gy++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + gy * cellH);
        ctx.lineTo(ox + boardW, oy + gy * cellH);
        ctx.stroke();
    }

    // ── Cone of recognition highlight ──
    drawGooseCones(gs, ox, oy, cellW, cellH);

    // ── Target ──
    drawGooseTarget(ox + target.x * cellW, oy + target.y * cellH, cellW, cellH);

    // ── Geese ──
    geese.forEach(g => {
        if (!g.active) return;
        const rx = ox + g.x * cellW;
        const ry = oy + g.y * cellH;
        drawGooseSprite(g, rx, ry, cellW, cellH);
    });

    // ── Player ──
    drawGoosePlayer(ox + player.x * cellW, oy + player.y * cellH, cellW, cellH, player.dir);

    // ── Level label ──
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${gs.levelIdx + 1}`, 20, 45);

    // ── Result flash ──
    if (gs.showResult) {
        const elapsed = Date.now() - gs.resultTimer;
        const alpha = Math.min(1, elapsed / 200);
        ctx.fillStyle = gs.showResult === 'success'
            ? `rgba(0,255,0,${alpha * 0.3})`
            : `rgba(255,0,0,${alpha * 0.3})`;
        ctx.fillRect(0, 0, 800, 600);
    }
}

// ── Cone-of-recognition renderer ─────────────────────────────
function drawGooseCones(gs, ox, oy, cellW, cellH) {
    const { grid, cols, rows, geese, player } = gs;
    const t = Date.now();

    geese.forEach(g => {
        if (!g.active) return;

        const { dx, dy } = gooseDelta(g.dir);
        const playerSpotted = gooseSpots(g, player.x, player.y, grid, cols, rows);

        // Collect all in-cone cells, walking column by column away from the goose.
        // Stop a column once a boulder is hit (boulders block LoS).
        let cx = g.x + dx;
        let cy = g.y + dy;
        let step = 0;

        // We'll gather all highlighted cells first, then draw them.
        const coneCells = [];

        while (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            // Perpendicular spread: ±1 in step 0, then full width for later steps
            const spread = step === 0 ? 1 : Math.max(cols, rows);
            let boulderInAxis = false;

            if (dx === 0) {
                // Moving N or S – sweep X
                for (let ox2 = -spread; ox2 <= spread; ox2++) {
                    const tx = cx + ox2;
                    const ty = cy;
                    if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) continue;

                    // Boulder blocks this lateral cell if there's a boulder between
                    // the goose's column and tx (for the first step only, the cell
                    // itself can also be the blocker).
                    let blocked = false;
                    // Walk along the axis from goose to (cx,cy), check for boulders
                    let by2 = g.y + dy;
                    while (by2 !== ty) {
                        if (gooseTileAt(grid, tx, by2) === GOOSE_TILE.BOULDER) { blocked = true; break; }
                        by2 += dy;
                    }
                    if (!blocked) coneCells.push({ tx, ty });
                }
                // If the centre column cell itself is a boulder, stop sweep here
                if (gooseTileAt(grid, cx, cy) === GOOSE_TILE.BOULDER) { boulderInAxis = true; }
            } else {
                // Moving E or W – sweep Y
                for (let oy2 = -spread; oy2 <= spread; oy2++) {
                    const tx = cx;
                    const ty = cy + oy2;
                    if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) continue;

                    let blocked = false;
                    let bx2 = g.x + dx;
                    while (bx2 !== tx) {
                        if (gooseTileAt(grid, bx2, ty) === GOOSE_TILE.BOULDER) { blocked = true; break; }
                        bx2 += dx;
                    }
                    if (!blocked) coneCells.push({ tx, ty });
                }
                if (gooseTileAt(grid, cx, cy) === GOOSE_TILE.BOULDER) { boulderInAxis = true; }
            }

            if (boulderInAxis) break;
            cx += dx;
            cy += dy;
            step++;
        }

        // ── Fill cone cells with translucent red ──
        // Pulse between 0.12 and 0.22 opacity to keep it lively
        const pulse = 0.12 + 0.10 * Math.sin(t / 400 + g.x + g.y);
        ctx.fillStyle = `rgba(220,30,30,${pulse})`;
        coneCells.forEach(({ tx, ty }) => {
            ctx.fillRect(ox + tx * cellW, oy + ty * cellH, cellW, cellH);
        });

        // ── Draw directional arrow chevrons along the cone axis ──
        // We draw a series of small arrow chevrons pointing away from the goose,
        // spaced one cell apart along the main axis.
        const arrowAlpha = playerSpotted ? 0.85 : (0.35 + 0.20 * Math.sin(t / 500));
        ctx.save();
        ctx.strokeStyle = `rgba(255,60,60,${arrowAlpha})`;
        ctx.fillStyle   = `rgba(255,60,60,${arrowAlpha})`;
        ctx.lineWidth = Math.max(1.5, cellW * 0.06);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let ax = g.x + dx;
        let ay = g.y + dy;
        let stepA = 0;
        while (ax >= 0 && ax < cols && ay >= 0 && ay < rows && stepA < 6) {
            if (gooseTileAt(grid, ax, ay) === GOOSE_TILE.BOULDER) break;

            // Centre of this cell
            const cx2 = ox + ax * cellW + cellW / 2;
            const cy2 = oy + ay * cellH + cellH / 2;

            // Arrow size shrinks slightly with distance
            const size = cellW * 0.28 * (1 - stepA * 0.06);
            const angle = dx === 1 ? 0 : dx === -1 ? Math.PI : dy === 1 ? Math.PI / 2 : -Math.PI / 2;

            drawConeArrow(cx2, cy2, size, angle);

            ax += dx;
            ay += dy;
            stepA++;
        }
        ctx.restore();
    });
}

// Draw a single chevron arrow (►) centred at (cx,cy), pointing in `angle` radians.
function drawConeArrow(cx, cy, size, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo( size,       0);
    ctx.lineTo(-size * 0.5, -size * 0.65);
    ctx.lineTo(-size * 0.5,  size * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// ── Tile renderer ─────────────────────────────────────────────

function drawGooseTile(tile, x, y, w, h) {
    if (tile === GOOSE_TILE.GRASS) {
        if (gooseTilesetImg.complete && gooseTilesetImg.naturalWidth > 0) {
            // Draw the 24x24 tile at (24, 24) on the tileset
            ctx.drawImage(gooseTilesetImg, 24, 24, 24, 24, x, y, w, h);
        } else {
            // Checkerboard grass effect
            const dark = (Math.floor(x / w) + Math.floor(y / h)) % 2 === 0;
            ctx.fillStyle = dark ? '#4a7c2f' : '#5a8f38';
            ctx.fillRect(x, y, w, h);
            // Tiny grass tufts (deterministic)
            ctx.fillStyle = '#3d6626';
            const seed1 = ((x * 7 + y * 13) % 5);
            const seed2 = ((x * 11 + y * 17) % 4);
            ctx.fillRect(x + seed1 * (w / 6) + 2, y + seed2 * (h / 5) + 2, 2, 3);
            ctx.fillRect(x + (seed1 + 2) * (w / 7) + 1, y + (seed2 + 1) * (h / 6) + 1, 2, 3);
        }
    } else if (tile === GOOSE_TILE.WATER) {
        if (oceanSheetImg.complete && oceanSheetImg.naturalWidth > 0) {
            const frameIndex = Math.floor(Date.now() / 150) % 7;
            ctx.drawImage(oceanSheetImg, frameIndex * 16, 0, 16, 16, x, y, w, h);
        } else {
            ctx.fillStyle = '#1a5276';
            ctx.fillRect(x, y, w, h);
        }
    } else if (tile === GOOSE_TILE.BOULDER) {
        if (boulderImg.complete && boulderImg.naturalWidth > 0) {
            ctx.drawImage(boulderImg, x, y, w, h);
        } else {
            // Stone gray with highlight
            ctx.fillStyle = '#707070';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#909090';
            ctx.fillRect(x + 2, y + 2, w - 6, h - 6);
            ctx.fillStyle = '#b0b0b0';
            ctx.fillRect(x + 4, y + 4, Math.max(4, w / 3), Math.max(3, h / 4));
            ctx.fillStyle = '#505050';
            ctx.fillRect(x + w - 5, y + h - 5, 4, 4);
        }
    }
}

// ── Target (green circle) ─────────────────────────────────────
function drawGooseTarget(x, y, w, h) {
    const cx = x + w / 2;
    
    // Base
    ctx.fillStyle = '#7f8c8d'; // Grey base
    ctx.fillRect(cx - 10, y + h - 8, 20, 4);
    
    // Pole
    ctx.fillStyle = '#95a5a6'; // Light grey pole
    ctx.fillRect(cx - 2, y + 6, 4, h - 14);
    
    // Red flag
    ctx.fillStyle = '#e74c3c'; // Red flag
    ctx.beginPath();
    ctx.moveTo(cx + 2, y + 6);
    ctx.lineTo(cx + 18, y + 13);
    ctx.lineTo(cx + 2, y + 20);
    ctx.closePath();
    ctx.fill();
}

// ── Goose sprite ─────────────────────────────────────────────
function drawGooseSprite(g, x, y, w, h) {
    if (gooseImg.complete && gooseImg.naturalWidth > 0) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        // Rotate to face direction (gooseImg faces East by default)
        if (g.dir === GOOSE_DIR.E) ctx.rotate(0);
        else if (g.dir === GOOSE_DIR.S) ctx.rotate(Math.PI / 2);
        else if (g.dir === GOOSE_DIR.W) ctx.rotate(Math.PI);
        else /* N */                   ctx.rotate(-Math.PI / 2);

        ctx.drawImage(gooseImg, -w/2, -h/2, w, h);
        ctx.restore();
    } else {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const s = Math.min(w, h) * 0.38;   // scale factor

        ctx.save();
        ctx.translate(cx, cy);

        // Rotate to face direction
        if (g.dir === GOOSE_DIR.E) ctx.rotate(0);
        else if (g.dir === GOOSE_DIR.S) ctx.rotate(Math.PI / 2);
        else if (g.dir === GOOSE_DIR.W) ctx.rotate(Math.PI);
        else /* N */                   ctx.rotate(-Math.PI / 2);

        // Body – white oval
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck & head
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(s * 0.7, -s * 0.35, s * 0.3, s * 0.2, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Black stripe on neck (Canada Goose characteristic)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(s * 0.65, -s * 0.3, s * 0.22, s * 0.13, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(s * 0.95, -s * 0.52, s * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // White chin patch
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(s * 0.85, -s * 0.38, s * 0.13, s * 0.09, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Beak (orange-yellow)
        ctx.fillStyle = '#d4820a';
        ctx.beginPath();
        ctx.moveTo(s * 1.14, -s * 0.55);
        ctx.lineTo(s * 1.35, -s * 0.5);
        ctx.lineTo(s * 1.14, -s * 0.44);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(s * 1.0, -s * 0.56, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(s * 1.02, -s * 0.56, s * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Wing detail
        ctx.strokeStyle = '#c8c8c8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, -s * 0.55);
        ctx.quadraticCurveTo(0, -s * 0.7, s * 0.3, -s * 0.55);
        ctx.stroke();

        ctx.restore();
    }
}

// ── Player sprite ─────────────────────────────────────────────
function drawGoosePlayer(x, y, w, h, dir = GOOSE_DIR.S) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const s = Math.min(w, h) * 0.38;

    // Draw using selected cast member's idle sprite if available
    const actorName = CAST[selectedIndex] ? CAST[selectedIndex].actor.toLowerCase() : 'peter';
    const idleSheet = idleSprites[actorName];
    if (idleSheet && idleSheet.complete && idleSheet.naturalWidth > 0) {
        const frameW = 64, frameH = 64;
        const dir2 = dir || GOOSE_DIR.S;
        let row = 0; // north
        if (dir2 === GOOSE_DIR.W) row = 1;
        else if (dir2 === GOOSE_DIR.S) row = 2;
        else if (dir2 === GOOSE_DIR.E) row = 3;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(idleSheet, 0, row * frameH, frameW, frameH,
                      cx - s * 0.9, cy - s * 1.4, s * 1.8, s * 1.8);
        return;
    }

    // Fallback: simple pixel-art human figure
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.9, s * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cc3333';
    ctx.fillRect(cx - s * 0.25, cy - s * 0.6, s * 0.5, s * 0.6);

    ctx.fillStyle = '#334499';
    ctx.fillRect(cx - s * 0.25, cy, s * 0.2, s * 0.5);
    ctx.fillRect(cx + s * 0.05, cy, s * 0.2, s * 0.5);
}

// ── Tutorial illustration helpers ────────────────────────────
// drawGooseTutorialForward: small 3×3 grid showing goose bouncing off obstacle
// drawGooseTutorialCone: small grid showing cone and player

function drawGooseTutorialForward(cx, cy, size, showReverse) {
    const cw = size / 3;
    const ch = size / 3;
    const ox = cx - size / 2;
    const oy = cy - size / 2;

    // Draw 3 grass tiles in a row
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#4a7c2f' : '#5a8f38';
        ctx.fillRect(ox + i * cw, oy + ch, cw, ch);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + i * cw, oy + ch, cw, ch);
    }
    // Boulder on right
    ctx.fillStyle = '#707070';
    ctx.fillRect(ox + 2 * cw + 2, oy + ch + 2, cw - 4, ch - 4);
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(ox + 2 * cw + 4, oy + ch + 4, cw / 3, ch / 4);

    // Draw a small goose facing E (or W if showReverse)
    const miniDir = showReverse ? GOOSE_DIR.W : GOOSE_DIR.E;
    const gx = showReverse ? ox + 1.5 * cw : ox + 0.5 * cw;
    drawGooseSprite({ x: 0, y: 0, dir: miniDir, active: true },
                    gx - cw / 2, oy + ch, cw, ch);

    // Arrow
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (!showReverse) {
        ctx.moveTo(ox + cw, oy + ch + ch / 2);
        ctx.lineTo(ox + 2 * cw - 4, oy + ch + ch / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ox + 2 * cw - 4, oy + ch + ch / 2 - 5);
        ctx.lineTo(ox + 2 * cw - 4, oy + ch + ch / 2 + 5);
        ctx.lineTo(ox + 2 * cw + 2, oy + ch + ch / 2);
        ctx.closePath();
        ctx.fillStyle = '#ffff00';
        ctx.fill();
    } else {
        ctx.moveTo(ox + 2 * cw - 2, oy + ch + ch / 2);
        ctx.lineTo(ox + cw + 4, oy + ch + ch / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ox + cw + 4, oy + ch + ch / 2 - 5);
        ctx.lineTo(ox + cw + 4, oy + ch + ch / 2 + 5);
        ctx.lineTo(ox + cw - 2, oy + ch + ch / 2);
        ctx.closePath();
        ctx.fillStyle = '#ffff00';
        ctx.fill();
    }
}

function drawGooseTutorialCone(cx, cy, size) {
    const cw = size / 5;
    const ch = size / 5;
    const ox = cx - size / 2;
    const oy = cy - size / 2;

    // 5×5 grid
    for (let gy = 0; gy < 5; gy++) {
        for (let gx = 0; gx < 5; gx++) {
            ctx.fillStyle = ((gx + gy) % 2 === 0) ? '#4a7c2f' : '#5a8f38';
            ctx.fillRect(ox + gx * cw, oy + gy * ch, cw, ch);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox + gx * cw, oy + gy * ch, cw, ch);
        }
    }

    // Goose at (0,2) facing East
    drawGooseSprite({ x: 0, y: 0, dir: GOOSE_DIR.E, active: true },
                    ox, oy + 2 * ch, cw, ch);

    // Cone highlight: (1,1),(1,2),(1,3), then (2,0)..(2,4), (3,0)..(3,4) etc.
    ctx.fillStyle = 'rgba(255,80,0,0.28)';
    [[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[2,4],[3,0],[3,1],[3,2],[3,3],[3,4],[4,0],[4,1],[4,2],[4,3],[4,4]].forEach(([gx,gy]) => {
        ctx.fillRect(ox + gx * cw, oy + gy * ch, cw, ch);
    });

    // Player at (3,2)
    drawGoosePlayer(ox + 3 * cw, oy + 2 * ch, cw, ch);

    // Arrow from goose to player
    ctx.strokeStyle = '#ff4400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + 0.5 * cw, oy + 2.5 * ch);
    ctx.lineTo(ox + 3.5 * cw, oy + 2.5 * ch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + 3.5 * cw - 5, oy + 2.5 * ch - 5);
    ctx.lineTo(ox + 3.5 * cw, oy + 2.5 * ch);
    ctx.lineTo(ox + 3.5 * cw - 5, oy + 2.5 * ch + 5);
    ctx.closePath();
    ctx.fillStyle = '#ff4400';
    ctx.fill();
}

// Exported so minigame_manager can call it during introductory dialog
function getGooseTutorialIllustration() {
    // returns a function(cx,cy,size) the dialog renderer can call as overlay
    return null; // Illustrations drawn via special dialog fields (see showDialog calls)
}
