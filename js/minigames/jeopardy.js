// ============================================================
// Canadian Jeopardy Minigame
// ============================================================

const JEOPARDY_BLUE = '#060CE9';
const JEOPARDY_DARK_BLUE = '#020880';
const JEOPARDY_CELL_BLUE = '#0A0FCC';
const JEOPARDY_GOLD = '#FFD700';
const JEOPARDY_LIGHT_BLUE = '#4060FF';

let jeopardyCluesData = null; // Loaded from data/jeopardy/clues.json

// Load clues — uses the pre-loaded global (from clues_data.js script tag) so
// the game works when opened directly via file:// without a local server.
// Falls back to fetch() when served over http/https.
function loadJeopardyClues(callback) {
    if (jeopardyCluesData) { callback(jeopardyCluesData); return; }
    // Prefer the synchronously-loaded global set by data/jeopardy/clues_data.js
    if (typeof JEOPARDY_CLUES_DATA !== 'undefined') {
        jeopardyCluesData = JEOPARDY_CLUES_DATA;
        callback(jeopardyCluesData);
        return;
    }
    // Fallback: fetch (works when served over http/https)
    fetch('data/jeopardy/clues.json')
        .then(r => r.json())
        .then(data => { jeopardyCluesData = data; callback(data); })
        .catch(err => { console.error('Failed to load jeopardy clues:', err); callback(null); });
}

function initJeopardyGame() {
    loadJeopardyClues(data => {
        if (!data) { endMinigame(); return; }

        // Pick 6 random categories in a random order
        const chosen = shuffleArray(data.categories).slice(0, 6);

        // Build board: for each category, for each dollar amount, pick one variant
        const DOLLAR_AMOUNTS = [200, 400, 600, 800, 1000];
        const board = chosen.map(cat => ({
            id: cat.id,
            name: cat.name,
            clues: DOLLAR_AMOUNTS.map(val => {
                const slot = cat.clues.find(c => c.value === val);
                if (!slot) return null;
                const variant = slot.variants[Math.floor(Math.random() * slot.variants.length)];
                return {
                    value: val,
                    clue: variant.clue,
                    correct: variant.correct,
                    options: shuffleArray([variant.correct, ...variant.wrong]),
                    revealed: false
                };
            })
        }));

        minigameState.jeopardy = {
            phase: 'category_reveal',   // 'category_reveal' | 'board' | 'pick_amount' | 'show_clue' | 'show_options' | 'feedback'
            board,
            revealIndex: 0,             // for category_reveal phase
            selectedCol: 0,             // for board phase
            selectedRow: 0,             // for pick_amount phase
            selectedOption: 0,          // for show_options phase
            activeCol: -1,
            activeRow: -1,
            currentClue: null,
            totalCorrectMoney: 0,
            lastWrongClue: '',
            feedbackMsg: '',
            feedbackCallback: null
        };

        // Start category reveal with intro dialog
        audio.play('JEOPARDY_INTRO_BGM');
        showDialog('Not Alex Trebek', 'Lindsey',
            'Our categories are...',
            () => { _jeopardyNextCategoryReveal(); }
        );
    });
}

function _jeopardyNextCategoryReveal() {
    const j = minigameState.jeopardy;
    if (j.revealIndex >= j.board.length) {
        // All categories revealed — go to board
        j.phase = 'board';
        j.selectedCol = 0;
        audio.play('JEOPARDY_BGM');
        return;
    }
    const cat = j.board[j.revealIndex];
    j.revealIndex++;
    showDialog('Not Alex Trebek', 'Lindsey', cat.name, () => {
        _jeopardyNextCategoryReveal();
    });
}

// ---- Drawing ----------------------------------------------------------------

function drawJeopardyGame() {
    const j = minigameState.jeopardy;
    if (!j) return;

    if (j.phase === 'category_reveal') {
        _drawCategoryReveal();
    } else if (j.phase === 'board' || j.phase === 'feedback') {
        _drawBoard();
    } else if (j.phase === 'show_clue') {
        _drawClueScreen();
    } else if (j.phase === 'show_options') {
        _drawOptionsScreen();
    }
}

