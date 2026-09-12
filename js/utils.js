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
    if (typeof currentPhase === 'undefined') return null;

    if (currentPhase === PHASES.MINIGAME_PLAY || currentPhase === PHASES.MINIGAME_MAP) {
        const gameType = (typeof minigameOrder !== 'undefined' && typeof currentMinigameIndex !== 'undefined') ? minigameOrder[currentMinigameIndex] : null;
        if (gameType === 'chicken') return farmBgImg;
        if (gameType === 'cheese') return marketStallImg;
        if (gameType === 'bump') return bumperCarLotImg;
        if (gameType === 'fish') return fishingBgImg;
        if (gameType === 'golf') return (typeof golfGreenImgs !== 'undefined' && golfGreenImgs[1]) ? golfGreenImgs[1] : countryRoadImg;
        if (gameType === 'karaoke') return countryRoadImg;
        if (gameType === 'math') return countryRoadImg;
        if (gameType === 'jeopardy') return canadaMapImg;
        if (gameType === 'goose') return canadaMapImg;
        if (gameType === 'climb') return boulderImg;
        return canadaMapImg;
    }

    switch (currentPhase) {
        case PHASES.DEPARTURE_CUTSCENE: return departureBgImg;
        case PHASES.IN_THE_CAR: return countryRoadImg;
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
        const bg = getCurrentBackground();
        if (bg && bg.src && !(bg instanceof HTMLVideoElement)) {
            const img = new Image();
            img.src = bg.src;
            screenCaptures.push(img);
            if (screenCaptures.length > 20) screenCaptures.shift();
        }
    }
}

function getCanvasPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function drawTouchButton(x, y, w, h, text, options = {}) {
    ctx.save();
    ctx.fillStyle = options.bgColor || '#222222';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = options.borderColor || '#FFFFFF';
    ctx.lineWidth = options.borderWidth || 3;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = options.textColor || '#FFFFFF';
    ctx.font = options.font || '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
}

function getPlaythroughCount() {
    try {
        if (typeof localStorage !== 'undefined') {
            const val = localStorage.getItem('wanderlust_playthrough_count');
            if (val !== null) {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) return parsed;
            }
        }
    } catch (e) {}
    try {
        if (typeof document !== 'undefined' && document.cookie) {
            const match = document.cookie.match(/(?:^|; )wanderlust_playthrough_count=([^;]*)/);
            if (match) {
                const parsed = parseInt(match[1], 10);
                if (!isNaN(parsed)) return parsed;
            }
        }
    } catch (e) {}
    return 0;
}

function incrementPlaythroughCount() {
    const current = getPlaythroughCount();
    const next = current + 1;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('wanderlust_playthrough_count', next.toString());
        }
    } catch (e) {}
    try {
        if (typeof document !== 'undefined') {
            document.cookie = `wanderlust_playthrough_count=${next}; path=/; max-age=315360000`;
        }
    } catch (e) {}
    return next;
}


