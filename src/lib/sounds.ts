// Sound effects using Web Audio API
// Each sound pack has different tones and styles

type SoundPackId = "default" | "chime" | "nature" | "gaming";

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  attack?: number;
  decay?: number;
  volume?: number;
}

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Play a simple tone
function playTone(config: SoundConfig) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = config.type;
  osc.frequency.value = config.frequency;

  const volume = config.volume ?? 0.3;
  const attack = config.attack ?? 0.01;
  const decay = config.decay ?? 0.1;

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration - decay);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + config.duration);
}

// Sound pack definitions
const soundPacks: Record<SoundPackId, () => void> = {
  default: () => {
    // Simple pop sound
    playTone({ frequency: 600, duration: 0.15, type: "sine", attack: 0.01, decay: 0.1 });
  },

  chime: () => {
    // Gentle chime - multiple harmonious tones
    playTone({ frequency: 523, duration: 0.3, type: "sine", volume: 0.2 }); // C5
    setTimeout(() => {
      playTone({ frequency: 659, duration: 0.3, type: "sine", volume: 0.15 }); // E5
    }, 50);
    setTimeout(() => {
      playTone({ frequency: 784, duration: 0.4, type: "sine", volume: 0.1 }); // G5
    }, 100);
  },

  nature: () => {
    // Soft water drop sound
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  gaming: () => {
    // Retro 8-bit success sound
    playTone({ frequency: 440, duration: 0.1, type: "square", volume: 0.15 }); // A4
    setTimeout(() => {
      playTone({ frequency: 554, duration: 0.1, type: "square", volume: 0.15 }); // C#5
    }, 80);
    setTimeout(() => {
      playTone({ frequency: 659, duration: 0.15, type: "square", volume: 0.15 }); // E5
    }, 160);
    setTimeout(() => {
      playTone({ frequency: 880, duration: 0.2, type: "square", volume: 0.2 }); // A5
    }, 240);
  },
};

// Main function to play completion sound
export function playCompletionSound(soundPack: SoundPackId = "default") {
  try {
    const playSound = soundPacks[soundPack] || soundPacks.default;
    playSound();
  } catch (error) {
    // Silently fail if audio context is not available
    console.warn("Could not play sound:", error);
  }
}

// Level up sound - more elaborate
export function playLevelUpSound() {
  try {
    // Ascending triumphant notes
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone({
          frequency: freq,
          duration: 0.3,
          type: "sine",
          volume: 0.25,
          attack: 0.02,
          decay: 0.15,
        });
      }, i * 100);
    });
  } catch (error) {
    console.warn("Could not play level up sound:", error);
  }
}

// Achievement unlock sound
export function playAchievementSound() {
  try {
    // Fanfare-like sound
    playTone({ frequency: 392, duration: 0.15, type: "sine", volume: 0.2 }); // G4
    setTimeout(() => {
      playTone({ frequency: 523, duration: 0.15, type: "sine", volume: 0.2 }); // C5
    }, 100);
    setTimeout(() => {
      playTone({ frequency: 659, duration: 0.2, type: "sine", volume: 0.25 }); // E5
    }, 200);
    setTimeout(() => {
      playTone({ frequency: 784, duration: 0.4, type: "sine", volume: 0.3 }); // G5
    }, 300);
  } catch (error) {
    console.warn("Could not play achievement sound:", error);
  }
}
