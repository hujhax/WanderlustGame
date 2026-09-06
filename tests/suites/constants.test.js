describe('Constants & Configuration Data', () => {
    it('COLORS dictionary contains valid hex color strings', () => {
        assert(typeof COLORS === 'object', 'COLORS should be defined as an object');
        const expectedKeys = ['BLACK', 'WHITE', 'RED', 'GREEN', 'BLUE', 'SKY_BLUE', 'GOLD', 'ORANGE_GLOW'];
        expectedKeys.forEach(key => {
            assert(key in COLORS, `COLORS should contain key ${key}`);
            assert(/^#[0-9A-Fa-f]{6}$/.test(COLORS[key]), `COLORS.${key} should be a valid hex color, got ${COLORS[key]}`);
        });
    });

    it('PHASES enum contains all expected game phase constants', () => {
        assert(typeof PHASES === 'object', 'PHASES should be defined');
        const requiredPhases = [
            'INTRO', 'TITLE', 'CHOOSE_TRAVELLER', 'PARTNER_ANNOUNCEMENT',
            'DEPARTURE_CUTSCENE', 'MINIGAME_MAP', 'MINIGAME_PLAY', 'MINIGAME_POST',
            'IN_THE_CAR', 'THE_CONFRONTATION', 'CONFRONTATION_PLAY', 'NEXT_DAY',
            'SEPARATE_WAYS', 'ON_YOUR_OWN', 'TOGETHER_AGAIN', 'CLOSING_INTERVIEW', 'CLOSING_CREDITS'
        ];
        requiredPhases.forEach(phase => {
            assertEquals(PHASES[phase], phase, `PHASES.${phase} should match key name`);
        });
    });

    it('CAST array contains cast members with correct schema', () => {
        assert(Array.isArray(CAST), 'CAST should be an array');
        assert(CAST.length >= 9, 'CAST should contain at least 9 cast members');
        
        CAST.forEach(member => {
            assert(member.name && typeof member.name === 'string', 'Cast member must have a name');
            assert(member.firstName && typeof member.firstName === 'string', 'Cast member must have a firstName');
            assert(member.actor && typeof member.actor === 'string', 'Cast member must have an actor name');
            assert(member.imgPath && member.imgPath.startsWith('images/cast/'), `ImgPath must start with images/cast/ for ${member.name}`);
        });
    });

    it('Lindsey is marked with noSprites flag in CAST', () => {
        const lindsey = CAST.find(c => c.firstName === 'Lindsey');
        assert(lindsey !== undefined, 'Lindsey should be present in CAST');
        assertEquals(lindsey.noSprites, true, 'Lindsey should have noSprites set to true');
    });

    it('PARTNER_PAIRS provides complete bidirectional mapping for 4 pairs', () => {
        assert(typeof PARTNER_PAIRS === 'object', 'PARTNER_PAIRS should be defined');
        const keys = Object.keys(PARTNER_PAIRS);
        assertEquals(keys.length, 8, 'PARTNER_PAIRS should have 8 keys representing 4 bidirectional pairs');

        // Check bidirectional mapping
        keys.forEach(person => {
            const partner = PARTNER_PAIRS[person];
            assertEquals(PARTNER_PAIRS[partner], person, `Partner of ${partner} should map back to ${person}`);
        });
    });

    it('CAR_DIALOG contains exactly 50 Insults, 50 Blands, and 50 Truths', () => {
        assert(typeof CAR_DIALOG === 'object', 'CAR_DIALOG should be defined');
        assert(Array.isArray(CAR_DIALOG.INSULTS), 'INSULTS should be an array');
        assert(Array.isArray(CAR_DIALOG.BLANDS), 'BLANDS should be an array');
        assert(Array.isArray(CAR_DIALOG.TRUTHS), 'TRUTHS should be an array');

        assertEquals(CAR_DIALOG.INSULTS.length, 50, 'CAR_DIALOG.INSULTS must have exactly 50 entries');
        assertEquals(CAR_DIALOG.BLANDS.length, 50, 'CAR_DIALOG.BLANDS must have exactly 50 entries');
        assertEquals(CAR_DIALOG.TRUTHS.length, 50, 'CAR_DIALOG.TRUTHS must have exactly 50 entries');
    });

    it('CAR_DIALOG entries are all non-empty strings', () => {
        ['INSULTS', 'BLANDS', 'TRUTHS'].forEach(category => {
            CAR_DIALOG[category].forEach((dialog, index) => {
                assert(typeof dialog === 'string' && dialog.trim().length > 0, `${category}[${index}] must be a non-empty string`);
            });
        });
    });

    it('CONFRONTATION_RESPONSES contains valid response options for all 4 categories', () => {
        assert(typeof CONFRONTATION_RESPONSES === 'object', 'CONFRONTATION_RESPONSES should be defined');
        const categories = ['PLAYER_SUCCESS', 'PLAYER_FAILURE', 'COMPANION_SUCCESS', 'COMPANION_FAILURE'];
        categories.forEach(cat => {
            assert(Array.isArray(CONFRONTATION_RESPONSES[cat]), `${cat} should be an array`);
            assertEquals(CONFRONTATION_RESPONSES[cat].length, 3, `${cat} should have 3 response variations`);
            CONFRONTATION_RESPONSES[cat].forEach((resp, i) => {
                assert(typeof resp === 'string' && resp.length > 0, `${cat}[${i}] should be a non-empty string`);
            });
        });
    });
});