function _drawCategoryReveal() {
    const j = minigameState.jeopardy;
    ctx.fillStyle = JEOPARDY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!j || j.revealIndex === 0) {
        // Intro screen — shown while "Our categories are..." dialog plays
        ctx.fillStyle = JEOPARDY_GOLD;
        ctx.font = '28px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('CANADIAN JEOPARDY!', canvas.width / 2, canvas.height / 2 - 20);
    } else {
        // Show the category currently being read aloud
        const cat = j.board[j.revealIndex - 1];
        ctx.fillStyle = '#AAAAFF';
        ctx.font = '11px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Category ' + j.revealIndex + ' of ' + j.board.length, canvas.width / 2, canvas.height / 2 - 80);
        ctx.fillStyle = JEOPARDY_GOLD;
        ctx.font = '22px "Press Start 2P"';
        _drawWrappedTextCentered(cat.name, 60, canvas.height / 2 - 50, canvas.width - 120, 36, 160);
    }
}

function _drawBoard() {
    const j = minigameState.jeopardy;
    const COLS = 6;
    const ROWS = 5; // dollar amounts
    const headerH = 48;
    const cellH = 52;
    const cellW = Math.floor(canvas.width / COLS);
    const boardTop = 50;
    // Board bottom = boardTop + headerH + ROWS*cellH = 50+48+260 = 358
    // HUD circles sit at y≈25 (height ≈35px) — headers now start at 50, safely below.
    // Dialog "Press Enter" renders at canvas.height-200-20 = 380 — safely clear.

    // Background
    ctx.fillStyle = JEOPARDY_DARK_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Money display — top-right strip above the board
    ctx.textAlign = 'right';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillStyle = '#AAAAFF';
    ctx.fillText('WINNINGS', canvas.width - 8, 10);
    ctx.font = 'bold 13px "Press Start 2P"';
    ctx.fillStyle = JEOPARDY_GOLD;
    ctx.fillText('$' + j.totalCorrectMoney.toLocaleString(), canvas.width - 8, 24);

    // Column headers — always the same color; no highlight (cursor is on cells, not headers)
    for (let col = 0; col < COLS; col++) {
        const x = col * cellW;
        ctx.fillStyle = JEOPARDY_CELL_BLUE;
        ctx.fillRect(x + 2, boardTop + 2, cellW - 4, headerH - 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '9px "Press Start 2P"';  // explicit — prevents dialog font bleed
        ctx.textAlign = 'center';
        _drawWrappedText(j.board[col].name, x + cellW / 2, boardTop + 13, cellW - 10, 11, headerH - 10);
    }

    // Dollar amount cells
    const AMOUNTS = [200, 400, 600, 800, 1000];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * cellW;
            const y = boardTop + headerH + row * cellH;
            const clueObj = j.board[col].clues[row];
            const isRevealed = !clueObj || clueObj.revealed;
            const isSelected = j.selectedCol === col && j.selectedRow === row;

            ctx.fillStyle = isRevealed ? '#050A55' : (isSelected ? JEOPARDY_LIGHT_BLUE : JEOPARDY_CELL_BLUE);
            ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

            if (isSelected && !isRevealed) {
                ctx.strokeStyle = JEOPARDY_GOLD;
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);
            }

            if (!isRevealed) {
                ctx.fillStyle = isSelected ? '#FFFFFF' : JEOPARDY_GOLD;
                ctx.font = 'bold 16px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText('$' + AMOUNTS[row], x + cellW / 2, y + cellH / 2 + 6);
            }
        }
    }

    // Instructions
    ctx.fillStyle = '#AAAAFF';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow keys to select a clue, Enter to choose', canvas.width / 2, boardTop + headerH + ROWS * cellH + 25);
}

function _drawClueScreen() {
    const j = minigameState.jeopardy;
    if (!j.currentClue) return;
    const c = j.currentClue;

    ctx.fillStyle = JEOPARDY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dollar amount banner
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('$' + c.value, canvas.width / 2, 75);

    // Category name
    ctx.fillStyle = JEOPARDY_GOLD;
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(j.board[j.activeCol].name, canvas.width / 2, 105);

    // Clue text — big, centered, white
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Press Start 2P"';
    _drawWrappedTextCentered(c.clue, 60, 150, canvas.width - 120, 26, canvas.height - 200);

    // Prompt
    ctx.fillStyle = '#AAAAFF';
    ctx.font = '11px "Press Start 2P"';
    ctx.fillText('Press Enter to see the choices', canvas.width / 2, canvas.height - 30);
}

