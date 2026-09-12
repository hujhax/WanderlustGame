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

    function resetPlaythroughStorage() {
        try { if (typeof localStorage !== 'undefined') localStorage.clear(); } catch (e) {}
        try { if (typeof document !== 'undefined') document.cookie = 'wanderlust_playthrough_count=0; path=/; max-age=0'; } catch (e) {}
    }

    it('getPlaythroughCount and incrementPlaythroughCount work correctly with localStorage', () => {
        resetPlaythroughStorage();
        assertEquals(getPlaythroughCount(), 0, 'Initial playthrough count should be 0');
        incrementPlaythroughCount();
        assertEquals(getPlaythroughCount(), 1, 'Playthrough count after 1 increment should be 1');
        incrementPlaythroughCount();
        assertEquals(getPlaythroughCount(), 2, 'Playthrough count after 2 increments should be 2');
        resetPlaythroughStorage();
    });

    it('generateMinigameOrder excludes jeopardy and climb on first playthrough (count 0)', () => {
        resetPlaythroughStorage();
        for (let i = 0; i < 20; i++) {
            generateMinigameOrder();
            assertEquals(minigameOrder.length, 3, 'minigameOrder should have length 3');
            assertFalse(minigameOrder.includes('jeopardy'), 'jeopardy should not be included on playthrough 0');
            assertFalse(minigameOrder.includes('climb'), 'climb should not be included on playthrough 0');
        }
    });

    it('generateMinigameOrder includes both jeopardy and climb on second playthrough (count 1)', () => {
        resetPlaythroughStorage();
        incrementPlaythroughCount(); // count = 1
        for (let i = 0; i < 20; i++) {
            generateMinigameOrder();
            assertEquals(minigameOrder.length, 3, 'minigameOrder should have length 3');
            assertTrue(minigameOrder.includes('jeopardy'), 'jeopardy must be included on playthrough 1');
            assertTrue(minigameOrder.includes('climb'), 'climb must be included on playthrough 1');
        }
        resetPlaythroughStorage();
    });

    it('generateMinigameOrder allows all minigames on playthrough 3+ (count >= 2)', () => {
        resetPlaythroughStorage();
        incrementPlaythroughCount(); // 1
        incrementPlaythroughCount(); // 2
        let sawJeopardy = false, sawClimb = false, sawOthers = false;
        for (let i = 0; i < 50; i++) {
            generateMinigameOrder();
            assertEquals(minigameOrder.length, 3, 'minigameOrder should have length 3');
            if (minigameOrder.includes('jeopardy')) sawJeopardy = true;
            if (minigameOrder.includes('climb')) sawClimb = true;
            if (minigameOrder.some(m => m !== 'jeopardy' && m !== 'climb')) sawOthers = true;
        }
        assertTrue(sawOthers, 'Should pick other minigames on playthrough >= 2');
        resetPlaythroughStorage();
    });

    it('drawUnlockMasters renders without error', () => {
        try {
            drawUnlockMasters();
        } catch (err) {
            assert(false, `drawUnlockMasters failed: ${err.message}`);
        }
    });

    it('Jeopardy clue option for Regina slogan uses Fredericton, New Brunswick', () => {
        const category = JEOPARDY_CLUES_DATA.categories.find(c => c.id === 'capitalism');
        assert(category !== undefined, 'capitalism category should exist');
        const clueObj = category.clues.find(c => c.value === 400);
        assert(clueObj !== undefined, 'clue 400 should exist in capitalism');
        const sloganVariant = clueObj.variants.find(v => v.correct.includes('Regina'));
        assert(sloganVariant !== undefined, 'Regina slogan variant should exist');
        assertTrue(sloganVariant.wrong.includes('What is Fredericton, New Brunswick?'), 'wrong options should include Fredericton, New Brunswick');
        assertFalse(sloganVariant.wrong.includes('What is Verdun, Quebec?'), 'wrong options should NOT include Verdun, Quebec');
    });
});

