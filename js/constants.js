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
    { name: 'Claire Biddiscombe', firstName: 'Claire', actor: 'Claire', imgPath: 'images/cast/claire.png' },
    { name: 'Gilbert El-Dick', firstName: 'Gilbert', actor: 'Gilbert', imgPath: 'images/cast/gilbert.png' },
    { name: 'Jason Summers', firstName: 'Jason', actor: 'Jason', imgPath: 'images/cast/jason.png' },
    { name: 'Krystal Merrells', firstName: 'Krystal', actor: 'Krystal', imgPath: 'images/cast/krystal.png' },
    { name: 'Patrice Forbes', firstName: 'Patrice', actor: 'Patrice', imgPath: 'images/cast/patrice.png' },
    { name: 'Peter Rogers', firstName: 'Peter', actor: 'Peter', imgPath: 'images/cast/peter.png' },
    { name: 'Sam Allen', firstName: 'Sam', actor: 'Sam', imgPath: 'images/cast/sam.png' },
    { name: 'The Velvet Duke', firstName: 'Velvet', actor: 'Velvet', imgPath: 'images/cast/velvet.png' }
];

const PARTNER_PAIRS = {
    'Jason Summers': 'Peter Rogers', 'Peter Rogers': 'Jason Summers',
    'Patrice Forbes': 'Gilbert El-Dick', 'Gilbert El-Dick': 'Patrice Forbes',
    'The Velvet Duke': 'Claire Biddiscombe', 'Claire Biddiscombe': 'The Velvet Duke',
    'Sam Allen': 'Krystal Merrells', 'Krystal Merrells': 'Sam Allen'
};

const CONFRONTATION_RESPONSES = {
    SUCCESS: [
        "So what? I really like [minigame name].",
        "I don't take like it when people don't want me to be *good* at something.",
        "Yeah, whatever. You're just jealous."
    ],
    FAILURE: [
        "Seriously? I already feel so bad about this.",
        "Maybe if you'd *helped*, I might have done better!",
        "I'm not your employee, [Companion's First Name]."
    ]
};

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
