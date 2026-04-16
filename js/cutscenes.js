function drawDepartureCutscene() {
    const elapsed = Date.now() - cutsceneStartTime, progress = elapsed / CUTSCENE_DURATION;
    if (departureBgImg.complete) ctx.drawImage(departureBgImg, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = COLORS.SKY_BLUE; ctx.fillRect(0, 0, canvas.width, canvas.height); }

    const playerActor = CAST[selectedIndex].actor.toLowerCase();
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();

    const others = CAST.filter(c => c.actor.toLowerCase() !== playerActor && c.actor.toLowerCase() !== partnerActor);
    others.forEach((c, i) => {
        const actor = c.actor.toLowerCase(), sprite = slashSprites[actor];
        if (sprite && sprite.complete) {
            const seed = (c.actor.length * 123) % 1000, frame = Math.floor((Date.now() + seed) / 150) % 6;
            drawPixelatedImage(sprite, frame * 64, 2 * 64, 64, 64, 320 + i * 45, 380, 64, 64);
        }
    });

    const carX = 80 + progress * 600, carY = 400;
    if (wagonImg.complete) {
        const scale = 0.5, w = wagonImg.width * scale, h = wagonImg.height * scale;
        drawPixelatedImage(wagonImg, 0, 0, wagonImg.width, wagonImg.height, carX, carY, w, h);
        [partnerActor, playerActor].forEach((actor, i) => {
            const sprite = sitSprites[actor];
            if (sprite && sprite.complete) {
                const windowX = carX + (i === 0 ? 130 : 180);
                const windowY = carY + 10;
                drawPixelatedImage(sprite, 0, 3 * 64 + 10, 64, 32, windowX, windowY, 64, 32);
            }
        });
    }
}

function drawSeparateWays() {
    const elapsed = Date.now() - separateWaysState.startTime, cycleDuration = 5000, totalCycles = 6;
    const currentCycle = Math.floor(elapsed / cycleDuration);
    
    if (currentCycle >= totalCycles) {
        ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2);
        return;
    }

    const index = currentCycle % 2, zoomIteration = Math.floor(currentCycle / 2);
    const bg = index === 0 ? companionSitsBg : playerSitsBg;
    
    if (bg.readyState >= 2 || bg.complete) {
        const W = canvas.width, H = canvas.height;
        const bgW = (index === 0) ? 540 : 450, bgH = (index === 0) ? 540 : 300;
        const s0 = Math.max(W / bgW, H / bgH);

        let zoom = s0, panXOffset = 0, progress = (elapsed % cycleDuration) / cycleDuration;
        let charX = (index === 0) ? 253 : 48, charY = (index === 0) ? 477 : 453;
        let targetX, targetY;

        if (zoomIteration === 0) { targetX = bgW / 2; targetY = bgH / 2; }
        else if (zoomIteration === 1) {
            zoom = s0 * 1.5; panXOffset = -progress * 40;
            targetX = charX + 32 + W / (4 * zoom) + panXOffset; targetY = charY + 32 - H / (4 * zoom);
        } else {
            zoom = s0 * 2.7; panXOffset = progress * 40;
            targetX = charX + 32 + W / (4 * zoom) + panXOffset; targetY = charY + 32 - H / (4 * zoom);
        }

        const halfVisibleH = (H / 2) / zoom;
        targetY = Math.max(halfVisibleH, Math.min(bgH - halfVisibleH, targetY));

        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-targetX, -targetY);
        
        ctx.drawImage(bg, 0, 0, bgW, bgH);
        ctx.save(); ctx.translate(2 * bgW, 0); ctx.scale(-1, 1); ctx.drawImage(bg, 0, 0, bgW, bgH); ctx.restore();
        ctx.save(); ctx.translate(-bgW, 0); ctx.scale(-1, 1); ctx.drawImage(bg, -bgW, 0, bgW, bgH); ctx.restore();
        
        const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
        const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
        const playerActor = CAST[selectedIndex].actor.toLowerCase();
        const sprite = index === 0 ? sitSprites[partnerActor] : sitSprites[playerActor];
        
        if (sprite && sprite.complete) {
            drawPixelatedImage(sprite, 0, 3 * 64, 64, 64, charX - 32, charY - 64, 128, 128);
        }
        ctx.restore();
    }
}

