function initBumpGame() {
    minigameState.car = {
        x: 400, y: 300, 
        angle: -Math.PI / 2, 
        speed: 0,
        vx: 0, vy: 0,
        color: 'green'
    };
    minigameState.coin = { x: 0, y: 0, frame: 0 };
    spawnCoin();
    minigameState.otherCars = [
        { x: 200, y: 200, angle: Math.random() * Math.PI * 2, speed: 1.5, color: 'red', state: 'chasing', vx: 0, vy: 0 },
        { x: 600, y: 200, angle: Math.random() * Math.PI * 2, speed: 1.2, color: 'white', mode: 'random', vx: 0, vy: 0 },
        { x: 200, y: 400, angle: Math.random() * Math.PI * 2, speed: 1.2, color: 'white', mode: 'random', vx: 0, vy: 0 },
        { x: 600, y: 400, angle: Math.random() * Math.PI * 2, speed: 1.2, color: 'white', mode: 'random', vx: 0, vy: 0 },
        { x: 400, y: 500, angle: Math.random() * Math.PI * 2, speed: 1.2, color: 'white', mode: 'random', vx: 0, vy: 0 }
    ];
}

function spawnCoin() {
    const bounds = { x1: 100, y1: 100, x2: 700, y2: 500 };
    minigameState.coin.x = bounds.x1 + Math.random() * (bounds.x2 - bounds.x1);
    minigameState.coin.y = bounds.y1 + Math.random() * (bounds.y2 - bounds.y1);
}

