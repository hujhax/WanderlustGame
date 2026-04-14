const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    SKY_BLUE: '#30A0FF',
    LAND_BROWN: '#8B4513',
    SELECTION_YELLOW: '#FFFF00',
    TEXT_GREY: '#BBBBBB',
    HOUSE_RED: '#A52A2A',
    CAR_BLUE: '#00008B',
    SUNSET_ORANGE: '#FF4500',
    SUNSET_PURPLE: '#4B0082',
    GOLD: '#FFD700',
    ORANGE_GLOW: '#FFA500'
};

const PHASES = {
    INTRO: 'INTRO',
    TITLE: 'TITLE',
    CHOOSE_TRAVELLER: 'CHOOSE_TRAVELLER',
    PARTNER_ANNOUNCEMENT: 'PARTNER_ANNOUNCEMENT',
    DEPARTURE_CUTSCENE: 'DEPARTURE_CUTSCENE',
    MINIGAME_MAP: 'MINIGAME_MAP',
    MINIGAME_PLAY: 'MINIGAME_PLAY',
    MINIGAME_POST: 'MINIGAME_POST',
    IN_THE_CAR: 'IN_THE_CAR',
    THE_CONFRONTATION: 'THE_CONFRONTATION',
    SEPARATE_WAYS: 'SEPARATE_WAYS',
    ON_YOUR_OWN: 'ON_YOUR_OWN',
    TOGETHER_AGAIN: 'TOGETHER_AGAIN',
    CLOSING_INTERVIEW: 'CLOSING_INTERVIEW',
    CLOSING_CREDITS: 'CLOSING_CREDITS'
};

const CAST = [
    { name: 'Claire Biddiscombe', actor: 'Claire', imgPath: 'images/cast/claire.png' },
    { name: 'Gilbert El-Dick', actor: 'Gilbert', imgPath: 'images/cast/gilbert.png' },
    { name: 'Jason Summers', actor: 'Jason', imgPath: 'images/cast/jason.png' },
    { name: 'Krystal Merrells', actor: 'Krystal', imgPath: 'images/cast/krystal.png' },
    { name: 'Patrice Forbes', actor: 'Patrice', imgPath: 'images/cast/patrice.png' },
    { name: 'Peter Rogers', actor: 'Peter', imgPath: 'images/cast/peter.png' },
    { name: 'Sam Allen', actor: 'Sam', imgPath: 'images/cast/sam.png' },
    { name: 'The Velvet Duke', actor: 'Velvet', imgPath: 'images/cast/velvet.png' }
];

const PARTNER_PAIRS = {
    'Jason Summers': 'Peter Rogers', 'Peter Rogers': 'Jason Summers',
    'Patrice Forbes': 'Gilbert El-Dick', 'Gilbert El-Dick': 'Patrice Forbes',
    'The Velvet Duke': 'Claire Biddiscombe', 'Claire Biddiscombe': 'The Velvet Duke',
    'Sam Allen': 'Krystal Merrells', 'Krystal Merrells': 'Sam Allen'
};

// Preload images
CAST.forEach(c => {
    c.img = new Image();
    c.img.src = c.imgPath;
    c.invertedImg = new Image();
    c.invertedImg.src = c.imgPath.replace('images/cast/', 'images/cast/inverted/');
});
const canadaMapImg = new Image();
canadaMapImg.src = 'images/canada map.jpg';
const cloudImg = new Image();
cloudImg.src = 'images/cloud.png';

const chickenSheetImg = new Image();
chickenSheetImg.src = 'images/sprites/chicken.png';
const skullImg = new Image();
skullImg.src = 'images/cow-skull.png';
const barnImg = new Image();
barnImg.src = 'images/barn.png';
const treeImg = new Image();
treeImg.src = 'images/tree.png';
const farmBgImg = new Image();
farmBgImg.src = 'images/farm_background.jpg';

const wagonImg = new Image();
wagonImg.src = 'images/station_wagon.png';

const departureBgImg = new Image();
departureBgImg.src = 'images/departure_bg.jpg';

const confrontationBgImg = new Image();
confrontationBgImg.src = 'images/gas_station.webp';

const onYourOwnBgImg = new Image();
onYourOwnBgImg.src = 'images/rainy-pixel-city-stockcake.jpg';

const stationWagonRawImg = new Image();
stationWagonRawImg.src = 'images/station_wagon_raw.png';

const companionSitsBg = new Image();
companionSitsBg.src = 'images/companion_alone.gif';
const playerSitsBg = new Image();
playerSitsBg.src = 'images/player_alone.gif';

const countryRoadImg = new Image();
countryRoadImg.src = 'images/country_road.png';

const slashSprites = {};
const idleSprites = {};
const walkSprites = {};
const runSprites = {};
const jumpSprites = {};
const sitSprites = {};
const combatSprites = {};
const halfSlashSprites = {};
const backSlashSprites = {};

CAST.forEach(c => {
    const actor = c.actor.toLowerCase();
    slashSprites[actor] = new Image();
    slashSprites[actor].src = `images/sprites/cast/${actor}/standard/slash.png`;
    idleSprites[actor] = new Image();
    idleSprites[actor].src = `images/sprites/cast/${actor}/standard/idle.png`;
    walkSprites[actor] = new Image();
    walkSprites[actor].src = `images/sprites/cast/${actor}/standard/walk.png`;
    runSprites[actor] = new Image();
    runSprites[actor].src = `images/sprites/cast/${actor}/standard/run.png`;
    jumpSprites[actor] = new Image();
    jumpSprites[actor].src = `images/sprites/cast/${actor}/standard/jump.png`;
    sitSprites[actor] = new Image();
    sitSprites[actor].src = `images/sprites/cast/${actor}/standard/sit.png`;
    combatSprites[actor] = new Image();
    combatSprites[actor].src = `images/sprites/cast/${actor}/standard/combat.png`;
    halfSlashSprites[actor] = new Image();
    halfSlashSprites[actor].src = `images/sprites/cast/${actor}/standard/1h_halfslash.png`;
    backSlashSprites[actor] = new Image();
    backSlashSprites[actor].src = `images/sprites/cast/${actor}/standard/1h_backslash.png`;
});

