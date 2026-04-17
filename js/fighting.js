let fightingState = {};

function startFightingGame(nextPhase, isShadow = false) {
    captureScreen();
    if (selectedIndex === undefined) selectedIndex = 5;
    const playerChar = CAST[selectedIndex].name;
    const partnerName = PARTNER_PAIRS[playerChar];
    const partner = CAST.find(c => c.name === partnerName);
    const partnerActor = partner.actor;
    const partnerFirstName = partner.firstName;
    const playerFirstName = CAST[selectedIndex].firstName;

    const startFight = () => {
        currentPhase = PHASES.CONFRONTATION_PLAY;
        fightingState = {
            player: { actor: CAST[selectedIndex].actor.toLowerCase(), x: 100, y: 400, health: 100, facing: 1, state: 'idle', frame: 0, attacking: 0, attackType: null, isShadow: false },
            ai: { actor: (isShadow ? CAST[selectedIndex].actor : partner.actor).toLowerCase(), x: 600, y: 400, health: 100, facing: -1, state: 'idle', frame: 0, attacking: 0, attackType: null, isShadow: isShadow },
            gameOver: false, won: false, nextPhase: nextPhase
        };
        audio.play('FIGHT_BGM', 30);
    };

    if (isShadow) {
        audio.stop();
        let dialogs = [
            ["?????", playerFirstName, "Hehehehhe. Hee hee hee.", 'silhouette'],
            ["?????", playerFirstName, "Now you are finally on your own.", 'silhouette'],
            ["?????", playerFirstName, "And I will tell you what I really think of you.", 'silhouette'],
            [playerFirstName, CAST[selectedIndex].actor, "Who... who is that?", null],
            ["?????", playerFirstName, "Don't you recognize me?", 'silhouette'],
            ["?????", playerFirstName, "Don't you recognize the wrenching inner conflicts you feel in the dead of night?", 'silhouette'],
            ["?????", playerFirstName, "The nagging doubts that creep around your every act?", 'silhouette'],
            ["?????", playerFirstName, "I have been here the whole time, " + playerFirstName + ". It is I...", 'silhouette'],
            ["SHADOW", playerFirstName, "YOUR SHADOW!!!", 'inverted']
        ];
        let currentD = 0;
        const nextDialog = () => {
            if (currentD < dialogs.length) { const d = dialogs[currentD++]; showDialog(d[0], d[1], d[2], nextDialog, d[3]); }
            else startFight();
        };
        nextDialog();
    } else {
        let dialogs = [
            [partnerFirstName, partnerActor, "I am so frustrated with this trip!", null],
            [playerFirstName, CAST[selectedIndex].actor, "Okay, fine. Here we go...", null]
        ];

        // Prepare randomized response lists
        const pSuccesses = [...CONFRONTATION_RESPONSES.PLAYER_SUCCESS].sort(() => Math.random() - 0.5);
        const pFailures = [...CONFRONTATION_RESPONSES.PLAYER_FAILURE].sort(() => Math.random() - 0.5);
        const cSuccesses = [...CONFRONTATION_RESPONSES.COMPANION_SUCCESS].sort(() => Math.random() - 0.5);
        const cFailures = [...CONFRONTATION_RESPONSES.COMPANION_FAILURE].sort(() => Math.random() - 0.5);
        
        let psIdx = 0, pfIdx = 0, csIdx = 0, cfIdx = 0;

        playedMinigames.forEach(mg => {
            const mgTitle = mg.name === 'chicken' ? 'CATCH THAT CHICKEN' : 
                          mg.name === 'math' ? 'MATHEMAGIC!' : 
                          mg.name === 'karaoke' ? 'KARAOKE NIGHT' : 'FROMAGERIE FRENZY!';

            if (mg.won) {
                // Companion success response
                dialogs.push([partnerFirstName, partnerActor, cSuccesses[csIdx++]
                    .replace('[minigame name]', mgTitle)
                    .replace('[Player\'s First Name]', playerFirstName), null]);
                // Player success response
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, pSuccesses[psIdx++]
                    .replace('[minigame name]', mgTitle)
                    .replace('[Companion\'s First Name]', partnerFirstName), null]);
            } else {
                // Companion failure response
                dialogs.push([partnerFirstName, partnerActor, cFailures[cfIdx++]
                    .replace('[minigame name]', mgTitle)
                    .replace('[Player\'s First Name]', playerFirstName), null]);
                // Player failure response
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, pFailures[pfIdx++]
                    .replace('[minigame name]', mgTitle)
                    .replace('[Companion\'s First Name]', partnerFirstName), null]);
            }
        });

        dialogs.push([partnerFirstName, partnerActor, "Well, maybe we shouldn't be friends any more!", null]);
        dialogs.push([playerFirstName, CAST[selectedIndex].actor, "Maybe we shouldn't!", null]);
        dialogs.push([partnerFirstName, partnerActor, "I grow tired of using words to handle this.", null]);
        dialogs.push([playerFirstName, CAST[selectedIndex].actor, "TO THE BATTLEDOME!", null]);

        let currentD = 0;
        const nextDialog = () => {
            if (currentD < dialogs.length) { const d = dialogs[currentD++]; showDialog(d[0], d[1], d[2], nextDialog, d[3]); }
            else startFight();
        };
        nextDialog();
    }
}

