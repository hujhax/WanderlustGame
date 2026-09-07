function drawIntro() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center';
    const text = isMobileMode ? 'Tap to Start' : 'Click to Start';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function drawTitle(includeTitleText=true) {
    const time = Date.now() * 0.001;
    const skyH = canvas.height * 0.6;
    const gradient = ctx.createLinearGradient(0, 0, 0, skyH);
    gradient.addColorStop(0, COLORS.SUNSET_PURPLE); gradient.addColorStop(1, COLORS.SUNSET_ORANGE);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, skyH);
    
    for (let i = 0; i < 4; i++) {
        const cx = (i * 250 + time * 20) % (canvas.width + 100) - 50; const cy = 80 + Math.sin(time + i) * 15;
        if (cloudImg.complete) drawPixelatedImage(cloudImg, 0, 0, cloudImg.width, cloudImg.height, cx, cy, 100, 60);
    }

    ctx.fillStyle = '#1a471a';
    ctx.fillRect(0, skyH, canvas.width, canvas.height * 0.4);
    
    // Procedural Trees
    for (let i = 0; i < 8; i++) {
        const tx = (i * 150 - time * 40) % (canvas.width + 100); const realTx = tx < -50 ? tx + canvas.width + 100 : tx;
        const ty = skyH; 
        ctx.beginPath(); ctx.moveTo(realTx, ty); ctx.lineTo(realTx + 20, ty - 40); ctx.lineTo(realTx + 40, ty); ctx.fill();
    }

    ctx.fillStyle = '#333'; ctx.fillRect(0, skyH, canvas.width, 100);

    ctx.fillStyle = '#FFF'; const lineOffset = (time * 150) % 60;
    for (let i = canvas.width; i > -60; i -= 60) ctx.fillRect(i - lineOffset, skyH + 45, 30, 10);

    // Procedural Car for Title Screen (Station Wagon style)
    const carX = canvas.width / 2 - 60;
    const carY = skyH + 20 + Math.sin(time * 15) * 2;
    ctx.fillStyle = '#8B4513'; // Wood panel brown
    ctx.fillRect(carX, carY, 120, 40); // Body
    ctx.fillStyle = '#DAA520'; // Upper body/roof
    ctx.fillRect(carX, carY - 15, 80, 15);
    ctx.fillStyle = '#000'; // Wheels
    ctx.fillRect(carX + 15, carY + 35, 20, 10);
    ctx.fillRect(carX + 85, carY + 35, 20, 10);
    ctx.fillStyle = COLORS.SKY_BLUE; // Windows
    ctx.fillRect(carX + 5, carY - 10, 30, 10);
    ctx.fillRect(carX + 40, carY - 10, 30, 10);

    if (includeTitleText) {
        ctx.textAlign = 'center'; ctx.font = isMobileMode ? '32px "Press Start 2P"' : '40px "Press Start 2P"';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillText('WANDERLUST', canvas.width / 2 + 4, 154);
        ctx.fillStyle = COLORS.WHITE; ctx.fillText('WANDERLUST', canvas.width / 2, 150);
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.font = '16px "Press Start 2P"';
            const prompt = isMobileMode ? 'Tap to Start' : 'Press Enter to Start';
            ctx.fillText(prompt, canvas.width / 2, canvas.height - 50);
        }
    }
}

function drawTravellerSelect() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = isMobileMode ? '18px "Press Start 2P"' : '24px "Press Start 2P"';
    ctx.textAlign = 'center'; ctx.fillText('CHOOSE YOUR TRAVELER', canvas.width / 2, isMobileMode ? 60 : 80);
    
    for (let i = 0; i < 8; i++) {
        let x, y, boxW = 120, boxH = 120;
        if (isMobileMode) {
            // 4 rows of 2 columns in portrait 600x800
            const col = i % 2;
            const row = Math.floor(i / 2);
            x = 80 + col * 260;
            y = 110 + row * 165;
            boxW = 180; boxH = 125;
        } else {
            x = 100 + (i % 4) * 150;
            y = 150 + Math.floor(i / 4) * 200;
        }

        const isSel = (i === selectedIndex);
        ctx.strokeStyle = isSel ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.lineWidth = isSel ? 6 : 2;
        ctx.strokeRect(x, y, boxW, boxH);

        const imgX = isMobileMode ? x + (boxW - 90) / 2 : x + 10;
        const imgY = isMobileMode ? y + 8 : y + 10;
        const imgS = isMobileMode ? 90 : 100;
        if (CAST[i].img.complete) drawPixelatedImage(CAST[i].img, 0, 0, CAST[i].img.width, CAST[i].img.height, imgX, imgY, imgS, imgS);
        
        ctx.fillStyle = isSel ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(CAST[i].firstName, x + boxW / 2, y + boxH + 18);
    }
}

