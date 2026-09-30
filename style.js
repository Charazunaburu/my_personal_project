/**
 * PIXEL ART SAKURA - STYLE ENGINE & PALETTES (style.js)
 * Define las paletas cromáticas, temas visuales y generadores de estilo pixel art.
 */

export const PIXEL_PALETTES = {
  sakuraDay: {
    name: 'Día de Primavera',
    skyColor: '#bce4fa',
    petalColors: ['#ffb7c5', '#ff94b8', '#ffffff', '#f472b6', '#fbcfe8'],
    accent: '#db2777',
    lanternGlow: false,
    filter: 'none'
  },
  sunsetGold: {
    name: 'Atardecer Dorado',
    skyColor: '#f97316',
    petalColors: ['#fed7aa', '#f472b6', '#fb923c', '#fecdd3', '#ffffff'],
    accent: '#ea580c',
    lanternGlow: true,
    filter: 'sepia(0.35) hue-rotate(-15deg) saturate(1.4) brightness(0.92)'
  },
  mysticNight: {
    name: 'Noche Bajo el Cerezo',
    skyColor: '#0f172a',
    petalColors: ['#f472b6', '#e879f9', '#c084fc', '#ffffff', '#fbcfe8'],
    accent: '#a855f7',
    lanternGlow: true,
    filter: 'hue-rotate(200deg) saturate(0.8) brightness(0.65) contrast(1.2)'
  }
};

/**
 * Aplica el tema visual al escenario
 * @param {string} themeKey - 'day' | 'sunset' | 'night'
 */
