function drawKaraokeGame() {
    const state = minigameState; ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; const staffTop = 250, lineSpacing = 30;
    for (let i = 0; i < 5; i++) { const y = staffTop + i * lineSpacing; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(750, y); ctx.stroke(); }
    
    if (gClefImg.complete) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 60; tempCanvas.height = 180;
        const tctx = tempCanvas.getContext('2d');
        tctx.drawImage(gClefImg, 0, 0, 60, 180);
        tctx.globalCompositeOperation = 'source-in';
        tctx.fillStyle = 'white';
        tctx.fillRect(0, 0, 60, 180);
        ctx.drawImage(tempCanvas, 60, staffTop - 40);
    } else { ctx.font = '60px Arial'; ctx.fillStyle = COLORS.WHITE; ctx.fillText('∮', 60, staffTop + 90); }

    const getY = (p) => staffTop + (10 - p) * 0.5 * lineSpacing;
    ctx.fillStyle = COLORS.GOLD; const dy = getY(state.diamondPos); 
    // Diamond at x = 150
    ctx.beginPath(); ctx.moveTo(150, dy - 15); ctx.lineTo(170, dy); ctx.lineTo(150, dy + 15); ctx.lineTo(130, dy); ctx.fill(); 

    state.notes.forEach(note => {
        note.x -= 4; if (note.x < 400 && note.color === 'red') note.color = 'white';
        ctx.fillStyle = note.hit ? COLORS.GREEN : note.color; 
        ctx.beginPath(); ctx.arc(note.x, getY(note.pitch), 10, 0, Math.PI * 2); ctx.fill();
        // Collision check at x = 150
        if (Math.abs(note.x - 150) < 15 && !note.hit) { if (note.pitch === state.diamondPos) { success(); note.hit = true; } }
        // Failure check if note passes diamond area
        if (note.x < 130 && !note.hit) { failure(); note.hit = true; note.color = COLORS.RED; }
    });
}
