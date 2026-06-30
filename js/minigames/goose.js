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
    // Level 1 – 7×7, one goose, simple
    {
        cols: 7, rows: 7,
        grid: [
            'GGGGGGG',
            'GWWWGGG',
            'GGWGGGG',
            'GGGGGGG',
            'GGGBGGG',
            'GGGGGGG',
            'GGGGGGG'
        ],
        player: { x: 0, y: 6 },
        target:  { x: 6, y: 0 },
        geese: [
            { x: 3, y: 3, dir: GOOSE_DIR.W }
        ]
    },

    // Level 2 – 8×7, two geese
    {
        cols: 8, rows: 7,
        grid: [
            'GGGGGGGG',
            'GGWWGGGG',
            'GBGGGBGG',
            'GGGGGGGG',
            'GGBGGGGG',
            'GGGWWGGG',
            'GGGGGGGG'
        ],
        player: { x: 0, y: 6 },
        target:  { x: 7, y: 0 },
        geese: [
            { x: 4, y: 3, dir: GOOSE_DIR.W },
            { x: 2, y: 1, dir: GOOSE_DIR.S }
        ]
    },

    // Level 3 – 8×8, three geese, tighter corridors
    {
        cols: 8, rows: 8,
        grid: [
            'GGGGGGGG',
            'GWWBGGGG',
            'GGGGBGGG',
            'GBGGGGGG',
            'GGGGWGGG',
            'GGGBGGGG',
            'GGGGGGWG',
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
            'GWWGBGGGG',
            'GGGGGBGGG',
            'GBGGGGGGG',
            'GGGWWWGGG',
            'GGGGGGGBG',
            'GBGGGGGGG',
            'GGGGWWGGG',
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

// ── Cone-of-recognition helper ───────────────────────────────
// Returns true if (px,py) is in the goose's cone.
// Boulders block los.
function gooseSpots(g, px, py, grid, cols, rows) {
    const { dx, dy } = gooseDelta(g.dir);
    // Expand the cone row by row from the goose's front
    // Row 1 (immediately ahead): the 3 squares in front ±1 perpendicular
    // Row 2+: expands to full width in the direction of travel
    let cx = g.x + dx;
    let cy = g.y + dy;
    let step = 0;

    while (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
        // Perpendicular spread: at step 0 → width 3 (±1), step 1+ → full
        const spread = (step === 0) ? 1 : Math.max(cols, rows);

        if (dx === 0) {
            // Moving N or S – perpendicular is X
            for (let ox = -spread; ox <= spread; ox++) {
                const tx = cx + ox;
                const ty = cy;
                if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) continue;
                // Check if boulder is blocking the column between goose and this square
                let blocked = false;
                let bx = g.x;
                let by = g.y + dy;
                while (bx !== tx || by !== ty) {
                    if (bx >= 0 && bx < cols && by >= 0 && by < rows) {
                        if (gooseTileAt(grid, bx, by) === GOOSE_TILE.BOULDER) { blocked = true; break; }
                    }
                    if (by !== ty) by += dy;
                    else if (bx !== tx) bx += (tx > bx ? 1 : -1);
                }
                if (!blocked && tx === px && ty === py) return true;
            }
        } else {
            // Moving E or W – perpendicular is Y
            for (let oy = -spread; oy <= spread; oy++) {
                const tx = cx;
                const ty = cy + oy;
                if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) continue;
                let blocked = false;
                let bx = g.x + dx;
                let by = g.y;
                while (bx !== tx || by !== ty) {
                    if (bx >= 0 && bx < cols && by >= 0 && by < rows) {
                        if (gooseTileAt(grid, bx, by) === GOOSE_TILE.BOULDER) { blocked = true; break; }
                    }
                    if (bx !== tx) bx += dx;
                    else if (by !== ty) by += (ty > by ? 1 : -1);
                }
                if (!blocked && tx === px && ty === py) return true;
            }
        }

        // If there is a boulder at (cx,cy), it blocks further sightlines in this column/row
        if (gooseTileAt(grid, cx, cy) === GOOSE_TILE.BOULDER) break;

        cx += dx;
        cy += dy;
        step++;
    }
    return false;
}

function gooseTileAt(grid, x, y) {
    if (!grid[y] || grid[y][x] === undefined) return GOOSE_TILE.GRASS;
    return grid[y][x];
}

