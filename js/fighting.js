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
        currentPhase = PHASES.MINIGAME_PLAY; // Using PLAY as a generic active state for render loop switch simplification if needed, but actually switch to PHASES.THE_CONFRONTATION or PHASES.ON_YOUR_OWN
        currentPhase = nextPhase === PHASES.TOGETHER_AGAIN ? PHASES.ON_YOUR_OWN : PHASES.THE_CONFRONTATION;
        fightingState = {
            player: { actor: CAST[selectedIndex].actor.toLowerCase(), x: 100, y: 400, health: 100, facing: 1, state: 'idle', frame: 0, attacking: 0, attackType: null, isShadow: false },
            ai: { actor: (isShadow ? CAST[selectedIndex].actor : partner.actor).toLowerCase(), x: 600, y: 400, health: 100, facing: -1, state: 'idle', frame: 0, attacking: 0, attackType: null, isShadow: isShadow },
            gameOver: false, won: false, nextPhase: nextPhase
        };
        audio.play('FIGHT_BGM');
    };

    if (isShadow) {
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
        // Confrontation opening with performance review
        let dialogs = [
            [partnerFirstName, partnerActor, "I am so frustrated with this trip!", null],
            [playerFirstName, CAST[selectedIndex].actor, "Okay, fine. Here we go...", null]
        ];

        // Add review for each minigame
        const successes = [...CONFRONTATION_RESPONSES.SUCCESS].sort(() => Math.random() - 0.5);
        const failures = [...CONFRONTATION_RESPONSES.FAILURE].sort(() => Math.random() - 0.5);
        let sIdx = 0, fIdx = 0;

        playedMinigames.forEach(mg => {
            if (mg.won) {
                dialogs.push([partnerFirstName, partnerActor, "I resented how good you were at " + mg.name + "!", null]);
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, successes[sIdx++].replace('[minigame name]', mg.name), null]);
            } else {
                dialogs.push([partnerFirstName, partnerActor, "How could you screw up " + mg.name + "!", null]);
                dialogs.push([playerFirstName, CAST[selectedIndex].actor, failures[fIdx++].replace('[Companion\'s First Name]', partnerFirstName), null]);
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

function handleFightingInput(key) {
    if (fightingState.gameOver) return;
    const p = fightingState.player;
    if (key === 'ArrowLeft') { p.x -= 10; p.facing = -1; p.state = 'walk_left'; }
    else if (key === 'ArrowRight') { p.x += 10; p.facing = 1; p.state = 'walk_right'; }
    else if (key === 'a') { performAttack(p, 'punch'); }
    else if (key === 's') { performAttack(p, 'kick'); }
}

function performAttack(char, type) {
    if (char.attacking > 0) return;
    char.state = type; char.attacking = 30; char.attackType = type; char.frame = 0;
    audio.playSFX(type);
}

function updateAI() {
    if (fightingState.gameOver) return;
    const ai = fightingState.ai, p = fightingState.player;
    const dist = p.x - ai.x;
    ai.facing = dist > 0 ? 1 : -1;
    if (Math.abs(dist) > 80) { ai.x += ai.facing * 3; ai.state = dist > 0 ? 'walk_right' : 'walk_left'; }
    else {
        ai.state = 'idle';
        if (Math.random() < 0.05) performAttack(ai, Math.random() < 0.5 ? 'punch' : 'kick');
    }
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
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    
    if (!fightingState.player || !fightingState.ai) return;
    updateAI();

    // Health bars
    ctx.fillStyle = COLORS.RED; ctx.fillRect(50, 50, 300, 20); ctx.fillRect(450, 50, 300, 20);
    ctx.fillStyle = COLORS.GREEN; ctx.fillRect(50, 50, 3 * fightingState.player.health, 20);
    ctx.fillRect(450 + 3 * (100 - fightingState.ai.health), 50, 3 * fightingState.ai.health, 20);

    [fightingState.player, fightingState.ai].forEach((char, i) => {
        let sprite = combatSprites[char.actor], row = char.facing === 1 ? 3 : 1, frames = 1;
        if (char.state.startsWith('walk')) { sprite = walkSprites[char.actor]; frames = 6; }
        else if (char.state === 'punch') { sprite = halfSlashSprites[char.actor]; frames = 6; }
        else if (char.state === 'kick') { sprite = backSlashSprites[char.actor]; frames = 6; }

        if (sprite && sprite.complete) {
            char.frame = (char.frame + 0.1) % frames;
            drawPixelatedImage(sprite, Math.floor(char.frame) * 64, row * 64, 64, 64, char.x, char.y, 128, 128, char.isShadow ? 'inverted' : null);
        }
        
        if (char.attacking > 0) {
            char.attacking--;
            if (char.attacking === 15) { // Hit frame
                const other = (char === fightingState.player) ? fightingState.ai : fightingState.player;
                const hitDist = Math.abs((char.x + (char.facing * 60)) - other.x);
                if (hitDist < 50) { other.health = Math.max(0, other.health - (char.attackType === 'punch' ? 5 : 10)); }
            }
            if (char.attacking === 0) char.state = 'idle';
        }
    });

    if (fightingState.player.health <= 0 || fightingState.ai.health <= 0) {
        fightingState.gameOver = true; fightingState.won = fightingState.player.health > 0;
        audio.stop(); audio.playSFX(fightingState.won ? 'TADA' : 'SAD_TROMBONE');
    }

    if (fightingState.gameOver) {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(fightingState.won ? 'YOU WIN!' : 'YOU LOSE!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
    } else {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("Use the 'a' and 's' keys to attack!", canvas.width / 2, canvas.height - 30);
    }
}