export function applyAtmosphereTheme(themeKey) {
  const stage = document.querySelector('.sakura-stage');
  if (!stage) return;

  stage.classList.remove('theme-day', 'theme-sunset', 'theme-night');
  stage.classList.add(`theme-${themeKey}`);

  // Actualizar botones de HUD
  document.querySelectorAll('.theme-selector-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });
}

/**
 * Genera una textura o borde pixelado personalizado para cuadros
 * @param {string} type - Tipo de marco ('wood' | 'gold' | 'sakura')
 */
export function getFrameBorderClass(type = 'wood') {
  switch (type) {
    case 'gold':
      return 'border-gold';
    case 'sakura':
      return 'border-sakura';
    default:
      return 'border-wood';
  }
}

/**
 * Efecto de sonido 8-bit sintetizado utilizando Web Audio API
 * Genera campanas románticas retro y acordes sin requerir archivos externos
 */
export class PixelAudioSynth {
  constructor() {
    this.ctx = null;
    this.bgmOscillator = null;
    this.isPlayingBgm = false;
    this.bgmStep = 0;
    this.bgmTimer = null;

    // Escala pentatónica japonesa suave (Insen / Hirajoshi inspirada en lofi 8-bit)
    this.notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25  // E5
    ];
    
    // Melodía romántica pacífica Sakura
    this.melody = [
      0, 2, 4, 2, 3, 2, 0, 1,
      2, 4, 5, 4, 3, 2, 1, 0,
      4, 5, 7, 5, 4, 3, 2, 4,
      3, 2, 1, 0, 2, 1, 0, 2
    ];

    // Partitura del Vals Parisino 8-bit en 3/4 (Estilo acordeón musette francés)
    // Cada paso define: [tiempo (1,2,3), frecuenciaBajo, frecuenciasAcordes, frecuenciaMelodiaLead]
    this.frenchWaltzScore = [
      // Frase 1 - Compás 1 (Am)
      [1, 110.00, null, 659.25],              // A2 bajo, E5 acordeón
      [2, null, [261.63, 329.63], 587.33],    // C4+E4 acorde, D5 lead
      [3, null, [261.63, 329.63], 523.25],    // C4+E4 acorde, C5 lead
      // Compás 2 (Am)
      [1, 110.00, null, 493.88],              // A2 bajo, B4 lead
      [2, null, [261.63, 329.63], 523.25],    // C4+E4 acorde, C5 lead
      [3, null, [261.63, 329.63], 440.00],    // C4+E4 acorde, A4 lead
      // Compás 3 (Dm)
      [1, 146.83, null, 698.46],              // D3 bajo, F5 lead
      [2, null, [293.66, 349.23], 659.25],    // D4+F4 acorde, E5 lead
      [3, null, [293.66, 349.23], 587.33],    // D4+F4 acorde, D5 lead
      // Compás 4 (Am)
      [1, 110.00, null, 523.25],              // A2 bajo, C5 lead
      [2, null, [261.63, 329.63], 493.88],    // C4+E4 acorde, B4 lead
      [3, null, [261.63, 329.63], 440.00],    // C4+E4 acorde, A4 lead
      // Compás 5 (E7)
      [1, 164.81, null, 415.30],              // E3 bajo, G#4 lead
      [2, null, [293.66, 415.30], 493.88],    // D4+G#4 acorde, B4 lead
      [3, null, [293.66, 415.30], 587.33],    // D4+G#4 acorde, D5 lead
      // Compás 6 (Am)
      [1, 110.00, null, 523.25],              // A2 bajo, C5 lead
      [2, null, [261.63, 329.63], 440.00],    // C4+E4 acorde, A4 lead
      [3, null, [261.63, 329.63], 329.63],    // C4+E4 acorde, E4 lead
      // Compás 7 (E7)
      [1, 164.81, null, 493.88],              // E3 bajo, B4 lead
      [2, null, [293.66, 415.30], 523.25],    // D4+G#4 acorde, C5 lead
      [3, null, [293.66, 415.30], 493.88],    // D4+G#4 acorde, B4 lead
      // Compás 8 (Am cadencia)
      [1, 110.00, null, 440.00],              // A2 bajo, A4 reposo
      [2, null, [261.63, 329.63], null],      // C4+E4 acorde
      [3, null, [261.63, 329.63], null],      // C4+E4 acorde
      // Frase 2 - Compás 9 (C mayor - vuelo lírico)
      [1, 130.81, null, 783.99],              // C3 bajo, G5 lead
      [2, null, [329.63, 392.00], 659.25],    // E4+G4 acorde, E5 lead
      [3, null, [329.63, 392.00], 783.99],    // E4+G4 acorde, G5 lead
      // Compás 10 (G)
      [1, 98.00, null, 698.46],               // G2 bajo, F5 lead
      [2, null, [293.66, 349.23], 587.33],    // D4+F4 acorde, D5 lead
      [3, null, [293.66, 349.23], 698.46],    // D4+F4 acorde, F5 lead
      // Compás 11 (Am)
      [1, 110.00, null, 659.25],              // A2 bajo, E5 lead
      [2, null, [261.63, 329.63], 523.25],    // C4+E4 acorde, C5 lead
      [3, null, [261.63, 329.63], 659.25],    // C4+E4 acorde, E5 lead
      // Compás 12 (E7)
      [1, 164.81, null, 587.33],              // E3 bajo, D5 lead
      [2, null, [293.66, 415.30], 493.88],    // D4+G#4 acorde, B4 lead
      [3, null, [293.66, 415.30], 415.30],    // D4+G#4 acorde, G#4 lead
      // Compás 13 (F)
      [1, 174.61, null, 440.00],              // F3 bajo, A4 lead
      [2, null, [261.63, 349.23], 523.25],    // C4+F4 acorde, C5 lead
      [3, null, [261.63, 349.23], 698.46],    // C4+F4 acorde, F5 lead
      // Compás 14 (Dm)
      [1, 146.83, null, 659.25],              // D3 bajo, E5 lead
      [2, null, [293.66, 349.23], 587.33],    // D4+F4 acorde, D5 lead
      [3, null, [293.66, 349.23], 493.88],    // D4+F4 acorde, B4 lead
      // Compás 15 (E7)
      [1, 164.81, null, 523.25],              // E3 bajo, C5 lead
      [2, null, [293.66, 415.30], 493.88],    // D4+G#4 acorde, B4 lead
      [3, null, [293.66, 415.30], 415.30],    // D4+G#4 acorde, G#4 lead
      // Compás 16 (Am final)
      [1, 110.00, null, 440.00],              // A2 bajo, A4 reposo final
      [2, null, [261.63, 329.63], null],      // C4+E4 acorde
      [3, null, [261.63, 329.63], null]       // C4+E4 acorde
    ];

    // Frecuencias base de respaldo
    this.frenchFrequencies = [
      261.63, 329.63, 392.00, 329.63, 261.63, 329.63,
      293.66, 349.23, 440.00, 349.23, 293.66, 349.23,
      246.94, 293.66, 392.00, 293.66, 246.94, 293.66,
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63
    ];
    this.isPlayingFrenchBgm = false;
    this.frenchStep = 0;
    this.frenchTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Campanada mágica al hacer clic en un marco de pareja
   */
  playChime() {
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Mayor 8-bit arpegio
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.06);
      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.6);
    });
  }

  /**
   * Sonido dulce de corazón "Like"
   */
  playHeartSound() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /**
   * Sonido retro de salto estilo 8-bit
   */
  playJumpSound() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.045, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /**
   * Fanfarria de inicio de partida
   */
  playGameStartSound() {
    this.init();
    if (!this.ctx) return;

    const notes = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
    });
  }

  /**
   * Alternar música de fondo tranquila en chiptune
   */
  toggleBgm() {
    this.init();
    if (this.isPlayingBgm) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  startBgm() {
    if (!this.ctx) return;
    this.isPlayingBgm = true;
    this.bgmStep = 0;

    const playNote = () => {
      if (!this.isPlayingBgm) return;

      const noteIdx = this.melody[this.bgmStep % this.melody.length];
      const freq = this.notes[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);

      this.bgmStep++;
      this.bgmTimer = setTimeout(playNote, 280);
    };

    playNote();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * BGM Sakura Chiptune (Japón)
   */
  playSakuraBgm() {
    this.startBgm();
  }

  startSakuraBgm() {
    this.startBgm();
  }

  stopSakuraBgm() {
    this.stopBgm();
  }

  toggleSakuraBgm() {
    return this.toggleBgm();
  }

  /**
   * Alias de sonido de campanada para interacciones
   */
  playChimeSound() {
    return this.playChime();
  }

  /**
   * Alternar música retro francesa (vals parisino 8-bit)
   */
  toggleFrenchBgm() {
    this.init();
    if (this.isPlayingFrenchBgm) {
      this.stopFrenchBgm();
      return false;
    } else {
      this.stopBgm();
      this.startFrenchBgm();
      return true;
    }
  }

  playFrenchBgm() {
    this.startFrenchBgm();
  }

  startFrenchBgm() {
    this.init();
    if (!this.ctx) return;
    if (this.isPlayingFrenchBgm) return;

    this.isPlayingFrenchBgm = true;
    this.frenchStep = 0;
    const tempoMs = 230; // Tempo alegre y melancólico de vals parisino en 3/4

    const playFrenchBeat = () => {
      if (!this.isPlayingFrenchBgm || !this.ctx) return;

      const stepData = this.frenchWaltzScore[this.frenchStep % this.frenchWaltzScore.length];
      const [beat, bass, chord, lead] = stepData;
      const now = this.ctx.currentTime;

      // 1. Bajo acústico 8-bit en tiempo 1 ("Oom")
      if (bass) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bass, now);

        gain.gain.setValueAtTime(0.048, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.33);
      }

      // 2. Acordes rítmicos staccato en tiempos 2 y 3 ("Pah - Pah")
      if (chord && Array.isArray(chord)) {
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.022, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        });
      }

      // 3. Acordeón parisino musette con doble lengüeta (trémolo natural)
      if (lead) {
        // Lengüeta principal
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(lead, now);

        gain1.gain.setValueAtTime(0.038, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.29);

        // Lengüeta musette sutilmente desafinada (+4 cents)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(lead * 1.004, now);

        gain2.gain.setValueAtTime(0.026, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.29);
      }

      this.frenchStep++;
      this.frenchTimer = setTimeout(playFrenchBeat, tempoMs);
    };

    playFrenchBeat();
  }

  stopFrenchBgm() {
    this.isPlayingFrenchBgm = false;
    if (this.frenchTimer) {
      clearTimeout(this.frenchTimer);
      this.frenchTimer = null;
    }
  }
}

// Compatibilidad en caso de carga directa en el navegador
if (typeof window !== 'undefined') {
  window.PIXEL_PALETTES = PIXEL_PALETTES;
  window.applyAtmosphereTheme = applyAtmosphereTheme;
  window.getFrameBorderClass = getFrameBorderClass;
  window.PixelAudioSynth = PixelAudioSynth;
}