function _drawOptionsScreen() {
    const j = minigameState.jeopardy;
    if (!j.currentClue) return;
    const c = j.currentClue;

    ctx.fillStyle = JEOPARDY_BLUE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dollar + category header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('$' + c.value + '  —  ' + j.board[j.activeCol].name, canvas.width / 2, 75);

    // Clue recap (smaller)
    ctx.fillStyle = '#CCCCFF';
    ctx.font = '11px "Press Start 2P"';
    _drawWrappedTextCentered(c.clue, 40, 98, canvas.width - 80, 18, 70);

    // Divider
    ctx.strokeStyle = JEOPARDY_GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, 170); ctx.lineTo(canvas.width - 40, 170); ctx.stroke();

    // Options
    const optionLabels = ['A', 'B', 'C'];
    for (let i = 0; i < c.options.length; i++) {
        const y = 195 + i * 110;
        const isSelected = j.selectedOption === i;
        ctx.fillStyle = isSelected ? JEOPARDY_LIGHT_BLUE : JEOPARDY_CELL_BLUE;
        ctx.fillRect(40, y, canvas.width - 80, 95);
        if (isSelected) {
            ctx.strokeStyle = JEOPARDY_GOLD;
            ctx.lineWidth = 3;
            ctx.strokeRect(40, y, canvas.width - 80, 95);
        }
        // Label
        ctx.fillStyle = JEOPARDY_GOLD;
        ctx.font = 'bold 18px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(optionLabels[i] + '.', 58, y + 95 / 2 + 6);
        // Option text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px "Press Start 2P"';
        
        const optionText = c.options[i];
        const maxWidth = canvas.width - 150;
        const lineHeight = 22;
        const boxH = 95;
        
        const lines = [];
        const words = optionText.split(' ');
        let currentLine = '';
        for (let word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        
        const startTextY = y + boxH / 2 + 5 - ((lines.length - 1) * lineHeight) / 2;
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            ctx.fillText(lines[lineIndex], 90, startTextY + lineIndex * lineHeight);
        }
    }

    ctx.fillStyle = '#AAAAFF';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('↑ ↓ to choose, Enter to answer', canvas.width / 2, canvas.height - 12);
}

// ---- Input ------------------------------------------------------------------

function handleJeopardyInput(key) {
    const j = minigameState.jeopardy;
    if (!j) return;

    if (j.phase === 'board') {
        const COLS = j.board.length;
        const ROWS = 5;

        const _nextUnrevealedInRow = (col, row, dCol) => {
            // Scan left or right for a column that has an unrevealed clue at this row
            let c = (col + dCol + COLS) % COLS;
            let steps = 0;
            while (steps < COLS) {
                if (j.board[c].clues[row] && !j.board[c].clues[row].revealed) return c;
                c = (c + dCol + COLS) % COLS;
                steps++;
            }
            return -1; // all revealed in this row
        };

        const _nextUnrevealedInCol = (col, row, dRow) => {
            let r = row + dRow;
            while (r >= 0 && r < ROWS) {
                if (j.board[col].clues[r] && !j.board[col].clues[r].revealed) return r;
                r += dRow;
            }
            return -1;
        };

        if (key === 'ArrowLeft') {
            const nc = _nextUnrevealedInRow(j.selectedCol, j.selectedRow, -1);
            if (nc !== -1) { j.selectedCol = nc; audio.playSFX('ui'); }
        } else if (key === 'ArrowRight') {
            const nc = _nextUnrevealedInRow(j.selectedCol, j.selectedRow, 1);
            if (nc !== -1) { j.selectedCol = nc; audio.playSFX('ui'); }
        } else if (key === 'ArrowUp') {
            const nr = _nextUnrevealedInCol(j.selectedCol, j.selectedRow, -1);
            if (nr !== -1) { j.selectedRow = nr; audio.playSFX('ui'); }
        } else if (key === 'ArrowDown') {
            const nr = _nextUnrevealedInCol(j.selectedCol, j.selectedRow, 1);
            if (nr !== -1) { j.selectedRow = nr; audio.playSFX('ui'); }
        } else if (key === 'Enter') {
            const clue = j.board[j.selectedCol].clues[j.selectedRow];
            if (!clue || clue.revealed) return;
            j.activeCol = j.selectedCol;
            j.activeRow = j.selectedRow;
            j.currentClue = clue;
            j.selectedOption = 0;
            j.phase = 'show_clue';
        }
    } else if (j.phase === 'show_clue') {
        if (key === 'Enter') {
            j.phase = 'show_options';
        }
    } else if (j.phase === 'show_options') {
        if (key === 'ArrowUp') {
            j.selectedOption = (j.selectedOption - 1 + 3) % 3;
            audio.playSFX('ui');
        } else if (key === 'ArrowDown') {
            j.selectedOption = (j.selectedOption + 1) % 3;
            audio.playSFX('ui');
        } else if (key === 'Enter') {
            _jeopardySubmitAnswer();
        }
    }
}