function drawPartnerAnnouncement() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partner = CAST.find(c => c.name === partnerName);
    ctx.fillStyle = COLORS.WHITE; ctx.font = isMobileMode ? '18px "Press Start 2P"' : '24px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('Your traveling companion is...', canvas.width / 2, isMobileMode ? 120 : 100);
    ctx.fillStyle = COLORS.SELECTION_YELLOW; ctx.font = isMobileMode ? '26px "Press Start 2P"' : '32px "Press Start 2P"';
    ctx.fillText(partner.firstName + '!', canvas.width / 2, isMobileMode ? 200 : 180);
    const imgS = isMobileMode ? 220 : 200;
    const imgY = isMobileMode ? 270 : 250;
    if (partner.img.complete) drawPixelatedImage(partner.img, 0, 0, partner.img.width, partner.img.height, canvas.width / 2 - imgS / 2, imgY, imgS, imgS);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        const prompt = isMobileMode ? 'Tap to Continue' : 'Press Enter to Continue';
        ctx.fillText(prompt, canvas.width / 2, isMobileMode ? 720 : 550);
    }
}

function drawDialogBox() {
    const isTop = currentDialog.style === 'top';
    const isCar = currentPhase === PHASES.IN_THE_CAR;

    const boxW = isMobileMode ? 490 : (isCar ? 630 : 700);
    const boxH = isMobileMode ? 220 : 185;
    const boxX = isMobileMode ? 25 : 50;
    const boxY = isTop ? 20 : canvas.height - boxH - 20;

    // Optional illustration drawn behind the dialog box
    if (currentDialog.illustration) {
        currentDialog.illustration();
    }

    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(boxX, boxY, boxW, boxH);
    
    const bgRectX = boxX + 15, bgRectY = boxY + 15, bgRectSize = isMobileMode ? 90 : 100;
    ctx.fillStyle = currentDialog.style === 'silhouette' ? '#888' : COLORS.BLACK;
    ctx.fillRect(bgRectX, bgRectY, bgRectSize, bgRectSize);

    if (currentDialog.castMember) {
        const isInverted = currentDialog.style === 'inverted';
        const img = isInverted ? currentDialog.castMember.invertedImg : currentDialog.castMember.img;
        if (img && img.complete) {
            const size = Math.min(img.width, img.height);
            const ox = (img.width - size) / 2, oy = (img.height - size) / 2;
            const pixelStyle = currentDialog.style === 'silhouette' ? 'silhouette' : null;
            drawPixelatedImage(img, ox, oy, size, size, bgRectX, bgRectY, bgRectSize, bgRectSize, pixelStyle);
        }
    }
    
    // Draw Name below the portrait
    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    const nameWords = currentDialog.name.split(' '), nameLines = []; let currentNameLine = '';
    nameWords.forEach(word => {
        const testLine = currentNameLine + word + ' ';
        if (ctx.measureText(testLine).width > bgRectSize) { nameLines.push(currentNameLine.trim()); currentNameLine = word + ' '; }
        else currentNameLine = testLine;
    });
    nameLines.push(currentNameLine.trim());
    nameLines.forEach((line, i) => ctx.fillText(line, bgRectX + bgRectSize / 2, boxY + bgRectSize + 25 + i * 15));
    
    // Draw Dialog text
    ctx.fillStyle = COLORS.WHITE;
    ctx.textAlign = 'left'; ctx.font = isMobileMode ? '11px "Press Start 2P"' : '12px "Press Start 2P"';
    const textX = bgRectX + bgRectSize + 20;
    const textW = boxW - (bgRectSize + 40);
    const chunkText = currentDialog.chunks[currentDialog.chunkIndex] || '';
    const wrappedLines = wrapTextLines(chunkText, textW, isMobileMode ? '11px "Press Start 2P"' : '12px "Press Start 2P"');
    wrappedLines.slice(0, 4).forEach((line, i) => ctx.fillText(line, textX, boxY + 40 + i * 28));
    
    // Draw Yes/No Options if provided
    if (currentDialog.options && Array.isArray(currentDialog.options)) {
        const optY = boxY + boxH - 45;
        const opts = currentDialog.options;
        const selIdx = currentDialog.selectedOption || 0;

        opts.forEach((optText, idx) => {
            const optX = isMobileMode ? (boxX + 220 + idx * 110) : (450 + idx * 110);
            const isSel = (idx === selIdx);
            
            ctx.fillStyle = isSel ? COLORS.SELECTION_YELLOW : '#333333';
            ctx.fillRect(optX, optY, 95, 34);
            ctx.strokeStyle = COLORS.WHITE;
            ctx.lineWidth = 2;
            ctx.strokeRect(optX, optY, 95, 34);

            ctx.fillStyle = isSel ? COLORS.BLACK : COLORS.WHITE;
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(optText, optX + 47, optY + 21);
        });
    } else {
        // Blinking continuation indicator at bottom right of the black box
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'right';
            const indicatorX = boxX + boxW - 20;
            ctx.fillText('▼', indicatorX, boxY + boxH - 18);
        }
    }
}

