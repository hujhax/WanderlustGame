function drawPixelatedImage(img, sx, sy, sw, sh, dx, dy, dw, dh, filter = null) {
    if (!img || (!img.complete && !(img instanceof HTMLVideoElement)) || (img.naturalWidth === 0 && !(img instanceof HTMLVideoElement))) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    if (filter === 'silhouette' || filter === 'inverted') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = dw; tempCanvas.height = dh;
        const tctx = tempCanvas.getContext('2d');
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        
        if (filter === 'silhouette') {
            tctx.globalCompositeOperation = 'source-in';
            tctx.fillStyle = 'black';
            tctx.fillRect(0, 0, dw, dh);
        } else if (filter === 'inverted') {
            tctx.globalCompositeOperation = 'difference';
            tctx.fillStyle = 'white';
            tctx.fillRect(0, 0, dw, dh);
            tctx.globalCompositeOperation = 'destination-in';
            tctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        }
        ctx.drawImage(tempCanvas, dx, dy);
    } else {
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
}

function wrapTextLines(text, maxWidth, font = null) {
    if (!text) return [];
    ctx.save();
    if (font) ctx.font = font;
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    words.forEach(word => {
        const testLine = currentLine ? (currentLine + ' ' + word) : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    if (currentLine) lines.push(currentLine);
    ctx.restore();
    return lines;
}

function wrapText(text, maxWidth) {
    if (!text && text !== 0) return [''];
    const lines = wrapTextLines(text, maxWidth, '12px "Press Start 2P"');
    if (lines.length === 0) return [''];
    const chunks = [];
    for (let i = 0; i < lines.length; i += 3) {
        chunks.push(lines.slice(i, i + 3).join('\n'));
    }
    return chunks;
}

function getCurrentBackground() {
    switch (currentPhase) {
        case PHASES.DEPARTURE_CUTSCENE: return departureBgImg;
        case PHASES.MINIGAME_PLAY:
            const gameType = minigameOrder[currentMinigameIndex];
            if (gameType === 'chicken') return farmBgImg;
            if (gameType === 'cheese') return marketStallImg;
            return null;
        case PHASES.THE_CONFRONTATION:
        case PHASES.ON_YOUR_OWN:
            return currentPhase === PHASES.ON_YOUR_OWN ? onYourOwnBgImg : confrontationBgImg;
        case PHASES.SEPARATE_WAYS:
            if (typeof separateWaysState !== 'undefined') {
                const elapsed = Date.now() - separateWaysState.startTime;
                const currentCycle = Math.floor(elapsed / 5000);
                return (currentCycle % 2 === 0) ? companionSitsBg : playerSitsBg;
            }
            return null;
        case PHASES.TOGETHER_AGAIN: return companionSitsBg;
        default: return null;
    }
}

function captureScreen() {
    try {
        const dataURL = canvas.toDataURL();
        const img = new Image();
        img.src = dataURL;
        screenCaptures.push(img);
        if (screenCaptures.length > 20) screenCaptures.shift();
    } catch (e) {
        console.warn("Could not capture screen, using background fallback");
        const bg = getCurrentBackground();
        if (bg && bg.src && !(bg instanceof HTMLVideoElement)) {
            const img = new Image();
            img.src = bg.src;
            screenCaptures.push(img);
            if (screenCaptures.length > 20) screenCaptures.shift();
        }
    }
}
