// Web Audio API Synthesizer for rich, zero-dependency feedback sounds

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const initAudio = () => {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  try {
    localStorage.setItem('quizmaster_sound_enabled', JSON.stringify(enabled));
  } catch {
    // ignore
  }
};

export const isSoundEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem('quizmaster_sound_enabled');
    if (saved !== null) {
      soundEnabled = JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return soundEnabled;
};

// Play a subtle click sound
export const playTapSound = () => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch {
    // audio error ignored
  }
};

// Play a bright, cheerful harmonic chord for correct answers
export const playCorrectSound = () => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const startTime = audioCtx.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

    if (navigator.vibrate) {
      navigator.vibrate([30, 40, 50]);
    }
  } catch {
    // audio error ignored
  }
};

// Play a soft, low double tone for wrong answers
export const playWrongSound = () => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const notes = [293.66, 220.0]; // D4 down to A3
    notes.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const startTime = audioCtx.currentTime + idx * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });

    if (navigator.vibrate) {
      navigator.vibrate([80]);
    }
  } catch {
    // audio error ignored
  }
};

// Timer tick for countdown warning (< 5 seconds remaining)
export const playTickSound = () => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch {
    // audio error ignored
  }
};

// Victory fanfare on quiz completion
export const playVictorySound = () => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const chord = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 659.25, time: 0.12 },  // E5
      { freq: 783.99, time: 0.24 },  // G5
      { freq: 1046.50, time: 0.38 }, // C6
      { freq: 1318.51, time: 0.52 }, // E6
    ];

    chord.forEach(({ freq, time }) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const startTime = audioCtx.currentTime + time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.48);
    });
  } catch {
    // audio error ignored
  }
};