const CAR_DIALOG = {
    INSULTS: [
        "You're as useful as a screen door on a submarine.", "I've met smarter rocks.", "Is that your face or did you lose a fight with a tractor?", "You have the charisma of a damp sponge.", "Your fashion sense is an insult to eyesight.", 
        "I'd explain it to you, but I don't have any crayons.", "You're the reason they put instructions on shampoo bottles.", "You're like a cloud—when you disappear, it's a beautiful day.", "I envy people who haven't met you.", "You're not the dumbest person in the world, but you better hope they don't die.",
        "You're about as bright as a black hole.", "If I wanted to hear from an idiot, I'd ask you a question.", "You're living proof that evolution can go in reverse.", "I'd call you a tool, but even tools have a purpose.", "You're the human equivalent of a participation trophy.",
        "Your presence is like a headache that won't go away.", "You're as pleasant as a root canal.", "I've seen more life in a cemetery than in your personality.", "You're the reason I prefer being alone.", "Is your brain on vacation or did it just quit?",
        "You're as sharp as a marble.", "I'd agree with you, but then we'd both be wrong.", "You're like a software update—I see you and think 'not now'.", "You're the 'before' picture in an antidepressant commercial.", "You're as reliable as a chocolate teapot.",
        "You bring everyone so much joy... when you leave the room.", "I'd give you a nasty look, but you've already got one.", "You're like a mosquito—annoying and better off ignored.", "You're the personification of a low-battery notification.", "I've had better conversations with my reflection.",
        "You're as interesting as watching paint dry.", "Your logic is like a pretzel—twisted and full of salt.", "You're the 'skip ad' button of my life.", "I'd tell you to go jump in a lake, but I like lakes.", "You're as helpful as a broken compass.",
        "You're the reason I have trust issues.", "You're like a bad wifi signal—frustrating and barely there.", "I'd offer you a penny for your thoughts, but I don't want change.", "You're as graceful as a giraffe on roller skates.", "You're the 'check engine' light of this trip.",
        "Your jokes are like a library—quiet and full of old stuff.", "You're as appetizing as a bowl of cold oatmeal.", "I'd rather watch grass grow than listen to you.", "You're like a flat tire—letting everyone down.", "You're the personification of a stubbed toe.",
        "Your stories are longer than this road and twice as boring.", "You're as inspiring as a 'closed' sign.", "I'd call you a legend, but that would be a myth.", "You're like a puzzle with missing pieces—incomplete and frustrating.", "You're the 'error 404' of human beings."
    ],
    BLANDS: [
        "The sky is quite blue today.", "This car has four wheels.", "I think I see a cow.", "The road goes on for a while.", "It's a nice day for a drive.",
        "I wonder what time it is.", "The engine makes a steady sound.", "We've passed three trees so far.", "The clouds look like clouds.", "My seat is moderately comfortable.",
        "The asphalt is dark grey.", "I saw a bird fly by.", "The wind is blowing slightly.", "There's a gas station every now and then.", "The horizon is flat.",
        "I like the color of this station wagon.", "The sun is at a certain angle.", "We are moving at a constant speed.", "The dashboard has some dust on it.", "The radio is currently off.",
        "The windshield is mostly clear.", "I see some grass on the side of the road.", "The rearview mirror shows the road behind us.", "The steering wheel is round.", "The pedals are under the feet.",
        "The wipers are not needed right now.", "The glove compartment contains things.", "The ceiling of the car is beige.", "The floor mats are rubber.", "The door handles are chrome.",
        "The tires have tread.", "The headlights are off during the day.", "The turn signals make a clicking sound.", "The fuel gauge is above empty.", "The temperature is room-like.",
        "The air vents are blowing air.", "The headrests are adjustable.", "The seatbelts are buckled.", "The windows can go up and down.", "The locks are engaged.",
        "The bumper is in the front.", "The exhaust pipe is in the back.", "The license plate has letters and numbers.", "The roof rack is empty.", "The hubcaps are shiny.",
        "The side mirrors are useful.", "The antenna is long.", "The hood is latched.", "The trunk is full of luggage.", "The road signs are green."
    ],
    TRUTHS: [
        "Sometimes I wonder if we're all just pixels in a game.", "Loneliness is the price of freedom.", "We are all just walking each other home.", "The journey is the destination, they say.", "Friendship is a fragile thing, like glass.",
        "Memory is a selective storyteller.", "We see the world as we are, not as it is.", "Every end is a new beginning in disguise.", "Silence speaks louder than words sometimes.", "Fear is just imagination gone wrong.",
        "Change is the only constant in this life.", "We are all stars wrapped in skin.", "The heart knows things the mind cannot explain.", "Time is a river that only flows one way.", "Beauty is found in the smallest details.",
        "Honesty is a gift few people can afford.", "Forgiveness is the key to a quiet mind.", "Regret is a ghost that haunts the living.", "Kindness costs nothing but means everything.", "Wisdom comes from experience, often painful.",
        "We are all connected by invisible threads.", "The truth is rarely pure and never simple.", "Dreams are the language of the soul.", "Love is an action, not just a feeling.", "Patience is the calm before the breakthrough.",
        "Courage is being scared but doing it anyway.", "Hope is the light that never goes out.", "Life is a collection of fleeting moments.", "The soul has no age.", "We are the authors of our own stories.",
        "Peace begins within the self.", "Authenticity is the highest form of beauty.", "Growth requires leaving the comfort zone.", "Happiness is a choice we make every day.", "Suffering is a teacher we never asked for.",
        "The ego is a wall between us and reality.", "Spirituality is a personal voyage.", "Unity is found in our shared humanity.", "Creativity is the expression of the divine.", "Innocence is lost but never truly forgotten.",
        "The universe is vast and we are small.", "Purpose gives meaning to the mundane.", "Integrity is doing the right thing when no one looks.", "Gratitude turns what we have into enough.", "Empathy is the bridge between souls.",
        "Acceptance is the final stage of grief.", "Faith is believing in what we cannot see.", "Justice is a target we must always aim for.", "Equality is a dream worth fighting for.", "Liberty is a responsibility, not just a right."
    ]
};

let inTheCarState = {
    cycle: 0,
    usedInsults: new Set(),
    usedBlands: new Set(),
    usedTruths: new Set(),
    options: [],
    waitingForResponse: false,
    responseText: "",
    responseType: ""
};

let currentPhase = PHASES.INTRO;
let selectedIndex = 0;
let score = 0;
let currentMinigameIndex = 0;
let minigameOrder = ['chicken', 'math', 'karaoke'];
minigameOrder.sort(() => Math.random() - 0.5);

const urlParams = new URLSearchParams(window.location.search);
const minigameOverride = urlParams.get('minigame');
if (minigameOverride === 'confrontation') {
    currentPhase = PHASES.THE_CONFRONTATION;
} else if (minigameOverride === 'separate') {
    currentPhase = PHASES.SEPARATE_WAYS;
} else if (minigameOverride === 'alone' || minigameOverride === 'own') {
    currentPhase = PHASES.ON_YOUR_OWN;
} else if (minigameOverride === 'reunited') {
    currentPhase = PHASES.TOGETHER_AGAIN;
} else if (minigameOverride) {
    minigameOrder = [minigameOverride];
    currentPhase = PHASES.MINIGAME_MAP;
}

let creditsY = canvas.height;
let creditsFinished = false;
let cutsceneStartTime = 0;
const CUTSCENE_DURATION = 6000;

let currentDialog = null;
let dialogCallback = null;

function showDialog(character, actor, text, callback, style = null) {
    const castMember = CAST.find(c => c.actor === actor);
    currentDialog = {
        name: character,
        castMember: castMember,
        fullText: text,
        chunks: wrapText(text, 400),
        chunkIndex: 0,
        style: style
    };
    dialogCallback = callback;
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    ctx.font = '12px "Press Start 2P"';
    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine.trim());
    const chunks = [];
    for (let i = 0; i < lines.length; i += 3) {
        chunks.push(lines.slice(i, i + 3).join('\n'));
    }
    return chunks;
}

class AudioManager {
    constructor() {
        this.tracks = {
            CHICAGO: new Audio('music/chicago.mp3'),
            ZELDA_VICTORY: new Audio('music/zelda_victory.mp3'),
            BEST_FRIEND: new Audio('music/best_friend.mp3'),
            MOON: new Audio('music/moon.mp3'),
            CHICKEN_BGM: new Audio('music/chicken_bgm.mp3'),
            MATH_BGM: new Audio('music/math_bgm.mp3'),
            KARAOKE_BGM: new Audio('music/karaoke_bgm.mp3'),
            FIGHT_BGM: new Audio('music/fighting_theme.mp3'),
            TOGETHER_BGM: new Audio('music/together_again.mp3'),
            INTERVIEW_BGM: new Audio('music/closing_interview.mp3'),
            SUCCESS: new Audio('music/success.mp3'),
            FAILURE: new Audio('music/failure.mp3'),
            TADA: new Audio('music/tada.mp3'),
            SAD_TROMBONE: new Audio('music/sad_trombone.mp3')
        };
        for (let key in this.tracks) {
            this.tracks[key].loop = (key === 'CHICAGO' || key === 'BEST_FRIEND' || key === 'MOON' || key.endsWith('_BGM') || key === 'FIGHT_BGM');
        }
        this.currentTrack = null;
        this.audioCtx = null;
    }
    play(trackName, startTime = 0) {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
        this.currentTrack = this.tracks[trackName];
        if (this.currentTrack) {
            this.currentTrack.currentTime = startTime;
            this.currentTrack.play().catch(e => console.error("Audio playback failed:", e));
        }
    }
    playSFX(name) {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const sfx = this.tracks[name];
        if (sfx && sfx.readyState >= 2) {
            sfx.currentTime = 0;
            sfx.play().catch(e => this.synthSFX(name));
        } else {
            this.synthSFX(name);
        }
    }
    synthSFX(name) {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;
        if (name === 'SUCCESS' || name === 'punch') {
            osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (name === 'FAILURE' || name === 'kick') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (name === 'ui') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        } else if (name === 'TADA') {
            [440, 554, 659, 880].forEach((f, i) => {
                const o = this.audioCtx.createOscillator(); o.connect(gain); o.frequency.setValueAtTime(f, now + i * 0.1); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.2);
            });
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        } else if (name === 'SAD_TROMBONE') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(110, now + 1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now); osc.stop(now + 1);
        } else {
            osc.type = 'square'; osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        }
    }
    stop() {
        if (this.currentTrack) { this.currentTrack.pause(); this.currentTrack.currentTime = 0; this.currentTrack = null; }
    }
}

const audio = new AudioManager();

const keysPressed = new Set();

window.addEventListener('mousedown', (e) => {
    if (currentPhase === PHASES.INTRO) {
        currentPhase = PHASES.TITLE;
        audio.play('CHICAGO', 12);
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < 8; i++) {
            const col = i % 4; const row = Math.floor(i / 4);
            const bx = 50 + col * 180; const by = 150 + row * 180;
            if (x > bx && x < bx + 150 && y > by && y < by + 150) {
                selectedIndex = i; audio.playSFX('ui'); selectTraveller();
            }
        }
    }
});

function selectTraveller() {
    currentPhase = PHASES.PARTNER_ANNOUNCEMENT;
    audio.play('ZELDA_VICTORY');
}

