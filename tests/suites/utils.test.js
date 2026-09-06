describe('Utility Functions (js/utils.js)', () => {
    it('wrapText returns single chunk for short text', () => {
        const text = 'Hello world';
        const chunks = wrapText(text, 500);
        assert(Array.isArray(chunks), 'wrapText should return an array');
        assertEquals(chunks.length, 1, 'Short text should fit in a single chunk');
        assertEquals(chunks[0], 'Hello world');
    });

    it('wrapText wraps text into multiple lines when width exceeded', () => {
        const text = 'This is a very long line of dialog that should definitely wrap across multiple lines when rendered on screen';
        const chunks = wrapText(text, 100);
        assert(chunks.length >= 1, 'wrapText should produce wrapped chunks');
        assert(chunks[0].includes('\n') || chunks.length > 1, 'Long text should contain newlines or multiple chunks');
    });

    it('wrapText chunks dialog into maximum 3 lines per chunk', () => {
        const text = 'Word '.repeat(50); // Very long sentence
        const chunks = wrapText(text, 80);
        chunks.forEach((chunk, index) => {
            const lines = chunk.split('\n');
            assert(lines.length <= 3, `Chunk ${index} should have at most 3 lines, got ${lines.length}`);
        });
    });

    it('wrapText handles empty string gracefully', () => {
        const chunks = wrapText('', 200);
        assert(Array.isArray(chunks));
        assertEquals(chunks.length, 1);
        assertEquals(chunks[0], '');
    });

    it('wrapTextLines safely handles null and undefined text inputs without throwing', () => {
        assertEquals(wrapTextLines(null, 200).length, 0, 'wrapTextLines(null) should return empty array');
        assertEquals(wrapTextLines(undefined, 200).length, 0, 'wrapTextLines(undefined) should return empty array');
        assertEquals(wrapTextLines('', 200).length, 0, 'wrapTextLines("") should return empty array');
    });

    it('getCurrentBackground returns null for INTRO phase', () => {
        currentPhase = PHASES.INTRO;
        const bg = getCurrentBackground();
        assertEquals(bg, null, 'INTRO phase should have null background');
    });

    it('getCurrentBackground returns departureBgImg for DEPARTURE_CUTSCENE', () => {
        currentPhase = PHASES.DEPARTURE_CUTSCENE;
        const bg = getCurrentBackground();
        assertEquals(bg, departureBgImg);
    });

    it('getCurrentBackground returns farmBgImg for chicken minigame', () => {
        currentPhase = PHASES.MINIGAME_PLAY;
        minigameOrder = ['chicken', 'math', 'karaoke'];
        currentMinigameIndex = 0;
        const bg = getCurrentBackground();
        assertEquals(bg, farmBgImg);
    });

    it('getCurrentBackground returns marketStallImg for cheese minigame', () => {
        currentPhase = PHASES.MINIGAME_PLAY;
        minigameOrder = ['cheese', 'math', 'karaoke'];
        currentMinigameIndex = 0;
        const bg = getCurrentBackground();
        assertEquals(bg, marketStallImg);
    });

    it('getCurrentBackground returns confrontationBgImg for THE_CONFRONTATION phase', () => {
        currentPhase = PHASES.THE_CONFRONTATION;
        const bg = getCurrentBackground();
        assertEquals(bg, confrontationBgImg);
    });

    it('getCurrentBackground returns onYourOwnBgImg for ON_YOUR_OWN phase', () => {
        currentPhase = PHASES.ON_YOUR_OWN;
        const bg = getCurrentBackground();
        assertEquals(bg, onYourOwnBgImg);
    });

    it('captureScreen pushes image to screenCaptures array without overflowing limit of 20', () => {
        screenCaptures = [];
        for (let i = 0; i < 25; i++) {
            captureScreen();
        }
        assert(screenCaptures.length <= 20, `screenCaptures length should be capped at 20, got ${screenCaptures.length}`);
    });
});
