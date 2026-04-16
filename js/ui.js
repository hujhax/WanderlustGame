function drawIntro() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
}

function drawTitle(includeTitleText=true) {
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    gradient.addColorStop(0, COLORS.SUNSET_PURPLE); gradient.addColorStop(1, COLORS.SUNSET_ORANGE);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    for (let i = 0; i < 4; i++) {
        const cx = (i * 250 + time * 20) % (canvas.width + 100) - 50; const cy = 80 + Math.sin(time + i) * 15;
        if (cloudImg.complete) drawPixelatedImage(cloudImg, 0, 0, cloudImg.width, cloudImg.height, cx, cy, 100, 60);
    }

    ctx.fillStyle = '#1a471a';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    
    // Procedural Trees
    for (let i = 0; i < 8; i++) {
        const tx = (i * 150 - time * 40) % (canvas.width + 100); const realTx = tx < -50 ? tx + canvas.width + 100 : tx;
        const ty = canvas.height * 0.6; 
        ctx.beginPath(); ctx.moveTo(realTx, ty); ctx.lineTo(realTx + 20, ty - 40); ctx.lineTo(realTx + 40, ty); ctx.fill();
    }

    ctx.fillStyle = '#333'; ctx.fillRect(0, canvas.height * 0.6, canvas.width, 100);

    ctx.fillStyle = '#FFF'; const lineOffset = (time * 150) % 60;
    for (let i = canvas.width; i > -60; i -= 60) ctx.fillRect(i - lineOffset, canvas.height * 0.6 + 45, 30, 10);

    // Procedural Car for Title Screen (Station Wagon style)
    const carX = canvas.width / 2 - 60;
    const carY = canvas.height * 0.6 + 20 + Math.sin(time * 15) * 2;
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
        ctx.textAlign = 'center'; ctx.font = '40px "Press Start 2P"';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillText('WANDERLUST', canvas.width / 2 + 4, 154);
        ctx.fillStyle = COLORS.WHITE; ctx.fillText('WANDERLUST', canvas.width / 2, 150);
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height - 50);
        }
    }
}

function drawTravellerSelect() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CHOOSE YOUR TRAVELER', canvas.width / 2, 80);
    for (let i = 0; i < 8; i++) {
        const x = 100 + (i % 4) * 150, y = 150 + Math.floor(i / 4) * 200;
        ctx.strokeStyle = (i === selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.lineWidth = (i === selectedIndex) ? 6 : 2; ctx.strokeRect(x, y, 120, 120);
        if (CAST[i].img.complete) drawPixelatedImage(CAST[i].img, 0, 0, CAST[i].img.width, CAST[i].img.height, x + 10, y + 10, 100, 100);
        ctx.fillStyle = (i === selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(CAST[i].firstName, x + 60, y + 140);
    }
}

function drawPartnerAnnouncement() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partner = CAST.find(c => c.name === partnerName);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('Your traveling companion is...', canvas.width / 2, 100);
    ctx.fillStyle = COLORS.SELECTION_YELLOW; ctx.font = '32px "Press Start 2P"';
    ctx.fillText(partner.firstName + '!', canvas.width / 2, 180);
    if (partner.img.complete) drawPixelatedImage(partner.img, 0, 0, partner.img.width, partner.img.height, canvas.width / 2 - 100, 250, 200, 200);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, 550);
}

function drawDialogBox() {
    const isTop = currentDialog.style === 'top';
    const boxY = isTop ? 20 : canvas.height - 200;
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(50, boxY, 700, 150);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(50, boxY, 700, 150);
    
    const bgRectX = 70, bgRectY = boxY + 10, bgRectSize = 100;
    ctx.fillStyle = currentDialog.style === 'silhouette' ? '#888' : COLORS.BLACK;
    ctx.fillRect(bgRectX, bgRectY, bgRectSize, bgRectSize);

    if (currentDialog.castMember) {
        const isInverted = currentDialog.style === 'inverted';
        const img = isInverted ? currentDialog.castMember.invertedImg : currentDialog.castMember.img;
        if (img && img.complete) {
            const size = Math.min(img.width, img.height);
            const ox = (img.width - size) / 2, oy = (img.height - size) / 2;
            const pixelStyle = currentDialog.style === 'inverted' ? null : currentDialog.style;
            drawPixelatedImage(img, ox, oy, size, size, 70, boxY + 10, 100, 100, pixelStyle);
        }
    }
    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    const nameWords = currentDialog.name.split(' '), nameLines = []; let currentNameLine = '';
    nameWords.forEach(word => {
        const testLine = currentNameLine + word + ' ';
        if (ctx.measureText(testLine).width > 100) { nameLines.push(currentNameLine.trim()); currentNameLine = word + ' '; }
        else currentNameLine = testLine;
    });
    nameLines.push(currentNameLine.trim());
    nameLines.forEach((line, i) => ctx.fillText(line, 120, boxY + 125 + i * 15));
    ctx.textAlign = 'left'; ctx.font = '12px "Press Start 2P"';
    const lines = currentDialog.chunks[currentDialog.chunkIndex].split('\n');
    lines.forEach((line, i) => ctx.fillText(line, 200, boxY + 40 + i * 30));
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Continue', 400, isTop ? boxY + 175 : boxY - 20);
    }
}

function drawInTheCar() {
    drawTitle(false);
    if (inTheCarState.waitingForResponse) {
        const boxY = 180, boxH = 220;
        ctx.fillStyle = COLORS.BLACK; ctx.fillRect(50, boxY, 700, boxH);
        ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(50, boxY, 700, boxH);
        ctx.fillStyle = COLORS.SELECTION_YELLOW; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("How do you respond?", 400, boxY + 30);
        ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'left';
        inTheCarState.options.forEach((opt, i) => {
            const y = boxY + 70 + i * 50;
            if (i === inTheCarState.selectedIndex) { ctx.fillStyle = COLORS.SELECTION_YELLOW; ctx.fillText("> ", 70, y); }
            else { ctx.fillStyle = COLORS.WHITE; }
            const wrapped = wrapText(opt.text, 600);
            wrapped[0].split('\n').forEach((line, j) => ctx.fillText(line, 100, y + j * 15));
        });
    }
}