window.addEventListener('keydown', (e) => {
    keysPressed.add(e.key);
    
    if (e.key === '>') {
        // Debug skip
        const phases = Object.values(PHASES);
        const currentIndex = phases.indexOf(currentPhase);
        currentPhase = phases[(currentIndex + 1) % phases.length];
        audio.stop();
        if (currentPhase === PHASES.DEPARTURE_CUTSCENE) cutsceneStartTime = Date.now();
        if (currentPhase === PHASES.TOGETHER_AGAIN && selectedIndex === undefined) selectedIndex = 5;
        return;
    }

    if (currentDialog) {
        if (e.key === 'Enter') {
            currentDialog.chunkIndex++;
            if (currentDialog.chunkIndex >= currentDialog.chunks.length) {
                const cb = dialogCallback; currentDialog = null; dialogCallback = null;
                if (cb) cb();
            }
        }
        return;
    }
    if (currentPhase === PHASES.TITLE) {
        if (e.key === 'Enter') { currentPhase = PHASES.CHOOSE_TRAVELLER; audio.play('BEST_FRIEND'); }
    } else if (currentPhase === PHASES.CHOOSE_TRAVELLER) {
        if (e.key === 'ArrowRight') { selectedIndex = (selectedIndex + 1) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowLeft') { selectedIndex = (selectedIndex - 1 + 8) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowDown') { selectedIndex = (selectedIndex + 4) % 8; audio.playSFX('ui'); }
        else if (e.key === 'ArrowUp') { selectedIndex = (selectedIndex - 4 + 8) % 8; audio.playSFX('ui'); }
        else if (e.key === 'Enter') { audio.playSFX('ui'); selectTraveller(); }
    } else if (currentPhase === PHASES.PARTNER_ANNOUNCEMENT) {
        if (e.key === 'Enter') { currentPhase = PHASES.DEPARTURE_CUTSCENE; cutsceneStartTime = Date.now(); audio.play('CHICAGO', 30); }
    } else if (currentPhase === PHASES.DEPARTURE_CUTSCENE) {
        if (e.key === 'Enter') { startInTheCar(); }
    } else if (currentPhase === PHASES.IN_THE_CAR) {
        handleInTheCarInput(e.key);
    } else if (currentPhase === PHASES.MINIGAME_MAP) {
        if (e.key === 'Enter') startMinigame();
    } else if (currentPhase === PHASES.MINIGAME_PLAY) {
        handleMinigameInput(e.key);
    } else if (currentPhase === PHASES.MINIGAME_POST) {
        if (e.key === 'Enter') {
            if (urlParams.get('minigame') && urlParams.get('minigame') !== 'confrontation' && urlParams.get('minigame') !== 'separate' && urlParams.get('minigame') !== 'own' && urlParams.get('minigame') !== 'alone' && urlParams.get('minigame') !== 'reunited') {
                currentPhase = PHASES.MINIGAME_MAP;
            } else {
                if (currentMinigameIndex < 2) {
                    currentMinigameIndex++;
                    currentPhase = PHASES.MINIGAME_MAP;
                    audio.stop();
                } else {
                    currentPhase = PHASES.THE_CONFRONTATION;
                    audio.stop();
                }
            }
        }
    } else if (currentPhase === PHASES.THE_CONFRONTATION) {
        if (e.key === 'Enter') startFightingGame(PHASES.SEPARATE_WAYS);
    } else if (currentPhase === PHASES.SEPARATE_WAYS) {
        if (e.key === 'Enter') {
            audio.stop();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startOnYourOwn();
        }
    } else if (currentPhase === PHASES.ON_YOUR_OWN) {
        if (e.key === 'Enter') startFightingGame(PHASES.TOGETHER_AGAIN, true);
    } else if (currentPhase === PHASES.CLOSING_CREDITS) {
        if (e.key === 'Enter') { currentPhase = PHASES.TITLE; currentMinigameIndex = 0; score = 0; audio.play('CHICAGO', 12); }
    }
});

window.addEventListener('keyup', (e) => {
    keysPressed.delete(e.key);
});

function startInTheCar() {
    currentPhase = PHASES.IN_THE_CAR;
    inTheCarState.cycle = 0;
    inTheCarState.usedInsults.clear();
    inTheCarState.usedBlands.clear();
    inTheCarState.usedTruths.clear();
    inTheCarState.waitingForResponse = false;
    audio.stop();
    nextCarCycle();
}

function nextCarCycle() {
    if (inTheCarState.cycle >= 4) {
        currentPhase = PHASES.MINIGAME_MAP;
        return;
    }
    
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor;
    const partnerFirstName = partnerName.split(' ')[0];
    
    const bland = getUnusedDialog(CAR_DIALOG.BLANDS, inTheCarState.usedBlands);
    
    showDialog(partnerFirstName, partnerActor, bland, () => {
        inTheCarState.waitingForResponse = true;
        const insult = getUnusedDialog(CAR_DIALOG.INSULTS, inTheCarState.usedInsults);
        const blandResp = getUnusedDialog(CAR_DIALOG.BLANDS, inTheCarState.usedBlands);
        const truth = getUnusedDialog(CAR_DIALOG.TRUTHS, inTheCarState.usedTruths);
        
        inTheCarState.options = [
            { text: insult, type: 'insult' },
            { text: blandResp, type: 'bland' },
            { text: truth, type: 'truth' }
        ].sort(() => Math.random() - 0.5);
        inTheCarState.selectedIndex = 0;
    }, 'top');
}

function getUnusedDialog(list, usedSet) {
    const available = list.filter(item => !usedSet.has(item));
    if (available.length === 0) return list[Math.floor(Math.random() * list.length)];
    const chosen = available[Math.floor(Math.random() * available.length)];
    usedSet.add(chosen);
    return chosen;
}

function handleInTheCarInput(key) {
    if (!inTheCarState.waitingForResponse) return;
    
    if (key === 'ArrowUp') {
        inTheCarState.selectedIndex = (inTheCarState.selectedIndex - 1 + 3) % 3;
        audio.playSFX('ui');
    } else if (key === 'ArrowDown') {
        inTheCarState.selectedIndex = (inTheCarState.selectedIndex + 1) % 3;
        audio.playSFX('ui');
    } else if (key === 'Enter') {
        const choice = inTheCarState.options[inTheCarState.selectedIndex];
        inTheCarState.waitingForResponse = false;
        
        if (choice.type === 'insult') {
            score -= 100;
            audio.playSFX('SAD_TROMBONE');
        } else if (choice.type === 'truth') {
            score += 200;
            audio.playSFX('TADA');
        }
        
        const playerFirstName = CAST[selectedIndex].name.split(' ')[0];
        showDialog(playerFirstName, CAST[selectedIndex].actor, choice.text, () => {
            inTheCarState.cycle++;
            nextCarCycle();
        }, 'top');
    }
}

function drawInTheCar() {
    drawTitle(false); // Background without text
    
    if (inTheCarState.waitingForResponse) {
        const boxY = 180;
        const boxH = 160;
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(50, boxY, 700, boxH);
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 4;
        ctx.strokeRect(50, boxY, 700, boxH);
        
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'left';
        
        inTheCarState.options.forEach((opt, i) => {
            const y = boxY + 40 + i * 40;
            if (i === inTheCarState.selectedIndex) {
                ctx.fillStyle = COLORS.SELECTION_YELLOW;
                ctx.fillText("> ", 70, y);
            } else {
                ctx.fillStyle = COLORS.WHITE;
            }
            
            // Wrap option text if needed
            const wrapped = wrapText(opt.text, 600);
            ctx.fillText(wrapped[0].split('\n')[0], 100, y);
        });
    }
}

let minigameState = {};

