// ============================================================
// THE CLIMBATORIUM
// Roguelike Deckbuilder Rock-Climbing Minigame
// ============================================================

const CLIMB_SHAPE_TYPES = {
    RED_SQUARE: 'red_square',
    RED_CIRCLE: 'red_circle',
    RED_DIAMOND: 'red_diamond',
    RED_PLUS: 'red_plus',
    BLUE_SQUARE: 'blue_square',
    BLUE_CIRCLE: 'blue_circle',
    BLUE_DIAMOND: 'blue_diamond',
    BLUE_PLUS: 'blue_plus',
    GREEN_SQUARE: 'green_square',
    GREEN_CIRCLE: 'green_circle',
    GREEN_DIAMOND: 'green_diamond',
    GREEN_PLUS: 'green_plus',
    WILD_ASTERISK: 'wild_asterisk'
};

const BASE_WALL_SHAPES = [
    { type: CLIMB_SHAPE_TYPES.RED_SQUARE, color: 'red', shape: 'square' },
    { type: CLIMB_SHAPE_TYPES.RED_CIRCLE, color: 'red', shape: 'circle' },
    { type: CLIMB_SHAPE_TYPES.RED_DIAMOND, color: 'red', shape: 'diamond' },
    { type: CLIMB_SHAPE_TYPES.RED_PLUS, color: 'red', shape: 'plus' },
    { type: CLIMB_SHAPE_TYPES.BLUE_SQUARE, color: 'blue', shape: 'square' },
    { type: CLIMB_SHAPE_TYPES.BLUE_CIRCLE, color: 'blue', shape: 'circle' },
    { type: CLIMB_SHAPE_TYPES.BLUE_DIAMOND, color: 'blue', shape: 'diamond' },
    { type: CLIMB_SHAPE_TYPES.BLUE_PLUS, color: 'blue', shape: 'plus' },
    { type: CLIMB_SHAPE_TYPES.GREEN_SQUARE, color: 'green', shape: 'square' },
    { type: CLIMB_SHAPE_TYPES.GREEN_CIRCLE, color: 'green', shape: 'circle' },
    { type: CLIMB_SHAPE_TYPES.GREEN_DIAMOND, color: 'green', shape: 'diamond' },
    { type: CLIMB_SHAPE_TYPES.GREEN_PLUS, color: 'green', shape: 'plus' }
];

const CLIMB_WARES_CATALOG = [
    { id: 1, name: 'Pulsating Asterisk Card', price: 2, desc: 'Matches any shape on the wall.', cardType: 'wild_asterisk' },
    { id: 2, name: 'Ring of Reach', price: 4, desc: 'Expands reach circle by +70%.', type: 'ring_reach' },
    { id: 3, name: 'Ring of Hand', price: 4, desc: 'Deals +3 extra cards at start of wall.', type: 'ring_hand' },
    { id: 4, name: 'Shape-then-Shape Card', price: 2, desc: 'Allows two consecutive shape moves.', type: 'combo_shape' },
    { id: 5, name: 'Card Go Up', price: 2, desc: 'Move to the highest shape within reach.', type: 'card_go_up' },
    { id: 6, name: 'Ring of Riches', price: 3, desc: 'Earn +1 extra coin per card at end of wall.', type: 'ring_riches' },
    { id: 7, name: 'Trash Two Cards', price: 1, desc: 'Removes 2 cards from deck for this climb.', type: 'trash_two' },
    { id: 8, name: 'Draw Two', price: 2, desc: 'Draw 2 cards immediately.', type: 'draw_two' }
];

const CLIMB_ROUND_CONFIGS = [
    { round: 1, wallHeight: 680, shapeSpacing: 38, wildFreq: 0.0, lineSpacing: 105, baseReach: 115, initialDeal: 5 },
    { round: 2, wallHeight: 780, shapeSpacing: 40, wildFreq: 0.0, lineSpacing: 115, baseReach: 110, initialDeal: 5 },
    { round: 3, wallHeight: 880, shapeSpacing: 42, wildFreq: 0.0, lineSpacing: 125, baseReach: 105, initialDeal: 4 },
    { round: 4, wallHeight: 980, shapeSpacing: 44, wildFreq: 0.0, lineSpacing: 135, baseReach: 100, initialDeal: 4 }
];

function initClimbGame() {
    const roundIdx = Math.min(3, minigameState.successes || 0);
    const cfg = CLIMB_ROUND_CONFIGS[roundIdx];

    minigameState.climb = {
        subPhase: 'climbing',
        wallWidth: 360,
        wallHeight: cfg.wallHeight,
        starStripX: 360,
        starStripWidth: 40,
        cardAreaX: 400,
        cardAreaWidth: 400,
        player: {
            x: 180,
            y: cfg.wallHeight - 40,
            baseReachRadius: cfg.baseReach,
            reachRadius: cfg.baseReach
        },
        coins: 0,
        deck: [],
        hand: [],
        drawPile: [],
        discardPile: [],
        shapes: [],
        lines: [],
        activeModal: null,
        frozenPilePreview: null,
        selectedCardIndex: -1,
        targetShapes: [],
        highlightedTargetIndex: 0,
        shopWares: [],
        usedShopDialogs: new Set(),
        ownedRings: new Set(),
        purchasedWareIds: new Set(),
        starWipe: { active: false, progress: 0, direction: 'in' },
        extraCardsDeal: 0,
        reachMultiplier: 1.0,
        extraCoinsPerCard: 0,
        deckScrollOffset: 0,
        handPage: 0
    };

    buildInitialClimbDeck();
    generateClimbWall();
    startClimbingRound();
}

function buildInitialClimbDeck() {
    const state = minigameState.climb;
    state.deck = [
        { type: 'color_red', color: 'red', title: 'Red Card' },
        { type: 'color_blue', color: 'blue', title: 'Blue Card' },
        { type: 'color_green', color: 'green', title: 'Green Card' },
        { type: 'shape_square', shape: 'square', title: 'Square Card' },
        { type: 'shape_circle', shape: 'circle', title: 'Circle Card' },
        { type: 'shape_diamond', shape: 'diamond', title: 'Diamond Card' },
        { type: 'shape_plus', shape: 'plus', title: 'Plus Card' }
    ];
}

function generateClimbWall() {
    const state = minigameState.climb;
    const roundIdx = Math.min(3, minigameState.successes || 0);
    const cfg = CLIMB_ROUND_CONFIGS[roundIdx];

    state.shapes = [];
    state.lines = [];

    // GUARANTEED VARIETY STARTING SHAPES AT BOTTOM OF WALL (Inside initial reach circle)
    // Row 1 at y = wallHeight - 50
    const startRow1X = [60, 140, 220, 300];
    startRow1X.forEach((baseX, idx) => {
        const x = Math.max(30, Math.min(330, baseX + (Math.random() * 20 - 10)));
        const y = cfg.wallHeight - 50 + (Math.random() * 6 - 3);
        const choice = BASE_WALL_SHAPES[idx % BASE_WALL_SHAPES.length];
        state.shapes.push({ id: Math.random(), x, y, type: choice.type, color: choice.color, shape: choice.shape });
    });

    // Row 2 at y = wallHeight - 85
    const startRow2X = [60, 140, 220, 300];
    startRow2X.forEach((baseX, idx) => {
        const x = Math.max(30, Math.min(330, baseX + (Math.random() * 20 - 10)));
        const y = cfg.wallHeight - 85 + (Math.random() * 6 - 3);
        const choice = BASE_WALL_SHAPES[(idx + 4) % BASE_WALL_SHAPES.length];
        state.shapes.push({ id: Math.random(), x, y, type: choice.type, color: choice.color, shape: choice.shape });
    });

    // Generate shapes along remaining height of wall with organic, chaotic placement
    for (let y = cfg.wallHeight - 120; y > 75; y -= cfg.shapeSpacing) {
        const count = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 shapes per level
        const rowJitterY = y + (Math.random() * 14 - 7);
        const rowOffset = (Math.sin(y * 0.08) * 35) + (Math.random() * 30 - 15);

        const rowShapes = [];
        for (let i = 0; i < count; i++) {
            const span = 280 / Math.max(1, count - 1);
            let x = 40 + i * span + rowOffset + (Math.random() * 36 - 18);
            x = Math.max(30, Math.min(330, x));

            // Prevent overlap with other shapes in the same row
            const tooClose = rowShapes.some(s => Math.abs(s.x - x) < 32);
            if (!tooClose) {
                const choice = BASE_WALL_SHAPES[Math.floor(Math.random() * BASE_WALL_SHAPES.length)];
                const shapeObj = { id: Math.random(), x, y: rowJitterY, type: choice.type, color: choice.color, shape: choice.shape };
                rowShapes.push(shapeObj);
                state.shapes.push(shapeObj);
            }
        }

        // Fallback: if no shape added due to overlap rejection, add one
        if (rowShapes.length === 0) {
            const x = Math.max(30, Math.min(330, 40 + Math.random() * 280));
            const choice = BASE_WALL_SHAPES[Math.floor(Math.random() * BASE_WALL_SHAPES.length)];
            state.shapes.push({ id: Math.random(), x, y: rowJitterY, type: choice.type, color: choice.color, shape: choice.shape });
        }
    }

    // Top row wild asterisks (above top horizontal cutoff line)
    for (let x = 35; x <= 325; x += 40) {
        state.shapes.push({ id: Math.random(), x, y: 60, type: CLIMB_SHAPE_TYPES.WILD_ASTERISK });
    }

    // Horizontal green glowing lines (Top line awards +2 CARDS!)
    const lineYs = [];
    for (let y = cfg.wallHeight - cfg.lineSpacing; y > 90; y -= cfg.lineSpacing) {
        lineYs.push(y);
    }
    lineYs.forEach((y, idx) => {
        const isTopLine = (idx === lineYs.length - 1);
        state.lines.push({ y, active: true, value: isTopLine ? 2 : 1 });
    });
}

function startClimbingRound(keepWall = false) {
    const state = minigameState.climb;
    const roundIdx = Math.min(3, minigameState.successes || 0);
    const cfg = CLIMB_ROUND_CONFIGS[roundIdx];

    // Generate wall shapes and lines for current wall round
    if (!keepWall) {
        generateClimbWall();
    }

    state.subPhase = 'climbing';
    state.wallHeight = cfg.wallHeight;
    state.player.y = cfg.wallHeight - 40;
    state.player.x = state.wallWidth / 2;
    state.player.reachRadius = cfg.baseReach * state.reachMultiplier;

    state.lines.forEach(l => l.active = true);
    state.drawPile = shuffleClimbArray([...state.deck]);
    state.discardPile = [];
    state.hand = [];

    currentDialog = null;
    dialogCallback = null;

    state.comboState = null;
    state.activeModal = null;
    state.selectedCardIndex = -1;

    const dealCount = cfg.initialDeal + state.extraCardsDeal;
    drawClimbCards(dealCount);
}

