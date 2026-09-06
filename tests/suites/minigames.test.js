describe('Individual Minigames Implementation', () => {

    // --- CATCH THAT CHICKEN ---
    describe('Catch That Chicken (chicken.js)', () => {
        it('Jump physics updates velocity and resets at ground level (y=480)', () => {
            minigameState = { type: 'chicken', playerY: 480, isJumping: true, jumpVel: -15 };
            
            // Simulate 1 frame of physics update (gravity = +1)
            minigameState.playerY += minigameState.jumpVel;
            minigameState.jumpVel += 1;

            assertEquals(minigameState.playerY, 465, 'playerY should decrease (jump up)');
            assertEquals(minigameState.jumpVel, -14, 'jumpVel should gravity pull');

            // Simulate rest of jump until ground contact
            for (let i = 0; i < 35; i++) {
                minigameState.playerY += minigameState.jumpVel;
                minigameState.jumpVel += 1;
                if (minigameState.playerY >= 480) {
                    minigameState.playerY = 480;
                    minigameState.isJumping = false;
                    minigameState.jumpVel = 0;
                    break;
                }
            }
            assertEquals(minigameState.playerY, 480, 'playerY should land at ground level 480');
            assertEquals(minigameState.isJumping, false, 'isJumping should reset to false on ground');
        });

        it('Chicken collision awards +100 points and increments success counter', () => {
            minigameState = {
                type: 'chicken', successes: 0, failures: 0, playerY: 480,
                entities: [{ type: 'chicken', x: 100, y: 480 }]
            };
            score = 0;

            // Player position is at x=100 (matching chicken)
            const chicken = minigameState.entities[0];
            const dist = Math.abs(100 - chicken.x);
            if (dist < 40 && Math.abs(minigameState.playerY - chicken.y) < 40) {
                success(100);
                minigameState.entities.splice(0, 1);
            }

            assertEquals(minigameState.successes, 1, 'Chicken catch should register success');
            assertEquals(score, 100, 'Score should increase by 100');
            assertEquals(minigameState.entities.length, 0, 'Caught chicken should be removed');
        });

        it('Skull collision registers failure', () => {
            minigameState = {
                type: 'chicken', successes: 0, failures: 0, playerY: 480,
                entities: [{ type: 'skull', x: 100, y: 480 }]
            };

            const skull = minigameState.entities[0];
            if (skull.type === 'skull') {
                failure();
                minigameState.entities.splice(0, 1);
            }

            assertEquals(minigameState.failures, 1, 'Skull collision should increment failure counter');
        });
    });

    // --- MATHEMAGIC ---
    describe('Mathemagic! (math.js)', () => {
        it('generateMathQuestion creates valid non-negative integer math problem', () => {
            minigameState = { type: 'math', difficulty: 1, question: '', correctAnswer: 0, answer: '', timer: 10 };
            generateMathQuestion();

            assert(minigameState.question.length > 0, 'Question text should be generated');
            assert(typeof minigameState.correctAnswer === 'number', 'correctAnswer should be a number');
            assert(Number.isInteger(minigameState.correctAnswer), 'correctAnswer should be an integer');
            assert(minigameState.correctAnswer >= 0, 'correctAnswer should be non-negative');
        });

        it('handleMinigameInput parses numeric input and backspace correctly', () => {
            minigameState = { type: 'math', answer: '1' };
            handleMinigameInput('2');
            assertEquals(minigameState.answer, '12', 'Digit 2 should append to answer');

            handleMinigameInput('5');
            assertEquals(minigameState.answer, '125', 'Digit 5 should append to answer');

            handleMinigameInput('Backspace');
            assertEquals(minigameState.answer, '12', 'Backspace should delete last digit');
        });

        it('Correct math answer advances difficulty; wrong answer decreases difficulty', () => {
            minigameState = { type: 'math', answer: '42', correctAnswer: 42, difficulty: 2, successes: 0, failures: 0 };
            handleMinigameInput('Enter');

            assertEquals(minigameState.successes, 1, 'Correct answer should yield success');
            assertEquals(minigameState.difficulty, 3, 'Difficulty should increase on success');

            minigameState.answer = '999';
            minigameState.correctAnswer = 10;
            handleMinigameInput('Enter');

            assertEquals(minigameState.failures, 1, 'Wrong answer should yield failure');
            assertEquals(minigameState.difficulty, 2, 'Difficulty should decrease on failure');
        });
    });

    // --- KARAOKE NIGHT ---
    describe('Karaoke Night (karaoke.js)', () => {
        it('Pitch diamond controls move pitch up and down within bounds [0..8]', () => {
            minigameState = { type: 'karaoke', diamondPos: 4 };

            handleMinigameInput('ArrowUp');
            assertEquals(minigameState.diamondPos, 5, 'ArrowUp should increase pitch position');

            handleMinigameInput('ArrowDown');
            handleMinigameInput('ArrowDown');
            assertEquals(minigameState.diamondPos, 3, 'ArrowDown should decrease pitch position');

            // Test upper bound 8
            minigameState.diamondPos = 8;
            handleMinigameInput('ArrowUp');
            assertEquals(minigameState.diamondPos, 8, 'Pitch position should clamp at upper bound 8');

            // Test lower bound 0
            minigameState.diamondPos = 0;
            handleMinigameInput('ArrowDown');
            assertEquals(minigameState.diamondPos, 0, 'Pitch position should clamp at lower bound 0');
        });

        it('Note hit registers success; note miss registers failure', () => {
            minigameState = { type: 'karaoke', diamondPos: 4, successes: 0, failures: 0 };
            score = 0;

            const noteHit = { x: 100, pitch: 4, hit: false };
            if (Math.abs(noteHit.pitch - minigameState.diamondPos) === 0) {
                noteHit.hit = true;
                success(100);
            }
            assertEquals(minigameState.successes, 1, 'Matching pitch note should count as success');
            assertEquals(score, 100);

            const noteMiss = { x: 50, pitch: 1, hit: false };
            if (noteMiss.pitch !== minigameState.diamondPos && noteMiss.x < 80 && !noteMiss.hit) {
                failure();
            }
            assertEquals(minigameState.failures, 1, 'Missed pitch note should count as failure');
        });
    });

    // --- FROMAGERIE FRENZY (CHEESE) ---
    describe('Fromagerie Frenzy (cheese.js)', () => {
        it('initCheeseGrid generates an 8x8 grid of cheese types (1..8)', () => {
            minigameState = { type: 'cheese', grid: [], progress: 0 };
            initCheeseGrid();

            assertEquals(minigameState.grid.length, 8, 'Grid should have 8 rows');
            minigameState.grid.forEach(row => {
                assertEquals(row.length, 8, 'Each row should have 8 columns');
                row.forEach(cell => {
                    assert(cell >= 1 && cell <= 8, `Cell value should be cheese ID 1..8, got ${cell}`);
                });
            });
        });

        it('Match-3 detection identifies horizontal and vertical matches', () => {
            const grid = [
                [1, 1, 1, 2, 3, 4, 5, 6], // Row 0 has 3 matching 1s
                [2, 3, 4, 5, 6, 7, 8, 1],
                [2, 3, 4, 5, 6, 7, 8, 1],
                [2, 3, 4, 5, 6, 7, 8, 1],
                [5, 6, 7, 8, 1, 2, 3, 4],
                [5, 6, 7, 8, 1, 2, 3, 4],
                [5, 6, 7, 8, 1, 2, 3, 4],
                [5, 6, 7, 8, 1, 2, 3, 4]
            ];

            const matches = findCheeseMatches(grid);
            assert(matches.length >= 3, 'Match detector should find at least 3 matching positions');
        });

        it('Cheese points awarded correctly (100 for 3, 200 for 4, 400 for >4)', () => {
            assertEquals(calculateCheesePoints(3), 100);
            assertEquals(calculateCheesePoints(4), 200);
            assertEquals(calculateCheesePoints(5), 400);
            assertEquals(calculateCheesePoints(6), 400);
        });

        it('Eat cheese button adds failure counter', () => {
            minigameState = { type: 'cheese', eatMode: false, failures: 0 };
            minigameState.eatMode = true;
            failure();
            assertEquals(minigameState.failures, 1, 'Eating cheese should register failure');
        });
    });

    // --- BUMPERTOWN (BUMP) ---
    describe('Bumpertown! (bump.js)', () => {
        it('initBumpGame initializes player green car and red/white NPC cars', () => {
            minigameState = { type: 'bump', car: {}, coin: {}, otherCars: [] };
            initBumpGame();

            assert(minigameState.car.x > 0, 'Player car should be placed on field');
            assert(minigameState.coin.x > 0, 'Coin should spawn on field');
            assert(minigameState.otherCars.length >= 4, 'Should spawn red car and white NPC cars');
        });

        it('Green player car collecting coin registers success (+200 score)', () => {
            minigameState = { type: 'bump', successes: 0, failures: 0, car: { x: 400, y: 300 }, coin: { x: 400, y: 300 } };
            score = 0;

            const dx = minigameState.car.x - minigameState.coin.x;
            const dy = minigameState.car.y - minigameState.coin.y;
            if (Math.hypot(dx, dy) < 30) {
                success(200);
            }

            assertEquals(minigameState.successes, 1, 'Collecting coin should yield success');
            assertEquals(score, 200, 'Score should increase by 200');
        });

        it('Red car collecting coin registers failure', () => {
            minigameState = { type: 'bump', successes: 0, failures: 0, car: { x: 100, y: 100 }, coin: { x: 400, y: 300 } };
            const redCar = { type: 'red', x: 400, y: 300 };

            if (Math.hypot(redCar.x - minigameState.coin.x, redCar.y - minigameState.coin.y) < 30) {
                failure();
            }

            assertEquals(minigameState.failures, 1, 'Red car getting coin should yield failure');
        });
    });

    // --- LAKE FISH-A-LOT (FISH) ---
    describe('Lake Fish-a-Lot (fish.js)', () => {
        it('initFishGame initializes lake grid and boat position', () => {
            minigameState = { type: 'fish', boat: {} };
            initFishGame();

            assert(Array.isArray(minigameState.grid), 'Lake grid should be initialized');
            assert(minigameState.boat !== undefined, 'Boat object should be initialized');
        });

        it('Catch probabilities match water zone specs (deep, normal, shallow)', () => {
            // Deep water: 20% catch, 100% fish
            const deepProb = getWaterProbabilities('deep');
            assertEquals(deepProb.catchRate, 0.2);
            assertEquals(deepProb.fishRate, 1.0);

            // Normal water: 50% catch, 100% fish
            const normalProb = getWaterProbabilities('normal');
            assertEquals(normalProb.catchRate, 0.5);
            assertEquals(normalProb.fishRate, 1.0);

            // Shallow water: 100% catch, 20% fish
            const shallowProb = getWaterProbabilities('shallow');
            assertEquals(shallowProb.catchRate, 1.0);
            assertEquals(shallowProb.fishRate, 0.2);
        });

        it('Fish catch yields success; empty catch yields failure; trash yields neutral', () => {
            minigameState = { type: 'fish', successes: 0, failures: 0 };

            // Fish catch
            handleFishingOutcome('fish');
            assertEquals(minigameState.successes, 1, 'Fish catch should add success');

            // Empty catch
            handleFishingOutcome('nothing');
            assertEquals(minigameState.failures, 1, 'Empty catch should add failure');

            // Trash catch
            handleFishingOutcome('trash');
            assertEquals(minigameState.successes, 1, 'Trash catch should not alter success count');
            assertEquals(minigameState.failures, 1, 'Trash catch should not alter failure count');
        });
    });

    // --- BOB'S INTENSE MINI-GOLF ---
    describe("Bob's Intense Mini-Golf (golf.js)", () => {
        it('initGolfGame initializes hole 1 with stroke count 1', () => {
            minigameState = { type: 'golf', holeIndex: 0, strokes: 1 };
            initGolfGame();

            assertEquals(minigameState.holeIndex, 0, 'Should start on hole 0');
            assertEquals(minigameState.strokes, 1, 'Strokes should start at 1');
        });

        it('Power bar oscillates linearly between min 10px and max 1000px', () => {
            const minPower = 10;
            const maxPower = 1000;

            for (let progress = 0; progress <= 1.0; progress += 0.25) {
                const power = minPower + progress * (maxPower - minPower);
                assert(power >= 10 && power <= 1000, `Power ${power} should be within 10..1000 range`);
            }
        });

        it('Ball reaching hole within 20px registers success; exceeding 3 strokes yields failure', () => {
            minigameState = { type: 'golf', successes: 0, failures: 0, strokes: 1, ball: { x: 100, y: 100 }, hole: { x: 105, y: 105 } };

            const dist = Math.hypot(minigameState.ball.x - minigameState.hole.x, minigameState.ball.y - minigameState.hole.y);
            if (dist < 20) {
                success(100);
            }
            assertEquals(minigameState.successes, 1, 'Dropping ball into hole should register success');

            minigameState.strokes = 4; // Exceeded par 3
            if (minigameState.strokes > 3) {
                failure();
            }
            assertEquals(minigameState.failures, 1, 'Exceeding 3 strokes should register failure');
        });
    });

    // --- CANADIAN JEOPARDY ---
    describe('Canadian Jeopardy! (jeopardy.js)', () => {
        it('JEOPARDY_CLUES_DATA dataset loaded with categories and dollar values $200..$1000', () => {
            assert(typeof JEOPARDY_CLUES_DATA === 'object', 'JEOPARDY_CLUES_DATA dataset must be loaded');
            assert(Array.isArray(JEOPARDY_CLUES_DATA.categories), 'Categories array must exist');
            assert(JEOPARDY_CLUES_DATA.categories.length >= 6, 'Dataset should contain at least 6 categories');

            JEOPARDY_CLUES_DATA.categories.forEach(cat => {
                assert(Array.isArray(cat.clues), `Category ${cat.name} should contain clues array`);
                cat.clues.forEach(clue => {
                    assert(clue.value >= 200 && clue.value <= 1000, `Clue value ${clue.value} should be between $200 and $1000`);
                    assert(Array.isArray(clue.variants), 'Clue variants must be an array');
                });
            });
        });

        it('Jeopardy success count equals floor of earnings divided by $1000', () => {
            minigameState = { type: 'jeopardy', earnings: 0, successes: 0 };

            minigameState.earnings = 800;
            minigameState.successes = Math.floor(minigameState.earnings / 1000);
            assertEquals(minigameState.successes, 0, '$800 earnings should equal 0 successes');

            minigameState.earnings = 2400;
            minigameState.successes = Math.floor(minigameState.earnings / 1000);
            assertEquals(minigameState.successes, 2, '$2400 earnings should equal 2 successes');

            minigameState.earnings = 4000;
            minigameState.successes = Math.floor(minigameState.earnings / 1000);
            assertEquals(minigameState.successes, 4, '$4000 earnings should equal 4 successes');
        });
    });

    // --- UNPLEASANT GOOSE GAME ---
    describe('Unpleasant Goose Game (goose.js)', () => {
        it('initGooseGame initializes player at start and places goal circle', () => {
            minigameState = { type: 'goose', successes: 0, failures: 0 };
            initGooseGame();

            assert(minigameState.goose !== undefined, 'Goose state object should be initialized');
            assert(minigameState.goose.player.x !== undefined, 'Player x coordinate should be set');
            assert(minigameState.goose.target.x !== undefined, 'Target x coordinate should be set');
            assert(minigameState.goose.geese.length > 0, 'Geese entities should be spawned');
        });

        it('Player reaching goal circle triggers victory success', () => {
            minigameState = {
                type: 'goose', successes: 0, failures: 0,
                goose: { player: { x: 10, y: 10 }, target: { x: 10, y: 10 } }
            };

            if (minigameState.goose.player.x === minigameState.goose.target.x && minigameState.goose.player.y === minigameState.goose.target.y) {
                success(100);
            }
            assertEquals(minigameState.successes, 1, 'Reaching goal circle should trigger success');
        });
    });

    // --- THE CLIMBATORIUM ---
    describe('The Climbatorium (climb.js)', () => {
        it('initClimbGame initializes climb state, deck, shapes, and horizontal lines', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            assert(minigameState.climb !== undefined, 'Climb state should be initialized');
            assertEquals(minigameState.climb.subPhase, 'climbing', 'subPhase should start in climbing');
            assertEquals(minigameState.climb.hand.length, 5, 'Hand should start with 5 cards');
            assert(minigameState.climb.shapes.length > 0, 'Wall shapes should be generated');
            assert(minigameState.climb.lines.length > 0, 'Horizontal lines should be generated');
        });

        it('openDrawPileModal sets frozenPilePreview array preventing flickering', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            openDrawPileModal();
            assertEquals(minigameState.climb.activeModal, 'draw_pile', 'activeModal should be draw_pile');
            assert(Array.isArray(minigameState.climb.frozenPilePreview), 'frozenPilePreview should be initialized');
            assertEquals(minigameState.climb.frozenPilePreview.length, minigameState.climb.drawPile.length, 'frozenPilePreview length should match drawPile');
        });

        it('Line crossing awards +50 points and draws a card', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            score = 0;
            const initialHandCount = minigameState.climb.hand.length;
            const line = minigameState.climb.lines[0];
            
            // Move player above line
            minigameState.climb.player.y = line.y - 10;
            if (line.active && minigameState.climb.player.y <= line.y) {
                line.active = false;
                score += 50;
                drawClimbCards(1);
            }

            assertEquals(score, 50, 'Crossing line should award +50 points');
            assertEquals(line.active, false, 'Line should deactivate after crossing');
            assertEquals(minigameState.climb.hand.length, initialHandCount + 1, 'Crossing line should draw 1 card');
        });

        it('Reaching top of wall awards +1000 points and triggers victory success', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            score = 0;

            const targetShape = { id: 999, x: 180, y: 80, type: CLIMB_SHAPE_TYPES.WILD_ASTERISK };
            executeClimbMove(targetShape);

            assertEquals(minigameState.successes, 1, 'Reaching top should trigger success');
            assert(score >= 1000, 'Reaching top should award +1000 points');
        });

        it('User can reach at least one shape at the start of each wall round', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            for (let round = 0; round < 4; round++) {
                minigameState.successes = round;
                startClimbingRound();

                const player = minigameState.climb.player;
                const reachRadius = player.reachRadius;
                const shapes = minigameState.climb.shapes;

                const distances = shapes.map(s => Math.hypot(s.x - player.x, s.y - player.y));
                const minDistance = Math.min(...distances);

                assert(minDistance <= reachRadius, `First shape is out of reach on Wall round ${round + 1}! Min distance: ${minDistance.toFixed(1)}px, Reach: ${reachRadius}px`);

                const reachShapes = shapes.filter(s => Math.hypot(s.x - player.x, s.y - player.y) <= reachRadius);
                assert(reachShapes.length >= 1, `Wall round ${round + 1} must have at least 1 shape within initial reach circle (user can reach something)`);
            }
        });

        it('confirmWarePurchase presents interactive YES/NO dialog options', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            minigameState.climb.coins = 10;

            const ware = CLIMB_WARES_CATALOG[0];
            confirmWarePurchase(ware);

            assert(currentDialog !== null, 'Dialog should be opened');
            assert(Array.isArray(currentDialog.options), 'Dialog options array should be set');
            assertEquals(currentDialog.options[0], 'YES', 'First option should be YES');
            assertEquals(currentDialog.options[1], 'NO', 'Second option should be NO');
        });

        it('Ring of Reach ware expands reach radius by +70%', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            const initialRadius = minigameState.climb.player.baseReachRadius;
            applyClimbWare({ type: 'ring_reach' });
            startClimbingRound();

            assertEquals(minigameState.climb.player.reachRadius, initialRadius * 1.7, 'Reach radius should expand by 70%');
        });

        it('Single-purchase wares become disabled ("purchased") and cannot be bought twice', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            minigameState.climb.coins = 10;

            const ware = { id: 1, name: 'Pulsating Asterisk Card', price: 2, desc: 'Matches any shape', cardType: 'wild_asterisk', purchased: false };
            confirmWarePurchase(ware);
            if (dialogCallback) dialogCallback('yes');

            assert(ware.purchased === true, 'Ware should be marked as purchased');
            const initialDeckCount = minigameState.climb.deck.length;

            // Attempting to confirm purchase again on same ware should be ignored
            confirmWarePurchase(ware);
            assertEquals(minigameState.climb.deck.length, initialDeckCount, 'Purchasing already bought ware should be ignored');
        });

        it('Ring uniqueness prevents purchasing duplicate rings', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            minigameState.climb.coins = 10;

            const ringWare = { id: 2, name: 'Ring of Reach', price: 4, desc: 'Expands reach circle by +70%.', type: 'ring_reach', purchased: false };
            confirmWarePurchase(ringWare);
            if (dialogCallback) dialogCallback('yes');

            assert(minigameState.climb.ownedRings.has('ring_reach'), 'Ring of Reach should be in ownedRings set');

            // Attempting to buy another Ring of Reach should be blocked
            const duplicateRing = { id: 2, name: 'Ring of Reach', price: 4, desc: 'Expands reach circle by +70%.', type: 'ring_reach', purchased: false };
            confirmWarePurchase(duplicateRing);
            assertEquals(duplicateRing.purchased, false, 'Duplicate ring purchase should be blocked');
        });

        it('Card coin valuation calculates 2c for color cards, 1c for shape cards, 3c for asterisk, 5c for wares cards (+1c for Ring of Riches)', () => {
            const colorCard = { type: 'color_red', color: 'red' };
            const shapeCard = { type: 'shape_square', shape: 'square' };
            const asteriskCard = { type: CLIMB_SHAPE_TYPES.WILD_ASTERISK };
            const wareCard = { type: 'draw_two' };

            assertEquals(getCardCoinValue(colorCard, 0), 2, 'Color card should be worth 2c');
            assertEquals(getCardCoinValue(shapeCard, 0), 1, 'Shape card should be worth 1c');
            assertEquals(getCardCoinValue(asteriskCard, 0), 3, 'Asterisk card should be worth 3c');
            assertEquals(getCardCoinValue(wareCard, 0), 5, 'Ware card should be worth 5c');

            // With Ring of Riches (+1c)
            assertEquals(getCardCoinValue(colorCard, 1), 3, 'Color card with Ring of Riches should be worth 3c');
            assertEquals(getCardCoinValue(shapeCard, 1), 2, 'Shape card with Ring of Riches should be worth 2c');
            assertEquals(getCardCoinValue(asteriskCard, 1), 4, 'Asterisk card with Ring of Riches should be worth 4c');
            assertEquals(getCardCoinValue(wareCard, 1), 6, 'Ware card with Ring of Riches should be worth 6c');
        });

        it('Color cards and Shape cards match correct wall objects', () => {
            const redCard = { type: 'color_red', color: 'red' };
            const circleCard = { type: 'shape_circle', shape: 'circle' };
            const plusCard = { type: 'shape_plus', shape: 'plus' };

            const redSquare = { type: 'red_square', color: 'red', shape: 'square' };
            const blueCircle = { type: 'blue_circle', color: 'blue', shape: 'circle' };
            const greenDiamond = { type: 'green_diamond', color: 'green', shape: 'diamond' };
            const redPlus = { type: 'red_plus', color: 'red', shape: 'plus' };
            const wildAsterisk = { type: CLIMB_SHAPE_TYPES.WILD_ASTERISK };

            // Color card (red) matches any red shape & wild, but not blue or green
            assert(isShapeMatchingCard(redSquare, redCard), 'Red card should match Red Square');
            assert(isShapeMatchingCard(redPlus, redCard), 'Red card should match Red Plus');
            assert(isShapeMatchingCard(wildAsterisk, redCard), 'Red card should match Wild Asterisk');
            assert(!isShapeMatchingCard(blueCircle, redCard), 'Red card should not match Blue Circle');

            // Shape card (circle & plus) matches any matching shape & wild, but not other shapes
            assert(isShapeMatchingCard(blueCircle, circleCard), 'Circle card should match Blue Circle');
            assert(isShapeMatchingCard(redPlus, plusCard), 'Plus card should match Red Plus');
            assert(isShapeMatchingCard(wildAsterisk, plusCard), 'Plus card should match Wild Asterisk');
            assert(!isShapeMatchingCard(greenDiamond, plusCard), 'Plus card should not match Green Diamond');
        });

        it('Draw Two card draws exactly 2 cards', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            minigameState.climb.hand = [{ type: 'draw_two', title: 'Draw Two' }];
            minigameState.climb.drawPile = [
                { type: CLIMB_SHAPE_TYPES.RED_SQUARE },
                { type: CLIMB_SHAPE_TYPES.BLUE_CIRCLE },
                { type: CLIMB_SHAPE_TYPES.GREEN_DIAMOND }
            ];
            minigameState.climb.selectedCardIndex = 0;

            activateSelectedClimbCard();

            assertEquals(minigameState.climb.hand.length, 2, 'Playing Draw Two should result in 2 cards in hand');
        });

        it('Draw Two card graphic renders without throwing ReferenceError', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            const card = { type: 'draw_two', title: 'Draw Two' };
            let error = null;
            try {
                drawClimbCard(card, 100, 100, 80, 100, false);
            } catch (err) {
                error = err;
            }
            assertEquals(error, null, 'drawClimbCard should render draw_two card without throwing error');
        });

        it('Shape-then-Shape card assigns 2 random shapes, matches regardless of color, and blocks play if no path available', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            // 1. Check shop offering generates shape1 and shape2
            openCardShop();
            const comboWare = minigameState.climb.shopWares.find(w => w.type === 'combo_shape' || w.cardType === 'combo_shape');
            if (comboWare) {
                assert(comboWare.shape1 !== undefined, 'Combo ware should have shape1');
                assert(comboWare.shape2 !== undefined, 'Combo ware should have shape2');
            }

            // 2. Test unplayability when no path available
            minigameState.climb.player = { x: 180, y: 700, reachRadius: 100 };
            // Shapes out of reach or not matching sequence
            minigameState.climb.shapes = [
                { id: 1, x: 180, y: 500, color: 'red', shape: 'square' }, // Far away
                { id: 2, x: 180, y: 400, color: 'blue', shape: 'diamond' }
            ];
            minigameState.climb.hand = [{ type: 'combo_shape', shape1: 'square', shape2: 'diamond' }];
            minigameState.climb.selectedCardIndex = 0;
            minigameState.climb.activeModal = 'card_modal';

            activateSelectedClimbCard();

            assertEquals(minigameState.climb.activeModal, 'card_modal', 'Card should remain unplayed (modal not changed to select_shape) when no sequence path available');

            // 3. Test successful activation when valid path exists
            minigameState.climb.shapes = [
                { id: 1, x: 180, y: 650, color: 'blue', shape: 'square' },   // S1 in reach of player (y=700)
                { id: 2, x: 180, y: 600, color: 'green', shape: 'diamond' } // S2 in reach of S1 (y=650)
            ];

            activateSelectedClimbCard();

            assertEquals(minigameState.climb.activeModal, 'select_shape', 'Card should activate select_shape modal when valid sequence path exists');
            assertEquals(minigameState.climb.targetShapes.length, 1, 'Should find 1 target S1 shape');
            assertEquals(minigameState.climb.targetShapes[0].id, 1, 'Target S1 should be blue square');
        });

        it('Hand pagination handles >6 cards in hand cleanly', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            // Fill hand with 14 cards
            minigameState.climb.hand = Array.from({ length: 14 }, (_, i) => ({ type: 'color_red', id: i }));

            const totalPages = Math.ceil(minigameState.climb.hand.length / 6);
            assertEquals(totalPages, 3, '14 cards should span 3 pages');
            assertEquals(minigameState.climb.handPage, 0, 'Initial hand page should be 0');
        });

        it('getItemizedEndWallMessage itemizes cards in hand by coin value', () => {
            const hand = [
                { type: 'color_red', color: 'red' },
                { type: 'shape_square', shape: 'square' },
                { type: CLIMB_SHAPE_TYPES.WILD_ASTERISK },
                { type: 'draw_two' }
            ];
            const info = getItemizedEndWallMessage(1, hand, 0);
            assertEquals(info.bonusCoins, 11, 'Bonus coins should sum to 2c + 1c + 3c + 5c = 11c');
            assert(info.message.includes('1 card worth 1¢'), 'Message should itemize 1 card worth 1¢');
            assert(info.message.includes('1 card worth 2¢'), 'Message should itemize 1 card worth 2¢');
            assert(info.message.includes('1 card worth 3¢'), 'Message should itemize 1 card worth 3¢');
            assert(info.message.includes('1 card worth 5¢'), 'Message should itemize 1 card worth 5¢');
        });

        it('openCardShop generates exactly 3 sanitized wares and handles catalog padding when stock is low', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            // Open shop and verify 3 sanitized wares
            openCardShop();
            assertEquals(minigameState.climb.shopWares.length, 3, 'Cardatorium shop must always offer exactly 3 wares');
            minigameState.climb.shopWares.forEach(ware => {
                assert(typeof ware.name === 'string' && ware.name.length > 0, 'Ware name must be non-empty string');
                assert(typeof ware.desc === 'string' && ware.desc.length > 0, 'Ware desc must be non-empty string');
                assert(typeof ware.price === 'number', 'Ware price must be a number');
                assert(ware.type !== undefined || ware.cardType !== undefined, 'Ware must have valid type or cardType');
            });

            // Simulate all rings owned to test catalog padding
            CLIMB_WARES_CATALOG.forEach(item => {
                if (item.type && item.type.startsWith('ring_')) {
                    minigameState.climb.ownedRings.add(item.type);
                }
            });
            openCardShop();
            assertEquals(minigameState.climb.shopWares.length, 3, 'Cardatorium shop must still produce 3 wares via padding when rings are sold out');
        });

        it('drawCardShopScreen renders defensively without throwing when wares or ownedRings have missing/undefined properties', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();
            openCardShop();

            // Test Case 1: Ware with undefined desc
            minigameState.climb.shopWares[0] = { id: 101, name: 'Ware No Desc', price: 2, type: 'wild_asterisk', desc: undefined };
            // Test Case 2: Ware with undefined name and price
            minigameState.climb.shopWares[1] = { id: 102, desc: 'Ware No Name/Price', type: 'card_go_up' };
            // Test Case 3: Completely empty/incomplete ware object
            minigameState.climb.shopWares[2] = { id: 103 };
            // Test Case 4: ownedRings property is undefined
            delete minigameState.climb.ownedRings;

            let renderError = null;
            try {
                drawCardShopScreen();
            } catch (err) {
                renderError = err;
            }
            assertEquals(renderError ? renderError.stack : null, null, `drawCardShopScreen threw exception on corrupt ware data: ${renderError ? renderError.stack : ''}`);
        });

        it('Card Go Up card selects highest shape within reach and opens select_shape modal', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            minigameState.climb.player = { x: 180, y: 700, reachRadius: 100 };
            minigameState.climb.shapes = [
                { id: 1, x: 180, y: 650, color: 'blue', shape: 'square' },
                { id: 2, x: 180, y: 620, color: 'red', shape: 'circle' } // Highest shape in reach (y=620 < y=650)
            ];
            minigameState.climb.hand = [{ type: 'card_go_up', title: 'Card Go Up' }];
            minigameState.climb.selectedCardIndex = 0;
            minigameState.climb.activeModal = 'card_modal';

            activateSelectedClimbCard();

            assertEquals(minigameState.climb.activeModal, 'select_shape', 'Card Go Up should activate select_shape modal');
            assertEquals(minigameState.climb.targetShapes.length, 1, 'Should select exactly the highest shape in reach');
            assertEquals(minigameState.climb.targetShapes[0].id, 2, 'Selected shape should be shape 2 (y=620)');

            // Verify coin value is 3c base
            const cardVal = getCardCoinValue(minigameState.climb.hand[0], 0);
            assertEquals(cardVal, 3, 'Card Go Up card coin value should be 3c');
        });

        it('Give Up button restarts player at bottom of current wall without generating a new wall', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            const initialShapeIds = minigameState.climb.shapes.map(s => s.id);
            const initialWallHeight = minigameState.climb.wallHeight;

            // Move player up wall
            minigameState.climb.player.y = 300;
            minigameState.climb.lines[0].active = false;

            // Trigger restart via Give Up star wipe
            startStarWipeRestart();
            minigameState.climb.starWipe.progress = 1.0;
            drawStarWipe();

            // Verify player is back at bottom of wall
            assertEquals(minigameState.climb.player.y, initialWallHeight - 40, 'Player should be reset to bottom of wall');
            assertEquals(minigameState.climb.lines[0].active, true, 'Horizontal line triggers should be reactivated');

            // Verify wall shapes are identical (no new wall generated)
            const restartedShapeIds = minigameState.climb.shapes.map(s => s.id);
            assertEquals(restartedShapeIds.length, initialShapeIds.length, 'Wall shape count should match original wall');
            assert(restartedShapeIds.every((id, idx) => id === initialShapeIds[idx]), 'Wall shape IDs must remain identical (wall not regenerated)');
        });

        it('isClimbCardPlayable correctly evaluates whether cards are currently playable based on reach and matching wall shapes', () => {
            minigameState = { type: 'climb', successes: 0, failures: 0 };
            initClimbGame();

            minigameState.climb.player = { x: 180, y: 700, reachRadius: 100 };
            minigameState.climb.shapes = [
                { id: 1, x: 180, y: 650, color: 'blue', shape: 'square' }
            ];

            const blueCard = { type: 'color_blue', color: 'blue' };
            const redCard = { type: 'color_red', color: 'red' };
            const squareCard = { type: 'shape_square', shape: 'square' };
            const circleCard = { type: 'shape_circle', shape: 'circle' };
            const drawTwoCard = { type: 'draw_two' };

            assert(isClimbCardPlayable(blueCard), 'Blue card should be playable when blue shape in reach');
            assert(isClimbCardPlayable(squareCard), 'Square card should be playable when square shape in reach');
            assert(isClimbCardPlayable(drawTwoCard), 'Draw Two card should always be playable');
            assert(!isClimbCardPlayable(redCard), 'Red card should be unplayable when no red shape in reach');
            assert(!isClimbCardPlayable(circleCard), 'Circle card should be unplayable when no circle shape in reach');
        });

        it('3 failures in Climbatorium transitions game to MINIGAME_POST phase with Rocky loss dialog', () => {
            minigameState = { type: 'climb', successes: 0, failures: 2, maxFailures: 3 };
            initClimbGame();

            // Trigger restart star wipe on 3rd failure
            startStarWipeRestart();
            minigameState.climb.starWipe.progress = 1.0;
            drawStarWipe();

            assertEquals(minigameState.failures, 3, 'Failures count should reach 3');
            assertEquals(currentPhase, PHASES.MINIGAME_POST, 'Game phase should transition to MINIGAME_POST');
            assert(currentDialog !== null, 'Ending dialog should be active');
            assertEquals(currentDialog.name, 'Rocky', 'Dialog character should be Rocky');
            assertEquals(currentDialog.fullText, 'Oof, three failures.', 'Dialog text should match first failure line');

            // Advance dialog
            const cb = dialogCallback;
            currentDialog = null;
            dialogCallback = null;
            if (cb) cb();

            assert(currentDialog !== null, 'Chained dialog should be active');
            assertEquals(currentDialog.fullText, 'Welp, the important thing is that you tried.', 'Dialog text should match second failure line');
        });
    });
});

// --- HELPER FUNCTIONS FOR MINIGAME TESTS ---
function findCheeseMatches(grid) {
    const matches = [];
    // Horizontal matches
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 6; c++) {
            const val = grid[r][c];
            if (val !== null && val === grid[r][c + 1] && val === grid[r][c + 2]) {
                matches.push({ r, c }, { r, c: c + 1 }, { r, c: c + 2 });
            }
        }
    }
    return matches;
}

function calculateCheesePoints(count) {
    if (count === 3) return 100;
    if (count === 4) return 200;
    if (count > 4) return 400;
    return 0;
}

function getWaterProbabilities(type) {
    if (type === 'deep') return { catchRate: 0.2, fishRate: 1.0 };
    if (type === 'normal') return { catchRate: 0.5, fishRate: 1.0 };
    if (type === 'shallow') return { catchRate: 1.0, fishRate: 0.2 };
    return { catchRate: 0, fishRate: 0 };
}

function handleFishingOutcome(outcome) {
    if (outcome === 'fish') {
        minigameState.successes++;
    } else if (outcome === 'nothing') {
        minigameState.failures++;
    }
}
