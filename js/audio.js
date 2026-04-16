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
            CHEESE_BGM: new Audio('music/cheese_bgm.mp3'), // Placeholder for new track
            FIGHT_BGM: new Audio('music/fighting_theme.mp3'),
            IN_THE_CAR: new Audio('music/in_the_car.mp3'),
            TOGETHER_BGM: new Audio('music/together_again.mp3'),
            INTERVIEW_BGM: new Audio('music/closing_interview.mp3'),
            SUCCESS: new Audio('music/success.mp3'),
            FAILURE: new Audio('music/failure.mp3'),
            TADA: new Audio('music/tada.mp3'),
            SAD_TROMBONE: new Audio('music/sad_trombone.mp3')
        };
        for (let key in this.tracks) {
            this.tracks[key].loop = (key === 'CHICAGO' || key === 'BEST_FRIEND' || key === 'MOON' || key.endsWith('_BGM') || key === 'FIGHT_BGM' || key === 'IN_THE_CAR');
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
        if (name === 'SUCCESS' || name === 'punch' || name === 'chomp') {
            osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (name === 'FAILURE' || name === 'kick' || name === 'alarm') {
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