function drawClimbCards(count) {
    const state = minigameState.climb;
    for (let i = 0; i < count; i++) {
        if (state.drawPile.length === 0) {
            if (state.discardPile.length === 0) break;
            state.drawPile = shuffleClimbArray([...state.discardPile]);
            state.discardPile = [];
        }
        if (state.drawPile.length > 0) {
            state.hand.push(state.drawPile.pop());
        }
    }
}

function shuffleClimbArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function drawClimbGame() {
    const state = minigameState.climb;
    if (!state) return;

    if (state.subPhase === 'climbing') {
        drawClimbingScreen();
    } else if (state.subPhase === 'shop') {
        drawCardShopScreen();
    }

    if (state.starWipe.active) {
        drawStarWipe();
    }
}

function drawClimbingScreen() {
    const state = minigameState.climb;
    const time = Date.now() * 0.002;

    const screenCenterY = canvas.height / 2;
    let cameraY = state.player.y - screenCenterY;
    cameraY = Math.max(0, Math.min(state.wallHeight - canvas.height, cameraY));

    // --- LEFT HALF: WALL AREA ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, state.wallWidth, canvas.height);
    ctx.clip();

    // 8-Bit Pixelated Rock Wall Background
    draw8BitRockWall(state.wallWidth, canvas.height, cameraY);

    // Wall Top Cutoff & Starry Sky Above Top
    const topScreenY = 70 - cameraY;
    if (topScreenY > 0) {
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, state.wallWidth, topScreenY);
        ctx.fillStyle = COLORS.WHITE;
        for (let i = 0; i < 16; i++) {
            const sx = (i * 37 + 12) % state.wallWidth;
            const sy = (i * 19 + 5) % topScreenY;
            ctx.fillRect(sx, sy, 2, 2);
        }
    }

    // Horizontal Green Glowing Lines
    const allCardsInHand = (state.hand.length === state.deck.length);
    state.lines.forEach(line => {
        const screenY = line.y - cameraY;
        if (screenY >= -10 && screenY <= canvas.height + 10) {
            ctx.lineWidth = 4;
            if (allCardsInHand) {
                ctx.strokeStyle = COLORS.RED;
            } else if (line.active) {
                ctx.strokeStyle = '#00FF66';
                ctx.shadowColor = '#00FF66';
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = '#225533';
                ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(state.wallWidth, screenY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    });

    // Shapes on Wall (No Black Outlines)
    state.shapes.forEach(shape => {
        const sy = shape.y - cameraY;
        if (sy >= 55 && sy <= canvas.height + 20) {
            let isTarget = false;
            let isHighlighted = false;
            if (state.activeModal === 'select_shape') {
                const targetIdx = state.targetShapes.findIndex(ts => ts.id === shape.id);
                if (targetIdx !== -1) {
                    isTarget = true;
                    if (targetIdx === state.highlightedTargetIndex) {
                        isHighlighted = true;
                    }
                }
            }

            const inReach = Math.hypot(shape.x - state.player.x, shape.y - state.player.y) <= state.player.reachRadius;

            ctx.save();
            if (state.activeModal === 'select_shape' && !isTarget) {
                ctx.globalAlpha = 0.3;
            }

            if (isHighlighted) {
                ctx.shadowColor = COLORS.SELECTION_YELLOW;
                ctx.shadowBlur = 12;
                ctx.strokeStyle = COLORS.SELECTION_YELLOW;
                ctx.lineWidth = 3;
            }

            draw8BitClimbShape(shape.type, shape.x, sy, time);

            if (isHighlighted) {
                ctx.beginPath();
                ctx.arc(shape.x, sy, 18, 0, Math.PI * 2);
                ctx.stroke();
            } else if (inReach) {
                draw8BitShapeDottedOutline(shape.type, shape.x, sy);
            }

            ctx.restore();
        }
    });

    // Glowing Reach Circle
    const playerScreenX = state.player.x;
    const playerScreenY = state.player.y - cameraY;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, state.player.reachRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Player Avatar Sprite
    const travelerActor = CAST[selectedIndex] ? CAST[selectedIndex].actor.toLowerCase() : 'peter';
    const climbSprite = (typeof climbSprites !== 'undefined' && climbSprites[travelerActor]) ? climbSprites[travelerActor] : null;
    if (climbSprite && climbSprite.complete && climbSprite.naturalWidth > 0) {
        drawPixelatedImage(climbSprite, 0, 0, 64, 64, playerScreenX - 32, playerScreenY - 32, 64, 64);
    } else {
        ctx.fillStyle = COLORS.RED;
        ctx.fillRect(playerScreenX - 12, playerScreenY - 18, 24, 36);
        ctx.fillStyle = COLORS.GOLD;
        ctx.fillRect(playerScreenX - 8, playerScreenY - 24, 16, 12);
    }

    // Explanatory prompt during shape selection
    if (state.activeModal === 'select_shape') {
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(10, canvas.height - 40, state.wallWidth - 20, 30);
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, canvas.height - 40, state.wallWidth - 20, 30);
        ctx.fillStyle = COLORS.SELECTION_YELLOW;
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Select shape with Left/Right or click it.', state.wallWidth / 2, canvas.height - 22);
    }

    ctx.restore();

    // --- STARRY STRIP RIGHT OF WALL (+ 1 CARD Text in Green) ---
    ctx.save();
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(state.starStripX, 0, state.starStripWidth, canvas.height);

    ctx.fillStyle = COLORS.WHITE;
    for (let i = 0; i < 12; i++) {
        const sx = state.starStripX + ((i * 13) % state.starStripWidth);
        const sy = (i * 47) % canvas.height;
        ctx.fillRect(sx, sy, 2, 2);
    }

    // Floating "+ 1 CARD" / "+ 2 CARDS" text in Green Shades
    state.lines.forEach(line => {
        const screenY = line.y - cameraY;
        if (screenY >= 0 && screenY <= canvas.height) {
            ctx.fillStyle = allCardsInHand ? COLORS.RED : (line.active ? '#00FF66' : '#225533');
            ctx.font = '7px "Press Start 2P"';
            ctx.textAlign = 'center';
            const val = line.value || 1;
            ctx.fillText(`+ ${val}`, state.starStripX + state.starStripWidth / 2, screenY - 5);
            ctx.fillText(val > 1 ? 'CARDS' : 'CARD', state.starStripX + state.starStripWidth / 2, screenY + 8);
        }
    });
    ctx.restore();

    // Solid Black Top HUD Background Bar
    ctx.save();
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, 400, 45);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(400, 45);
    ctx.stroke();
    ctx.restore();

    // --- RIGHT HALF: CARD AREA (8-Bit Wood Table) ---
    ctx.save();
    draw8BitWoodTexture(state.cardAreaX, 0, state.cardAreaWidth, canvas.height);

    // Coins Indicator
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(state.cardAreaX + 20, 20, 120, 35);
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(state.cardAreaX + 20, 20, 120, 35);
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`COINS: ${state.coins}¢`, state.cardAreaX + 30, 42);

    // Draw / Discard Buttons
    drawPileButton(state.cardAreaX + 20, 75, 110, 50, `DRAW (${state.drawPile.length})`);
    drawPileButton(state.cardAreaX + 150, 75, 110, 50, `DISCARD (${state.discardPile.length})`);

    // Give Up Button
    ctx.fillStyle = COLORS.RED;
    ctx.fillRect(state.cardAreaX + 275, 20, 105, 105);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 3;
    ctx.strokeRect(state.cardAreaX + 275, 20, 105, 105);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GIVE UP', state.cardAreaX + 327, 75);

    // Player Cards in Hand (No Text on Card Face)
    const cardsPerPage = 6;
    const totalHandPages = Math.ceil(state.hand.length / cardsPerPage) || 1;
    if (state.handPage >= totalHandPages) state.handPage = Math.max(0, totalHandPages - 1);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'left';
    if (state.hand.length > cardsPerPage) {
        ctx.fillText(`HAND (${state.hand.length}) P.${state.handPage + 1}/${totalHandPages}`, state.cardAreaX + 20, 155);

        // Prev Page (<)
        ctx.fillStyle = (state.handPage > 0) ? COLORS.GOLD : '#555555';
        ctx.fillRect(state.cardAreaX + 280, 138, 25, 22);
        ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 1.5; ctx.strokeRect(state.cardAreaX + 280, 138, 25, 22);
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('<', state.cardAreaX + 292, 153);

        // Next Page (>)
        ctx.fillStyle = (state.handPage < totalHandPages - 1) ? COLORS.GOLD : '#555555';
        ctx.fillRect(state.cardAreaX + 315, 138, 25, 22);
        ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 1.5; ctx.strokeRect(state.cardAreaX + 315, 138, 25, 22);
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('>', state.cardAreaX + 327, 153);
    } else {
        ctx.fillText('YOUR HAND:', state.cardAreaX + 20, 155);
    }

    const handY = 170;
    const cardW = 100, cardH = 140;
    const startIndex = state.handPage * cardsPerPage;
    const visibleCards = state.hand.slice(startIndex, startIndex + cardsPerPage);

    visibleCards.forEach((card, localIdx) => {
        const actualIdx = startIndex + localIdx;
        const col = localIdx % 3;
        const row = Math.floor(localIdx / 3);
        const cx = state.cardAreaX + 20 + col * 120;
        const cy = handY + row * 155;
        const playable = isClimbCardPlayable(card);
        drawClimbCard(card, cx, cy, cardW, cardH, state.selectedCardIndex === actualIdx, playable);
    });

    ctx.restore();

    // Modals
    if (state.activeModal === 'card_modal' && state.selectedCardIndex >= 0) {
        drawCardDetailModal(state.hand[state.selectedCardIndex]);
    } else if (state.activeModal === 'draw_pile') {
        drawPileInspectionModal('Draw Pile (Random Order)', state.frozenPilePreview || state.drawPile);
    } else if (state.activeModal === 'discard_pile') {
        drawPileInspectionModal('Discard Pile', state.frozenPilePreview || state.discardPile);
    }
}

// 8-Bit Wood Surface Texture
function draw8BitWoodTexture(x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x, y, w, h);

    const plankH = 40;
    for (let py = y; py < y + h; py += plankH) {
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x, py, w, 4);

        ctx.fillStyle = '#5D4037';
        for (let gx = x + 10; gx < x + w; gx += 30) {
            ctx.fillRect(gx, py + 12, 16, 2);
            ctx.fillRect(gx + 8, py + 24, 12, 2);
        }

        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(x + ((py * 7) % (w - 20)), py + 18, 4, 4);
    }
    ctx.restore();
}