function startMinigame() {
    const gameType = minigameOrder[currentMinigameIndex];
    if (selectedIndex === undefined || selectedIndex === null) selectedIndex = 5; // Default to Peter
    minigameState = {
        type: gameType, successes: 0, failures: 0, startTime: Date.now(), entities: [],
        parallax: { bgX: 0, roadX: 0, trees: [] },
        gameOver: false, won: false, playerY: 480, isJumping: false, jumpVel: 0, frame: 0,
        distance: 0
    };
    if (gameType === 'chicken') {
        audio.play('CHICKEN_BGM');
        showDialog('Farmer Lucky', 'Jason', "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!", () => {
            currentPhase = PHASES.MINIGAME_PLAY;
            for (let i = 0; i < 5; i++) { 
                minigameState.parallax.trees.push({ 
                    x: i * 400, 
                    y: 400, 
                    speed: 2,
                    scale: 0.8 + Math.random() * 0.4,
                    flipped: Math.random() < 0.5
                }); 
            }
            for (let i = 0; i < 100; i++) {
                const startX = i < 2 ? 400 + i * 300 : 1000 + i * 300 + Math.random() * 200;
                minigameState.entities.push({ type: 'chicken', x: startX, y: 480, speed: 1 + Math.random() * 1, frame: Math.random() * 16 });
                if (i > 0 && i % 4 === 0) { minigameState.entities.push({ type: 'skull', x: startX + 150 + Math.random() * 100, y: 480 }); }
            }
        });
    } else if (gameType === 'math') {
        audio.play('MATH_BGM');
        showDialog('Mr. Bergemot', 'Peter', "Well if it isn't our favorite former mathlete! Welcome back to your old school — wanna see if you've still got what it takes?", () => {
            currentPhase = PHASES.MINIGAME_PLAY; minigameState.difficulty = 1; minigameState.answer = ""; generateMathQuestion();
        });
    } else if (gameType === 'karaoke') {
        audio.play('KARAOKE_BGM');
        showDialog('Lord Karaoke', 'Velvet', "It's Karaoke Night at Tappers! Sure, you can come up and sing, just make sure you hit all the notes on-key! Use the up and down buttons to adjust your pitch!", () => {
            currentPhase = PHASES.MINIGAME_PLAY; minigameState.diamondPos = 3; minigameState.notes = [];
            for (let i = 0; i < 60; i++) { minigameState.notes.push({ x: 800 + i * 180, pitch: Math.floor(Math.random() * 11), color: 'red', hit: false }); }
        });
    }
}

function generateMathQuestion() {
    const d = minigameState.difficulty; let a, b, op;
    if (d === 1) { a = Math.floor(Math.random() * 10); b = Math.floor(Math.random() * 10); op = '+'; }
    else if (d === 2) { a = Math.floor(Math.random() * 90) + 10; b = Math.floor(Math.random() * 90) + 10; op = '+'; }
    else if (d === 3) { b = Math.floor(Math.random() * 50) + 10; a = b + Math.floor(Math.random() * 50); op = '-'; }
    else if (d === 4) { a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * 20) + 5; op = 'x'; }
    else { a = Math.floor(Math.random() * 100) + 10; b = Math.floor(Math.random() * 10) + 2; op = 'x'; }
    minigameState.question = `${a} ${op} ${b} = ?`;
    minigameState.correctAnswer = (op === '+') ? (a + b) : (op === '-') ? (a - b) : (a * b);
    minigameState.timer = 10; minigameState.lastTimerUpdate = Date.now(); minigameState.answer = "";
}

function handleMinigameInput(key) {
    if (minigameState.type === 'chicken') {
        if (key === 'Enter' && !minigameState.isJumping) { minigameState.isJumping = true; minigameState.jumpVel = -18; }
    } else if (minigameState.type === 'math') {
        if (key >= '0' && key <= '9' || (key === '-' && minigameState.answer === "")) minigameState.answer += key;
        else if (key === 'Backspace') minigameState.answer = minigameState.answer.slice(0, -1);
        else if (key === 'Enter') {
            if (parseInt(minigameState.answer) === minigameState.correctAnswer) { success(); minigameState.difficulty++; }
            else { failure(); minigameState.difficulty = Math.max(1, minigameState.difficulty - 1); }
            if (!minigameState.gameOver) generateMathQuestion();
        }
    } else if (minigameState.type === 'karaoke') {
        if (key === 'ArrowUp') minigameState.diamondPos = Math.min(10, minigameState.diamondPos + 1);
        else if (key === 'ArrowDown') minigameState.diamondPos = Math.max(0, minigameState.diamondPos - 1);
    }
}

function success() {
    minigameState.successes++; score += 100; audio.playSFX('SUCCESS');
    if (minigameState.successes >= 4) { score += 1000; minigameState.gameOver = true; minigameState.won = true; audio.playSFX('TADA'); endMinigame(); }
}
function failure() {
    minigameState.failures++; audio.playSFX('FAILURE');
    if (minigameState.failures >= 3) { minigameState.gameOver = true; minigameState.won = false; audio.playSFX('SAD_TROMBONE'); endMinigame(); }
}
function endMinigame() {
    currentPhase = PHASES.MINIGAME_POST;
    let msg = "", actor = "", char = "";
    if (minigameState.type === 'chicken') { actor = 'Jason'; char = 'Farmer Lucky'; msg = minigameState.won ? "Thanks for catching my chickens!" : "You have failed this farm. Never return here again."; }
    else if (minigameState.type === 'math') { actor = 'Peter'; char = 'Mr. Bergemot'; msg = minigameState.won ? "Wow! You're still a top-tier mathlete!" : "That's too bad. *sigh* Really I blame myself."; }
    else if (minigameState.type === 'karaoke') { actor = 'Velvet'; char = 'Lord Karaoke'; msg = minigameState.won ? "Killer performance! Your next round of drinks is on me!" : "You have failed karaoke night. Leave here, and take your dishonor with you."; }
    showDialog(char, actor, msg, null);
}

let fightingState = {};
function startFightingGame(nextPhase, isShadow = false) {
    if (selectedIndex === undefined) selectedIndex = 5;
    const playerChar = CAST[selectedIndex].name;
    const partnerName = PARTNER_PAIRS[playerChar];
    const partner = CAST.find(c => c.name === partnerName);
    const partnerActor = partner.actor;
    let partnerFirstName = partnerName.split(' ')[0];
    if (partnerName === 'The Velvet Duke') partnerFirstName = 'Velvet';

    const setupFight = () => {
        currentPhase = PHASES.CONFRONTATION_PLAY;
        audio.play('FIGHT_BGM');
        fightingState = {
            player: { 
                actor: CAST[selectedIndex].actor.toLowerCase(),
                x: 100, y: 400, width: 64, height: 64, health: 100, attacking: 0, frame: 0, state: 'idle', facing: 1
            },
            ai: { 
                actor: isShadow ? CAST[selectedIndex].actor.toLowerCase() : partnerActor.toLowerCase(),
                x: 650, y: 400, width: 64, height: 64, health: 100, attacking: 0, frame: 0, state: 'idle', facing: -1,
                isShadow: isShadow
            },
            gameOver: false, won: false, nextPhase: nextPhase
        };
    };

    if (isShadow) {
        setupFight();
    } else {
        showDialog(partnerFirstName, partnerActor, "Well, maybe we shouldn't be friends any more!", setupFight);
    }
}

function startOnYourOwn() {
    if (selectedIndex === undefined) selectedIndex = 5;
    const playerChar = CAST[selectedIndex].name;
    const playerFirstName = playerChar.split(' ')[0];
    const playerActor = CAST[selectedIndex].actor;
    const partnerName = PARTNER_PAIRS[playerChar];
    const partnerFirstName = partnerName.split(' ')[0];

    let dialogs = [
        ["?????", playerFirstName, "Hehehehhe.  Hee hee hee.", 'silhouette'],
        ["?????", playerFirstName, "Now you are finally on your own.", 'silhouette'],
        ["?????", playerFirstName, "And I will tell you what I really think of you.", 'silhouette'],
        [playerFirstName, playerActor, "Who... who is that?", null],
        ["?????", playerFirstName, "Don't you recognize me?", 'silhouette'],
        ["?????", playerFirstName, "Don't you recognize the wrenching inner conflicts you feel in the dead of night?", 'silhouette'],
        ["?????", playerFirstName, "The nagging doubts that creep around your every act?", 'silhouette'],
        ["?????", playerFirstName, "I have been here the whole time, " + playerFirstName + ".  It is I...", 'silhouette'],
        ["SHADOW", playerFirstName, "YOUR SHADOW!!!", 'inverted']
    ];

    let currentD = 0;
    const nextDialog = () => {
        if (currentD < dialogs.length) {
            const d = dialogs[currentD++];
            showDialog(d[0], d[1], d[2], nextDialog, d[3]);
        } else {
            currentPhase = PHASES.ON_YOUR_OWN;
        }
    };
    nextDialog();
}

function handleFightingInput() {
    if (fightingState.gameOver) {
        if (keysPressed.has('Enter')) { 
            if (fightingState.nextPhase === PHASES.TOGETHER_AGAIN) {
                startTogetherAgain();
            } else if (fightingState.nextPhase === PHASES.SEPARATE_WAYS) {
                startSeparateWays();
            } else {
                currentPhase = fightingState.nextPhase;
                if (currentPhase === PHASES.CLOSING_CREDITS) {
                    creditsY = canvas.height; creditsFinished = false; audio.play('MOON');
                }
            }
        } 
        return; 
    }
    const p = fightingState.player;
    let moving = false;
    if (keysPressed.has('ArrowLeft')) { p.x = Math.max(0, p.x - 5); p.state = 'walk_left'; p.facing = -1; moving = true; }
    else if (keysPressed.has('ArrowRight')) { p.x = Math.min(canvas.width - p.width, p.x + 5); p.state = 'walk_right'; p.facing = 1; moving = true; }
    
    if (keysPressed.has('a')) { performAttack(p, 'punch'); audio.playSFX('punch'); }
    else if (keysPressed.has('s')) { performAttack(p, 'kick'); audio.playSFX('kick'); }
    else if (!moving && p.attacking === 0) p.state = 'idle';
}

