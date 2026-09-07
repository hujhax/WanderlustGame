function drawMathGame() {
    const boardX = isMobileMode ? 30 : 50;
    const boardY = isMobileMode ? 70 : 100;
    const boardW = isMobileMode ? 540 : 700;
    const boardH = isMobileMode ? 340 : 400;

    ctx.fillStyle = '#004400'; ctx.fillRect(boardX, boardY, boardW, boardH); 
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 10; ctx.strokeRect(boardX, boardY, boardW, boardH);
    
    const peterSprite = idleSprites['peter'];
    if (peterSprite && peterSprite.complete) {
        const px = isMobileMode ? 40 : 100;
        const py = isMobileMode ? boardY + boardH - 120 : 350;
        drawPixelatedImage(peterSprite, 0, 3 * 64, 64, 64, px, py, 100, 100);
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = isMobileMode ? '22px "Press Start 2P"' : '30px "Press Start 2P"'; ctx.textAlign = 'center'; 
    ctx.fillText(minigameState.question, canvas.width / 2, boardY + 120);
    ctx.fillText(minigameState.answer + "_", canvas.width / 2, boardY + 200);
    
    const elapsed = Date.now() - minigameState.lastTimerUpdate;
    if (elapsed > 1000) { 
        minigameState.timer--; minigameState.lastTimerUpdate = Date.now(); 
        if (minigameState.timer <= 0) { failure(); generateMathQuestion(); } 
    }
    
    ctx.font = '16px "Press Start 2P"'; ctx.fillText(`Time: ${minigameState.timer}`, canvas.width / 2, boardY + 270);
    
    if (isMobileMode) {
        drawMathKeypad();
    } else {
        ctx.font = '10px "Press Start 2P"'; ctx.fillText('Type in your answer and press enter.', 400, 520);
    }
}

function drawMathKeypad() {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['DEL', '0', 'ENTER']
    ];
    const keyW = 150, keyH = 65, gap = 15;
    const startX = (canvas.width - (3 * keyW + 2 * gap)) / 2;
    const startY = 440;

    keys.forEach((row, r) => {
        row.forEach((key, c) => {
            const kx = startX + c * (keyW + gap);
            const ky = startY + r * (keyH + gap);
            const isEnter = key === 'ENTER';
            const isDel = key === 'DEL';

            drawTouchButton(kx, ky, keyW, keyH, key, {
                bgColor: isEnter ? '#007700' : (isDel ? '#770000' : '#222222'),
                borderColor: '#FFFFFF',
                textColor: '#FFFFFF',
                font: isEnter || isDel ? '12px "Press Start 2P"' : '18px "Press Start 2P"'
            });
        });
    });
}

function handleMathTouch(x, y) {
    if (!isMobileMode) return;
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['DEL', '0', 'ENTER']
    ];
    const keyW = 150, keyH = 65, gap = 15;
    const startX = (canvas.width - (3 * keyW + 2 * gap)) / 2;
    const startY = 440;

    keys.forEach((row, r) => {
        row.forEach((key, c) => {
            const kx = startX + c * (keyW + gap);
            const ky = startY + r * (keyH + gap);
            if (x >= kx && x <= kx + keyW && y >= ky && y <= ky + keyH) {
                audio.playSFX('ui');
                if (key === 'ENTER') {
                    if (parseInt(minigameState.answer) === minigameState.correctAnswer) {
                        success(); minigameState.difficulty++;
                    } else {
                        failure(); minigameState.difficulty = Math.max(1, minigameState.difficulty - 1);
                    }
                    generateMathQuestion();
                } else if (key === 'DEL') {
                    minigameState.answer = minigameState.answer.slice(0, -1);
                } else {
                    minigameState.answer += key;
                }
            }
        });
    });
}

function generateMathQuestion() {
    const diff = minigameState.difficulty || 1, ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * (diff > 2 ? 3 : 2))];
    let a, b, c;
    const useThree = diff > 1 && Math.random() < 0.4;
    
    if (useThree) {
        const op2 = Math.random() < 0.5 ? '+' : '-';
        a = Math.floor(Math.random() * 8 * diff) + 2;
        b = Math.floor(Math.random() * 8 * diff) + 2;
        c = Math.floor(Math.random() * 5 * diff) + 1;
        
        let result;
        if (op2 === '+') result = a + b + c;
        else result = a + b - c;
        
        minigameState.question = `${a} + ${b} ${op2} ${c} = ?`;
        minigameState.correctAnswer = result;
    } else {
        if (op === '+') { 
            a = Math.floor(Math.random() * 15 * diff) + 5; 
            b = Math.floor(Math.random() * 15 * diff) + 5; 
        } else if (op === '-') { 
            a = Math.floor(Math.random() * 20 * diff) + 5; 
            b = Math.floor(Math.random() * a); 
        } else { 
            a = Math.floor(Math.random() * 8 * diff) + 2; 
            b = Math.floor(Math.random() * 6 * diff) + 2; 
        }
        minigameState.question = `${a} ${op} ${b} = ?`;
        minigameState.correctAnswer = eval(`${a} ${op} ${b}`);
    }
    minigameState.answer = ""; minigameState.timer = 10; minigameState.lastTimerUpdate = Date.now();
}
