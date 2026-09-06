const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Load Harness
require('./test_harness.js');

// Helper to evaluate script file in node context, binding top-level vars to global
function loadScript(relPath) {
    const fullPath = path.join(__dirname, relPath);
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Transform top-level const/let declarations to global properties so they persist across scripts
    code = code.replace(/^(const|let)\s+([A-Za-z0-9_]+)\s*=/gm, 'global.$2 =');

    vm.runInThisContext(code, { filename: fullPath });
}

// 2. Load Source Game Modules
loadScript('../js/constants.js');
loadScript('../js/audio.js');
loadScript('../js/utils.js');
loadScript('../js/ui.js');
loadScript('../js/cutscenes.js');
loadScript('../js/fighting.js');
loadScript('../js/minigames/minigame_manager.js');
loadScript('../js/minigames/chicken.js');
loadScript('../js/minigames/math.js');
loadScript('../js/minigames/karaoke.js');
loadScript('../js/minigames/golf.js');
loadScript('../js/minigames/cheese.js');
loadScript('../js/minigames/bump.js');
loadScript('../js/minigames/fish.js');
loadScript('../data/jeopardy/clues_data.js');
loadScript('../js/minigames/jeopardy.js');
loadScript('../js/minigames/goose.js');
loadScript('../js/minigames/climb.js');
loadScript('../js/main.js');
global.showDialog = showDialog;

// 3. Load Test Suites
loadScript('./suites/constants.test.js');
loadScript('./suites/utils.test.js');
loadScript('./suites/audio_and_ui.test.js');
loadScript('./suites/minigame_manager.test.js');
loadScript('./suites/minigames.test.js');

// 4. Report Results to Console
const results = TestHarness.getResults();

console.log('\n==================================================');
console.log('   Wanderlust Game - Automated Unit Test Suite   ');
console.log('==================================================\n');

results.suites.forEach(suite => {
    console.log(`\x1b[36m■ ${suite.name}\x1b[0m (${suite.passed}/${suite.tests.length} Passed)`);
    suite.tests.forEach(t => {
        if (t.passed) {
            console.log(`  \x1b[32m✔\x1b[0m ${t.name}`);
        } else {
            console.log(`  \x1b[31m✖\x1b[0m ${t.name}`);
            console.log(`    \x1b[31mError: ${t.error ? (t.error.stack || t.error.message) : 'Failed'}\x1b[0m`);
        }
    });
    console.log('');
});

console.log('--------------------------------------------------');
console.log(`SUMMARY: Total: ${results.total} | Passed: \x1b[32m${results.passed}\x1b[0m | Failed: \x1b[31m${results.failed}\x1b[0m`);
console.log('--------------------------------------------------\n');

if (results.failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