function performAttack(char, type) {
    if (char.attacking > 0) return;
    char.attacking = type === 'punch' ? 10 : 15; char.attackType = type;
    char.state = type === 'punch' ? 'punch' : 'kick';
    const other = char === fightingState.player ? fightingState.ai : fightingState.player;
    const range = type === 'punch' ? 40 : 60; const damage = type === 'punch' ? 5 : 8;
    
    const charCenterX = char.x + 32;
    const otherCenterX = other.x + 32;
    const dist = Math.abs(charCenterX - otherCenterX);
    const facingOther = (char.facing === 1 && otherCenterX > charCenterX) || (char.facing === -1 && otherCenterX < charCenterX);

    if (dist < (32 + 32 + range) && facingOther) {
        other.health = Math.max(0, other.health - damage);
        if (other.health <= 0 && !fightingState.gameOver) {
            fightingState.gameOver = true; fightingState.won = (char === fightingState.player);
            if (fightingState.won) audio.playSFX('TADA'); else audio.playSFX('SAD_TROMBONE');
        }
    }
}

function updateAI() {
    if (fightingState.gameOver || currentPhase !== PHASES.CONFRONTATION_PLAY) return;
    const ai = fightingState.ai; const p = fightingState.player;
    if (!ai || !p) return;
    if (ai.attacking === 0) {
        if (ai.x > p.x + 100) { ai.x -= 3; ai.state = 'walk_left'; ai.facing = -1; }
        else if (ai.x < p.x - 100) { ai.x += 3; ai.state = 'walk_right'; ai.facing = 1; }
        else { ai.state = 'idle'; ai.facing = (p.x > ai.x) ? 1 : -1; }
        if (Math.random() < 0.05) { performAttack(ai, Math.random() < 0.5 ? 'punch' : 'kick'); audio.playSFX('kick'); }
    }
    if (ai.attacking > 0) {
        ai.attacking--;
        if (ai.attacking === 0) ai.state = 'idle';
    }
    if (p.attacking > 0) {
        p.attacking--;
        if (p.attacking === 0) p.state = 'idle';
    }
}

let separateWaysState = { startTime: 0, index: 0 };
function startSeparateWays() {
    currentPhase = PHASES.SEPARATE_WAYS;
    separateWaysState = { startTime: Date.now(), index: 0 };
    audio.play('KARAOKE_BGM');
}

let togetherAgainState = { startTime: 0, playerX: -100 };
function startTogetherAgain() {
    currentPhase = PHASES.TOGETHER_AGAIN;
    togetherAgainState = { startTime: Date.now(), playerX: -100, state: 'walking' };
    audio.play('TOGETHER_BGM');
}

function startClosingInterview() {
    currentPhase = PHASES.CLOSING_INTERVIEW;
    audio.play('INTERVIEW_BGM');
    if (selectedIndex === undefined) selectedIndex = 5;
    const playerFirstName = CAST[selectedIndex].name.split(' ')[0];
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerFirstName = partnerName.split(' ')[0];
    const partnerActor = CAST.find(c => c.name === partnerName).actor;

    let dialogs = [
        [playerFirstName, CAST[selectedIndex].actor, "We had a crazy trip.", 'top'],
        [partnerFirstName, partnerActor, "It challenged our friendship.", 'top'],
        [playerFirstName, CAST[selectedIndex].actor, "It was a crazy time.", 'top'],
        [partnerFirstName, partnerActor, "But we learned a lot about ourselves.", 'top'],
        [playerFirstName, CAST[selectedIndex].actor, "I gained " + score + " points worth of self-knowledge!", 'top']
    ];

    let currentD = 0;
    const nextDialog = () => {
        if (currentD < dialogs.length) {
            const d = dialogs[currentD++];
            showDialog(d[0], d[1], d[2], nextDialog, d[3]);
        } else {
            currentPhase = PHASES.CLOSING_CREDITS;
            creditsY = canvas.height; creditsFinished = false; audio.play('MOON');
        }
    };
    nextDialog();
}

function gameLoop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (currentPhase) {
        case PHASES.INTRO: drawIntro(); break;
        case PHASES.TITLE: drawTitle(); break;
        case PHASES.CHOOSE_TRAVELLER: drawTravellerSelect(); break;
        case PHASES.PARTNER_ANNOUNCEMENT: drawPartnerAnnouncement(); break;
        case PHASES.DEPARTURE_CUTSCENE: drawDepartureCutscene(); if (Date.now() - cutsceneStartTime > CUTSCENE_DURATION) { startInTheCar(); } break;
        case PHASES.IN_THE_CAR: drawInTheCar(); break;
        case PHASES.MINIGAME_MAP: drawMinigameMap(); break;
        case PHASES.MINIGAME_PLAY: drawMinigamePlay(); break;
        case PHASES.MINIGAME_POST: drawMinigamePost(); break;
        case PHASES.THE_CONFRONTATION: drawConfrontationTitle(); break;
        case PHASES.SEPARATE_WAYS: drawSeparateWays(); break;
        case PHASES.ON_YOUR_OWN: drawOnYourOwnTitle(); break;
        case PHASES.CONFRONTATION_PLAY: handleFightingInput(); updateAI(); drawConfrontationPlay(); break;
        case PHASES.TOGETHER_AGAIN: drawTogetherAgain(); break;
        case PHASES.CLOSING_INTERVIEW: drawClosingInterview(); break;
        case PHASES.CLOSING_CREDITS: drawCredits(); break;
    }
    if (currentDialog) drawDialogBox();
    requestAnimationFrame(gameLoop);
}

function drawPixelatedImage(img, sx, sy, sw, sh, dx, dy, dw, dh, filter = null) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    if (filter === 'silhouette' || filter === 'inverted') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = dw; tempCanvas.height = dh;
        const tctx = tempCanvas.getContext('2d');
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        
        if (filter === 'silhouette') {
            tctx.globalCompositeOperation = 'source-in';
            tctx.fillStyle = 'black';
            tctx.fillRect(0, 0, dw, dh);
        } else if (filter === 'inverted') {
            // Invert colors using 'difference' blending with white
            tctx.globalCompositeOperation = 'difference';
            tctx.fillStyle = 'white';
            tctx.fillRect(0, 0, dw, dh);
            // Mask with original alpha to keep transparency
            tctx.globalCompositeOperation = 'destination-in';
            tctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        }
        ctx.drawImage(tempCanvas, dx, dy);
    } else {
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
}

function drawDialogBox() {
    const isTop = currentDialog.style === 'top';
    const boxY = isTop ? 20 : canvas.height - 200;
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(50, boxY, 700, 150);
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(50, boxY, 700, 150);
    
    // Background square for headshot
    const bgRectX = 70, bgRectY = boxY + 10, bgRectSize = 100;
    ctx.fillStyle = currentDialog.style === 'silhouette' ? '#888' : COLORS.BLACK;
    ctx.fillRect(bgRectX, bgRectY, bgRectSize, bgRectSize);

    const img = currentDialog.style === 'inverted' ? currentDialog.castMember.invertedImg : currentDialog.castMember.img;
    if (currentDialog.castMember && img.complete) {
        const size = Math.min(img.width, img.height);
        const ox = (img.width - size) / 2; const oy = (img.height - size) / 2;
        const pixelStyle = currentDialog.style === 'inverted' ? null : currentDialog.style;
        drawPixelatedImage(img, ox, oy, size, size, 70, boxY + 10, 100, 100, pixelStyle);
    }
    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    const nameWords = currentDialog.name.split(' '); const nameLines = []; let currentNameLine = '';
    nameWords.forEach(word => {
        const testLine = currentNameLine + word + ' ';
        if (ctx.measureText(testLine).width > 100) { nameLines.push(currentNameLine.trim()); currentNameLine = word + ' '; }
        else currentNameLine = testLine;
    });
    nameLines.push(currentNameLine.trim());
    nameLines.forEach((line, i) => ctx.fillText(line, 120, boxY + 125 + i * 15));
    ctx.textAlign = 'left'; ctx.font = '12px "Press Start 2P"';
    const lines = currentDialog.chunks[currentDialog.chunkIndex].split('\n');
    lines.forEach((line, i) => ctx.fillText(line, 200, boxY + 40 + i * 30));
    if (Math.floor(Date.now() / 500) % 2 === 0) { ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('Press Enter to Continue', 400, boxY + 175); }
}

