function startMinigame() {
    captureScreen();
    const gameType = minigameOrder[currentMinigameIndex];
    if (selectedIndex === undefined || selectedIndex === null) selectedIndex = 5;
    minigameState = {
        type: gameType, successes: 0, failures: 0, startTime: Date.now(), entities: [],
        parallax: { bgX: 0, roadX: 0, trees: [] },
        gameOver: false, won: false, playerY: 480, isJumping: false, jumpVel: 0, frame: 0,
        distance: 0, question: "", answer: "", timer: 10, lastTimerUpdate: Date.now(), difficulty: 1,
        // Cheese specific
        grid: [], selected: null, swapTarget: null, swapTime: 0, progress: 0, eatMode: false, matches: []
    };

    if (gameType === 'chicken') {
        audio.play('CHICKEN_BGM');
        showDialog('Farmer Lucky', 'Jason', "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            for (let i = 0; i < 5; i++) minigameState.parallax.trees.push({ x: i * 400, y: 400, speed: 2, scale: 0.8 + Math.random() * 0.4, flipped: Math.random() < 0.5 });
            for (let i = 0; i < 100; i++) {
                const startX = i < 2 ? 400 + i * 300 : 1000 + i * 300 + Math.random() * 200;
                minigameState.entities.push({ type: 'chicken', x: startX, y: 480, speed: 1 + Math.random() * 1, frame: Math.random() * 16 });
                if (i > 0 && i % 4 === 0) minigameState.entities.push({ type: 'skull', x: startX + 150 + Math.random() * 100, y: 480 });
            }
        });
    } else if (gameType === 'math') {
        audio.play('MATH_BGM');
        showDialog('Mr. Bergemot', 'Peter', "Well if it isn't our favorite former mathlete! Welcome back to your old school — wanna see if you've still got what it takes?", () => {
            currentPhase = PHASES.MINIGAME_PLAY; generateMathQuestion();
        });
    } else if (gameType === 'karaoke') {
        audio.play('KARAOKE_BGM');
        showDialog('Lord Karaoke', 'Velvet', "It's Karaoke Night at Tappers! Sure, you can come up and sing, just make sure you hit all the notes on-key! Use the up and down buttons to adjust your pitch!", () => {
            currentPhase = PHASES.MINIGAME_PLAY; minigameState.diamondPos = 4; minigameState.notes = [];
            for (let i = 0; i < 50; i++) minigameState.notes.push({ x: 800 + i * 200, pitch: Math.floor(Math.random() * 9), color: 'red', hit: false });
        });
    } else if (gameType === 'cheese') {
        audio.play('CHEESE_BGM');
        showDialog('Mme. Tremblay', 'Claire', "Welcome to the fromagerie! Alas, we have a bit of a crisis. As you know, tomorrow is Cheese Day... and we have to prep all our at-least-three-cheese gift baskets today! Can you help? Just go to the cheese chutes and exchange pairs of cheeses to produce rows and columns of three identical cheeses. If you get stuck, press the red button and you can eat one cheese — but I wouldn't recommend doing that more than twice!", () => {
            currentPhase = PHASES.MINIGAME_PLAY; initCheeseGrid();
        });
    }
}

function success() {
    minigameState.successes++; score += 100; audio.playSFX('SUCCESS');
    if (minigameState.successes >= 4) { minigameState.won = true; score += 1000; audio.playSFX('TADA'); endMinigame(); }
}

function failure() {
    minigameState.failures++; audio.playSFX('FAILURE');
    if (minigameState.failures >= 3) { minigameState.won = false; audio.playSFX('SAD_TROMBONE'); endMinigame(); }
}

function endMinigame() {
    audio.stop(); currentPhase = PHASES.MINIGAME_POST;
    let msg = "", actor = "", char = "";
    if (minigameState.type === 'chicken') { actor = 'Jason'; char = 'Farmer Lucky'; msg = minigameState.won ? "Thanks for catching my chickens!" : "You have failed this farm. Never return here again."; }
    else if (minigameState.type === 'math') { actor = 'Peter'; char = 'Mr. Bergemot'; msg = minigameState.won ? "Wow! You're still a top-tier mathlete!" : "That's too bad. *sigh* Really I blame myself."; }
    else if (minigameState.type === 'karaoke') { actor = 'Velvet'; char = 'Lord Karaoke'; msg = minigameState.won ? "Killer performance! Your next round of drinks is on me!" : "You have failed karaoke night. Leave here, and take your dishonor with you."; }
    else if (minigameState.type === 'cheese') { actor = 'Claire'; char = 'Mme. Tremblay'; msg = minigameState.won ? "Hooray! The at-least-three-cheese gift baskets are saved! It's a Cheese Day miracle!" : "Alas, you have succumbed to the Temptation of the Cheese. Do not weep, weary traveler. It has claimed prouder souls than yours."; }
    showDialog(char, actor, msg, null);
}

