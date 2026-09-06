describe('Minigame Manager (js/minigames/minigame_manager.js)', () => {
    const ALL_MINIGAMES = ['chicken', 'math', 'karaoke', 'cheese', 'bump', 'fish', 'golf', 'jeopardy', 'goose'];

    function clearAllActiveDialogs() {
        while (typeof currentDialog !== 'undefined' && currentDialog !== null) {
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback; currentDialog = null; dialogCallback = null; if (cb) cb();
            }
        }
    }

    it('startMinigame initializes state correctly for all minigame types', () => {
        ALL_MINIGAMES.forEach(type => {
            minigameOrder = [type, 'math', 'karaoke'];
            currentMinigameIndex = 0;
            selectedIndex = 0;

            startMinigame();
            assert(minigameState !== null, `minigameState should be initialized for ${type}`);
            assertEquals(minigameState.type, type, `minigameState.type should be ${type}`);
            assertEquals(minigameState.successes, 0, `Initial successes for ${type} should be 0`);
            assertEquals(minigameState.failures, 0, `Initial failures for ${type} should be 0`);
            assertEquals(minigameState.gameOver, false, `Initial gameOver for ${type} should be false`);
        });
    });

    it('success() increments successes counter and adds score', () => {
        minigameState = { type: 'chicken', successes: 0, failures: 0, won: false };
        score = 500;

        success(100);
        assertEquals(minigameState.successes, 1, 'successes should increment to 1');
        assertEquals(score, 600, 'score should increase by 100');
    });

    it('success() triggers win state and +1000 point bonus at 4 successes', () => {
        minigameState = { type: 'math', successes: 3, failures: 0, won: false };
        score = 1000;

        success(100);
        assertEquals(minigameState.successes, 4, 'successes should reach 4');
        assertEquals(minigameState.won, true, 'won flag should be true');
        assertEquals(score, 2100, 'score should add 100 + 1000 bonus = 2100');
        assertEquals(currentPhase, PHASES.MINIGAME_POST, 'phase should transition to MINIGAME_POST');
    });

    it('failure() increments failure counter', () => {
        minigameState = { type: 'karaoke', successes: 0, failures: 0, won: false };
        failure();
        assertEquals(minigameState.failures, 1, 'failures should increment to 1');
    });

    it('failure() triggers loss state at 3 failures without win bonus', () => {
        minigameState = { type: 'karaoke', successes: 1, failures: 2, won: false };
        score = 500;

        failure();
        assertEquals(minigameState.failures, 3, 'failures should reach 3');
        assertEquals(minigameState.won, false, 'won flag should remain false');
        assertEquals(score, 500, 'score should not receive victory bonus on loss');
        assertEquals(currentPhase, PHASES.MINIGAME_POST, 'phase should transition to MINIGAME_POST');
    });

    it('endMinigame sets appropriate post-dialog for all minigames', () => {
        ALL_MINIGAMES.forEach(type => {
            minigameState = { type, successes: 4, failures: 0, won: true };
            endMinigame();
            assertEquals(currentPhase, PHASES.MINIGAME_POST, `endMinigame should set MINIGAME_POST phase for ${type}`);
        });
    });

    it('drawMinigameMap executes without throwing errors across all 3 stop indices', () => {
        minigameOrder = ['chicken', 'math', 'karaoke'];
        [0, 1, 2].forEach(index => {
            currentMinigameIndex = index;
            try {
                drawMinigameMap();
            } catch (err) {
                assert(false, `drawMinigameMap failed for stop index ${index}: ${err.message}`);
            }
        });
    });

    it('drawMinigamePlay executes without throwing errors for all minigames', () => {
        ALL_MINIGAMES.forEach(type => {
            minigameOrder = [type];
            currentMinigameIndex = 0;
            startMinigame();
            clearAllActiveDialogs();
            try {
                drawMinigamePlay();
            } catch (err) {
                assert(false, `drawMinigamePlay failed for ${type}: ${err.message}`);
            }
        });
    });
});