// ── Goose move logic ─────────────────────────────────────────
function stepGeese() {
    const gs = minigameState.goose;
    const { grid, cols, rows, player, geese } = gs;

    geese.forEach(g => {
        if (!g.active) return;

        const spotted = gooseSpots(g, player.x, player.y, grid, cols, rows);

        if (spotted) {
            // Move one step towards player unless that puts it in water
            const dx = Math.sign(player.x - g.x);
            const dy = Math.sign(player.y - g.y);
            // Prefer moving in the axis with larger distance
            const absDx = Math.abs(player.x - g.x);
            const absDy = Math.abs(player.y - g.y);
            let nx = g.x, ny = g.y;
            if (absDx >= absDy && absDx > 0) {
                nx = g.x + Math.sign(player.x - g.x);
                ny = g.y;
            } else if (absDy > 0) {
                nx = g.x;
                ny = g.y + Math.sign(player.y - g.y);
            }
            // Update facing direction
            if (nx !== g.x) g.dir = (nx > g.x) ? GOOSE_DIR.E : GOOSE_DIR.W;
            else if (ny !== g.y) g.dir = (ny > g.y) ? GOOSE_DIR.S : GOOSE_DIR.N;

            const tile = gooseTileAt(grid, nx, ny);
            if (tile !== GOOSE_TILE.WATER) {
                g.x = nx; g.y = ny;
            }
            // else stay put (water blocks chase)
        } else {
            // Move forward; bounce on boulder or water
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
                    g.x = nx; g.y = ny;
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

    gs.player.x = nx;
    gs.player.y = ny;

    stepGeese();
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
    } else if (tile === GOOSE_TILE.WATER) {
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x, y, w, h);
        // Animated ripple stripe
        const t = Date.now() / 600;
        const offset = ((Math.floor((x + y) / w) + Math.floor(t * 2)) % 3) * (h / 3);
        ctx.fillStyle = 'rgba(100,180,255,0.35)';
        ctx.fillRect(x + 2, y + Math.floor(offset) + 2, w - 4, Math.max(2, h / 4));
    } else if (tile === GOOSE_TILE.BOULDER) {
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

// ── Target (green circle) ─────────────────────────────────────
function drawGooseTarget(x, y, w, h) {
    // 8-bit pixel circle: draw as a grid of square pixels.
    // We use a classic NES-style circular ring defined by a pixel mask.
    // The mask is an 11×11 bitmap where 1 = ring pixel, 2 = fill pixel.
    const MASK = [
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,1,1,0,0,0,1,1,0,0],
        [0,1,1,0,0,0,0,0,1,1,0],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [0,1,1,0,0,0,0,0,1,1,0],
        [0,0,1,1,0,0,0,1,1,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
    ];

    const GRID = 11;
    // Pixel size: fit the mask inside the cell with a small margin
    const px = Math.max(1, Math.floor(Math.min(w, h) * 0.8 / GRID));
    const totalSize = px * GRID;
    const startX = Math.floor(x + (w - totalSize) / 2);
    const startY = Math.floor(y + (h - totalSize) / 2);

    // Slow blink: toggle between bright and dim green every ~600ms
    const blink = Math.floor(Date.now() / 600) % 2 === 0;
    const ringColor  = blink ? '#00ff44' : '#00cc33';
    const innerColor = blink ? 'rgba(0,255,68,0.18)' : 'rgba(0,180,40,0.12)';

    // Draw inner fill first (dim green squares)
    ctx.fillStyle = innerColor;
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            if (MASK[row][col] === 0) {
                // Check if this pixel is truly inside the ring by flood-fill logic:
                // simple check — surrounded by ring pixels implies interior
                const inside =
                    row > 0 && row < GRID - 1 && col > 0 && col < GRID - 1 &&
                    MASK[row][col] === 0;
                if (inside) {
                    ctx.fillRect(startX + col * px, startY + row * px, px, px);
                }
            }
        }
    }

    // Draw ring pixels
    ctx.fillStyle = ringColor;
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            if (MASK[row][col] === 1) {
                ctx.fillRect(startX + col * px, startY + row * px, px, px);
            }
        }
    }

    // Pixel-art flag pole (1px wide) + triangular pennant made of pixel blocks
    const poleX = startX + Math.floor(GRID / 2) * px;
    const poleTop = startY - px * 4;
    const poleBot = startY + px * 2;
    ctx.fillStyle = ringColor;
    ctx.fillRect(poleX, poleTop, px, poleBot - poleTop);

    // Pennant: 3 rows of decreasing width, yellow pixels
    ctx.fillStyle = '#ffff00';
    for (let r = 0; r < 3; r++) {
        const cols = 3 - r;
        ctx.fillRect(poleX + px, poleTop + r * px, cols * px, px);
    }
}

// ── Goose sprite (drawn with canvas 2D primitives) ───────────
function drawGooseSprite(g, x, y, w, h) {
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

    // Threat indicator (small red eye-cone overlay when player is in sight)
    // Drawn separately in world space for readability — omitted here for cleanliness
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