function drawIntro() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
}

// PROTECTED START 

function drawTitle(includeTitleText=true) {
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    gradient.addColorStop(0, COLORS.SUNSET_PURPLE); gradient.addColorStop(1, COLORS.SUNSET_ORANGE);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    for (let i = 0; i < 4; i++) {
        const cx = (i * 250 + time * 20) % (canvas.width + 100) - 50; const cy = 80 + Math.sin(time + i) * 15;
        if (cloudImg.complete) drawPixelatedImage(cloudImg, 0, 0, cloudImg.width, cloudImg.height, cx, cy, 100, 60);
    }
    ctx.fillStyle = '#1a471a';
    for (let i = 0; i < 8; i++) {
        const tx = (i * 150 - time * 40) % (canvas.width + 100); const realTx = tx < -50 ? tx + canvas.width + 100 : tx;
        const ty = canvas.height * 0.6; ctx.beginPath(); ctx.moveTo(realTx, ty); ctx.lineTo(realTx + 20, ty - 40); ctx.lineTo(realTx + 40, ty); ctx.fill();
    }
    ctx.fillStyle = '#333'; ctx.fillRect(0, canvas.height * 0.6, canvas.width, 100);
    ctx.fillStyle = '#5c3317'; ctx.fillRect(0, canvas.height * 0.6 + 100, canvas.width, canvas.height * 0.4 - 100);
    ctx.fillStyle = '#FFF'; const lineOffset = (time * 150) % 60;
    for (let i = canvas.width; i > -60; i -= 60) ctx.fillRect(i - lineOffset, canvas.height * 0.6 + 45, 30, 10);

    // Procedural Car for Title Screen (Station Wagon style)
    const carX = canvas.width / 2 - 60;
    const carY = canvas.height * 0.6 + 20 + Math.sin(time * 15) * 2;
    ctx.fillStyle = '#8B4513'; // Wood panel brown
    ctx.fillRect(carX, carY, 120, 40); // Body
    ctx.fillStyle = '#DAA520'; // Upper body/roof
    ctx.fillRect(carX, carY - 15, 80, 15);
    ctx.fillStyle = '#000'; // Wheels
    ctx.fillRect(carX + 15, carY + 35, 20, 10);
    ctx.fillRect(carX + 85, carY + 35, 20, 10);
    ctx.fillStyle = COLORS.SKY_BLUE; // Windows
    ctx.fillRect(carX + 5, carY - 10, 30, 10);
    ctx.fillRect(carX + 40, carY - 10, 30, 10);

    if (includeTitleText) {
        ctx.textAlign = 'center'; ctx.font = '40px "Press Start 2P"'; ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('WANDERLUST', canvas.width / 2 + 4, 154); ctx.fillStyle = COLORS.WHITE; ctx.fillText('WANDERLUST', canvas.width / 2, 150);
        if (Math.floor(Date.now() / 500) % 2 === 0) { ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height - 50); }
    }
}

// PROTECTED END


function drawTravellerSelect() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CHOOSE YOUR TRAVELER', canvas.width / 2, 80);
    CAST.forEach((c, i) => {
        const col = i % 4; const row = Math.floor(i / 4); const x = 50 + col * 180; const y = 150 + row * 180;
        ctx.strokeStyle = (i === selectedIndex) ? COLORS.SELECTION_YELLOW : COLORS.WHITE;
        ctx.lineWidth = 4; ctx.strokeRect(x, y, 150, 150);
        if (c.img.complete) {
            const size = Math.min(c.img.width, c.img.height); const ox = (c.img.width - size) / 2; const oy = (c.img.height - size) / 2;
            drawPixelatedImage(c.img, ox, oy, size, size, x + 10, y + 10, 130, 130);
        }
        ctx.fillStyle = COLORS.WHITE; ctx.font = '8px "Press Start 2P"'; ctx.fillText(c.actor, x + 75, y + 165);
    });
}

function drawPartnerAnnouncement() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '20px "Press Start 2P"'; ctx.textAlign = 'center';
    const playerChar = CAST[selectedIndex].name; const partnerFullName = PARTNER_PAIRS[playerChar];
    let partnerFirstName = partnerFullName.split(' ')[0]; if (partnerFullName === 'The Velvet Duke') partnerFirstName = 'Velvet';
    const partner = CAST.find(c => c.name === partnerFullName);
    ctx.fillText('Your traveling companion is...', canvas.width / 2, 100); ctx.font = '30px "Press Start 2P"'; ctx.fillText(partnerFirstName + "!", canvas.width / 2, 160);
    const boxSize = 250; const bx = canvas.width / 2 - boxSize / 2; const by = 220;
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 4; ctx.strokeRect(bx, by, boxSize, boxSize);
    if (partner && partner.img.complete) {
        const size = Math.min(partner.img.width, partner.img.height); const ox = (partner.img.width - size) / 2; const oy = (partner.img.height - size) / 2;
        drawPixelatedImage(partner.img, ox, oy, size, size, bx + 10, by + 10, boxSize - 20, boxSize - 20);
    }
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height - 50);
}

function drawDepartureCutscene() {
    const elapsed = Date.now() - cutsceneStartTime;
    const progress = elapsed / CUTSCENE_DURATION;

    if (departureBgImg.complete) {
        ctx.drawImage(departureBgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = COLORS.SKY_BLUE;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const playerActor = CAST[selectedIndex].actor.toLowerCase();
    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();

    // Others waving in front of house (Row 3 of slash.png)
    const others = CAST.filter(c => c.actor.toLowerCase() !== playerActor && c.actor.toLowerCase() !== partnerActor);
    others.forEach((c, i) => {
        const actor = c.actor.toLowerCase();
        const sprite = slashSprites[actor];
        if (sprite && sprite.complete) {
            // Randomly out of sync animation
            const seed = (c.actor.length * 123) % 1000;
            const frame = Math.floor((Date.now() + seed) / 150) % 6;
            // Row 3 (index 2) of slash.png
            drawPixelatedImage(sprite, frame * 64, 2 * 64, 64, 64, 320 + i * 45, 380, 64, 64);
        }
    });


    // PROTECTED START

    // Wagon leaving (left to right)
    const carX = 80 + progress * 600;
    const carY = 400;
    const scale = .5;
    if (wagonImg.complete) {
        const w = wagonImg.width * scale; // Scale up by 50%
        const h = wagonImg.height * scale;
        drawPixelatedImage(wagonImg, 0, 0, wagonImg.width, wagonImg.height, carX, carY, w, h);
        
        // Heads in windows (row 4 of sit.png)
        [partnerActor, playerActor].forEach((actor, i) => {
            const sprite = sitSprites[actor];
            if (sprite && sprite.complete) {
                // Show only top half of sprite
                const windowX = carX + (i === 0 ? 130 : 180); // Front and rear roughly
                drawPixelatedImage(sprite, 0, 3 * 64 + 10, 64, 32, windowX, carY + 10, 64, 32);
            }
        });
    }
    
    // PROTECTED END
}


// PROTECTED START
function drawMinigameMap() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '24px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(`Stop #${currentMinigameIndex + 1}`, canvas.width / 2, 80);
    const gameType = minigameOrder[currentMinigameIndex];
    ctx.font = '30px "Press Start 2P"';
    const titles = { chicken: 'CATCH THAT CHICKEN', math: 'MATHEMAGIC!', karaoke: 'KARAOKE NIGHT' };
    ctx.fillText(titles[gameType], canvas.width / 2, 140);
    if (canadaMapImg.complete && canadaMapImg.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false; const imgWidth = 500; const imgHeight = 300;
        const ix = (canvas.width - imgWidth) / 2; const iy = 200; ctx.drawImage(canadaMapImg, ix, iy, imgWidth, imgHeight);
        const ox = ix + imgWidth * 0.85; const oy = iy + imgHeight * 0.75;
        const vx = ix + imgWidth * 0.15; const vy = iy + imgHeight * 0.45;
        ctx.save(); ctx.strokeStyle = COLORS.SUNSET_ORANGE; ctx.lineWidth = 4; ctx.shadowColor = COLORS.ORANGE_GLOW; ctx.shadowBlur = 10;
        ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.bezierCurveTo(ix + imgWidth * 0.6, iy + imgHeight * 0.3, ix + imgWidth * 0.4, iy + imgHeight * 0.3, vx, vy); ctx.stroke(); ctx.restore();
        const xPos = [0.25, 0.5, 0.75][currentMinigameIndex];
        const tx = ox + (vx - ox) * xPos; const ty = oy + (vy - oy) * xPos - Math.sin(xPos * Math.PI) * 40;
        ctx.fillStyle = COLORS.RED; ctx.font = '30px "Press Start 2P"'; ctx.fillText('X', tx, ty);
    } else { ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; ctx.strokeRect(150, 200, 500, 300); }
    ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, 550);
}