function updateFighting() {
    if (!fightingState.player || fightingState.gameOver) return;

    const p = fightingState.player;
    const ai = fightingState.ai;

    // Player attacks (using keysJustPressed for immediate response)
    if (keysJustPressed.has('a')) performAttack(p, 'punch');
    else if (keysJustPressed.has('s')) performAttack(p, 'kick');

    // Player movement
    let isMoving = false;
    if (keysPressed.has('ArrowLeft')) { 
        p.x -= 5; p.facing = -1; 
        if (p.attacking <= 0) p.state = 'walk_left'; 
        isMoving = true; 
    } else if (keysPressed.has('ArrowRight')) { 
        p.x += 5; p.facing = 1; 
        if (p.attacking <= 0) p.state = 'walk_right'; 
        isMoving = true; 
    }
    if (!isMoving && p.attacking <= 0) p.state = 'idle';

    // AI logic
    const dist = p.x - ai.x;
    ai.facing = dist > 0 ? 1 : -1;
    if (Math.abs(dist) > 70) { 
        ai.x += ai.facing * 2.5; 
        if (ai.attacking <= 0) ai.state = ai.facing > 0 ? 'walk_right' : 'walk_left'; 
    } else {
        if (ai.attacking <= 0) ai.state = 'idle';
        if (Math.random() < 0.03 && ai.attacking <= 0) performAttack(ai, Math.random() < 0.5 ? 'punch' : 'kick');
    }

    // Process attacks for both
    [p, ai].forEach(char => {
        if (char.attacking > 0) {
            char.attacking--;
            if (char.attacking === 15) { // Hit frame
                const other = (char === p) ? ai : p;
                const hitDist = Math.abs((char.x + (char.facing * 60)) - other.x);
                if (hitDist < 60) { 
                    other.health = Math.max(0, other.health - (char.attackType === 'punch' ? 5 : 10)); 
                }
            }
            if (char.attacking === 0) char.state = 'idle';
        }
    });

    // Check game over (with !fightingState.gameOver check to play sound once)
    if (!fightingState.gameOver && (p.health <= 0 || ai.health <= 0)) {
        fightingState.gameOver = true;
        fightingState.won = p.health > 0;
        audio.stop();
        audio.playSFX(fightingState.won ? 'TADA' : 'SAD_TROMBONE');
    }
}

function handleFightingInput(key) {
    // This is now handled in updateFighting for better responsiveness
    return;
}

function performAttack(char, type) {
    if (char.attacking > 0) return;
    char.state = type; char.attacking = 30; char.attackType = type; char.frame = 0;
    audio.playSFX(type);
}

function drawConfrontationTitle() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '32px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("The Confrontation", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
}

function drawOnYourOwnTitle() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '32px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("On Your Own?", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
}

function drawConfrontationPlay() {
    const isShadowFight = fightingState.ai && fightingState.ai.isShadow;
    const bg = isShadowFight ? onYourOwnBgImg : confrontationBgImg;
    
    if (bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (!fightingState.player || !fightingState.ai) return;

    // Health bars
    ctx.fillStyle = COLORS.RED; ctx.fillRect(50, 50, 300, 20); ctx.fillRect(450, 50, 300, 20);
    ctx.fillStyle = COLORS.GREEN; ctx.fillRect(50, 50, 3 * fightingState.player.health, 20);
    ctx.fillRect(450 + 3 * (100 - fightingState.ai.health), 50, 3 * fightingState.ai.health, 20);

    [fightingState.player, fightingState.ai].forEach((char) => {
        let sprite = combatSprites[char.actor], row = char.facing === 1 ? 3 : 1, frames = 1;
        if (char.state.startsWith('walk')) { sprite = walkSprites[char.actor]; frames = 6; }
        else if (char.state === 'punch') { sprite = halfSlashSprites[char.actor]; frames = 6; }
        else if (char.state === 'kick') { sprite = backSlashSprites[char.actor]; frames = 6; }

        if (sprite && sprite.complete) {
            char.frame = (char.frame + 0.1) % frames;
            drawPixelatedImage(sprite, Math.floor(char.frame) * 64, row * 64, 64, 64, char.x, char.y, 128, 128, char.isShadow ? 'inverted' : null);
        }
    });

    if (fightingState.gameOver) {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(fightingState.won ? 'YOU WIN!' : 'YOU LOSE!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
    } else {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("Use the 'a' and 's' keys to attack!", canvas.width / 2, canvas.height - 30);
    }
}