function drawTogetherAgain() {
    if (companionSitsBg.readyState >= 2 || companionSitsBg.complete) ctx.drawImage(companionSitsBg, 0, 0, canvas.width, canvas.height);

    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name], partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase(), playerActor = CAST[selectedIndex].actor.toLowerCase();
    const sitSprite = sitSprites[partnerActor];
    if (sitSprite && sitSprite.complete) drawPixelatedImage(sitSprite, 0, 3 * 64, 64, 64, 253 - 64, 430 - 128, 128, 128);

    if (togetherAgainState.state === 'walking') {
        togetherAgainState.playerX += 2;
        const walkSprite = walkSprites[playerActor];
        if (walkSprite && walkSprite.complete) {
            const frame = Math.floor(Date.now() / 150) % 6;
            drawPixelatedImage(walkSprite, frame * 64, 3 * 64, 64, 64, togetherAgainState.playerX - 64, 453 - 128, 128, 128);
        }
        if (togetherAgainState.playerX >= 230) {
            togetherAgainState.state = 'sitting';
            const pFirst = CAST[selectedIndex].firstName, cFirst = CAST.find(c => c.name === partnerName).firstName;
            showDialog(pFirst, CAST[selectedIndex].actor, "I'm sorry I fought with you.", () => {
                showDialog(cFirst, CAST.find(c => c.name === partnerName).actor, "I'm sorry too.", () => {
                    showDialog(pFirst, CAST[selectedIndex].actor, "Can we be friends again?", () => {
                        showDialog(cFirst, CAST.find(c => c.name === partnerName).actor, "Yes we can!", () => {
                            showDialog(pFirst, CAST[selectedIndex].actor, "YAY!", startClosingInterview, 'top');
                        }, 'top');
                    }, 'top');
                }, 'top');
            }, 'top');
        }
    } else {
        const playerSit = sitSprites[playerActor];
        if (playerSit && playerSit.complete) drawPixelatedImage(playerSit, 0, 3 * 64, 64, 64, 230 - 64, 453 - 128, 128, 128);
    }
}

function drawClosingInterview() { drawTitle(false); }

function drawCredits() {
    if (creditsStartTime === 0) {
        creditsStartTime = Date.now(); polaroids = [];
        if (screenCaptures.length > 0) {
            for (let i = 0; i < 5; i++) {
                const img = screenCaptures[Math.floor(Math.random() * screenCaptures.length)];
                polaroids.push({ img, x: 50 + Math.random() * 500, y: 50 + Math.random() * 300, rotation: (Math.random() - 0.5) * 0.4, time: i * 1500 });
            }
        }
    }
    const elapsed = Date.now() - creditsStartTime, allPhotosShownTime = 5 * 1500 + 1000;
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (elapsed < allPhotosShownTime + 2000) {
        polaroids.forEach(p => {
            if (elapsed > p.time) {
                ctx.save(); ctx.translate(p.x + 100, p.y + 100); ctx.rotate(p.rotation);
                ctx.fillStyle = COLORS.WHITE; ctx.fillRect(-110, -110, 220, 240);
                ctx.drawImage(p.img, -100, -100, 200, 150); ctx.restore();
            }
        });
        return;
    }

    ctx.save(); if (screenCaptures.length > 0) {
        ctx.globalAlpha = 0.3;
        polaroids.forEach(p => {
            ctx.save(); ctx.translate(p.x + 100, p.y + 100); ctx.rotate(p.rotation);
            ctx.fillStyle = COLORS.WHITE; ctx.fillRect(-110, -110, 220, 240);
            ctx.drawImage(p.img, -100, -100, 200, 150); ctx.restore();
        });
    } ctx.restore();

    const CREDITS_TEXT = [
        "Wanderlust", "", "Director & Tech", "Lindsey McGowen", "", "Assistant Director & Understudy", "Leichelle Little", "", "Cast",
        "Claire Biddiscombe", "Gilbert El-Dick", "Jason Summers", "Krystal Merrells", "Patrice Forbes", "Peter Rogers", "Sam Allen", "The Velvet Duke", "",
        "Special Thanks to", "Annika Bolden (pinkies up!)", "", "Presented By", "Wayward Improvised Theatre & Videogaming Concern"
    ];
    ctx.fillStyle = COLORS.WHITE; ctx.textAlign = 'center'; ctx.font = '16px "Press Start 2P"';
    CREDITS_TEXT.forEach((line, i) => { 
        const y = creditsY + i * 40; 
        if (y > -40 && y < canvas.height + 40) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillText(line, canvas.width / 2 + 2, y + 2);
            ctx.fillStyle = COLORS.WHITE; ctx.fillText(line, canvas.width / 2, y); 
        }
    });
    if (!creditsFinished) { creditsY -= 2.5; if (creditsY < -(CREDITS_TEXT.length * 40)) creditsFinished = true; }
    else { ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('Click Enter to Replay', canvas.width / 2, canvas.height / 2); }
}
