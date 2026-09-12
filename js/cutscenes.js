function drawDepartureCutscene() {
    const elapsed = Date.now() - cutsceneStartTime, progress = elapsed / CUTSCENE_DURATION;
    
    let bgScale = 1.0, bgX = 0, bgY = 0;
    if (departureBgImg.complete && departureBgImg.naturalWidth > 0) {
        if (isMobileMode) {
            bgScale = Math.max(canvas.width / departureBgImg.naturalWidth, canvas.height / departureBgImg.naturalHeight);
            const w = departureBgImg.naturalWidth * bgScale, h = departureBgImg.naturalHeight * bgScale;
            bgX = (canvas.width - w) / 2;
            bgY = (canvas.height - h) / 2;
            ctx.drawImage(departureBgImg, bgX, bgY, w, h);
        } else {
            ctx.drawImage(departureBgImg, 0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.fillStyle = COLORS.SKY_BLUE; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const playerActor = CAST[selectedIndex].actor.toLowerCase();
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();

    const bystanderY = isMobileMode ? (bgY + 380 * bgScale) : 380;
    const bystanderXBase = isMobileMode ? 150 : 320;
    const bystanderSpacing = isMobileMode ? 55 : 45;

    const others = CAST.filter(c => c.actor.toLowerCase() !== playerActor && c.actor.toLowerCase() !== partnerActor);
    others.forEach((c, i) => {
        const actor = c.actor.toLowerCase(), sprite = waveSprites[actor];
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            const seed = (c.actor.length * 123) % 1000;
            const pingPongFrames = [0, 1, 2, 3, 2, 1];
            const frame = pingPongFrames[Math.floor((Date.now() + seed) / 150) % 6];
            const size = 64 * (isMobileMode ? bgScale : 1.0);
            drawPixelatedImage(sprite, frame * 64, 0, 64, 64, bystanderXBase + i * bystanderSpacing, bystanderY, size, size);
        }
    });

    const carY = isMobileMode ? (bgY + 400 * bgScale) : 400;
    const carX = isMobileMode ? (-120 + progress * 740) : (80 + progress * 600);

    if (wagonImg.complete && wagonImg.naturalWidth > 0) {
        const baseScale = 0.5 * (isMobileMode ? bgScale : 1.0);
        const w = wagonImg.width * baseScale, h = wagonImg.height * baseScale;
        drawPixelatedImage(wagonImg, 0, 0, wagonImg.width, wagonImg.height, carX, carY, w, h);
        [partnerActor, playerActor].forEach((actor, i) => {
            const sprite = sitSprites[actor];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                const windowX = carX + (i === 0 ? 130 : 180) * (isMobileMode ? bgScale : 1.0);
                const windowY = carY + 10 * (isMobileMode ? bgScale : 1.0);
                const sprW = 64 * (isMobileMode ? bgScale : 1.0);
                const sprH = 32 * (isMobileMode ? bgScale : 1.0);
                drawPixelatedImage(sprite, 0, 3 * 64 + 10, 64, 32, windowX, windowY, sprW, sprH);
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
        const prompt = isMobileMode ? 'Tap to Continue' : 'Press Enter to Continue';
        ctx.fillText(prompt, canvas.width / 2, canvas.height / 2);
        return;
    }

    const index = currentCycle % 2, zoomIteration = Math.floor(currentCycle / 2);
    const bg = index === 0 ? companionSitsBg : playerSitsBg;
    if (bg.paused) bg.play().catch(e => {});
    
    const W = canvas.width, H = canvas.height;
    const bgW = (index === 0) ? 540 : 450, bgH = (index === 0) ? 540 : 300;
    
    // Ensure background fills height, width is handled by mirrored tiling
    const s0 = H / bgH;

    let zoom = s0, panXOffset = 0, progress = (elapsed % cycleDuration) / cycleDuration;
    let charX, charY;

    if (index === 0) { // Companion Sits
        charX = 253; charY = 477;
        if (zoomIteration > 0) panXOffset = -progress * 40;
    } else { // Player Sits
        charX = 385; charY = 285;
        if (zoomIteration > 0) panXOffset = progress * 40;
    }

    let targetX, targetY;

    if (zoomIteration === 0) { 
        targetX = index === 0 ? bgW / 2 : charX - 40; 
        targetY = index === 1 ? charY - 50 : bgH / 2;
    } else {
        if (zoomIteration === 1) zoom = s0 * 1.5;
        else {
            if (index === 1 && zoomIteration === 2) {
                zoom = s0 * 2.1;
            } else {
                zoom = s0 * 2.7;
            }
        }

        const xDir = (index === 0) ? 1 : -1;
        targetX = charX + xDir * (W / 4) / zoom + panXOffset;
        if (index === 1 && zoomIteration === 2) {
            targetY = charY - 64;
        } else {
            targetY = charY - (H / 4) / zoom;
        }
    }

    // Clamp targetY so we never see above or below the background image
    const halfVisibleH = (H / 2) / zoom;
    targetY = Math.max(halfVisibleH, Math.min(bgH - halfVisibleH, targetY));

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-targetX, -targetY);
    
    // Render video if ready, or dark background fallback
    if (bg.readyState >= 2) {
        ctx.drawImage(bg, 0, 0, bgW, bgH);
        ctx.save(); ctx.translate(2 * bgW, 0); ctx.scale(-1, 1); ctx.drawImage(bg, 0, 0, bgW, bgH); ctx.restore();
        ctx.save(); ctx.scale(-1, 1); ctx.drawImage(bg, 0, 0, bgW, bgH); ctx.restore();
    } else {
        ctx.fillStyle = '#2d1e18';
        ctx.fillRect(-bgW, 0, bgW * 3, bgH);
    }
    
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
    const playerActor = CAST[selectedIndex].actor.toLowerCase();
    const sprite = index === 0 ? sitSprites[partnerActor] : sitSprites[playerActor];
    
    if (sprite && sprite.complete) {
        const row = (index === 0) ? 3 : 1;
        ctx.save();
        ctx.translate(charX, charY);
        if (index === 1 && zoomIteration === 0) {
            ctx.scale(5 / 9, 5 / 9);
        }
        drawPixelatedImage(sprite, 0, row * 64, 64, 64, -64, -128, 128, 128);
        ctx.restore();
    }
    
    ctx.restore();
}

function startTogetherAgain() {
    currentPhase = PHASES.TOGETHER_AGAIN;
    togetherAgainState = { startTime: Date.now(), playerX: -100, state: 'walking' };
    audio.play('TOGETHER_BGM');
}

function drawTogetherAgain() {
    if (companionSitsBg.paused) companionSitsBg.play().catch(e => {});

    if (isMobileMode) {
        const scale = Math.max(canvas.width / 540, canvas.height / 540);
        const scaledW = 540 * scale, scaledH = 540 * scale;
        const offsetX = (canvas.width - scaledW) / 2;
        const offsetY = (canvas.height - scaledH) / 2;

        if (companionSitsBg.readyState >= 2 || companionSitsBg.complete) {
            ctx.drawImage(companionSitsBg, offsetX, offsetY, scaledW, scaledH);
        } else {
            ctx.fillStyle = '#2d1e18';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const rockX = offsetX + 253 * scale;
        const rockY = offsetY + 477 * scale;

        const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
        const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
        const playerActor = CAST[selectedIndex].actor.toLowerCase();
        
        // Companion sitting at rock seat
        const sitSprite = sitSprites[partnerActor];
        if (sitSprite && sitSprite.complete) {
            drawPixelatedImage(sitSprite, 0, 3 * 64, 64, 64, rockX - 64, rockY - 128, 128, 128);
        }

        const targetPlayerX = rockX - 45;

        if (togetherAgainState.state === 'walking') {
            if (togetherAgainState.playerX === -100) togetherAgainState.playerX = -64;
            togetherAgainState.playerX += 2.5;

            const walkSprite = walkSprites[playerActor];
            if (walkSprite && walkSprite.complete) {
                const frame = Math.floor(Date.now() / 150) % 6;
                drawPixelatedImage(walkSprite, frame * 64, 3 * 64, 64, 64, togetherAgainState.playerX - 64, rockY - 128, 128, 128);
            }
            if (togetherAgainState.playerX >= targetPlayerX) {
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
            if (playerSit && playerSit.complete) {
                drawPixelatedImage(playerSit, 0, 3 * 64, 64, 64, targetPlayerX - 64, rockY - 128, 128, 128);
            }
        }
    } else {
        // Exact original desktop behavior
        if (companionSitsBg.readyState >= 2 || companionSitsBg.complete) {
            ctx.drawImage(companionSitsBg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#2d1e18';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
        const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
        const playerActor = CAST[selectedIndex].actor.toLowerCase();
        
        // Companion sitting at (253, 500)
        const sitSprite = sitSprites[partnerActor];
        if (sitSprite && sitSprite.complete) {
            drawPixelatedImage(sitSprite, 0, 3 * 64, 64, 64, 253 - 64, 500 - 128, 128, 128);
        }

        if (togetherAgainState.state === 'walking') {
            togetherAgainState.playerX += 2;
            const walkSprite = walkSprites[playerActor];
            if (walkSprite && walkSprite.complete) {
                const frame = Math.floor(Date.now() / 150) % 6;
                // Player walks at y=523
                drawPixelatedImage(walkSprite, frame * 64, 3 * 64, 64, 64, togetherAgainState.playerX - 64, 523 - 128, 128, 128);
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
            if (playerSit && playerSit.complete) {
                // Player sits at (230, 523)
                drawPixelatedImage(playerSit, 0, 3 * 64, 64, 64, 230 - 64, 523 - 128, 128, 128);
            }
        }
    }
}

function startClosingInterview() {
    currentPhase = PHASES.CLOSING_INTERVIEW;
    audio.play('INTERVIEW_BGM', 39);
    if (selectedIndex === undefined) selectedIndex = 5;
    const playerFirstName = CAST[selectedIndex].firstName;
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partner = CAST.find(c => c.name === partnerName);
    const partnerFirstName = partner.firstName;
    const partnerActor = partner.actor;

    let dialogs = [
        [playerFirstName, CAST[selectedIndex].actor, "We had a meaningful trip.", 'top'],
        [partnerFirstName, partnerActor, "It challenged our friendship.", 'top'],
        [playerFirstName, CAST[selectedIndex].actor, "It was a crazy time.", 'top'],
        [partnerFirstName, partnerActor, "But we learned a lot about ourselves.", 'top'],
        [playerFirstName, CAST[selectedIndex].actor, "I gained " + score + " points worth of self-knowledge!", 'top']
    ];

    let currentD = 0;
    const nextDialog = () => {
        if (currentD < dialogs.length) {
            const d = dialogs[currentD++];
            showDialog(d[0], d[1], d[2], nextDialog, d[3]);
        } else {
            if (getPlaythroughCount() === 0) {
                startUnlockMasters();
            } else {
                currentPhase = PHASES.CLOSING_CREDITS;
                creditsY = canvas.height; creditsFinished = false; audio.play('MOON');
                incrementPlaythroughCount();
            }
        }
    };
    nextDialog();
}

function startUnlockMasters() {
    currentPhase = PHASES.UNLOCK_MASTERS;
    audio.play('ZELDA_VICTORY');
    incrementPlaythroughCount();
}

function drawClosingInterview() { drawTitle(false); }

function drawCredits() {
    if (creditsStartTime === 0) {
        creditsStartTime = Date.now();
        polaroids = [];
        
        let photos = (screenCaptures && screenCaptures.length > 0) 
            ? screenCaptures.filter(img => img && img.complete) 
            : [];
            
        if (photos.length === 0) {
            photos = [departureBgImg, farmBgImg, countryRoadImg, confrontationBgImg, bumperCarLotImg].filter(img => img && img.complete);
        }
        if (photos.length === 0) {
            photos = [departureBgImg];
        }

        for (let i = 0; i < 5; i++) {
            const img = photos[Math.floor(Math.random() * photos.length)];
            const x = isMobileMode ? (30 + Math.random() * 320) : (50 + Math.random() * 500);
            const y = isMobileMode ? (40 + Math.random() * 380) : (50 + Math.random() * 300);
            polaroids.push({
                img,
                x,
                y,
                rotation: (Math.random() - 0.5) * 0.4,
                time: i * 800
            });
        }
    }

    const elapsed = Date.now() - creditsStartTime;
    const allPhotosShownTime = 5 * 800 + 500;
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderPolaroid = (p, offsetY = 0) => {
        if (!p.img || !p.img.complete || p.img.naturalWidth === 0) return;
        
        if (!isMobileMode) {
            ctx.save();
            ctx.translate(p.x + 100, p.y + 100 + offsetY);
            ctx.rotate(p.rotation);
            ctx.fillStyle = COLORS.WHITE;
            ctx.fillRect(-110, -110, 220, 240);
            ctx.fillStyle = COLORS.BLACK;
            ctx.fillRect(-100, -100, 200, 150);
            ctx.drawImage(p.img, -100, -100, 200, 150);
            ctx.restore();
            return;
        }

        const imgW = p.img.naturalWidth || p.img.width || 1;
        const imgH = p.img.naturalHeight || p.img.height || 1;
        
        const targetW = 200, targetH = 150;
        const targetAspect = targetW / targetH;
        const imgAspect = imgW / imgH;
        
        let srcX = 0, srcY = 0, srcW = imgW, srcH = imgH;
        if (imgAspect > targetAspect) {
            srcW = imgH * targetAspect;
            srcX = (imgW - srcW) / 2;
        } else {
            srcH = imgW / targetAspect;
            srcY = (imgH - srcH) / 2;
        }

        ctx.save();
        ctx.translate(p.x + 100, p.y + 100 + offsetY);
        ctx.rotate(p.rotation);
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillRect(-110, -110, 220, 240);
        ctx.drawImage(p.img, srcX, srcY, srcW, srcH, -100, -100, targetW, targetH);
        ctx.restore();
    };

    if (elapsed < allPhotosShownTime) {
        polaroids.forEach(p => {
            if (elapsed > p.time) {
                renderPolaroid(p);
            }
        });
        return;
    }

    // Scrolling phase - Polaroids and text move together
    const scrollProgress = creditsY - canvas.height;

    polaroids.forEach(p => {
        renderPolaroid(p, scrollProgress);
    });

    const CREDITS_TEXT = [
        "Wanderlust", "", "Director & Tech", "Lindsey McGowen", "", "Assistant Director & Understudy", "Leichelle Little", "", "Cast",
        "Claire Biddiscombe", "Gilbert El-Dick", "Jason Summers", "Krystal Merrells", "Patrice Forbes", "Peter Rogers", "Sam Adams", "The Velvet Duke", "",
        "Special Thanks to", "Annika Bolden (pinkies up!)", "", "Presented By", "Wayward Improvised Theatre", "& Videogaming Concern"
    ];

    ctx.fillStyle = COLORS.WHITE; ctx.textAlign = 'center'; ctx.font = '16px "Press Start 2P"';
    const textBaseY = 100;

    CREDITS_TEXT.forEach((line, i) => { 
        const y = creditsY + textBaseY + i * 40; 
        if (y > -40 && y < canvas.height + 40) {
            ctx.fillText(line, canvas.width / 2, y); 
        }
    });

    // Animated chicken at the end
    const chickenY = creditsY + textBaseY + CREDITS_TEXT.length * 40 + 50;
    if (chickenY > -64 && chickenY < canvas.height + 64) {
        if (chickenSheetImg.complete) {
            const frame = Math.floor(Date.now() / 150) % 16;
            ctx.drawImage(chickenSheetImg, frame * 128, 0, 128, 128, canvas.width / 2 - 64, chickenY, 128, 128);
        }
    }

    if (!creditsFinished) { 
        creditsY -= 2.0; // Fairly slow scroll
        if (chickenY < -100) creditsFinished = true; 
    } else { 
        ctx.font = isMobileMode ? '14px "Press Start 2P"' : '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        const promptText = isMobileMode ? 'Tap to Replay' : 'Press Enter to Replay';
        ctx.fillText(promptText, canvas.width / 2, canvas.height / 2); 
    }
}