function drawRotatedCar(img, x, y, angle, color) {
    const scale = 1.3; // 30% increase
    const drawSize = 60 * scale;

    if (!img || !img.complete || img.naturalWidth === 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = color;
        ctx.fillRect(-drawSize/3, -drawSize/6, drawSize*2/3, drawSize/3);
        ctx.restore();
        return;
    }

    let normAngle = (angle + Math.PI / 2) % (Math.PI * 2);
    if (normAngle < 0) normAngle += Math.PI * 2;
    let degrees = (normAngle * 180 / Math.PI);
    let rowIndex = Math.round(degrees / 22.5) % 16;

    ctx.drawImage(img, 0, rowIndex * 100, 100, 100, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
}

function drawBumpGame() {
    const state = minigameState;
    const car = state.car;
    // Scaled bounds based on rgb(101,101,101) logic
    const bounds = { x1: 50, y1: 50, x2: 750, y2: 550 };

    if (bumperCarLotImg.complete && bumperCarLotImg.naturalWidth > 0) {
        ctx.drawImage(bumperCarLotImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#666'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Update Player Car
    if (keysPressed.has('ArrowLeft')) car.angle -= 0.05;
    if (keysPressed.has('ArrowRight')) car.angle += 0.05;
    if (keysPressed.has('ArrowUp')) {
        car.speed = Math.min(car.speed + 0.1, 4);
        if (Math.random() < 0.1) audio.playSFX('engine');
    } else if (keysPressed.has('ArrowDown')) {
        car.speed = Math.max(car.speed - 0.2, -2);
        if (car.speed > 0) audio.playSFX('screech');
    } else {
        car.speed *= 0.98; 
    }

    // Combine directed velocity and skid velocity
    let targetVX = Math.cos(car.angle) * car.speed;
    let targetVY = Math.sin(car.angle) * car.speed;
    car.vx = car.vx * 0.9 + targetVX * 0.1;
    car.vy = car.vy * 0.9 + targetVY * 0.1;

    car.x += car.vx;
    car.y += car.vy;

    checkEnvCollision(car, true);

    const allCars = [car, ...state.otherCars];
    state.otherCars.forEach(other => {
        if (other.color === 'red') {
            const dx = state.coin.x - other.x;
            const dy = state.coin.y - other.y;
            const targetAngle = Math.atan2(dy, dx);
            let angleDiff = targetAngle - other.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            other.angle += angleDiff * 0.05;
            other.speed = 1.8;
        } else {
            if (Math.random() < 0.01) other.mode = Math.random() < 0.8 ? 'random' : 'chase';
            if (other.mode === 'chase') {
                let nearest = null, minDist = 1000;
                allCars.forEach(c => {
                    if (c === other) return;
                    const d = Math.sqrt((other.x - c.x)**2 + (other.y - c.y)**2);
                    if (d < minDist) { minDist = d; nearest = c; }
                });
                if (nearest) {
                    const dx = nearest.x - other.x, dy = nearest.y - other.y;
                    const targetAngle = Math.atan2(dy, dx);
                    let angleDiff = targetAngle - other.angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    other.angle += angleDiff * 0.04;
                }
            } else if (Math.random() < 0.03) other.angle += (Math.random() - 0.5) * 1.5;
            other.speed = 1.3;
        }
        
        let targetVX = Math.cos(other.angle) * other.speed;
        let targetVY = Math.sin(other.angle) * other.speed;
        other.vx = other.vx * 0.95 + targetVX * 0.05;
        other.vy = other.vy * 0.95 + targetVY * 0.05;
        other.x += other.vx;
        other.y += other.vy;

        checkEnvCollision(other, false);
    });

    // Bumper collisions with skidding
    for (let i = 0; i < allCars.length; i++) {
        for (let j = i + 1; j < allCars.length; j++) {
            const c1 = allCars[i], c2 = allCars[j];
            const dx = c2.x - c1.x, dy = c2.y - c1.y, dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 50) { // Increased hitbox for larger sprites
                const angle = Math.atan2(dy, dx);
                const overlap = 50 - dist;
                const force = 10; // "skid pretty far"
                
                c1.x -= Math.cos(angle) * overlap / 2;
                c1.y -= Math.sin(angle) * overlap / 2;
                c2.x += Math.cos(angle) * overlap / 2;
                c2.y += Math.sin(angle) * overlap / 2;
                
                c1.vx -= Math.cos(angle) * force;
                c1.vy -= Math.sin(angle) * force;
                c2.vx += Math.cos(angle) * force;
                c2.vy += Math.sin(angle) * force;
                
                if (c1 === car) c1.speed *= -0.5;
                if (c2 === car) c2.speed *= -0.5;
                
                audio.playSFX('kick');
            }
        }
    }

    if (Math.sqrt((car.x - state.coin.x)**2 + (car.y - state.coin.y)**2) < 45) { success(200); spawnCoin(); }
    const redCar = state.otherCars.find(c => c.color === 'red');
    if (Math.sqrt((redCar.x - state.coin.x)**2 + (redCar.y - state.coin.y)**2) < 45) { failure(); score = Math.max(0, score - 100); spawnCoin(); }

    if (coinImg.complete && coinImg.naturalWidth > 0) {
        const widths = [278, 244, 223, 178, 100, 178, 223, 244, 278];
        state.coin.frame = (state.coin.frame + 0.15) % widths.length;
        const cf = Math.floor(state.coin.frame), fw = widths[cf];
        let fx = 0; for (let i = 0; i < cf; i++) fx += widths[i];
        ctx.drawImage(coinImg, fx, 0, fw, 540, state.coin.x - 26, state.coin.y - 26, 52, 52); // 30% larger coin
    }

    allCars.forEach(c => {
        drawRotatedCar(window.carImgs[c.color], c.x, c.y, c.angle, c.color);
    });
}

function checkEnvCollision(c, isPlayer) {
    // 1. Left beige wall
    if (c.x < 73) {
        c.x = 73;
        c.vx *= -0.8;
        c.angle = Math.PI - c.angle;
        if (isPlayer) c.speed *= -0.5;
    }
    
    // 2. Right green zigzag
    const rightPhase = ((c.y - 120) % 40 + 40) % 40;
    const rightLimit = (rightPhase < 20) ? (713 + (rightPhase / 20) * 40) : (753 - ((rightPhase - 20) / 20) * 40);
    if (c.x > rightLimit) {
        c.x = rightLimit - 2;
        c.vx *= -0.8;
        c.angle = Math.PI - c.angle;
        if (isPlayer) c.speed *= -0.5;
    }
    
    // 3. Top white zigzag
    const topPhase = ((c.x - 60) % 80 + 80) % 80;
    const topLimit = (topPhase < 40) ? (82 + (topPhase / 40) * 20) : (102 - ((topPhase - 40) / 40) * 20);
    if (c.y < topLimit) {
        c.y = topLimit + 2;
        c.vy *= -0.8;
        c.angle = -c.angle;
        if (isPlayer) c.speed *= -0.5;
    }
    
    // 4. Bottom green zigzag
    const bottomPhase = ((c.x - 100) % 80 + 80) % 80;
    const bottomLimit = (bottomPhase < 40) ? (552 + (bottomPhase / 40) * 33) : (585 - ((bottomPhase - 40) / 40) * 33);
    if (c.y > bottomLimit) {
        c.y = bottomLimit - 2;
        c.vy *= -0.8;
        c.angle = -c.angle;
        if (isPlayer) c.speed *= -0.5;
    }
}
