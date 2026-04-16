const roadCentreY = 480;

function drawChickenGame() {
    const state = minigameState; 
    ctx.fillStyle = COLORS.SKY_BLUE; 
    ctx.fillRect(0, 0, canvas.width, 400);
    
    if (farmBgImg.complete) {
        state.parallax.bgX = (state.parallax.bgX - 0.5) % (canvas.width * 2);
        ctx.drawImage(farmBgImg, state.parallax.bgX, 0, canvas.width * 2, 400);
        ctx.drawImage(farmBgImg, state.parallax.bgX + canvas.width * 2, 0, canvas.width * 2, 400);
    }

    ctx.fillStyle = '#4a7a2a'; 
    ctx.fillRect(0, 400, canvas.width, 200);

    state.parallax.trees.forEach(t => {
        t.x -= 3; 
        if (t.x < -200) {
            t.x = canvas.width + Math.random() * 200;
            t.scale = 0.8 + Math.random() * 0.4;
            t.flipped = Math.random() < 0.5;
        }
        if (treeImg.complete) {
            ctx.save();
            const tw = 120 * t.scale, th = 180 * t.scale;
            if (t.flipped) {
                ctx.translate(t.x + tw, roadCentreY - 20); ctx.scale(-1, 1);
                drawPixelatedImage(treeImg, 0, 0, treeImg.width, treeImg.height, 0, -th, tw, th);
            } else {
                drawPixelatedImage(treeImg, 0, 0, treeImg.width, treeImg.height, t.x, roadCentreY - 20 - th, tw, th);
            }
            ctx.restore();
        }
    });

    if (countryRoadImg.complete) {
        const roadW = countryRoadImg.width;
        state.parallax.roadX = (state.parallax.roadX - 8) % roadW;
        for (let x = state.parallax.roadX; x < canvas.width + roadW; x += roadW) {
            ctx.drawImage(countryRoadImg, x, roadCentreY - 60);
        }
    }

    if (state.isJumping) { 
        state.playerY += state.jumpVel; state.jumpVel += 0.8; 
        if (state.playerY >= roadCentreY) { state.playerY = roadCentreY; state.isJumping = false; } 
    }
    
    const actorName = (CAST[selectedIndex] ? CAST[selectedIndex].actor : 'Peter').toLowerCase();
    const pcSheet = state.isJumping ? jumpSprites[actorName] : runSprites[actorName];
    if (pcSheet && pcSheet.complete) {
        state.frame = (state.frame + 0.2) % 6; 
        const frameX = Math.floor(state.frame) * 64;
        drawPixelatedImage(pcSheet, frameX, 3 * 64, 64, 64, 100, state.playerY - 120, 128, 128);
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center'; 
    ctx.fillText('Press Enter to Jump', canvas.width / 2, canvas.height - 30);

    state.entities.forEach(ent => {
        ent.x -= 8;
        if (ent.type === 'chicken') {
            ent.x += ent.speed;
            if (chickenSheetImg.complete) {
                ent.frame = (ent.frame + 0.2) % 16; 
                const fx = Math.floor(ent.frame) * 128;
                ctx.drawImage(chickenSheetImg, fx, 0, 128, 128, ent.x, roadCentreY - 50, 64, 64);
            }
        } else {
            if (skullImg.complete) ctx.drawImage(skullImg, 0, 0, skullImg.width, skullImg.height, ent.x, roadCentreY - 25, 40, 30);
        }
        
        if (Math.abs(ent.x - 100) < 40 && Math.abs(roadCentreY - state.playerY) < 50) {
            if (ent.type === 'skull') { if (!state.isJumping || state.playerY > roadCentreY - 40) { failure(); ent.x = -1000; } }
            else if (ent.type === 'chicken') { if (!state.isJumping || state.playerY > roadCentreY - 60) { success(); ent.x = -1000; } }
        }
    });
}
