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
            GOLF_BGM: new Audio('music/golf_bgm.mp3'),
            CHEESE_BGM: new Audio('music/cheese_bgm.mp3'),
            BUMP_BGM: new Audio('music/bump_bgm.mp3'),
            FISH_BGM: new Audio('music/fishing_bgm.mp3'),
            CLIMB_BGM: new Audio('music/climb_bgm.webm'),
            JEOPARDY_INTRO_BGM: new Audio('music/jeopardy_intro_bgm.mp3'),
            JEOPARDY_BGM: new Audio('music/jeopardy_bgm.mp3'),
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
        if (this.currentTrack === this.tracks[trackName] && !this.currentTrack.paused) {
            return;
        }
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
        let targetTrack = this.tracks[trackName];
        if (!targetTrack && trackName === 'CLIMB_BGM') {
            targetTrack = this.tracks['MATH_BGM'] || this.tracks['GOLF_BGM'];
        }
        this.currentTrack = targetTrack;
        if (this.currentTrack) {
            this.currentTrack.currentTime = startTime;
            this.currentTrack.play().catch(e => {
                // If specific BGM file is missing or not supported, try fallback BGM
                if (trackName === 'CLIMB_BGM' && this.tracks['MATH_BGM'] && this.currentTrack !== this.tracks['MATH_BGM']) {
                    this.play('MATH_BGM', startTime);
                } else {
                    console.warn(`BGM track '${trackName}' playback skipped (file missing or blocked by browser).`);
                }
            });
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
        } else if (name === 'engine') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50 + Math.random() * 20, now);
            gain.gain.setValueAtTime(0.02, now); gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (name === 'screech') {
            osc.type = 'square'; osc.frequency.setValueAtTime(1000 + Math.random() * 500, now);
            gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (name === 'TADA') {
            [440, 554, 659, 880].forEach((f, i) => {
                const o = this.audioCtx.createOscillator(); o.connect(gain); o.frequency.setValueAtTime(f, now + i * 0.1); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.2);
            });
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        } else if (name === 'SAD_TROMBONE') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(110, now + 1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now); osc.stop(now + 1);
        } else if (name === 'thunk') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(120, now); osc.frequency.linearRampToValueAtTime(60, now + 0.15);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        } else if (name === 'splash') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
            gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now); osc.stop(now + 0.25);
            const osc2 = this.audioCtx.createOscillator();
            const gain2 = this.audioCtx.createGain();
            osc2.type = 'triangle'; osc2.frequency.setValueAtTime(450, now); osc2.frequency.linearRampToValueAtTime(80, now + 0.2);
            osc2.connect(gain2); gain2.connect(this.audioCtx.destination);
            gain2.gain.setValueAtTime(0.15, now); gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc2.start(now); osc2.stop(now + 0.2);
        } else if (name === 'clunk') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(180, now); osc.frequency.linearRampToValueAtTime(120, now + 0.12);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now); osc.stop(now + 0.12);
        } else if (name === 'applause') {
            gain.gain.setValueAtTime(0.05, now);
            for (let i = 0; i < 20; i++) {
                const o = this.audioCtx.createOscillator();
                const g = this.audioCtx.createGain();
                o.connect(g); g.connect(this.audioCtx.destination);
                o.type = 'sawtooth';
                const t = now + i * 0.04 + Math.random() * 0.02;
                o.frequency.setValueAtTime(300 + Math.random() * 600, t);
                g.gain.setValueAtTime(0.05, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                o.start(t); o.stop(t + 0.06);
            }
            osc.start(now); osc.stop(now + 0.01); // DUMMY OSC START/STOP
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