// 8-Bit Pixelated Rock Wall Generator
function draw8BitRockWall(w, h, cameraY) {
    ctx.save();
    ctx.fillStyle = '#C8C8C8';
    ctx.fillRect(0, 0, w, h);

    const tileSize = 32;
    const startY = Math.floor(cameraY / tileSize) * tileSize;

    for (let ry = startY; ry < cameraY + h + tileSize; ry += tileSize) {
        const screenY = ry - cameraY;
        for (let rx = 0; rx < w; rx += tileSize) {
            const hash = (rx * 17 + ry * 31) % 100;
            if (hash < 30) {
                ctx.fillStyle = '#BCBCBC';
                ctx.fillRect(rx, screenY, tileSize, tileSize);
            } else if (hash > 70) {
                ctx.fillStyle = '#D6D6D6';
                ctx.fillRect(rx, screenY, tileSize, tileSize);
            }

            if (hash % 7 === 0) {
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(rx + 8, screenY + 8, 4, 4);
            }
        }
    }
    ctx.restore();
}

// 8-Bit Pixel Art Shape Renderer for all 9 shape/color combinations
function draw8BitClimbShape(type, x, y, time) {
    ctx.save();
    const px = Math.round(x);
    const py = Math.round(y);
    const safeType = typeof type === 'string' ? type : '';

    let mainColor = '#DD0000';
    let lightColor = '#FF6666';

    if (safeType.startsWith('blue_')) {
        mainColor = '#0055FF';
        lightColor = '#66AAMM';
    } else if (safeType.startsWith('green_')) {
        mainColor = '#00CC44';
        lightColor = '#88FF88';
    } else if (safeType.startsWith('gray_')) {
        mainColor = '#777777';
        lightColor = '#AAAAAA';
    }

    if (safeType.endsWith('_square') || safeType === 'square' || safeType === 'shape_square' || safeType === CLIMB_SHAPE_TYPES.RED_SQUARE) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 11, py - 11, 22, 22);
        ctx.fillStyle = lightColor;
        ctx.fillRect(px - 11, py - 11, 22, 4);
        ctx.fillRect(px - 11, py - 11, 4, 22);
    } else if (safeType.endsWith('_circle') || safeType === 'circle' || safeType === 'shape_circle' || safeType === CLIMB_SHAPE_TYPES.BLUE_CIRCLE) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 6, py - 11, 12, 22);
        ctx.fillRect(px - 11, py - 6, 22, 12);
        ctx.fillStyle = lightColor;
        ctx.fillRect(px - 6, py - 11, 10, 4);
        ctx.fillRect(px - 11, py - 6, 4, 10);
    } else if (safeType.endsWith('_diamond') || safeType === 'diamond' || safeType === 'shape_diamond' || safeType === CLIMB_SHAPE_TYPES.GREEN_DIAMOND) {
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(px, py - 12); ctx.lineTo(px + 12, py); ctx.lineTo(px, py + 12); ctx.lineTo(px - 12, py);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(px, py - 12); ctx.lineTo(px + 6, py - 6); ctx.lineTo(px, py); ctx.lineTo(px - 6, py - 6);
        ctx.closePath(); ctx.fill();
    } else if (safeType.endsWith('_plus') || safeType === 'plus' || safeType === 'shape_plus' || safeType === CLIMB_SHAPE_TYPES.RED_PLUS || safeType === CLIMB_SHAPE_TYPES.BLUE_PLUS || safeType === CLIMB_SHAPE_TYPES.GREEN_PLUS) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 11, py - 4, 22, 8);
        ctx.fillRect(px - 4, py - 11, 8, 22);
        ctx.fillStyle = lightColor;
        ctx.fillRect(px - 4, py - 11, 8, 3);
        ctx.fillRect(px - 11, py - 4, 3, 8);
    } else {
        const hue = Math.floor(((time || 0) * 200) % 360);
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.font = '22px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('*', px, py + 2);
    }
    ctx.restore();
}

function draw8BitShapeDottedOutline(type, x, y) {
    ctx.save();
    const px = Math.round(x);
    const py = Math.round(y);
    const safeType = typeof type === 'string' ? type : '';

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    if (safeType.endsWith('_square') || safeType === 'square' || safeType === 'shape_square' || safeType === CLIMB_SHAPE_TYPES.RED_SQUARE) {
        ctx.strokeRect(px - 13, py - 13, 26, 26);
    } else if (safeType.endsWith('_circle') || safeType === 'circle' || safeType === 'shape_circle' || safeType === CLIMB_SHAPE_TYPES.BLUE_CIRCLE) {
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.stroke();
    } else if (safeType.endsWith('_diamond') || safeType === 'diamond' || safeType === 'shape_diamond' || safeType === CLIMB_SHAPE_TYPES.GREEN_DIAMOND) {
        ctx.beginPath();
        ctx.moveTo(px, py - 14);
        ctx.lineTo(px + 14, py);
        ctx.lineTo(px, py + 14);
        ctx.lineTo(px - 14, py);
        ctx.closePath();
        ctx.stroke();
    } else if (safeType.endsWith('_plus') || safeType === 'plus' || safeType === 'shape_plus' || safeType === CLIMB_SHAPE_TYPES.RED_PLUS || safeType === CLIMB_SHAPE_TYPES.BLUE_PLUS || safeType === CLIMB_SHAPE_TYPES.GREEN_PLUS) {
        ctx.beginPath();
        ctx.moveTo(px - 5, py - 13);
        ctx.lineTo(px + 5, py - 13);
        ctx.lineTo(px + 5, py - 5);
        ctx.lineTo(px + 13, py - 5);
        ctx.lineTo(px + 13, py + 5);
        ctx.lineTo(px + 5, py + 5);
        ctx.lineTo(px + 5, py + 13);
        ctx.lineTo(px - 5, py + 13);
        ctx.lineTo(px - 5, py + 5);
        ctx.lineTo(px - 13, py + 5);
        ctx.lineTo(px - 13, py - 5);
        ctx.lineTo(px - 5, py - 5);
        ctx.closePath();
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function draw8BitColorCardGraphic(type, cx, cy) {
    ctx.save();
    let col = '#DD0000';
    let name = 'RED';
    if (type === 'color_blue') { col = '#0055FF'; name = 'BLUE'; }
    else if (type === 'color_green') { col = '#00CC44'; name = 'GREEN'; }

    ctx.fillStyle = col;
    ctx.fillRect(cx - 16, cy - 16, 32, 32);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 16, cy - 16, 32, 32);

    ctx.fillStyle = '#2D1E18';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(name, cx, cy + 20);
    ctx.restore();
}

function draw8BitShapeCardGraphic(type, cx, cy) {
    ctx.save();
    let name = 'SQUARE';
    ctx.fillStyle = '#444444';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    if (type === 'shape_square') {
        name = 'SQUARE';
        ctx.fillRect(cx - 14, cy - 14, 28, 28);
        ctx.strokeRect(cx - 14, cy - 14, 28, 28);
    } else if (type === 'shape_circle') {
        name = 'CIRCLE';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (type === 'shape_diamond') {
        name = 'DIAMOND';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 15); ctx.lineTo(cx + 15, cy); ctx.lineTo(cx, cy + 15); ctx.lineTo(cx - 15, cy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (type === 'shape_plus') {
        name = 'PLUS';
        ctx.fillRect(cx - 14, cy - 5, 28, 10);
        ctx.fillRect(cx - 5, cy - 14, 10, 28);
        ctx.strokeRect(cx - 14, cy - 5, 28, 10);
        ctx.strokeRect(cx - 5, cy - 14, 10, 28);
    }

    ctx.fillStyle = '#2D1E18';
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(name, cx, cy + 18);
    ctx.restore();
}

// Helper function for rounded rectangles with browser compatibility fallback
function drawClimbRoundedRectPath(x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
    } else if (typeof ctx.arcTo === 'function') {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    } else {
        ctx.rect(x, y, w, h);
    }
}

// Card Renderer with Rounded Corners & Warm Off-White Cream Background
function drawClimbCard(card, x, y, w, h, isSelected, isPlayable = true) {
    ctx.save();
    const r = 5; // Slight rounding radius for cards

    if (!isPlayable) {
        // Card Face Gray Fill
        ctx.fillStyle = isSelected ? '#E0E0E0' : '#D0D0D0';
        drawClimbRoundedRectPath(x, y, w, h, r);
        ctx.fill();

        // Outer Border Frame (Grayed out)
        ctx.strokeStyle = isSelected ? COLORS.SELECTION_YELLOW : '#666666';
        ctx.lineWidth = isSelected ? 3 : 2;
        drawClimbRoundedRectPath(x, y, w, h, r);
        ctx.stroke();

        // Inner Inset Accent Line
        ctx.strokeStyle = isSelected ? 'rgba(255, 215, 0, 0.4)' : '#B0B0B0';
        ctx.lineWidth = 1.5;
        drawClimbRoundedRectPath(x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 2));
        ctx.stroke();

        ctx.globalAlpha = 0.45;
    } else {
        // Card Face Off-White / Cream Fill
        ctx.fillStyle = isSelected ? '#FFFCE6' : '#F9F5EA';
        drawClimbRoundedRectPath(x, y, w, h, r);
        ctx.fill();

        // Outer Border Frame
        ctx.strokeStyle = isSelected ? COLORS.SELECTION_YELLOW : '#2D1E18';
        ctx.lineWidth = isSelected ? 3 : 2;
        drawClimbRoundedRectPath(x, y, w, h, r);
        ctx.stroke();

        // Inner Inset Accent Line
        ctx.strokeStyle = isSelected ? 'rgba(255, 215, 0, 0.4)' : '#E6DDD0';
        ctx.lineWidth = 1.5;
        drawClimbRoundedRectPath(x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 2));
        ctx.stroke();
    }

    // Render Card Symbol / Special Graphic
    try {
        if (card.type === 'draw_two') {
            draw8BitDrawTwoGraphic(x + w / 2, y + h / 2 - 6);
        } else if (card.type === 'draw_three') {
            draw8BitDrawThreeGraphic(x + w / 2, y + h / 2 - 6);
        } else if (card.type === 'combo_shape') {
            draw8BitComboShapeGraphic(x + w / 2, y + h / 2 - 6, card);
        } else if (card.type === 'card_go_up') {
            draw8BitGoUpGraphic(x + w / 2, y + h / 2 - 6);
        } else if (card.type === 'trash_two') {
            draw8BitTrashBinGraphic(x + w / 2, y + h / 2 - 6);
        } else if (card.type && card.type.startsWith('color_')) {
            draw8BitColorCardGraphic(card.type, x + w / 2, y + h / 2 - 6);
        } else if (card.type && card.type.startsWith('shape_')) {
            draw8BitShapeCardGraphic(card.type, x + w / 2, y + h / 2 - 6);
        } else {
            draw8BitClimbShape(card.type, x + w / 2, y + h / 2 - 6, Date.now() * 0.002);
        }
    } catch (err) {
        console.error("Error rendering climb card graphic:", err);
    }

    // Render Coin Icons row near bottom of card
    const extraCoins = (minigameState.climb && minigameState.climb.extraCoinsPerCard) || 0;
    const coinVal = getCardCoinValue(card, extraCoins);
    drawCardCoinIcons(x, y, w, h, coinVal);

    ctx.restore();
}

