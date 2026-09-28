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
    
    // Melodía romántica pacífica
    this.melody = [
      0, 2, 4, 2, 3, 2, 0, 1,
      2, 4, 5, 4, 3, 2, 1, 0,
      4, 5, 7, 5, 4, 3, 2, 4,
      3, 2, 1, 0, 2, 1, 0, 2
    ];
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
}

// Compatibilidad en caso de carga directa en el navegador
if (typeof window !== 'undefined') {
  window.PIXEL_PALETTES = PIXEL_PALETTES;
  window.applyAtmosphereTheme = applyAtmosphereTheme;
  window.getFrameBorderClass = getFrameBorderClass;
  window.PixelAudioSynth = PixelAudioSynth;
}