// PROTECTED END

function drawMinigamePlay() {
    const gameType = minigameOrder[currentMinigameIndex];
    
    // UI elements common to all minigames
    ctx.fillStyle = COLORS.WHITE; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'left'; 
    ctx.fillText(`Score: ${score}`, 20, 30);
    
    // Successes (4 green circles)
    for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(200 + i * 30, 25, 10, 0, Math.PI * 2);
        if (i < minigameState.successes) { 
            ctx.fillStyle = COLORS.GREEN; ctx.fill(); 
        } else { 
            ctx.strokeStyle = COLORS.GREEN; ctx.lineWidth = 2; ctx.stroke(); 
        }
    }
    
    // Failures (3 red squares)
    for (let i = 0; i < 3; i++) {
        const fx = 350 + i * 30;
        if (i < minigameState.failures) { 
            ctx.fillStyle = COLORS.RED; ctx.fillRect(fx - 10, 15, 20, 20); 
        } else { 
            ctx.strokeStyle = COLORS.RED; ctx.lineWidth = 2; ctx.strokeRect(fx - 10, 15, 20, 20); 
        }
    }

    if (gameType === 'chicken') drawChickenGame(); 
    else if (gameType === 'math') drawMathGame(); 
    else if (gameType === 'karaoke') drawKaraokeGame();
}

// PROTECTED START 

const roadCentreY = 480;

function drawChickenGame() {
    const state = minigameState; 
    ctx.fillStyle = COLORS.SKY_BLUE; 
    ctx.fillRect(0, 0, canvas.width, 400);
    
    // Parallax Background
    if (farmBgImg.complete) {
        state.parallax.bgX = (state.parallax.bgX - 0.5) % (canvas.width * 2);
        ctx.drawImage(farmBgImg, state.parallax.bgX, 0, canvas.width * 2, 400);
        ctx.drawImage(farmBgImg, state.parallax.bgX + canvas.width * 2, 0, canvas.width * 2, 400);
    }

    // Grass area below sky
    ctx.fillStyle = '#4a7a2a'; 
    ctx.fillRect(0, 400, canvas.width, 200);

    // Trees (behind road)
    state.parallax.trees.forEach(t => {
        t.x -= 3; 
        if (t.x < -200) {
            t.x = canvas.width + Math.random() * 200;
            t.scale = 0.8 + Math.random() * 0.4;
            t.flipped = Math.random() < 0.5;
        }
        if (treeImg.complete) {
            ctx.save();
            const tw = 120 * t.scale;
            const th = 180 * t.scale;
            if (t.flipped) {
                ctx.translate(t.x + tw, roadCentreY - 20);
                ctx.scale(-1, 1);
                drawPixelatedImage(treeImg, 0, 0, treeImg.width, treeImg.height, 0, -th, tw, th);
            } else {
                drawPixelatedImage(treeImg, 0, 0, treeImg.width, treeImg.height, t.x, roadCentreY - 20 - th, tw, th);
            }
            ctx.restore();
        }
    });

    // Road
    if (countryRoadImg.complete) {
        const roadW = countryRoadImg.width;
        state.parallax.roadX = (state.parallax.roadX - 8) % roadW;
        for (let x = state.parallax.roadX; x < canvas.width + roadW; x += roadW) {
            ctx.drawImage(countryRoadImg, x, roadCentreY - 60);
        }
    }

    // Player Jump Physics
    if (state.isJumping) { 
        state.playerY += state.jumpVel; 
        state.jumpVel += 0.8; 
        if (state.playerY >= roadCentreY) { 
            state.playerY = roadCentreY; 
            state.isJumping = false; 
        } 
    }
    
    const actorName = (CAST[selectedIndex] ? CAST[selectedIndex].actor : 'Peter').toLowerCase();
    const pcSheet = state.isJumping ? jumpSprites[actorName] : runSprites[actorName];
    if (pcSheet && pcSheet.complete) {
        state.frame = (state.frame + 0.2) % 6; 
        const frameX = Math.floor(state.frame) * 64;
        // Player is double size (128x128)
        drawPixelatedImage(pcSheet, frameX, 3 * 64, 64, 64, 100, state.playerY - 120, 128, 128);
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center'; 
    ctx.fillText('Press Enter to Jump', canvas.width / 2, canvas.height - 30);

    // Entities
    state.entities.forEach(ent => {
        ent.x -= 8;
        if (ent.type === 'chicken') {
            ent.x += ent.speed;
            if (chickenSheetImg.complete) {
                ent.frame = (ent.frame + 0.2) % 16; 
                const fx = Math.floor(ent.frame) * 128;
                // Chicken is half size (64x64)
                ctx.drawImage(chickenSheetImg, fx, 0, 128, 128, ent.x, roadCentreY - 50, 64, 64);
            }
        } else {
            if (skullImg.complete) {
                ctx.drawImage(skullImg, 0, 0, skullImg.width, skullImg.height, ent.x, roadCentreY - 25, 40, 30);
            }
        }
        
        // Collision Detection
        if (Math.abs(ent.x - 100) < 40 && Math.abs(roadCentreY - state.playerY) < 50) {
            // Check if player is actually touching the ground/entity (simple jump height check)
            if (ent.type === 'skull') {
                if (!state.isJumping || state.playerY > roadCentreY - 40) {
                    failure(); ent.x = -1000;
                }
            } else if (ent.type === 'chicken') {
                 if (!state.isJumping || state.playerY > roadCentreY - 60) {
                    success(); ent.x = -1000;
                 }
            }
        }
    });
}

// PROTECTED END

function drawMathGame() {
    // Chalkboard background
    ctx.fillStyle = '#004400'; ctx.fillRect(50, 100, 700, 400); 
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 10; ctx.strokeRect(50, 100, 700, 400);
    
    // Peter standing in front (Mr. Bergemot)
    const peterSprite = idleSprites['peter'];
    if (peterSprite && peterSprite.complete) {
        // Show Peter on the side
        drawPixelatedImage(peterSprite, 0, 3 * 64, 64, 64, 100, 350, 128, 128);
    }

    ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center'; 
    ctx.fillText(minigameState.question, 400, 250); 
    ctx.fillText(minigameState.answer + "_", 400, 350);
    
    const elapsed = Date.now() - minigameState.lastTimerUpdate;
    if (elapsed > 1000) { 
        minigameState.timer--; 
        minigameState.lastTimerUpdate = Date.now(); 
        if (minigameState.timer <= 0) { failure(); generateMathQuestion(); } 
    }
    
    ctx.font = '20px "Press Start 2P"'; ctx.fillText(`Time: ${minigameState.timer}`, 400, 450);
    ctx.font = '10px "Press Start 2P"'; ctx.fillText('Type in your answer and press enter.', 400, 520);
}

function drawKaraokeGame() {
    const state = minigameState; ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    
    // Musical Staff (5 lines)
    ctx.strokeStyle = COLORS.WHITE; ctx.lineWidth = 2; 
    const staffTop = 250; 
    const lineSpacing = 30;
    for (let i = 0; i < 5; i++) { 
        const y = staffTop + i * lineSpacing; 
        ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(750, y); ctx.stroke(); 
    }
    
    // G-clef (placeholder text for now as per pixel art rule)
    ctx.font = '60px Arial';
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText('∮', 60, staffTop + 100);

    // Pitch logic: notes can be on lines or in gaps
    // Pitch 0 is below bottom line, Pitch 1 is bottom line, etc.
    const getY = (p) => staffTop + (10 - p) * 0.5 * lineSpacing;
    
    // Player Diamond (Gold)
    ctx.fillStyle = COLORS.GOLD; 
    const dy = getY(state.diamondPos); 
    ctx.beginPath(); 
    ctx.moveTo(100, dy - 15); 
    ctx.lineTo(120, dy); 
    ctx.lineTo(100, dy + 15); 
    ctx.lineTo(80, dy); 
    ctx.fill(); 

    // Notes
    state.notes.forEach(note => {
        note.x -= 4; 
        // Red when far right, white as they move left
        if (note.x < 400 && note.color === 'red') note.color = 'white';
        
        ctx.fillStyle = note.hit ? COLORS.GREEN : note.color; 
        ctx.beginPath(); ctx.arc(note.x, getY(note.pitch), 10, 0, Math.PI * 2); ctx.fill();
        
        // Success condition: diamond touches note as it passes (at x=100)
        if (Math.abs(note.x - 100) < 15 && !note.hit) { 
            if (note.pitch === state.diamondPos) { 
                success(); 
                note.hit = true; 
            } 
        }
        
        // Failure condition: note passes x=80 without hit
        if (note.x < 80 && !note.hit) { 
            failure(); 
            note.hit = true; 
            note.color = COLORS.RED;
        }
    });
}

function drawMinigamePost() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '40px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(minigameState.won ? "Great job!" : "Too bad!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 150);
}

