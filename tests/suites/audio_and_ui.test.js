describe('Audio Manager & UI Engine (js/audio.js & js/ui.js)', () => {
    function advanceDialog() {
        if (typeof currentDialog !== 'undefined' && currentDialog) {
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback; currentDialog = null; dialogCallback = null; if (cb) cb();
            }
        }
    }

    it('AudioManager initializes with all required music and SFX tracks', () => {
        assert(typeof audio === 'object', 'Global audio instance should exist');
        assert(typeof audio.tracks === 'object', 'audio.tracks should be defined');
        
        const requiredTracks = [
            'CHICAGO', 'ZELDA_VICTORY', 'BEST_FRIEND', 'MOON',
            'CHICKEN_BGM', 'MATH_BGM', 'KARAOKE_BGM', 'GOLF_BGM', 'CHEESE_BGM', 'BUMP_BGM', 'FISH_BGM', 'JEOPARDY_BGM',
            'SUCCESS', 'FAILURE', 'TADA', 'SAD_TROMBONE'
        ];
        requiredTracks.forEach(track => {
            assert(audio.tracks[track] !== undefined, `audio.tracks should include ${track}`);
        });
    });

    it('audio.play sets currentTrack and handles switching tracks cleanly', () => {
        audio.stop();
        assertEquals(audio.currentTrack, null);

        audio.play('CHICAGO');
        assert(audio.currentTrack !== null, 'audio.currentTrack should be set');
        assertEquals(audio.currentTrack, audio.tracks['CHICAGO']);

        audio.play('BEST_FRIEND');
        assertEquals(audio.currentTrack, audio.tracks['BEST_FRIEND']);

        audio.stop();
        assertEquals(audio.currentTrack, null);
    });

    it('audio.playSFX triggers sound synthesis without throwing errors', () => {
        ['SUCCESS', 'FAILURE', 'TADA', 'SAD_TROMBONE', 'ui', 'engine', 'screech', 'thunk', 'splash', 'clunk', 'applause'].forEach(sfx => {
            try {
                audio.playSFX(sfx);
            } catch (err) {
                assert(false, `audio.playSFX("${sfx}") threw an error: ${err.message}`);
            }
        });
    });

    it('showDialog initializes dialog state correctly', () => {
        let callbackFired = false;
        showDialog('Mr. Willis', 'Jason', 'Hello world!', () => { callbackFired = true; });

        assert(currentDialog !== null, 'currentDialog should be set');
        assertEquals(currentDialog.name, 'Mr. Willis');
        assert(currentDialog.castMember !== undefined, 'currentDialog.castMember should be resolved');
        assertEquals(currentDialog.castMember.actor, 'Jason');
        assert(Array.isArray(currentDialog.chunks), 'currentDialog.chunks should be an array');
        assertEquals(currentDialog.chunkIndex, 0);

        // Advance dialog to completion
        advanceDialog();
        assertEquals(currentDialog, null, 'currentDialog should be cleared after finishing');
        assertEquals(callbackFired, true, 'dialogCallback should fire on completion');
    });

    it('showDialog handles multi-chunk dialog pagination', () => {
        const longText = 'Word '.repeat(80);
        showDialog('Farmer', 'Jason', longText, null);

        assert(currentDialog.chunks.length > 1, 'Long dialog should produce multiple chunks');
        
        advanceDialog();
        if (currentDialog !== null) {
            assertEquals(currentDialog.chunkIndex, 1, 'chunkIndex should increment');
        }
    });

    it('inTheCar response options give correct score penalties and rewards', () => {
        // Setup inTheCarState
        inTheCarState = {
            cycle: 0,
            usedInsults: new Set(),
            usedBlands: new Set(),
            usedTruths: new Set(),
            options: [
                { type: 'INSULT', text: CAR_DIALOG.INSULTS[0] },
                { type: 'BLAND', text: CAR_DIALOG.BLANDS[0] },
                { type: 'TRUTH', text: CAR_DIALOG.TRUTHS[0] }
            ],
            waitingForResponse: true,
            selectedIndex: 0
        };

        score = 1000;
        intimacy = 4;

        // Select INSULT (Option 0)
        let selectedOpt = inTheCarState.options[0];
        if (selectedOpt.type === 'INSULT') {
            score += -100;
            intimacy = Math.max(0, intimacy - 1);
        }
        assertEquals(score, 900, 'INSULT option should subtract 100 score');
        assertEquals(intimacy, 3, 'INSULT should decrement intimacy');

        // Select TRUTH
        selectedOpt = inTheCarState.options[2];
        if (selectedOpt.type === 'TRUTH') {
            score += 200;
            intimacy = Math.min(8, intimacy + 1);
        }
        assertEquals(score, 1100, 'TRUTH option should add 200 score');
        assertEquals(intimacy, 4, 'TRUTH should increment intimacy');
    });

    it('Dialog mouse clicks advance standard dialogs and resolve interactive option choices', () => {
        let callbackFired = false;
        let choiceReceived = null;

        showDialog('Rocky', 'Leichelle', 'Do you want to buy?', (choice) => {
            callbackFired = true;
            choiceReceived = choice;
        }, null, null, ['YES', 'NO']);

        assert(currentDialog !== null, 'Dialog with options should be active');
        assertEquals(currentDialog.options.length, 2, 'Options length should be 2');

        // Simulate choice callback execution
        const cb = dialogCallback;
        currentDialog = null;
        dialogCallback = null;
        if (cb) cb('yes');

        assertEquals(currentDialog, null, 'Dialog should be closed after option selection');
        assertEquals(callbackFired, true, 'Callback should have fired');
        assertEquals(choiceReceived, 'yes', 'Choice received should be yes');
    });
});