function _jeopardySubmitAnswer() {
    const j = minigameState.jeopardy;
    const clue = j.currentClue;
    const chosen = clue.options[j.selectedOption];
    const isCorrect = chosen === clue.correct;

    // Mark revealed
    j.board[j.activeCol].clues[j.activeRow].revealed = true;
    j.phase = 'feedback';

    if (isCorrect) {
        j.totalCorrectMoney += clue.value;
        const newSuccesses = Math.floor(j.totalCorrectMoney / 1000);
        const prevSuccesses = minigameState.successes;
        minigameState.successes = newSuccesses;

        const correctLines = [
            'Correct!',
            `You got that right, for $${clue.value}!`,
            'Absolutely right. You have control of the board.'
        ];
        const msg = correctLines[Math.floor(Math.random() * correctLines.length)];
        audio.playSFX('SUCCESS');

        showDialog('Not Alex Trebek', 'Lindsey', msg, () => {
            if (minigameState.successes >= 4) {
                // Win!
                showDialog('Not Alex Trebek', 'Lindsey',
                    "Congratulations! You really know your stuff!",
                    () => {
                        minigameState.won = true;
                        audio.playSFX('TADA');
                        endMinigame();
                    }
                );
            } else {
                j.phase = _jeopardyCheckBoardDone() ? 'board' : 'board';
                _jeopardyReturnToBoard();
            }
        });
    } else {
        j.lastWrongClue = clue.correct;
        minigameState.failures++;
        audio.playSFX('FAILURE');

        const wrongLines = [
            `I'm sorry.  The correct response is, "${clue.correct}".`,
            `Not quite.  The correct response is, "${clue.correct}".`
        ];
        const msg = wrongLines[Math.floor(Math.random() * wrongLines.length)];

        showDialog('Not Alex Trebek', 'Lindsey', msg, () => {
            if (minigameState.failures >= 3) {
                showDialog('Not Alex Trebek', 'Lindsey',
                    `I'm so sorry, you have lost.  You will receive our second-place consolation prize of just $3,000, and a lifetime spent thinking back on "${j.lastWrongClue}".`,
                    () => {
                        minigameState.won = false;
                        audio.playSFX('SAD_TROMBONE');
                        endMinigame();
                    }
                );
            } else {
                _jeopardyReturnToBoard();
            }
        });
    }
}

function _jeopardyReturnToBoard() {
    const j = minigameState.jeopardy;
    // Check if board is exhausted
    if (_jeopardyCheckBoardDone()) {
        // Board cleared without hitting 4 successes or 3 failures — end by current state
        if (minigameState.successes >= 4) {
            minigameState.won = true;
        } else {
            minigameState.won = (minigameState.failures < 3);
        }
        endMinigame();
        return;
    }
    j.phase = 'board';
    // Auto-advance selected column to one that still has clues
    if (j.board[j.selectedCol].clues.every(c => !c || c.revealed)) {
        for (let i = 0; i < j.board.length; i++) {
            if (j.board[i].clues.some(c => c && !c.revealed)) {
                j.selectedCol = i;
                break;
            }
        }
    }
}

function _jeopardyCheckBoardDone() {
    const j = minigameState.jeopardy;
    return j.board.every(col => col.clues.every(c => !c || c.revealed));
}

// ---- Text Helpers -----------------------------------------------------------

function _drawWrappedText(text, x, y, maxWidth, lineHeight, maxHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let word of words) {
        const testLine = line ? line + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
            if (currentY + lineHeight - y > maxHeight) break;
            ctx.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line && (currentY - y) <= maxHeight) ctx.fillText(line, x, currentY);
}

function _drawWrappedTextCentered(text, x, y, maxWidth, lineHeight, maxHeight) {
    ctx.textAlign = 'center';
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const cx = x + maxWidth / 2;
    for (let word of words) {
        const testLine = line ? line + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
            if (currentY + lineHeight - y > maxHeight) break;
            ctx.fillText(line, cx, currentY);
            line = word;
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line && (currentY - y) <= maxHeight) ctx.fillText(line, cx, currentY);
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