function drawCardCoinIcons(x, y, w, h, coinVal) {
    ctx.save();
    const coinRadius = Math.max(3, Math.floor(w / 22));
    const spacing = coinRadius * 2 + 4;
    const totalW = coinVal * spacing - 4;
    const startX = x + (w - totalW) / 2 + coinRadius;
    const coinY = y + h - coinRadius - 7;

    for (let i = 0; i < coinVal; i++) {
        const cx = startX + i * spacing;
        ctx.fillStyle = COLORS.GOLD;
        ctx.beginPath();
        ctx.arc(cx, coinY, coinRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (coinRadius >= 4) {
            ctx.fillStyle = '#5C4000';
            ctx.font = `${Math.floor(coinRadius * 1.5)}px "Press Start 2P"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('¢', cx, coinY + 0.5);
        }
    }
    ctx.restore();
}

// Pre-rendered custom graphics loaded from images/elements/climb/wares directory
const ware3xImg = new Image(); ware3xImg.src = 'data:image/png;base64,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';
const wareRingReachImg = new Image(); wareRingReachImg.src = 'data:image/png;base64,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';
const wareRingHandImg = new Image(); wareRingHandImg.src = 'data:image/png;base64,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';
const wareRingRichesImg = new Image(); wareRingRichesImg.src = 'data:image/png;base64,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';
const wareSlotMachineImg = new Image(); wareSlotMachineImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA3CAYAAACb4M1PAAATk0lEQVR4nO1bCZRVxZn+qu69771+TXezNt2sDYg0i4hKBFREoohohEGjZ8YJ6hyTzKhnzuSo45Zxm8mZzInLGZckmknUqHGLUWMyaibigGgEDKC0gALNIjvYQK9vubeq5vxVdd/+HsRmzpmJ/PD63XvfvX/99ddf/36B43AcjsNx+PICK/fDyy+9qFo3fYrFv/89XM+DlApKAYwVP6KUgrmc/S17n9LX6VxfISQ5w9NtdEVB5hPGmMFrUZixuR2nAA2d55JFxyGt9jhDXc6x/ug/CvQPnCMWj+P5X76aN8n5c85TUBJKCPOs4+Krc87Hd265pSz/cMVlCwpI/HLC+iVvqyZAjQPUeECdYJfgO1cu0t9FHHzxhWfVe0v/G0vfehOiZy/uuPV6JDv3QAQCtAC0UkJKLR2OY9dRkXQZKWScZ6WNcb3kJC2cczu0kchQEug65wyKSY2b7iVpDyVY4ywgVUsiAKkkpBFNfaykhJTCSrQRUxXisDiJbsJl6JH6HnqWoCcdwbO/fBNdKReNQ0ZhROMI9E90oWvbFgyKelC+QML3sbunG8n+g4DBQ+AWMnDd2lX49a9ewLZ9HeyCCVAzJ1cDsg+gIpDShW8H1fRxoWlg0gFTaTAmITXzDIME7Su9/SzTwsnAoYf1tiXm0Qf00f/1VVoOMDsxvZUV/WK2GwMHLQ2UgNRDMCgpwEgNKAnaaJqJxBwm9QJ4tPgM+n76o+lwlB7J44DnKGzd5eBXQRfgVmP7+o+xdeUaTI5yXHvRHPRLd4KlFQLmoA0KT6/9FC+s+4TlMfDqRX+pfvPySzh1fD1uvmaaqq/ugUwewObte/HaGx+ivTsKofWFmZgArbgCk1bS9PWQWQySTrVUEuVGLmjhpWRamkmCSSo4fRzDSMYJj1FcVs40Ekcz0DJRS6oZL1zPUIr0DiFm0UVaRG7GdaXBb7A7YLR7uIAbJDB14lAsmDsJA6oZ7r7pa+gRdXjmuXfw4Yod8OjxngSiQQpuIJASAn1cD3HLgzwG7tixHas3bGfTxp2o5p41DJ5KQwiF3QcU3ly6C+vayhud/8/AEFcXze2LmuoExjX1QVpVo64qsJNVcLiDKHfhORK0Ht1+GswalDwGkhYicCDhiAR2H0hj+54ObNot0C3p1gB/jrBpT4C3V36OEf1TaB7VH5CkjpRWBQmlsLv9MByRhpvq1qqm241CaB1SyEBpuEpGgsR8w+Y2/MsDS7ElaRajeexYdfY5ZyOZTED4tIGZvjcQaVJHZivpYbWG11vTD3z85+tvlpTcSxfOV/GqagQ0HmdwHAdcb1VSrGYL6g1MRkIEEFLho7UfY8P6DUX4Ro8apWbOOhuB7yOd8i0JAkIJq7JJWUprnBxEPA9BOo2XX32FLVu3jy1b9xLmjYN65Ad/D192g7kREJZOzrCfOejqSqF/VQTxeBUOCwcJN1qKgVk9wp0IekQswzyCufPm4cGHHtLny//wvlLcWD96TgmpJwlGSoloJT0lcfDQIQQyUL978628STc3j1PfWLQIAwcOAq0b9xhc14MDB6dPn1bEoBUr/qDICDz0yCPEwLzfZsyYoaaccjKuuvJKMwdl6KIlJqYFQkBqR1HqRVWSwXMc7Ny+Fa2tm9RHLR/r8fa1A0lZA7A0BHewDWDRtFL/1bIBtUGA0UMHQB3qwK7DCewISnh5Z51xmr567YLRaucbf6MeuXmuPp8yaUKvfcIzzzorg+O+++/vNb6mplEax4Tm5l7jeuj++zSOUxqhWl65RW149dvqWxeMzMM7xYOaHoOawqHGAOqvzze8sTvZgPG3jB0V1ocy13vvU3PtExpwyBT3Eig6IohEzFbqDXR3delvIY36MhY+f86nz5mBO//9dpx2/mS0kmNRU4NiBuaeaJNvD49BTBL4WQPkHgMGbt60UZPrMKfXuLTqMWpb61n9XSA0AwfH0Dx5CBqaDONUxMwhbybG4Q1jTw4pzDkJz5qVy3vFRidnnseAfxlQJWLzPxksDvJMfKEQqACB9StzBSBIJ5FK9uRNIs+IhOEThTna8lmjEpBBsMdLfvSwShzYj5qqKBx6WjGIlILHJMg31dEH4zpiSXkezr3pViMp5ExbcHmWm2sef0zFKBqTxu9StFoUqhGBDofjcCim0J0S8BoaMXHe1/I4JnOSEO889VPVvbUV1bEoPE7myNHRh3bBBYV42jwikRZwGuox81vX2fAoxEWCkw338sbRQkUehvEyuJ1DfiiXM0liBllR2EnZ6Babf/c6Dn2yDv0irhZf4qsUFHb5OizikkMwwHcd7GUcnUvfUjWzzmNuTtDjUigHoPWJn6jn7r0XgxgHZ+T2EAk0bYpIuKbHZeSKBGhXDN74SUXCk5vF2bZkMVJr1yLCBLiOkGy8TFZY+GA+IAKGbs4QmzwxhzksyyRitjHeeSA4R0C/8nxhy2MgmXjzoxVRu2lpQsQcgnjUw0GlkCI/DwabdHQsBU9KxAHEXA+B40BxD9179hkcOTqF/DOCCBSqXQduKgWfnA7u6LHJSeVKIaI4Ypwhyh1NKHe9YgbqENFAzItARaKa4b4Q4JSgoESH3m4KcShEHQ5PBnk7QpD1sDIXikqh3aTdSJIczpkSGkUMDM0GMZJppWW3dM4WTjKGfqPH4OKL5yMajUJQ9oOsjPARSaZwsGU91n/wR43YVQrbW7eYidrQRx/TEhNRnMNnwKCmJkw/dxYSQkEoF4FMw4WEm0pi+6pVOPTZDiTTAbxEsiIDu4XCgKbROG/hfCTTaahU2kgUjd3Tg89bWtCyZIl2toNEIsvAIMgyMMw5FnCQPBHyUkJvIrQX+VvYXqSogJCEkiIdCWWtwIAppyGd6EHD9TeU1N4H7/++2rvsPTDhIzZmLKZ99w59n3CzliOkLajrCzF0KOKTJ6P+5ruL8KmPlqtd+/aifetmiJpasFhV8YA5e40PGwY3GkX8sitL0tb2wweU/8EquIFEXcOwLAOtFdZz11wqSNDqcQqYag9LSqBGks2qaYV5yrQZGuWC2+6saPZSvg8ZjcIXDtpzJSbHDwwt55i/uMwcvL64JC528nS29JtXqAR3MPvyyzH07HNx1dPP5d+Tg/equ/+1Im17Dx1E3ZAGdCTSuPDyy4HHn8rbwpo2mx8Md0m+esvmMUtKoE47ZWxJltuhAakELc//XPFdu7D1ww9RVVuHqTPOQGLIMOCd5UU4RKGGLgGfvfisih48hPff+A32J9LY70UwdsbMIkK4e2Q/cP97S5TctRNr3vgtEkxiW/thtAV+DhKr1+hPqK4KlaAtD+jcJUHFLUw60OboDOLKLuD+dxerX9x+G9hnO1DnuHBGjMBJF86DO3tuZsLcRg76OEdqSsErN1yvXvze3ajxffDqaqTjfcD7Dip5b8Z3LQOHlr2tHrvpRtQHvs6sLLzmGsw54UTUzrkwQxvF4ASUbKV8p0umNjS3FgxzyZDYJJcVgnwGhlbYZodDq8ydyhOWXV2oTaXgpFKorY7AHTgoj3kZAsJJV8QGRDo7UdV+GHHGMOGc2fjmN64EO/Ocktsg3DXlINrdharDB1ElfHRFYug7fCTiOcwjcEIpNmY4U6YoGMkuVj71BZFIuLXMjZnVdSsTmU6kIHuSqHFciJ4E6voNKLonI/qa4soL4iRSiPoCnD41dWWZZyitvBwskURV4CMqfc0X34sUj2cZSDs5rC4W2xBTr6Hkau64BTPJhnKm5Gclsmg18qG2uwfVnocO38dhN4JkNFZMZE78dqTcRCwQersEsSiCaLHvlwfWvSoHkVRCu1gpzpGickIJYQijQXIUSGtRbcVEHTn32HJE6LiXdmNyEWqlGSrM8gQ+cul89dqjP4bo7ESfoUMx4fx56ByWdRGKqKwAL991uzq0ag0+27ABPuNoExIjvMpGopIOfO3mG9WrTz6BWDQKVVuLFHehqquLcdhEMs2THGwTUhZ50nlbOPSLC9yYfAjPdSWrDLRvaYWzaw98pnDirFmY+G/3lrxb5UpgGSPS0boFHavXwAl8fOXcr6Jp/kWINzcDd36/7PjhREpB56rV6Gz9RIvW1HkX4oq7f8D+afqsovso3tagK3UUVjqm7JkLrMBtsuf56azcbgLKiYWhXAUJrIlGUOu5iEUj6N/YWPa+XH+tnAascV3U6qwxMHz8eDT+1dWs7pTpFUW3HP+SK99X1SpAFWU8HA+838AKWEJjaajTgUQZ4+Rm3Cb7TO6PlEw0RCmTxbCTpqJ0OXDBEHUdvYqReIlIITNclqAwri6ECOFgJjT0c9yeSmCbP4oh8OEI36QtaOtGYuVpszlFk4ShOdvadtEcTIUuF/JrIpnsC6lR6hYw1wuTi4UWzKFikAtwm2QsDTmxcBmj5Diu3jpa/xxB92WhNG1K+NopJkmieL2SDnZspiisOTPuwilQM1wFoHwMlHXAS2VjqOAdSiIlU0kSCahqVg6Yy3U2RlLuLlLsImQIyHFdSjUoadLpHtc1selRRBgVwTZD6Vymyc1VuNn+RsVAxrXHQBkogvEDoUYNi2Fko0DM6YZjGRh6JiUZqLcwpbYD24FQYQtLh0F4DJK2CS/PQFrVzDNl7gk4EFBUoJOpR8nAgoghc1ln2LhuE6HdVEkCqfRpHjLpLI8YaK3wmScPwj9cdyE8vhce2sB1sTNbSnBL6UDjiZuypL5ewY/pUFTP9dDheEiVcFJL+c7lptIFjjbmoZ076CrtYRWBUqWL/ZSPPKyADnB0K45UBQnUDUohbVT2zCGwplphQF8PTLi66pbhkC0UFejATB0uT7dQwX3liuXq9GnFFrHx1Kmo6exAnHFEho84qkmX207jzpyJxr4D0J5OoeaEsUeFKiw7FELtzNns19f+nXI+H4I+rot4/eAKSELtZ/S/jcP0NdcRcJDWckxxcjZDVSKhGjqlVFDKS5bLoGwGZdF9D2eZ+ugTR6KxIky9YlEW170PHPkB7QeWN1wLfvxoFt9zL1RCYr5086Rn1Ic1IpQPcKnkYHmiO8DKbeGQR1r+JPHcXtfZid5Vv3iuY9pLXLlgOliODZCAhZnnsEgueQSSV+mWN+nGEViW6e6uolBO5uuCrM9D3nnvJs1ynjc1imMDQW5e7wtCnz4mvCPDr6uDPGxZBpKqCio2GEHKAY/XQ7i1+jq3blZBOis8MJ2eTibek+jpbO8VkZ2dnZnj5StW9ArXk0//XF296Cp2NLnFI8E/3nSjev6F5/WxzjNIH4EIoKzwvL1yJw7d8xzinkRd/RC0bDpgHiy5hTOGg0I5gSrXx0gH6qNPN7O77rhVffe2m1VDYyM4uSTMVNBMV6lpjMy00pIzTJU8iis5x4oVK/DYo/+RWZ4nn/gZW3jJQrVwwQKk0qmC5m/dNqk/Wr/pUiPVnDlcz8UHq/+IkHkErVu36OM777pLjRzZhFQybdqFSQAsRiIsNA60E6ggG416SKWT+PbfXqufHzsQang9UBtLIJFOZUK0dTt8tm7Hp/ZsU4ZX9fX1xQzMZluVbneYMGYwrlk0BRv3pdUzb6xhO3ftV1XVVabISW2ynFQqeZ/hguhCrA7GNT5dQlDo6OgoWvlXXn6FbWv9NG/NDFDbrn0jQLim71X7aaa7tKu7u6Qk/fM997BJEycqSV1i5GJIqauCFPXogjlFJLBtdMIsbBh5NTe66pbr5mD0IAFX7Iena9MGzj7jNHXylFOxfcsO7D2wF5d8/VKMO3E8Fl76dVbEQOs3gzEPIi0xclgcI0ZMRUvrAaxfu16t3rHr2Gl/AGs+Wn9M8X28bt0XwjeoOsAZJ/VDv5gPJVMIZA2UbrsAGhuG4+L5l+p4ec7cOWzlqg/zni1wY8z3/sMKm3bSauzDCaOHoH+8G9Mn1aCpkStq2dCSZxugmSmimu58+tDaUSO46QK3eEmKzMf0LofFq5xWkpCGMJtLuIVxanU2mFSDbSYnr5zcqkAKuIr2g023m8JFtkgkzfMav92T+o0BokNn7RWYn8S4kdXwcBiBjGHnng58no7gQLtx0AfWN+D8Cy4ouzB5DEyl0/r7xcUb2YrlG9XEUcBPHrwBJ44C7rrpEgQBMcCBLyi5aPkQvtKg0z8MruNpE086LPuqAk3QNGLmvOJiJqQtf1hvCO+1DLR0mWZV28BOk7b9LpQL1GpCx23UiRqWIbL4adFowfV1opF+pjCVuvophQ8Bh/twnTRUdCAee/63WLY6jY22HzwdGJ4cFQPPmT0bQ4ePUIsXv822d4PVd3mqZYuEIyN65fVLARRfas7ZpJSuI5hCPEmUzuhSQ5BNNJm3hWgCdEavNxi1FyYqcgMJwziTxAgTSvo9EtNrkpPUpPQ66WEd/dsHDfNCvMb42IjKvh9C7iwx1CEfl56lNwJIv8oIHFYFt6oKbT0DsbFtNzt1crNqGDocEyedhD8Jfvb4T49BN6CBEdVQI/tkP0015htfEFel82MNDz/04BfH/8yzv1CjThjzv0rg/2WYOHGSevqpZ3o3/9Onf+VLycC5c89Ty95996jnXta6LHt3ifr8QJvWGbrt1ValtPK1VpLbvsFQT5nGTBv3Mm7fp3Oy1ayMqc36mxpTqKMyRiC/2kbHubG0watfeTLnuSGAfs6MXZi4VVQuIM2oSBfbnKFu46BWOEVvE2BwQyPOmXXuMXWvjsNxOA7HAX+m8D+MHhb8KH90WwAAAABJRU5ErkJggg==';

// Enhanced Render Wares Cards & Rings in Shop
function draw8BitWareGraphic(ware, x, y, w, h) {
    ctx.save();
    const cx = x + w / 2, cy = y + 42;

    if (ware.type === 'ring_reach') {
        if (wareRingReachImg.complete && wareRingReachImg.naturalWidth > 0) {
            ctx.drawImage(wareRingReachImg, cx - 35, cy - 35, 70, 70);
        } else {
            ctx.fillStyle = COLORS.GOLD;
            ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
        }
    } else if (ware.type === 'ring_hand') {
        if (wareRingHandImg.complete && wareRingHandImg.naturalWidth > 0) {
            ctx.drawImage(wareRingHandImg, cx - 35, cy - 35, 70, 70);
        } else {
            ctx.fillStyle = COLORS.GOLD;
            ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
        }
    } else if (ware.type === 'ring_riches') {
        if (wareRingRichesImg.complete && wareRingRichesImg.naturalWidth > 0) {
            ctx.drawImage(wareRingRichesImg, cx - 35, cy - 35, 70, 70);
        } else {
            ctx.fillStyle = COLORS.GOLD;
            ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
        }
    } else {
        // Draw 8-Bit Card Ware inside top half of box
        const cardObj = { type: ware.cardType || ware.type, title: ware.name };
        drawClimbCard(cardObj, cx - 22, y + 12, 44, 60, false);
    }
    ctx.restore();
}

function draw8BitDrawThreeGraphic(cx, cy) {
    ctx.save();
    if (ware3xImg.complete && ware3xImg.naturalWidth > 0) {
        ctx.drawImage(ware3xImg, cx - 20, cy - 18, 40, 36);
    } else {
        ctx.fillStyle = '#D32F2F';
        ctx.font = 'bold 20px "Press Start 2P"';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('3x', cx, cy + 2);
    }
    ctx.restore();
}

function draw8BitDrawTwoGraphic(cx, cy) {
    ctx.save();
    ctx.fillStyle = '#1976D2';
    ctx.fillRect(cx - 16, cy - 16, 32, 32);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 16, cy - 16, 32, 32);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+2', cx, cy);

    ctx.fillStyle = '#2D1E18';
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('DRAW 2', cx, cy + 20);
    ctx.restore();
}

function draw8BitComboShapeGraphic(cx, cy, card) {
    ctx.save();
    const s1 = (card && card.shape1) ? card.shape1 : 'square';
    const s2 = (card && card.shape2) ? card.shape2 : 'diamond';
    draw8BitClimbShape('gray_' + s1, cx - 12, cy - 14, 0);
    draw8BitClimbShape('gray_' + s2, cx + 12, cy + 14, 0);
    ctx.fillStyle = COLORS.SELECTION_YELLOW;
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('➔', cx, cy);
    ctx.restore();
}

function draw8BitGoUpGraphic(cx, cy) {
    ctx.save();
    // Big Gray Up-Arrow
    ctx.fillStyle = '#777777';
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - 22);
    ctx.lineTo(cx + 18, cy - 2);
    ctx.lineTo(cx + 9, cy - 2);
    ctx.lineTo(cx + 9, cy + 18);
    ctx.lineTo(cx - 9, cy + 18);
    ctx.lineTo(cx - 9, cy - 2);
    ctx.lineTo(cx - 18, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#AAAAAA';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx - 16, cy - 2);
    ctx.lineTo(cx - 7, cy - 2);
    ctx.lineTo(cx - 7, cy + 16);
    ctx.lineTo(cx - 4, cy + 16);
    ctx.lineTo(cx - 4, cy - 4);
    ctx.lineTo(cx - 12, cy - 4);
    ctx.lineTo(cx, cy - 16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function draw8BitTrashBinGraphic(cx, cy) {
    ctx.save();
    // Metal Lid & Handle (Doubled scale)
    ctx.fillStyle = '#78909C';
    ctx.fillRect(cx - 6, cy - 20, 12, 4);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(cx - 16, cy - 16, 32, 6);
    ctx.fillStyle = '#37474F';
    ctx.fillRect(cx - 16, cy - 10, 32, 3);

    // Metallic Bin Body
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 7);
    ctx.lineTo(cx + 14, cy - 7);
    ctx.lineTo(cx + 11, cy + 18);
    ctx.lineTo(cx - 11, cy + 18);
    ctx.closePath();
    ctx.fill();

    // Rib Lines
    ctx.fillStyle = '#546E7A';
    ctx.fillRect(cx - 7, cy - 4, 3, 19);
    ctx.fillRect(cx - 1, cy - 4, 3, 19);
    ctx.fillRect(cx + 5, cy - 4, 3, 19);
    ctx.restore();
}

function drawPileButton(x, y, w, h, label) {
    ctx.save();
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 3);
    ctx.restore();
}

function drawCardDetailModal(card) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mw = 420, mh = 300;
    const mx = (canvas.width - mw) / 2, my = (canvas.height - mh) / 2;

    ctx.fillStyle = '#FFFDF0';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#2A1B18';
    ctx.lineWidth = 4;
    ctx.strokeRect(mx, my, mw, mh);

    const playable = isClimbCardPlayable(card);
    drawClimbCard(card, mx + 30, my + 40, 100, 140, false, playable);

    ctx.fillStyle = COLORS.BLACK;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(card.title, mx + 150, my + 55);

    const desc = getClimbCardDescription(card);
    const lines = wrapTextLines(desc, 230, '10px "Press Start 2P"');
    lines.forEach((line, i) => {
        ctx.fillText(line, mx + 150, my + 85 + i * 20);
    });

    if (playable) {
        drawModalBtn(mx + 50, my + 230, 140, 40, 'PLAY CARD', '#00AA00');
    } else {
        drawModalBtn(mx + 50, my + 230, 140, 40, 'UNPLAYABLE', '#666666');
    }
    drawModalBtn(mx + 230, my + 230, 140, 40, 'CANCEL', '#AA0000');

    ctx.restore();
}

function getClimbCardDescription(card) {
    if (!card) return 'Climbing card.';
    if (card.type === 'color_red') return 'Matches any red shape within reach.';
    if (card.type === 'color_blue') return 'Matches any blue shape within reach.';
    if (card.type === 'color_green') return 'Matches any green shape within reach.';
    if (card.type === 'shape_square') return 'Matches any square shape within reach.';
    if (card.type === 'shape_circle') return 'Matches any circle shape within reach.';
    if (card.type === 'shape_diamond') return 'Matches any diamond shape within reach.';
    if (card.type === 'shape_plus') return 'Matches any plus shape within reach.';
    if (card.type === CLIMB_SHAPE_TYPES.RED_SQUARE) return 'Move to any red square in your reach circle.';
    if (card.type === CLIMB_SHAPE_TYPES.BLUE_CIRCLE) return 'Move to any blue circle in your reach circle.';
    if (card.type === CLIMB_SHAPE_TYPES.GREEN_DIAMOND) return 'Move to any green diamond in your reach circle.';
    if (card.type === CLIMB_SHAPE_TYPES.WILD_ASTERISK || card.type === 'wild_asterisk') return 'Matches any shape on the wall in reach.';
    if (card.type === 'combo_shape') {
        const s1 = card.shape1 || 'square';
        const s2 = card.shape2 || 'diamond';
        return `Allows ${s1.charAt(0).toUpperCase() + s1.slice(1)} then ${s2.charAt(0).toUpperCase() + s2.slice(1)} move.`;
    }
    if (card.type === 'card_go_up') return 'Move to the highest shape within reach.';
    if (card.type === 'trash_two') return 'Remove 2 cards from deck for this climb.';
    if (card.type === 'draw_two' || card.type === 'draw_three') return 'Draw 2 cards immediately from draw pile.';
    return 'Climbing card.';
}

function drawModalBtn(x, y, w, h, text, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 4);
}

function drawPileInspectionModal(title, pile) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mw = 550, mh = 400;
    const mx = (canvas.width - mw) / 2, my = (canvas.height - mh) / 2;

    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 4;
    ctx.strokeRect(mx, my, mw, mh);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, my + 35);

    pile.forEach((card, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const cx = mx + 30 + col * 125;
        const cy = my + 60 + row * 110;
        drawClimbCard(card, cx, cy, 80, 100, false);
    });

    ctx.fillStyle = COLORS.SELECTION_YELLOW;
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText('Click anywhere to close modal', canvas.width / 2, my + mh - 20);

    ctx.restore();
}

function openDrawPileModal() {
    const state = minigameState.climb;
    state.activeModal = 'draw_pile';
    state.frozenPilePreview = shuffleClimbArray([...state.drawPile]);
}

function openDiscardPileModal() {
    const state = minigameState.climb;
    state.activeModal = 'discard_pile';
    state.frozenPilePreview = [...state.discardPile];
}

function drawCardShopScreen() {
    const state = minigameState.climb;
    ctx.save();

    // Wood texture covers the entire canvas (underlying the top HUD)
    draw8BitWoodTexture(0, 0, canvas.width, canvas.height);

    // Player Coins on top right over wood background
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(`YOUR COINS: ${state.coins}¢`, canvas.width - 20, 28);

    // Shop Title below top HUD
    ctx.fillStyle = COLORS.SELECTION_YELLOW;
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('CARDATORIUM SHOP', canvas.width / 2, 72);

    // 3 Wares Boxes (Spacious 220x195px boxes with generous padding)
    const shopWares = state.shopWares || [];
    shopWares.forEach((ware, idx) => {
        if (!ware) return;
        const wx = 30 + idx * 260;
        const wy = 95, ww = 220, wh = 195;

        const wareType = (ware && (ware.type || ware.cardType)) || '';
        const ownedRings = state.ownedRings || new Set();
        const isPurchased = Boolean(ware && (ware.purchased || (wareType.startsWith('ring_') && ownedRings.has(wareType))));
        const warePrice = (ware && typeof ware.price === 'number') ? ware.price : 0;
        const canAfford = !isPurchased && state.coins >= warePrice;

        ctx.fillStyle = isPurchased ? '#3E2723' : (canAfford ? '#4E342E' : '#2A1B18');
        ctx.fillRect(wx, wy, ww, wh);
        ctx.strokeStyle = isPurchased ? '#777777' : (canAfford ? COLORS.GOLD : '#888888');
        ctx.lineWidth = 3;
        ctx.strokeRect(wx, wy, ww, wh);

        // Ware Graphic (Top half of box)
        ctx.save();
        if (isPurchased) ctx.globalAlpha = 0.7;
        try {
            draw8BitWareGraphic(ware || {}, wx, wy, ww, wh);
        } catch (e) {
            console.error("Error rendering ware graphic:", e);
        }
        ctx.restore();

        // Ware Name beneath image (no overlap!)
        const wareName = (ware && ware.name) || 'Special Ware';
        ctx.fillStyle = isPurchased ? '#AAAAAA' : (canAfford ? COLORS.SELECTION_YELLOW : '#888888');
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(wareName, wx + ww / 2, wy + 93);

        // Ware Description text
        ctx.fillStyle = isPurchased ? '#888888' : (canAfford ? '#E0E0E0' : '#888888');
        ctx.font = '7px "Press Start 2P"';
        const wareDesc = (ware && ware.desc) || '';
        const lines = wrapTextLines(wareDesc, ww - 24, '7px "Press Start 2P"');
        lines.forEach((l, i) => {
            if (wy + 114 + i * 13 < wy + wh - 22) {
                ctx.fillText(l, wx + ww / 2, wy + 114 + i * 13);
            }
        });

        // Price Tag (Bottom of box)
        ctx.fillStyle = isPurchased ? '#FF5555' : (canAfford ? COLORS.GOLD : '#888888');
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(isPurchased ? 'SOLD OUT' : `PRICE: ${warePrice}¢`, wx + ww / 2, wy + wh - 12);

        // CRISP SOLID RED DIAGONAL STAMP WITH "BOUGHT!" TEXT ACROSS THE WARE BOX
        if (isPurchased) {
            ctx.save();
            ctx.translate(wx + ww / 2, wy + wh / 2);
            ctx.rotate(-Math.PI / 6); // -30 degree angle
            ctx.fillStyle = '#D32F2F'; // Solid retro red banner
            ctx.fillRect(-65, -16, 130, 32);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(-65, -16, 130, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BOUGHT!', 0, 0);
            ctx.restore();
        }
    });

    // Card Removal Section Title
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '11px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Card Removal is 1¢ (Click card to remove)', canvas.width / 2, 310);

    // Single Horizontal Scrollable Line for Card Removal
    const deckY = 330;
    const cardW = 75, cardH = 105;
    const maxVisible = 6;
    const totalCards = state.deck.length;

    // Scroll Left Button (<)
    ctx.fillStyle = (state.deckScrollOffset > 0 || totalCards > maxVisible) ? COLORS.GOLD : '#555555';
    ctx.fillRect(40, deckY + 30, 35, 45);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; ctx.strokeRect(40, deckY + 30, 35, 45);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('<', 57, deckY + 58);

    // Scroll Right Button (>)
    ctx.fillStyle = (totalCards > maxVisible) ? COLORS.GOLD : '#555555';
    ctx.fillRect(725, deckY + 30, 35, 45);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; ctx.strokeRect(725, deckY + 30, 35, 45);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('>', 742, deckY + 58);

    // Render single row of visible cards
    const startIdx = state.deckScrollOffset;
    const endIdx = Math.min(totalCards, startIdx + maxVisible);

    for (let i = startIdx; i < endIdx; i++) {
        const col = i - startIdx;
        const cx = 100 + col * 100;
        drawClimbCard(state.deck[i], cx, deckY, cardW, cardH, false);
    }

    // Next Wall Button
    ctx.fillStyle = COLORS.RED;
    ctx.fillRect(canvas.width / 2 - 100, 525, 200, 50);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width / 2 - 100, 525, 200, 50);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT WALL', canvas.width / 2, 555);

    ctx.restore();
}

function handleClimbClick(x, y) {
    const state = minigameState.climb;
    if (!state || state.starWipe.active) return;

    if (state.activeModal === 'draw_pile' || state.activeModal === 'discard_pile') {
        state.activeModal = null;
        state.frozenPilePreview = null;
        return;
    }

    if (state.subPhase === 'climbing') {
        if (state.activeModal === 'card_modal') {
            const mw = 420, mh = 300;
            const mx = (canvas.width - mw) / 2, my = (canvas.height - mh) / 2;
            if (x >= mx + 50 && x <= mx + 190 && y >= my + 230 && y <= my + 270) {
                const card = state.hand[state.selectedCardIndex];
                if (isClimbCardPlayable(card)) {
                    activateSelectedClimbCard();
                } else {
                    audio.playSFX('FAILURE');
                }
                return;
            }
            state.activeModal = null;
            state.selectedCardIndex = -1;
            return;
        }

        if (state.activeModal === 'select_shape') {
            let clickedTarget = false;
            state.targetShapes.forEach((shape, idx) => {
                const cameraY = Math.max(0, Math.min(state.wallHeight - canvas.height, state.player.y - canvas.height / 2));
                const sy = shape.y - cameraY;
                if (Math.hypot(x - shape.x, y - sy) < 25) {
                    state.highlightedTargetIndex = idx;
                    executeClimbMove(shape);
                    clickedTarget = true;
                }
            });
            if (!clickedTarget) {
                state.activeModal = null;
                state.selectedCardIndex = -1;
            }
            return;
        }

        if (x >= state.cardAreaX + 275 && x <= state.cardAreaX + 380 && y >= 20 && y <= 125) {
            triggerClimbGiveUp();
            return;
        }

        if (x >= state.cardAreaX + 20 && x <= state.cardAreaX + 130 && y >= 75 && y <= 125) {
            openDrawPileModal();
            return;
        }
        if (x >= state.cardAreaX + 150 && x <= state.cardAreaX + 260 && y >= 75 && y <= 125) {
            openDiscardPileModal();
            return;
        }

        const cardsPerPage = 6;
        const totalHandPages = Math.ceil(state.hand.length / cardsPerPage) || 1;
        if (state.hand.length > cardsPerPage) {
            // Prev Page (<)
            if (x >= state.cardAreaX + 280 && x <= state.cardAreaX + 305 && y >= 138 && y <= 160) {
                if (state.handPage > 0) {
                    state.handPage--;
                    audio.playSFX('ui');
                }
                return;
            }
            // Next Page (>)
            if (x >= state.cardAreaX + 315 && x <= state.cardAreaX + 340 && y >= 138 && y <= 160) {
                if (state.handPage < totalHandPages - 1) {
                    state.handPage++;
                    audio.playSFX('ui');
                }
                return;
            }
        }

        const handY = 170;
        const cardW = 100, cardH = 140;
        const startIndex = state.handPage * cardsPerPage;
        const visibleCards = state.hand.slice(startIndex, startIndex + cardsPerPage);

        visibleCards.forEach((card, localIdx) => {
            const actualIdx = startIndex + localIdx;
            const col = localIdx % 3;
            const row = Math.floor(localIdx / 3);
            const cx = state.cardAreaX + 20 + col * 120;
            const cy = handY + row * 155;
            if (x >= cx && x <= cx + cardW && y >= cy && y <= cy + cardH) {
                state.selectedCardIndex = actualIdx;
                state.activeModal = 'card_modal';
                audio.playSFX('ui');
            }
        });
    } else if (state.subPhase === 'shop') {
        if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 && y >= 525 && y <= 575) {
            startClimbingRound();
            return;
        }

        // Shop Wares Clicks
        state.shopWares.forEach((ware, idx) => {
            const wx = 30 + idx * 260;
            const wy = 95, ww = 220, wh = 195;
            if (x >= wx && x <= wx + ww && y >= wy && y <= wy + wh) {
                if (state.coins >= ware.price) {
                    confirmWarePurchase(ware);
                }
            }
        });

        const deckY = 330;
        const cardW = 75, cardH = 105;
        const maxVisible = 6;
        const totalCards = state.deck.length;

        // Left Scroll Button (<) Click
        if (x >= 40 && x <= 75 && y >= deckY + 30 && y <= deckY + 75) {
            const maxOffset = Math.max(0, totalCards - maxVisible);
            state.deckScrollOffset = (state.deckScrollOffset - 1 + (maxOffset + 1)) % (maxOffset + 1);
            audio.playSFX('ui');
            return;
        }

        // Right Scroll Button (>) Click
        if (x >= 725 && x <= 760 && y >= deckY + 30 && y <= deckY + 75) {
            const maxOffset = Math.max(0, totalCards - maxVisible);
            state.deckScrollOffset = (state.deckScrollOffset + 1) % (maxOffset + 1);
            audio.playSFX('ui');
            return;
        }

        // Single Row Card Removal Clicks
        const startIdx = state.deckScrollOffset;
        const endIdx = Math.min(totalCards, startIdx + maxVisible);

        for (let i = startIdx; i < endIdx; i++) {
            const col = i - startIdx;
            const cx = 100 + col * 100;
            if (x >= cx && x <= cx + cardW && y >= deckY && y <= deckY + cardH) {
                if (state.coins >= 1) {
                    confirmCardDeletion(state.deck[i], i);
                }
            }
        }
    }
}

function isShapeMatchingCard(shapeObj, cardObj) {
    if (!shapeObj || !cardObj) return false;
    let cardType = (typeof cardObj === 'object' ? cardObj.type : cardObj) || '';
    let cardShape = typeof cardObj === 'object' ? (cardObj.shape || '') : '';
    let cardColor = typeof cardObj === 'object' ? (cardObj.color || '') : '';

    if (typeof cardObj === 'string') {
        if (['square', 'circle', 'diamond', 'plus'].includes(cardObj)) cardShape = cardObj;
        if (['red', 'blue', 'green'].includes(cardObj)) cardColor = cardObj;
    }
    if (cardType.startsWith('shape_')) cardShape = cardType.replace('shape_', '');
    if (cardType.startsWith('color_')) cardColor = cardType.replace('color_', '');
    if (['square', 'circle', 'diamond', 'plus'].includes(cardType)) cardShape = cardType;
    if (['red', 'blue', 'green'].includes(cardType)) cardColor = cardType;

    const shapeType = shapeObj.type || shapeObj;

    if (cardType === CLIMB_SHAPE_TYPES.WILD_ASTERISK || cardType === 'wild_asterisk' ||
        shapeType === CLIMB_SHAPE_TYPES.WILD_ASTERISK || shapeType === 'wild_asterisk') {
        return true;
    }

    if (cardColor && shapeObj.color === cardColor) {
        return true;
    }

    if (cardShape && shapeObj.shape === cardShape) {
        return true;
    }

    return cardType === shapeType;
}

function isClimbCardPlayable(card) {
    const state = minigameState.climb;
    if (!state || !card) return false;

    const cardType = (typeof card === 'object' ? card.type : card) || '';

    if (cardType === 'draw_two' || cardType === 'draw_three' || cardType === 'trash_two') {
        return true;
    }

    if (cardType === 'combo_shape') {
        const shape1 = card.shape1 || CLIMB_SHAPE_TYPES.RED_SQUARE;
        const shape2 = card.shape2 || CLIMB_SHAPE_TYPES.GREEN_DIAMOND;
        const validS1 = getValidComboTargets(state.player.x, state.player.y, state.player.reachRadius, state.shapes, shape1, shape2);
        return validS1.length > 0;
    }

    if (cardType === 'card_go_up' || cardType === CLIMB_SHAPE_TYPES.WILD_ASTERISK || cardType === 'wild_asterisk') {
        return state.shapes.some(s => Math.hypot(s.x - state.player.x, s.y - state.player.y) <= state.player.reachRadius);
    }

    return state.shapes.some(s => {
        const inReach = Math.hypot(s.x - state.player.x, s.y - state.player.y) <= state.player.reachRadius;
        const matchesType = isShapeMatchingCard(s, card);
        return inReach && matchesType;
    });
}

function getValidComboTargets(playerX, playerY, reachRadius, shapes, shape1, shape2) {
    const validS1List = [];
    shapes.forEach(s1 => {
        const dist1 = Math.hypot(s1.x - playerX, s1.y - playerY);
        if (dist1 <= reachRadius) {
            const matches1 = isShapeMatchingCard(s1, typeof shape1 === 'object' ? shape1 : { type: shape1 });
            if (matches1) {
                const hasS2 = shapes.some(s2 => {
                    if (s2.id === s1.id) return false;
                    const dist2 = Math.hypot(s2.x - s1.x, s2.y - s1.y);
                    if (dist2 > reachRadius) return false;
                    return isShapeMatchingCard(s2, typeof shape2 === 'object' ? shape2 : { type: shape2 });
                });
                if (hasS2) {
                    validS1List.push(s1);
                }
            }
        }
    });
    return validS1List;
}

function getCardCoinValue(card, extraCoinsPerCard = 0) {
    if (!card) return 0;
    let base = 1;
    const cardType = card.type || '';
    if (cardType === CLIMB_SHAPE_TYPES.WILD_ASTERISK || cardType === 'wild_asterisk' || cardType === 'card_go_up') {
        base = 3;
    } else if (['draw_two', 'draw_three', 'combo_shape', 'trash_two'].includes(cardType)) {
        base = 5;
    } else if (cardType.startsWith('color_')) {
        base = 2;
    } else if (cardType.startsWith('shape_')) {
        base = 1;
    } else {
        base = 1;
    }
    return base + extraCoinsPerCard;
}

function activateSelectedClimbCard() {
    const state = minigameState.climb;
    const card = state.hand[state.selectedCardIndex];
    if (!card) return;

    if (card.type === 'draw_two' || card.type === 'draw_three') {
        state.hand.splice(state.selectedCardIndex, 1);
        state.discardPile.push(card);
        drawClimbCards(2);
        state.activeModal = null;
        state.selectedCardIndex = -1;
        return;
    }

    if (card.type === 'card_go_up') {
        const shapesInReach = state.shapes.filter(s => Math.hypot(s.x - state.player.x, s.y - state.player.y) <= state.player.reachRadius);
        if (shapesInReach.length === 0) {
            audio.playSFX('FAILURE');
            return;
        }
        const minY = Math.min(...shapesInReach.map(s => s.y));
        const highestShapes = shapesInReach.filter(s => s.y === minY);
        state.targetShapes = highestShapes;
        state.highlightedTargetIndex = 0;
        state.activeModal = 'select_shape';
        return;
    }

    if (card.type === 'combo_shape') {
        const shape1 = card.shape1 || CLIMB_SHAPE_TYPES.RED_SQUARE;
        const shape2 = card.shape2 || CLIMB_SHAPE_TYPES.GREEN_DIAMOND;

        const validS1 = getValidComboTargets(state.player.x, state.player.y, state.player.reachRadius, state.shapes, shape1, shape2);

        if (validS1.length === 0) {
            audio.playSFX('FAILURE');
            return;
        }

        validS1.sort((a, b) => a.y - b.y);

        state.comboState = { stage: 1, shape1, shape2, cardIndex: state.selectedCardIndex };
        state.targetShapes = validS1;
        state.highlightedTargetIndex = 0;
        state.activeModal = 'select_shape';
        return;
    }

    const validTargets = state.shapes.filter(s => {
        const inReach = Math.hypot(s.x - state.player.x, s.y - state.player.y) <= state.player.reachRadius;
        const matchesType = isShapeMatchingCard(s, card);
        return inReach && matchesType;
    });

    if (validTargets.length === 0) {
        audio.playSFX('FAILURE');
        return;
    }

    validTargets.sort((a, b) => a.y - b.y);

    state.targetShapes = validTargets;
    state.highlightedTargetIndex = 0;
    state.activeModal = 'select_shape';
}

function executeClimbMove(targetShape) {
    const state = minigameState.climb;
    state.player.x = targetShape.x;
    state.player.y = targetShape.y;

    state.lines.forEach(line => {
        if (line.active && state.player.y <= line.y) {
            line.active = false;
            score += 50;
            drawClimbCards(line.value);
            audio.playSFX('SUCCESS');
        }
    });

    if (state.comboState && state.comboState.stage === 1) {
        if (state.player.y <= 80) {
            if (state.selectedCardIndex >= 0 && state.selectedCardIndex < state.hand.length) {
                const played = state.hand.splice(state.selectedCardIndex, 1)[0];
                state.discardPile.push(played);
            }
            state.comboState = null;
            state.activeModal = null;
            state.selectedCardIndex = -1;
            score += 1000;
            success(0);
            if (minigameState.successes < 4) {
                const wallNum = minigameState.successes;
                const handInfo = getItemizedEndWallMessage(wallNum, state.hand, state.extraCoinsPerCard);
                state.coins += handInfo.bonusCoins;
                showDialog('Rocky', 'Leichelle', handInfo.message, () => { openCardShop(); });
            }
            return;
        }

        const shape2 = state.comboState.shape2;
        const validS2 = state.shapes.filter(s2 => {
            if (s2.id === targetShape.id) return false;
            const dist = Math.hypot(s2.x - state.player.x, s2.y - state.player.y);
            if (dist > state.player.reachRadius) return false;
            return isShapeMatchingCard(s2, typeof shape2 === 'object' ? shape2 : { type: shape2 });
        });

        validS2.sort((a, b) => a.y - b.y);

        state.comboState.stage = 2;
        state.targetShapes = validS2;
        state.highlightedTargetIndex = 0;
        state.activeModal = 'select_shape';
        audio.playSFX('ui');
        return;
    }

    if (state.selectedCardIndex >= 0 && state.selectedCardIndex < state.hand.length) {
        const played = state.hand.splice(state.selectedCardIndex, 1)[0];
        state.discardPile.push(played);
    }

    state.comboState = null;
    state.activeModal = null;
    state.selectedCardIndex = -1;
    audio.playSFX('ui');

    if (state.player.y <= 80) {
        score += 1000;
        success(0);
        if (minigameState.successes < 4) {
            const wallNum = minigameState.successes;
            const handInfo = getItemizedEndWallMessage(wallNum, state.hand, state.extraCoinsPerCard);
            state.coins += handInfo.bonusCoins;

            showDialog('Rocky', 'Leichelle', handInfo.message, () => {
                openCardShop();
            });
        }
    }
}

function getItemizedEndWallMessage(wallNum, hand, extraCoins) {
    const handCount = hand.length;
    const bonusCoins = hand.reduce((total, c) => total + getCardCoinValue(c, extraCoins), 0);
    const valueCounts = {};
    hand.forEach(c => {
        const val = getCardCoinValue(c, extraCoins);
        valueCounts[val] = (valueCounts[val] || 0) + 1;
    });
    const itemized = Object.keys(valueCounts)
        .sort((a, b) => Number(a) - Number(b))
        .map(val => `${valueCounts[val]} card${valueCounts[val] === 1 ? '' : 's'} worth ${val}¢`)
        .join(', ');

    const cardText = (handCount === 1) ? '1 card' : `${handCount} cards`;
    const itemizedStr = itemized ? ` (${itemized})` : '';

    return {
        bonusCoins,
        message: `You completed wall number ${wallNum} with ${cardText}${itemizedStr}, for a total of ${bonusCoins}¢ for your remaining hand!`
    };
}

function triggerClimbGiveUp() {
    showDialog('Rocky', 'Leichelle', "Oh no! You're going to give up, keep your cards, and start again at the bottom?", (choice) => {
        if (choice === 'yes' || choice === true) {
            startStarWipeRestart();
        }
    }, null, null, ['YES', 'NO']);
}

function startStarWipeRestart() {
    const state = minigameState.climb;
    state.starWipe = { active: true, progress: 0, direction: 'in' };
}

function drawStarWipe() {
    const state = minigameState.climb;
    const sw = state.starWipe;
    sw.progress += 0.05;

    ctx.save();
    ctx.fillStyle = COLORS.BLACK;
    if (sw.direction === 'in') {
        ctx.globalAlpha = Math.min(1, sw.progress);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (sw.progress >= 1.0) {
            sw.direction = 'out';
            sw.progress = 0;
            failure();
            if (minigameState.failures < (minigameState.maxFailures || 3)) {
                startClimbingRound(true);
            }
        }
    } else {
        ctx.globalAlpha = Math.max(0, 1 - sw.progress);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (sw.progress >= 1.0) {
            sw.active = false;
        }
    }
    ctx.restore();
}

function capitalizeClimbStr(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function openCardShop() {
    const state = minigameState.climb;
    state.subPhase = 'shop';

    const availableCatalog = CLIMB_WARES_CATALOG.filter(item => {
        if (item.type && item.type.startsWith('ring_')) {
            return !state.ownedRings.has(item.type);
        }
        return true;
    });

    let candidateCatalog = [...availableCatalog];
    if (candidateCatalog.length < 3) {
        for (const catItem of CLIMB_WARES_CATALOG) {
            if (!candidateCatalog.some(c => c.id === catItem.id)) {
                candidateCatalog.push(catItem);
            }
            if (candidateCatalog.length >= 3) break;
        }
    }

    state.shopWares = shuffleClimbArray(candidateCatalog).slice(0, 3).map(w => {
        const item = {
            id: w.id || Math.random(),
            name: w.name || 'Special Ware',
            price: typeof w.price === 'number' ? w.price : 1,
            desc: w.desc || 'Climbing card ware.',
            type: w.type || w.cardType || '',
            cardType: w.cardType || w.type || '',
            purchased: Boolean(w.purchased)
        };
        if (item.type === 'combo_shape' || item.cardType === 'combo_shape') {
            const shapes = ['square', 'circle', 'diamond', 'plus'];
            item.shape1 = w.shape1 || shapes[Math.floor(Math.random() * shapes.length)];
            item.shape2 = w.shape2 || shapes[Math.floor(Math.random() * shapes.length)];
            item.name = `${capitalizeClimbStr(item.shape1)}-then-${capitalizeClimbStr(item.shape2)} Card`;
            item.desc = `Allows ${capitalizeClimbStr(item.shape1)} then ${capitalizeClimbStr(item.shape2)} move.`;
        }
        return item;
    });

    const shopDialogs = [
        "The Cardatorium has wares, if you have coin.",
        "Getcher pipin' hot fresh cards!",
        "And now, we move on to the true heart of the climbatorium: unfettered capitalism."
    ];
    const available = shopDialogs.filter(d => !state.usedShopDialogs.has(d));
    const chosen = (available.length === 0) ? shopDialogs[Math.floor(Math.random() * shopDialogs.length)] : available[Math.floor(Math.random() * available.length)];
    state.usedShopDialogs.add(chosen);

    showDialog('Rocky', 'Leichelle', chosen, null);
}

function confirmWarePurchase(ware) {
    const state = minigameState.climb;

    if (currentDialog) return;
    if (ware.purchased) return;
    if (ware.type && ware.type.startsWith('ring_') && state.ownedRings.has(ware.type)) return;
    if (state.coins < ware.price) return;

    showDialog('Rocky', 'Leichelle', `Looks like you want to buy the ${ware.desc} for ${ware.price}¢. Is that correct?`, (choice) => {
        if (choice === 'yes' || choice === true) {
            state.coins -= ware.price;
            ware.purchased = true;
            if (ware.type && ware.type.startsWith('ring_')) {
                state.ownedRings.add(ware.type);
            }
            applyClimbWare(ware);
            audio.playSFX('SUCCESS');
        }
    }, null, null, ['YES', 'NO']);
}

function applyClimbWare(ware) {
    const state = minigameState.climb;
    if (ware.cardType === CLIMB_SHAPE_TYPES.WILD_ASTERISK) {
        state.deck.push({ type: CLIMB_SHAPE_TYPES.WILD_ASTERISK, title: 'Wild Asterisk' });
    } else if (ware.type === 'ring_reach') {
        state.reachMultiplier *= 1.7;
    } else if (ware.type === 'ring_hand') {
        state.extraCardsDeal += 3;
    } else if (ware.type === 'combo_shape' || ware.cardType === 'combo_shape') {
        const shapes = ['square', 'circle', 'diamond', 'plus'];
        const s1 = ware.shape1 || shapes[Math.floor(Math.random() * shapes.length)];
        const s2 = ware.shape2 || shapes[Math.floor(Math.random() * shapes.length)];
        state.deck.push({
            type: 'combo_shape',
            title: `${capitalizeClimbStr(s1)}-then-${capitalizeClimbStr(s2)} Card`,
            shape1: s1,
            shape2: s2
        });
    } else if (ware.type === 'card_go_up') {
        state.deck.push({ type: 'card_go_up', title: 'Card Go Up' });
    } else if (ware.type === 'ring_riches') {
        state.extraCoinsPerCard += 1;
    } else if (ware.type === 'trash_two') {
        state.deck.push({ type: 'trash_two', title: 'Trash Two Cards' });
    } else if (ware.type === 'draw_two' || ware.type === 'draw_three') {
        state.deck.push({ type: 'draw_two', title: 'Draw Two' });
    }
}

function confirmCardDeletion(card, index) {
    const state = minigameState.climb;
    if (currentDialog) return;
    showDialog('Rocky', 'Leichelle', `Looks like you get rid of your ${card.title} for 1¢. Is that correct?`, (choice) => {
        if (choice === 'yes' || choice === true) {
            state.coins -= 1;
            state.deck.splice(index, 1);
            audio.playSFX('ui');
        }
    }, null, null, ['YES', 'NO']);
}

function handleClimbInput(key) {
    const state = minigameState.climb;
    if (!state || state.activeModal !== 'select_shape' || state.targetShapes.length === 0) return;

    if (key === 'ArrowRight' || key === 'ArrowDown') {
        state.highlightedTargetIndex = (state.highlightedTargetIndex + 1) % state.targetShapes.length;
        audio.playSFX('ui');
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        state.highlightedTargetIndex = (state.highlightedTargetIndex - 1 + state.targetShapes.length) % state.targetShapes.length;
        audio.playSFX('ui');
    } else if (key === 'Enter') {
        executeClimbMove(state.targetShapes[state.highlightedTargetIndex]);
    }
}
