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
            const titles = {
                chicken: 'CATCH THAT CHICKEN',
                math: 'MATHEMAGIC!',
                karaoke: 'KARAOKE NIGHT',
                cheese: 'FROMAGERIE FRENZY!',
                bump: 'BUMPERTOWN!',
                fish: 'OBLIGATORY FISHING MINIGAME',
                golf: "Bob's Intense Mini-Golf"
            };
            const mgTitle = titles[mg.name] || mg.name.toUpperCase();

            if (mg.won) {
                dialogs.push([partnerFirstName, partnerActor, cSuccesses[csIdx++ % cSuccesses.length].replace('[minigame name]', mgTitle).replace('[Player\'s First Name]', playerFirstName), null]);
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, pSuccesses[psIdx++ % pSuccesses.length].replace('[minigame name]', mgTitle).replace('[Companion\'s First Name]', partnerFirstName), null]);
            } else {
                dialogs.push([partnerFirstName, partnerActor, cFailures[cfIdx++ % cFailures.length].replace('[minigame name]', mgTitle).replace('[Player\'s First Name]', playerFirstName), null]);
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, pFailures[pfIdx++ % pFailures.length].replace('[minigame name]', mgTitle).replace('[Companion\'s First Name]', partnerFirstName), null]);
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

    // Use keysJustPressed for instantaneous attack triggering
    if (keysJustPressed.has('a')) performAttack(p, 'punch');
    else if (keysJustPressed.has('s')) performAttack(p, 'kick');

    // Continuous movement polling
    let isMoving = false;
    if (keysPressed.has('ArrowLeft')) { 
        p.x -= 7; p.facing = -1; 
        if (p.attacking <= 0) p.state = 'walk_left'; 
        isMoving = true; 
    } else if (keysPressed.has('ArrowRight')) { 
        p.x += 7; p.facing = 1; 
        if (p.attacking <= 0) p.state = 'walk_right'; 
        isMoving = true; 
    }
    if (!isMoving && p.attacking <= 0) p.state = 'idle';

    // AI logic (simplified physics)
    const dist = p.x - ai.x;
    ai.facing = dist > 0 ? 1 : -1;
    if (Math.abs(dist) > 70) { 
        ai.x += ai.facing * 4; 
        if (ai.attacking <= 0) ai.state = ai.facing > 0 ? 'walk_right' : 'walk_left'; 
    } else {
        if (ai.attacking <= 0) ai.state = 'idle';
        if (Math.random() < 0.05 && ai.attacking <= 0) performAttack(ai, Math.random() < 0.5 ? 'punch' : 'kick');
    }

    // Process attacks and collisions
    [p, ai].forEach(char => {
        if (char.attacking > 0) {
            char.attacking--;
            if (char.attacking === 8) { // Hit frame
                const other = (char === p) ? ai : p;
                const hitDist = Math.abs((char.x + (char.facing * 60)) - other.x);
                if (hitDist < 70) { 
                    other.health = Math.max(0, other.health - (char.attackType === 'punch' ? 10 : 15)); 
                }
            }
            if (char.attacking === 0) char.state = 'idle';
        }
    });

    // Single-trigger game over logic
    if (!fightingState.gameOver && (p.health <= 0 || ai.health <= 0)) {
        fightingState.gameOver = true;
        fightingState.won = p.health > 0;
        audio.stop();
        audio.playSFX(fightingState.won ? 'TADA' : 'SAD_TROMBONE');
        p.state = 'idle'; ai.state = 'idle'; // Stop animations
    }
}

function handleFightingInput(key) { return; }

function performAttack(char, type) {
    if (char.attacking > 0) return;
    char.state = type; char.attacking = 15; char.attackType = type; char.frame = 0;
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
    
    // Maintain Aspect Ratio and check image state
    if (bg.complete && bg.naturalWidth > 0) {
        const scale = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
        const w = bg.naturalWidth * scale, h = bg.naturalHeight * scale;
        const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
        ctx.drawImage(bg, x, y, w, h);
    } else {
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (!fightingState.player || !fightingState.ai) return;

    // Health bars
    ctx.fillStyle = COLORS.RED; ctx.fillRect(50, 50, 300, 20); ctx.fillRect(450, 50, 300, 20);
    ctx.fillStyle = COLORS.GREEN; ctx.fillRect(50, 50, 3 * fightingState.player.health, 20);
    ctx.fillRect(450 + 3 * (100 - fightingState.ai.health), 50, 3 * fightingState.ai.health, 20);

    // Characters
    [fightingState.player, fightingState.ai].forEach((char) => {
        let sprite = combatSprites[char.actor], row = char.facing === 1 ? 3 : 1, frames = 1;
        if (char.state.startsWith('walk')) { sprite = walkSprites[char.actor]; frames = 6; }
        else if (char.state === 'punch') { sprite = halfSlashSprites[char.actor]; frames = 6; }
        else if (char.state === 'kick') { sprite = kickSprites[char.actor]; frames = 5; row = char.facing === 1 ? 0 : 1; }

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            if (!fightingState.gameOver) char.frame = (char.frame + 0.2) % frames;
            drawPixelatedImage(sprite, Math.floor(char.frame) * 64, row * 64, 64, 64, char.x, char.y, 128, 128, char.isShadow ? 'inverted' : null);
        }
    });

    if (fightingState.gameOver) {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(fightingState.won ? 'YOU WIN!' : 'YOU LOSE!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
    } else {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("press 'a' to punch, 's' to kick", canvas.width / 2, canvas.height - 30);
    }
}