function drawMinigameMap() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(`Stop #${currentMinigameIndex + 1}`, canvas.width / 2, 80);
    const gameType = minigameOrder[currentMinigameIndex];
    ctx.font = '30px "Press Start 2P"';
    const titles = { chicken: 'CATCH THAT CHICKEN', math: 'MATHEMAGIC!', karaoke: 'KARAOKE NIGHT', cheese: 'FROMAGERIE FRENZY!' };
    ctx.fillText(titles[gameType], canvas.width / 2, 140);
    if (canadaMapImg.complete && canadaMapImg.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false; const imgWidth = 500; const imgHeight = 300;
        const ix = (canvas.width - imgWidth) / 2; const iy = 200; ctx.drawImage(canadaMapImg, ix, iy, imgWidth, imgHeight);
        const ox = ix + imgWidth * 0.85; const oy = iy + imgHeight * 0.75;
        const vx = ix + imgWidth * 0.15; const vy = iy + imgHeight * 0.45;
        ctx.save(); ctx.strokeStyle = COLORS.SUNSET_ORANGE; ctx.lineWidth = 4; ctx.shadowColor = COLORS.ORANGE_GLOW; ctx.shadowBlur = 10;
        ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.bezierCurveTo(ix + imgWidth * 0.6, iy + imgHeight * 0.3, ix + imgWidth * 0.4, iy + imgHeight * 0.3, vx, vy); ctx.stroke(); ctx.restore();
        const xPos = [0.25, 0.5, 0.75][currentMinigameIndex];
        const tx = ox + (vx - ox) * xPos; const ty = oy + (vy - oy) * xPos - Math.sin(xPos * Math.PI) * 40;
        ctx.fillStyle = COLORS.RED; ctx.font = '30px "Press Start 2P"'; ctx.fillText('X', tx, ty);
    } else { ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; ctx.strokeRect(150, 200, 500, 300); }
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, 550);
}

function drawMinigamePlay() {
    const gameType = minigameOrder[currentMinigameIndex];
    if (gameType === 'chicken') drawChickenGame(); 
    else if (gameType === 'math') drawMathGame(); 
    else if (gameType === 'karaoke') drawKaraokeGame(); 
    else if (gameType === 'cheese') drawCheeseGame();
    
    // UI elements common to all minigames (drawn last to be on top)
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.WHITE; ctx.font = '12px "Press Start 2P"'; ctx.fillText(`Score: ${score}`, 20, 30);
    for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(200 + i * 30, 25, 10, 0, Math.PI * 2);
        if (i < minigameState.successes) { ctx.fillStyle = COLORS.GREEN; ctx.fill(); } else { ctx.strokeStyle = COLORS.GREEN; ctx.lineWidth = 2; ctx.stroke(); }
    }
    for (let i = 0; i < 3; i++) {
        const fx = 350 + i * 30;
        if (i < minigameState.failures) { ctx.fillStyle = COLORS.RED; ctx.fillRect(fx - 10, 15, 20, 20); } else { ctx.strokeStyle = COLORS.RED; ctx.lineWidth = 2; ctx.strokeRect(fx - 10, 15, 20, 20); }
    }
}

function drawMinigamePost() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '32px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(minigameState.won ? "Great job!" : "Too bad!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 100);
}

function handleMinigameInput(key) {
    const state = minigameState;
    if (state.type === 'chicken') { if (key === 'Enter' && !state.isJumping) { state.isJumping = true; state.jumpVel = -15; } }
    else if (state.type === 'math') {
        if (key === 'Enter') { if (parseInt(state.answer) === state.correctAnswer) { success(); state.difficulty++; } else { failure(); state.difficulty = Math.max(1, state.difficulty - 1); } generateMathQuestion(); }
        else if (key === 'Backspace') state.answer = state.answer.slice(0, -1);
        else if (/^[0-9]$/.test(key)) state.answer += key;
    } else if (state.type === 'karaoke') {
        if (key === 'ArrowUp') { state.diamondPos = Math.min(8, state.diamondPos + 1); audio.playSFX('ui'); }
        else if (key === 'ArrowDown') { state.diamondPos = Math.max(0, state.diamondPos - 1); audio.playSFX('ui'); }
    }
}