function drawIntimacyBar() {
    const barX = isMobileMode ? 545 : 710;
    const barY = isMobileMode ? 60 : 80;
    const barH = isMobileMode ? 240 : 320;
    const barW = isMobileMode ? 26 : 30;

    // Progress bar border
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 3; ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(barX, barY, barW, barH);
    
    // Gradient fill
    const fillH = barH * (intimacy / 8);
    const barGrad = ctx.createLinearGradient(0, barY + barH, 0, barY);
    barGrad.addColorStop(0, '#0000FF');
    barGrad.addColorStop(1, '#FF0000');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX + 2, barY + barH - fillH, barW - 4, fillH);
    
    // Vertical text label
    ctx.save();
    ctx.translate(barX - 12, barY + barH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("INTENSITY OF CONVERSATION", 0, 0);
    ctx.restore();
    
    // Sparks
    if (intimacy >= 7) {
        if (Math.random() < 0.3) {
            intimacySparks.push({
                x: barX + 12,
                y: barY,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 2,
                life: 1.0
            });
        }
    }
    
    // Update and draw sparks
    for (let i = intimacySparks.length - 1; i >= 0; i--) {
        const p = intimacySparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.03;
        if (p.life <= 0) {
            intimacySparks.splice(i, 1);
        } else {
            ctx.fillStyle = `rgba(255, 230, 0, ${p.life})`;
            ctx.fillRect(p.x, p.y, 4, 4);
        }
    }
}

function drawInTheCar() {
    drawTitle(false);
    drawIntimacyBar();
    if (inTheCarState.waitingForResponse) {
        const boxX = isMobileMode ? 25 : 50;
        const boxY = isMobileMode ? 200 : 180;
        const boxW = isMobileMode ? 490 : 630;
        const boxH = isMobileMode ? 400 : 220;

        ctx.fillStyle = COLORS.BLACK; ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = COLORS.SELECTION_YELLOW; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("How do you respond?", boxX + boxW / 2, boxY + 30);
        
        inTheCarState.options.forEach((opt, i) => {
            if (isMobileMode) {
                const cardY = boxY + 55 + i * 110;
                const cardH = 95;
                const isSel = (i === inTheCarState.selectedIndex);

                ctx.fillStyle = isSel ? 'rgba(255, 255, 0, 0.15)' : '#111111';
                ctx.fillRect(boxX + 15, cardY, boxW - 30, cardH);
                ctx.strokeStyle = isSel ? COLORS.SELECTION_YELLOW : '#555555';
                ctx.lineWidth = isSel ? 3 : 1;
                ctx.strokeRect(boxX + 15, cardY, boxW - 30, cardH);

                ctx.fillStyle = isSel ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
                ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'left';
                const lines = wrapTextLines(opt.text, boxW - 60, '10px "Press Start 2P"');
                lines.slice(0, 4).forEach((line, j) => ctx.fillText(line, boxX + 30, cardY + 25 + j * 16));
            } else {
                const y = boxY + 70 + i * 50;
                ctx.fillStyle = (i === inTheCarState.selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
                ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'left';
                if (i === inTheCarState.selectedIndex) ctx.fillText("> ", 70, y);
                const wrapped = wrapText(opt.text, 540);
                wrapped[0].split('\n').forEach((line, j) => ctx.fillText(line, 100, y + j * 15));
            }
        });
    }
}

function drawNextDay() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = isMobileMode ? '24px "Press Start 2P"' : '32px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("The next day...", canvas.width / 2, canvas.height / 2);
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        const prompt = isMobileMode ? 'Tap to Continue' : 'Press Enter to Continue';
        ctx.fillText(prompt, canvas.width / 2, canvas.height / 2 + 100);
    }
}

