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
        grid: [], visualGrid: [], selected: null, swapTarget: null, swapTime: 0, progress: 0, eatMode: false, matches: [],
        fadingMatches: [], chainLevel: 0,
        // Bump specific
        car: { x: 400, y: 300, speed: 0, angle: 0, targetAngle: 0 },
        coin: { x: 0, y: 0 },
        otherCars: [],
        // Fish specific
        boat: { x: 400, y: 300, gridX: 5, gridY: 5, angle: 0 },
        fishCenters: [],
        fishWindow: null
    };

    if (gameType === 'chicken') {
        audio.play('CHICKEN_BGM');
        showDialog('Farmer Lucky', 'Jason', "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            for (let i = 0; i < 5; i++) minigameState.parallax.trees.push({ x: i * 400, y: 400, speed: 2, scale: 0.8 + Math.random() * 0.4, flipped: Math.random() < 0.5 });
            for (let i = 0; i < 100; i++) {
                const startX = i < 2 ? 400 + i * 300 : 1000 + i * 300 + Math.random() * 200;
                minigameState.entities.push({ type: 'chicken', x: startX, y: 480, speed: 1 + Math.random() * 1, frame: Math.random() * 16 });
                if (i > 0 && i % 8 < 3) minigameState.entities.push({ type: 'skull', x: startX + 150 + Math.random() * 100, y: 480 });
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
    } else if (gameType === 'golf') {
        audio.play('GOLF_BGM');
        showDialog('Bob Golf', 'Gilbert', "Welcome to the most INTENSE mini-golf course in ALL OF CANADA. Every hole is a par 3. If you make the hole in three strokes, that's a success! But if you don't, that's a FAILURE. Get three failures, and you're KNOCKED OUT. Can't take the golf heat? Then GET OUT of the GOLF KITCHEN!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            initGolfGame();
        });
    } else if (gameType === 'cheese') {
        audio.play('CHEESE_BGM');
        showDialog('Mme. Tremblay', 'Claire', "Welcome to the fromagerie! Alas, we have a bit of a crisis. As you know, tomorrow is Cheese Day... and we have to prep all our at-least-three-cheese gift baskets today! Can you help? Just go to the cheese chutes and exchange pairs of cheeses to produce rows and columns of three identical cheeses. If you get stuck, press the red button and you can eat one cheese — but I wouldn't recommend doing that more than twice!", () => {
            currentPhase = PHASES.MINIGAME_PLAY; initCheeseGrid();
        });
    } else if (gameType === 'bump') {
        audio.play('BUMP_BGM');
        showDialog('Charlene', 'Krystal', "Welcome to Bump World, where bumper cars are our whole world. You'll have the green car. Get out there and try to catch the coin four times! But watch out. The red car is gunning for it, too, and all the other cars will get in the way.", () => {
            currentPhase = PHASES.MINIGAME_PLAY; initBumpGame();
        });
    } else if (gameType === 'fish') {
        audio.play('FISH_BGM');
        showDialog('Blair the Stylish Pirate', 'Patrice', "Yarr, welcome to me lake, matey. I'm old friends with your parents, so I'll let you borrow the ol' sloop and catch FOUR FISH. But don't ye be bringing up the hook empty! Do that too many times and ye'll have to WALK THE PLANK. Red squares have more fish, but they're harder to catch. Blue squares are easier, but you're as like to get a boot or a can as a fine flounder. Get out there and try yer best!", () => {
            currentPhase = PHASES.MINIGAME_PLAY; initFishGame();
        });
    } else if (gameType === 'jeopardy') {
        audio.play('JEOPARDY_INTRO_BGM');
        showDialog('Not Alex Trebek', 'Lindsey', "Good evening and welcome to Canadian Jeopardy!", () => {
            showDialog('Not Alex Trebek', 'Lindsey', "Your knowledge of Canadian culture, history, and trivia will be tested by me, Lindsey, a Legitimate Canadian\u2122.", () => {
                showDialog('Not Alex Trebek', 'Lindsey', "For every thousand dollars you rack up, you get a success! Four successes, and you win!", () => {
                    showDialog('Not Alex Trebek', 'Lindsey', "For each clue you get wrong, that's a failure.  Three failures, and you lose.", () => {
                        showDialog('Not Alex Trebek', 'Lindsey', "Let's play Canadian Jeopardy!", () => {
                            currentPhase = PHASES.MINIGAME_PLAY;
                            initJeopardyGame();
                        });
                    });
                });
            });
        });
    } else if (gameType === 'goose') {
        audio.play('CHICKEN_BGM'); // park ambience stand-in
        minigameState.gooseIntroShown = false;
        showDialog('Ranger Willis', 'Sam', "Welcome to Algonquin Provincial Park!", () => {
            showDialog('Ranger Willis', 'Sam', "Good to have a tourist willing to... brave the... er, current circumstances.", () => {
                showDialog('Ranger Willis', 'Sam', "There's a really scenic walk this way... The way forward is marked with green circles.", () => {
                    showDialog('Ranger Willis', 'Sam', "The weensy little problem is that there are... geese. So many Canada Geese.", () => {
                        showDialog('Ranger Willis', 'Sam', "The good news is, left to their own devices, they'll just march straight forward. And they just go that way 'til they hit an obstacle.", () => {
                            showDialog('Ranger Willis', 'Sam', "Motivated only by boundless range. And they'll just keep doin' that 'til they spot you.", () => {
                                showDialog('Ranger Willis', 'Sam', "Good news is, they only move when you move.", () => {
                                    showDialog('Ranger Willis', 'Sam', "Bad news is, they know no fear, and if they get you three times, we'll have to airlift you out to the hospital. Guess that's two bad things.", () => {
                                        showDialog('Ranger Willis', 'Sam', "Anyway, good luck!", () => {
                                            currentPhase = PHASES.MINIGAME_PLAY;
                                            minigameState.gooseIntroShown = true;
                                            initGooseGame();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

function success(points = 100) {
    minigameState.successes++; score += points; audio.playSFX('SUCCESS');
    if (minigameState.successes >= 4) { 
        minigameState.won = true; 
        score += 1000; 
        audio.playSFX('TADA'); 
        if (minigameState.type === 'cheese') {
            minigameState.shouldWinEnd = true;
        } else {
            endMinigame();
        }
    }
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
    else if (minigameState.type === 'golf') {
        actor = 'Gilbert'; char = 'Bob Golf';
        if (minigameState.won) {
            msg = "Whoa! Four successes! You stared into the abyss of golf and did. not. blink. Great job!";
        } else {
            msg = "*sigh* Not everybody is cut out to handle the high-stakes world of miniature golf.";
        }
    }
    else if (minigameState.type === 'cheese') { actor = 'Claire'; char = 'Mme. Tremblay'; msg = minigameState.won ? "Hooray! The at-least-three-cheese gift baskets are saved! It's a Cheese Day miracle!" : "Alas, you have succumbed to the Temptation of the Cheese. Do not weep, weary traveler. It has claimed prouder souls than yours."; }
    else if (minigameState.type === 'bump') { actor = 'Krystal'; char = 'Charlene'; msg = minigameState.won ? "Congratulations. Here are four Bump Tickets, redeemable for a small plush toy." : "Eh, you failed. Honestly? No big."; }
    else if (minigameState.type === 'fish') { 
        actor = 'Patrice'; char = 'Blair the Stylish Pirate'; 
        if (minigameState.won) {
            msg = `I knew ye had it in ye! Three cheers for ${CAST[selectedIndex].firstName}!`;
        } else {
            msg = `Bah! Only ${minigameState.successes} fish?! A PIRATE'S CURSE UPON YE!`;
        }
    }
    else if (minigameState.type === 'jeopardy') {
        // End-game dialog is shown inside jeopardy.js before endMinigame() is called.
        return; // Skip the showDialog below; phase is already MINIGAME_POST.
    }
    else if (minigameState.type === 'goose') {
        actor = 'Sam'; char = 'Ranger Willis';
        if (minigameState.won) {
            showDialog(char, actor, "You made it!", () => {
                showDialog(char, actor, "The prophecies are true \u2014 you are the promised Goose Whisperer.", () => {
                    showDialog(char, actor, "Anyhoozit, have a nice day!", null);
                });
            });
            return;
        } else {
            // Spec: title card "Later, in the hospital." then dialog
            showDialog('', '', 'Later, in the hospital.', () => {
                showDialog(char, actor, "Hey, you're conscious again!", () => {
                    showDialog(char, actor, "Glad to see you powered through your massive injuries.", () => {
                        showDialog(char, actor, "Glad you could visit us at Algonquin Provincial Park!", null);
                    });
                });
            });
            return;
        }
    }
    showDialog(char, actor, msg, null);
}



function drawMinigameMap() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(`Stop #${currentMinigameIndex + 1}`, canvas.width / 2, 80);
    const gameType = minigameOrder[currentMinigameIndex];
    const titles = { 
        chicken: 'CATCH THAT CHICKEN', 
        math: 'MATHEMAGIC!', 
        karaoke: 'KARAOKE NIGHT', 
        cheese: 'FROMAGERIE FRENZY! (FORMERLY SUPERMARKET SWEEP)', 
        bump: 'BUMPERTOWN! (POPULATION BUMP)', 
        fish: 'LAKE FISH-A-LOT (AKA OBLIGATORY FISHING MINIGAME)', 
        golf: "BOB'S INTENSE MINI-GOLF", 
        jeopardy: 'CANADIAN JEOPARDY!', 
        goose: 'UNPLEASANT GOOSE GAME' 
    };
    const titleText = titles[gameType];
    const parenIdx = titleText.indexOf('(');
    if (parenIdx !== -1) {
        const mainTitle = titleText.substring(0, parenIdx).trim();
        const subTitle = titleText.substring(parenIdx).trim();
        ctx.font = '24px "Press Start 2P"';
        ctx.fillText(mainTitle, canvas.width / 2, 130);
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText(subTitle, canvas.width / 2, 160);
    } else {
        ctx.font = '24px "Press Start 2P"';
        ctx.fillText(titleText, canvas.width / 2, 140);
    }
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
    else if (gameType === 'golf') drawGolfGame(); 
    else if (gameType === 'cheese') drawCheeseGame();
    else if (gameType === 'bump') drawBumpGame();
    else if (gameType === 'fish') drawFishGame();
    else if (gameType === 'jeopardy') drawJeopardyGame();
    else if (gameType === 'goose') drawGooseGame();
    
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
    
    // Only show "Press Enter to Continue" when closing dialog is complete
    if (!currentDialog) {
        ctx.font = '16px "Press Start 2P"'; 
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 100);
    }
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
    } else if (state.type === 'golf') {
        handleGolfInput(key);
    } else if (state.type === 'fish') {
        handleFishInput(key);
    } else if (state.type === 'jeopardy') {
        handleJeopardyInput(key);
    } else if (state.type === 'goose') {
        handleGooseInput(key);
    }
}
