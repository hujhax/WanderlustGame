/**
 * Standalone Unit Testing Harness for Wanderlust Game
 * Supports running in both Browser environment and Node.js environment.
 */

(function (global) {
    const suites = [];
    let currentSuite = null;

    // Test Registry & Assertion Engine
    const TestHarness = {
        describe(name, fn) {
            currentSuite = { name, tests: [], passed: 0, failed: 0 };
            suites.push(currentSuite);
            fn();
            currentSuite = null;
        },

        it(name, fn) {
            if (!currentSuite) {
                this.describe('Default Suite', () => { this.it(name, fn); });
                return;
            }
            const testCase = { name, passed: false, error: null };
            try {
                fn();
                testCase.passed = true;
                currentSuite.passed++;
            } catch (err) {
                testCase.passed = false;
                testCase.error = err;
                currentSuite.failed++;
            }
            currentSuite.tests.push(testCase);
        },

        assert(condition, message) {
            if (!condition) {
                throw new Error(message || 'Assertion failed');
            }
        },

        assertEquals(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
        },

        assertDeepEquals(actual, expected, message) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(message || `Expected deep equality:\nExpected: ${expectedStr}\nActual:   ${actualStr}`);
            }
        },

        assertTrue(condition, message) {
            this.assertEquals(Boolean(condition), true, message || `Expected true, but got ${condition}`);
        },

        assertFalse(condition, message) {
            this.assertEquals(Boolean(condition), false, message || `Expected false, but got ${condition}`);
        },

        assertThrows(fn, expectedErrorMsg, message) {
            let threw = false;
            try {
                fn();
            } catch (err) {
                threw = true;
                if (expectedErrorMsg && !err.message.includes(expectedErrorMsg)) {
                    throw new Error(`Expected error containing "${expectedErrorMsg}", got "${err.message}"`);
                }
            }
            if (!threw) {
                throw new Error(message || 'Expected function to throw an error, but it succeeded.');
            }
        },

        getResults() {
            let total = 0;
            let passed = 0;
            let failed = 0;
            suites.forEach(suite => {
                total += suite.tests.length;
                passed += suite.passed;
                failed += suite.failed;
            });
            return { suites, total, passed, failed };
        },

        reset() {
            suites.length = 0;
            currentSuite = null;
        }
    };

    // DOM & Audio Mocks for Headless Test Environments
    function initMockDOM() {
        if (typeof global.window === 'undefined') {
            global.window = global;
        }
        global.window.addEventListener = global.window.addEventListener || (() => {});
        global.window.removeEventListener = global.window.removeEventListener || (() => {});
        global.window.location = global.window.location || { search: '' };
        global.location = global.location || global.window.location;
        global.requestAnimationFrame = global.window.requestAnimationFrame = global.window.requestAnimationFrame || (() => 0);
        global.cancelAnimationFrame = global.window.cancelAnimationFrame = global.window.cancelAnimationFrame || (() => {});

        function MockAudioContext() {
            this.currentTime = 0;
            this.destination = {};
            this.createOscillator = () => ({
                type: '',
                frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
                connect: () => {},
                start: () => {},
                stop: () => {}
            });
            this.createGain = () => ({
                gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
                connect: () => {}
            });
        }
        global.window.AudioContext = global.window.webkitAudioContext = global.AudioContext = MockAudioContext;

        if (typeof global.document === 'undefined') {
            global.document = {
                createElement(tag) {
                    if (tag === 'canvas') {
                        return createMockCanvas();
                    }
                    return {
                        getContext: () => createMockContext(),
                        setAttribute: () => {},
                        style: {}
                    };
                },
                getElementById(id) {
                    if (id === 'gameCanvas') {
                        return createMockCanvas();
                    }
                    return null;
                },
                location: global.window.location,
                addEventListener: () => {}
            };
        }

        if (typeof global.Image === 'undefined') {
            global.Image = function () {
                this.complete = true;
                this.naturalWidth = 100;
                this.naturalHeight = 100;
                this.width = 100;
                this.height = 100;
                this.src = '';
                this.addEventListener = () => {};
            };
        }

        if (typeof global.HTMLVideoElement === 'undefined') {
            global.HTMLVideoElement = function () {};
        }

        if (typeof global.HTMLCanvasElement === 'undefined') {
            global.HTMLCanvasElement = function () {};
        }

        if (typeof global.Audio === 'undefined') {
            global.Audio = function () {
                this.currentTime = 0;
                this.volume = 1;
                this.loop = false;
                this.play = () => Promise.resolve();
                this.pause = () => {};
                this.load = () => {};
            };
        }

        if (typeof global.localStorage === 'undefined') {
            const store = {};
            global.localStorage = {
                getItem: (k) => store[k] || null,
                setItem: (k, v) => { store[k] = String(v); },
                removeItem: (k) => { delete store[k]; },
                clear: () => { Object.keys(store).forEach(k => delete store[k]); }
            };
        }
    }

    function createMockContext() {
        return {
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            scale: () => {},
            beginPath: () => {},
            closePath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            arcTo: () => {},
            roundRect: () => {},
            rect: () => {},
            fillRect: () => {},
            strokeRect: () => {},
            clearRect: () => {},
            fillText: () => {},
            strokeText: () => {},
            drawImage: () => {},
            stroke: () => {},
            fill: () => {},
            bezierCurveTo: () => {},
            measureText: (text) => ({ width: text ? text.length * 8 : 0 }),
            setLineDash: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} }),
            imageSmoothingEnabled: false,
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '12px sans-serif',
            textAlign: 'left',
            textBaseline: 'top',
            shadowColor: '#000000',
            shadowBlur: 0,
            canvas: { width: 800, height: 600 }
        };
    }

    function createMockCanvas() {
        const ctx = createMockContext();
        return {
            width: 800,
            height: 600,
            getContext: () => ctx,
            toDataURL: () => 'data:image/png;base64,mock',
            addEventListener: () => {}
        };
    }

    initMockDOM();

    // Export to global scope
    global.TestHarness = TestHarness;
    global.describe = TestHarness.describe.bind(TestHarness);
    global.it = TestHarness.it.bind(TestHarness);
    global.assert = TestHarness.assert.bind(TestHarness);
    global.assertEquals = TestHarness.assertEquals.bind(TestHarness);
    global.assertDeepEquals = TestHarness.assertDeepEquals.bind(TestHarness);
    global.assertTrue = TestHarness.assertTrue.bind(TestHarness);
    global.assertFalse = TestHarness.assertFalse.bind(TestHarness);
    global.assertThrows = TestHarness.assertThrows.bind(TestHarness);

})(typeof window !== 'undefined' ? window : global);