function drawConfrontationTitle() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '40px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('The Confrontation', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 150);
}

function drawOnYourOwnTitle() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = '40px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('On Your Own?', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 150);
}

function drawConfrontationPlay() {
    // Determine background based on whether it's the Shadow fight
    const isShadowFight = fightingState.ai && fightingState.ai.isShadow;
    const bg = isShadowFight ? onYourOwnBgImg : confrontationBgImg;
    
    if (bg.complete) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (!fightingState.player || !fightingState.ai) return;

    // Health bars
    ctx.fillStyle = COLORS.RED;
    ctx.fillRect(50, 50, 300, 20);
    ctx.fillRect(450, 50, 300, 20);
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillRect(50, 50, 3 * fightingState.player.health, 20);
    ctx.fillRect(450 + 3 * (100 - fightingState.ai.health), 50, 3 * fightingState.ai.health, 20);

    // Characters
    [fightingState.player, fightingState.ai].forEach((char, i) => {
        let sprite = combatSprites[char.actor];
        let row = 0;
        let frames = 1;

        if (char.state.startsWith('walk')) {
            sprite = walkSprites[char.actor];
            row = char.facing === 1 ? 3 : 1;
            frames = 6;
        } else if (char.state === 'punch') {
            sprite = halfSlashSprites[char.actor];
            row = char.facing === 1 ? 3 : 1;
            frames = 6;
        } else if (char.state === 'kick') {
            sprite = backSlashSprites[char.actor];
            row = char.facing === 1 ? 3 : 1;
            frames = 6;
        } else {
            sprite = combatSprites[char.actor];
            row = char.facing === 1 ? 3 : 1;
            frames = 1;
        }

        if (sprite && sprite.complete) {
            char.frame = (char.frame + 0.1) % frames;
            const fx = Math.floor(char.frame) * 64;
            // Use 'inverted' filter if it's the shadow
            drawPixelatedImage(sprite, fx, row * 64, 64, 64, char.x, char.y, 128, 128, char.isShadow ? 'inverted' : null);
        }
    });

    if (fightingState.gameOver) {
        ctx.fillStyle = COLORS.WHITE; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(fightingState.won ? 'YOU WIN!' : 'YOU LOSE!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px "Press Start 2P"'; ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2 + 50);
    }
}

function drawSeparateWays() {
    const elapsed = Date.now() - separateWaysState.startTime;
    const cycleDuration = 5000;
    const totalCycles = 6;
    const currentCycle = Math.floor(elapsed / cycleDuration);
    
    if (currentCycle >= totalCycles) {
        // Stop panning/alternating
        ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.WHITE; ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Continue', canvas.width / 2, canvas.height / 2);
        return;
    }

    const index = currentCycle % 2; // 0: Companion, 1: Player
    const zoomCycles = Math.floor(currentCycle / 2); // 0, 1, 2
    const bg = index === 0 ? companionSitsBg : playerSitsBg;
    
    if (bg.complete) {
        let zoom = 1;
        let panX = 0;
        const progress = (elapsed % cycleDuration) / cycleDuration;

        if (zoomCycles === 1) {
            zoom = 1.3;
            panX = progress * 40; // Camera moves right, so background pans left
        } else if (zoomCycles === 2) {
            zoom = 1.6;
            panX = -progress * 40; // Camera moves left, so background pans right
        }

        ctx.save();
        
        // Character position in original image coords
        let charX, charY;
        const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
        const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
        const playerActor = CAST[selectedIndex].actor.toLowerCase();
        
        if (index === 0) {
            charX = 253; charY = 477;
        } else {
            charX = 48; charY = 453;
        }

        // Center zoom on character
        const centerX = charX + 32;
        const centerY = charY + 32;
        
        const W = canvas.width;
        const H = canvas.height;
        
        // Target point in image coords, including pan
        let targetX = centerX + panX;
        let targetY = centerY;
        
        // Clamp targetX and targetY to ensure background image (W x H) always fills canvas (W x H)
        const halfVisibleW = W / (2 * zoom);
        const minX = halfVisibleW;
        const maxX = W - halfVisibleW;
        targetX = Math.max(minX, Math.min(maxX, targetX));
        
        const halfVisibleH = H / (2 * zoom);
        const minY = halfVisibleH;
        const maxY = H - halfVisibleH;
        targetY = Math.max(minY, Math.min(maxY, targetY));

        ctx.translate(W / 2, H / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-targetX, -targetY);
        
        ctx.drawImage(bg, 0, 0, W, H);
        
        const sprite = index === 0 ? sitSprites[partnerActor] : sitSprites[playerActor];
        if (sprite && sprite.complete) {
            const frame = 0;
            drawPixelatedImage(sprite, frame * 64, 3 * 64, 64, 64, charX, charY, 64, 64);
        }
        
        ctx.restore();
    }
}

function drawTogetherAgain() {
    if (companionSitsBg.complete) {
        ctx.drawImage(companionSitsBg, 0, 0, canvas.width, canvas.height);
    }

    const partnerName = PARTNER_PAIRS[CAST[selectedIndex].name];
    const partnerActor = CAST.find(c => c.name === partnerName).actor.toLowerCase();
    const playerActor = CAST[selectedIndex].actor.toLowerCase();

    // Companion sitting
    const sitSprite = sitSprites[partnerActor];
    if (sitSprite && sitSprite.complete) {
        drawPixelatedImage(sitSprite, 0, 3 * 64, 64, 64, 253, 430, 128, 128);
    }

    // Player walking and sitting
    if (togetherAgainState.state === 'walking') {
        togetherAgainState.playerX += 2;
        const walkSprite = walkSprites[playerActor];
        if (walkSprite && walkSprite.complete) {
            const frame = Math.floor(Date.now() / 150) % 6;
            drawPixelatedImage(walkSprite, frame * 64, 3 * 64, 64, 64, togetherAgainState.playerX, 430, 128, 128);
        }
        if (togetherAgainState.playerX >= 230) {
            togetherAgainState.state = 'sitting';
            const pFirst = CAST[selectedIndex].name.split(' ')[0];
            const cFirst = partnerName.split(' ')[0];
            showDialog(pFirst, CAST[selectedIndex].actor, "I'm sorry I fought with you.", () => {
                showDialog(cFirst, CAST.find(c => c.name === partnerName).actor, "I'm sorry too.", () => {
                    showDialog(pFirst, CAST[selectedIndex].actor, "Can we be friends again?", () => {
                        showDialog(cFirst, CAST.find(c => c.name === partnerName).actor, "Yes we can!", () => {
                            showDialog(pFirst, CAST[selectedIndex].actor, "YAY!", startClosingInterview, 'top');
                        }, 'top');
                    }, 'top');
                }, 'top');
            }, 'top');
        }
    } else {
        const playerSit = sitSprites[playerActor];
        if (playerSit && playerSit.complete) {
            drawPixelatedImage(playerSit, 0, 3 * 64, 64, 64, 230, 430, 128, 128);
        }
    }
}

function drawClosingInterview() {
    drawTitle(false); // Title screen background
}

function drawCredits() {
    ctx.fillStyle = COLORS.BLACK; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const CREDITS_TEXT = [
        "Wanderlust", "", 
        "Director & Tech", "Lindsey McGowen", "", 
        "Assistant Director & Understudy", "Leichelle Little", "", 
        "Cast",
        "Claire Biddiscombe", "Gilbert El-Dick", "Jason Summers", 
        "Krystal Merrells", "Patrice Forbes", "Peter Rogers", 
        "Sam Allen", "The Velvet Duke", "",
        "Presented By", "Wayward Improvised Theatre &", "Videogaming Concern"
    ];
    ctx.fillStyle = COLORS.WHITE; ctx.textAlign = 'center'; ctx.font = '16px "Press Start 2P"';
    CREDITS_TEXT.forEach((line, i) => { 
        const y = creditsY + i * 40; 
        if (y > -40 && y < canvas.height + 40) ctx.fillText(line, canvas.width / 2, y); 
    });
    if (!creditsFinished) { 
        creditsY -= 2.5; 
        if (creditsY < -(CREDITS_TEXT.length * 40)) creditsFinished = true; 
    } else { 
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Click Enter to Replay', canvas.width / 2, canvas.height / 2); 
    }
}

function startTogetherAgain() {
    currentPhase = PHASES.TOGETHER_AGAIN;
    togetherAgainState = { startTime: Date.now(), playerX: -100, state: 'walking' };
    audio.play('TOGETHER_BGM');
}

requestAnimationFrame(gameLoop);
