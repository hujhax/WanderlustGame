function drawMathGame() {
    ctx.fillStyle = '#004400'; ctx.fillRect(50, 100, 700, 400); 
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 10; ctx.strokeRect(50, 100, 700, 400);
    
    const peterSprite = idleSprites['peter'];
    if (peterSprite && peterSprite.complete) drawPixelatedImage(peterSprite, 0, 3 * 64, 64, 64, 100, 350, 128, 128);

    ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center'; 
    ctx.fillText(minigameState.question, 400, 250); ctx.fillText(minigameState.answer + "_", 400, 350);
    
    const elapsed = Date.now() - minigameState.lastTimerUpdate;
    if (elapsed > 1000) { 
        minigameState.timer--; minigameState.lastTimerUpdate = Date.now(); 
        if (minigameState.timer <= 0) { failure(); generateMathQuestion(); } 
    }
    
    ctx.font = '20px "Press Start 2P"'; ctx.fillText(`Time: ${minigameState.timer}`, 400, 450);
    ctx.font = '10px "Press Start 2P"'; ctx.fillText('Type in your answer and press enter.', 400, 520);
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
