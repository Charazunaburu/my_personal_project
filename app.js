/**
 * SAKURA PIXEL LOVE - APP CONTROLLER (app.js)
 * Maneja el lienzo de pétalos pixel art, marcos colgantes interactivos,
 * audio chiptune y gestión de recuerdos de parejas.
 */

import { PIXEL_PALETTES, applyAtmosphereTheme, PixelAudioSynth } from './style.js';

/* ==========================================================================
   DATOS INICIALES DE PAREJAS EN PIXEL ART
   ========================================================================== */
const INITIAL_COUPLES = [
  {
    id: 'couple-1',
    names: 'Mateo & Bea',
    date: '2024-04-12',
    dateFormatted: '12 Abril 2024',
    quote: 'Nuestro paseo soñado bajo los cerezos en flor. Promesa de amor eterno.',
    image: 'assets/couple_1.jpg',
    posX: 22, // % de ancho
    posY: 16, // % de alto
    swayType: 'sway-1',
    likes: 42
  },
  {
    id: 'couple-2',
    names: 'Ren & Sakura',
    date: '2023-07-20',
    dateFormatted: '20 Julio 2023',
    quote: 'Compartiendo el paraguas bajo los farolillos de Kioto en una noche mágica.',
    image: 'assets/couple_2.jpg',
    posX: 38,
    posY: 25,
    swayType: 'sway-2',
    likes: 88
  },
  {
    id: 'couple-3',
    names: 'Kenji & Hana',
    date: '2023-10-05',
    dateFormatted: '5 Octubre 2023',
    quote: 'Mirando el monte Fuji al atardecer, donde el tiempo se detuvo para nosotros.',
    image: 'assets/couple_3.jpg',
    posX: 58,
    posY: 14,
    swayType: 'sway-3',
    likes: 67
  },
  {
    id: 'couple-4',
    names: 'Hiro & Emi',
    date: '2024-03-30',
    dateFormatted: '30 Marzo 2024',
    quote: 'Una selfie llena de risas bajo las ramas más altas del árbol sagrado.',
    image: 'assets/couple_4.jpg',
    posX: 77,
    posY: 22,
    swayType: 'sway-1',
    likes: 53
  },
  {
    id: 'couple-5',
    names: 'Yuki & Kaito',
    date: '2024-01-14',
    dateFormatted: '14 Enero 2024',
    quote: 'Compartiendo pastelitos de taiyaki recién horneados con el primer deshielo.',
    image: 'assets/couple_5.jpg',
    posX: 48,
    posY: 34,
    swayType: 'sway-2',
    likes: 95
  }
];

// Almacenamiento local para parejas personalizadas
function getStoredCouples() {
  try {
    const raw = localStorage.getItem('sakura_couples_list');
    return raw ? JSON.parse(raw) : INITIAL_COUPLES;
  } catch (e) {
    console.warn('No se pudo acceder a localStorage:', e);
    return INITIAL_COUPLES;
  }
}

function saveCouples(couples) {
  try {
    localStorage.setItem('sakura_couples_list', JSON.stringify(couples));
  } catch (e) {
    console.warn('Error al guardar en localStorage:', e);
  }
}

let couplesData = getStoredCouples();
let activeCouple = null;
let currentTheme = 'day';

// Instancia de sintetizador de audio retro
const audioSynth = new PixelAudioSynth();

/* ==========================================================================
   MOTOR DE PARTÍCULAS: LLUVIA DE PÉTALOS SAKURA EN PIXEL ART
   ========================================================================== */
class SakuraPetalEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.windIntensity = 1; // 1 = suave, 2.5 = ráfaga
    this.currentPetalColors = PIXEL_PALETTES.sakuraDay.petalColors;
    this.animationId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initPetals(55);
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false; // Mantiene el estilo pixel art
  }

  setThemeColors(paletteKey) {
    const palette = PIXEL_PALETTES[paletteKey] || PIXEL_PALETTES.sakuraDay;
    this.currentPetalColors = palette.petalColors;
  }

  toggleWind() {
    this.windIntensity = this.windIntensity === 1 ? 2.6 : 1;
    return this.windIntensity > 1;
  }

  initPetals(count) {
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    const size = Math.floor(Math.random() * 3) + 3; // 3 a 5 píxeles
    const color = this.currentPetalColors[Math.floor(Math.random() * this.currentPetalColors.length)];

    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -10 - Math.random() * 20,
      size: size,
      color: color,
      speedY: 1.2 + Math.random() * 1.6,
      speedX: (0.8 + Math.random() * 1.5) * this.windIntensity,
      flutterSpeed: 0.02 + Math.random() * 0.04,
      flutterAngle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 3,
      opacity: 0.75 + Math.random() * 0.25
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];

      // Física de aleteo en brisa
      p.flutterAngle += p.flutterSpeed;
      const swayOffset = Math.sin(p.flutterAngle) * 1.8;

      p.y += p.speedY;
      p.x += (p.speedX + swayOffset) * (this.windIntensity === 1 ? 1 : 1.8);
      p.rotation += p.rotSpeed;

      // Dibujar pétalo estilo pixel art
      this.ctx.save();
      this.ctx.translate(Math.floor(p.x), Math.floor(p.y));
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;

      // Forma de pétalo pixelado escalonado
      const s = p.size;
      this.ctx.fillRect(-s, -s/2, s * 2, s);
      this.ctx.fillRect(-s/2, -s, s, s * 2);

      // Borde de sombra sutil pixel art
      this.ctx.fillStyle = 'rgba(219, 39, 119, 0.4)';
      this.ctx.fillRect(s/2, s/2, 2, 2);

      this.ctx.restore();

      // Reciclar cuando sale de pantalla
      if (p.y > this.canvas.height + 20 || p.x > this.canvas.width + 20) {
        this.petals[i] = this.createPetal(false);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

/* ==========================================================================
   RENDERIZADO DE MARCOS EN EL ÁRBOL
   ========================================================================== */
function renderFramesLayer(couples) {
  const container = document.getElementById('frames-layer');
  if (!container) return;
  container.innerHTML = '';

  couples.forEach((couple, idx) => {
    const anchor = document.createElement('article');
    anchor.className = `couple-frame-anchor ${couple.swayType || 'sway-1'}`;
    anchor.style.left = `${couple.posX}%`;
    anchor.style.top = `${couple.posY}%`;
    anchor.setAttribute('tabindex', '0');
    anchor.setAttribute('role', 'button');
    anchor.setAttribute('aria-label', `Ver recuerdo de ${couple.names}`);

    anchor.innerHTML = `
      <div class="hanging-rope"></div>
      <div class="photo-card">
        <div class="washi-tape"></div>
        <div class="photo-img-wrapper">
          <img src="${couple.image}" alt="${couple.names}" class="photo-thumbnail" loading="lazy">
          <span class="photo-heart-badge">❤️ ${couple.likes}</span>
        </div>
        <div class="photo-caption">
          <strong class="photo-couple-names">${couple.names}</strong>
          <span class="photo-date-tag">${couple.dateFormatted || couple.date}</span>
        </div>
      </div>
    `;

    // Abrir detalle al hacer clic o presionar Enter
    const openCard = () => openCoupleModal(couple);
    anchor.addEventListener('click', openCard);
    anchor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard();
      }
    });

    container.appendChild(anchor);
  });
}

/* ==========================================================================
   DETALLE DEL MARCO EN MODAL DIALOG
   ========================================================================== */
const photoDialog = document.getElementById('photo-dialog');
const addDialog = document.getElementById('add-dialog');

function openCoupleModal(couple) {
  activeCouple = couple;
  audioSynth.playChime();

  document.getElementById('view-photo-img').src = couple.image;
  document.getElementById('view-photo-img').alt = `Fotografía de ${couple.names}`;
  document.getElementById('view-couple-names').textContent = couple.names;
  document.getElementById('view-date-tag').textContent = `📅 ${couple.dateFormatted || couple.date}`;
  document.getElementById('view-quote-text').textContent = `"${couple.quote}"`;
  document.getElementById('view-love-count').textContent = couple.likes || 0;

  if (photoDialog && typeof photoDialog.showModal === 'function') {
    photoDialog.showModal();
  }
}

// Botón de Dar Amor ❤️
document.getElementById('btn-give-love')?.addEventListener('click', (e) => {
  if (!activeCouple) return;
  activeCouple.likes = (activeCouple.likes || 0) + 1;
  document.getElementById('view-love-count').textContent = activeCouple.likes;

  audioSynth.playHeartSound();
  saveCouples(couplesData);
  renderFramesLayer(couplesData);

  // Efecto de corazón pixel flotante
  createFloatingHeart(e.clientX, e.clientY);
});

function createFloatingHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'floating-pixel-heart';
  heart.textContent = '❤️ +1';
  heart.style.left = `${x - 15}px`;
  heart.style.top = `${y - 25}px`;
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 1200);
}

// Cierre de modales
document.getElementById('btn-close-view')?.addEventListener('click', () => {
  photoDialog.close();
});

photoDialog?.addEventListener('click', (e) => {
  const rect = photoDialog.getBoundingClientRect();
  const isInDialog = (
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width
  );
  if (!isInDialog) {
    photoDialog.close();
  }
});

/* ==========================================================================
   FORMULARIO: COLGAR NUEVO RECUERDO DE PAREJA
   ========================================================================== */
const btnAddCouple = document.getElementById('btn-add-couple');
const btnCloseAdd = document.getElementById('btn-close-add');
const btnCancelAdd = document.getElementById('btn-cancel-add');
const formAddCouple = document.getElementById('form-add-couple');
const uploadArea = document.getElementById('upload-preview-area');
const inputPhotoFile = document.getElementById('input-photo-file');
const uploadPreviewImg = document.getElementById('upload-preview-img');
const uploadPlaceholderText = document.getElementById('upload-placeholder-text');

let currentUploadedImageBase64 = null;

btnAddCouple?.addEventListener('click', () => {
  audioSynth.init();
  formAddCouple.reset();
  currentUploadedImageBase64 = null;
  uploadPreviewImg.style.display = 'none';
  uploadPlaceholderText.style.display = 'block';
  
  // Asignar fecha de hoy por defecto
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('input-date').value = today;

  addDialog.showModal();
});

[btnCloseAdd, btnCancelAdd].forEach(btn => {
  btn?.addEventListener('click', () => addDialog.close());
});

// Manejo de subida de imagen con vista previa instantánea
uploadArea?.addEventListener('click', () => {
  inputPhotoFile.click();
});

inputPhotoFile?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentUploadedImageBase64 = event.target.result;
    uploadPreviewImg.src = currentUploadedImageBase64;
    uploadPreviewImg.style.display = 'block';
    uploadPlaceholderText.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// Coordenadas para colgar según la rama elegida
const BRANCH_COORDINATES = {
  'left-high': { x: 18, y: 15, sway: 'sway-1' },
  'left-mid': { x: 28, y: 28, sway: 'sway-2' },
  'center-high': { x: 50, y: 12, sway: 'sway-3' },
  'right-high': { x: 72, y: 15, sway: 'sway-1' },
  'right-mid': { x: 82, y: 28, sway: 'sway-2' }
};

formAddCouple?.addEventListener('submit', (e) => {
  e.preventDefault();

  const names = document.getElementById('input-couple-names').value.trim();
  const dateVal = document.getElementById('input-date').value;
  const quote = document.getElementById('input-quote').value.trim();
  const branchKey = document.getElementById('select-branch').value;

  const branchInfo = BRANCH_COORDINATES[branchKey] || { x: 50, y: 15, sway: 'sway-1' };

  // Si no subió foto propia, alternar entre las existentes
  const fallbackImages = [
    'assets/couple_1.jpg',
    'assets/couple_2.jpg',
    'assets/couple_3.jpg',
    'assets/couple_4.jpg',
    'assets/couple_5.jpg'
  ];
  const finalImage = currentUploadedImageBase64 || fallbackImages[couplesData.length % fallbackImages.length];

  const dateParts = dateVal.split('-');
  const dateFormatted = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateVal;

  const newCouple = {
    id: `custom-${Date.now()}`,
    names: names,
    date: dateVal,
    dateFormatted: dateFormatted,
    quote: quote,
    image: finalImage,
    posX: branchInfo.x + (Math.random() * 4 - 2), // Leve variación natural
    posY: branchInfo.y + (Math.random() * 4 - 2),
    swayType: branchInfo.sway,
    likes: 1
  };

  couplesData.push(newCouple);
  saveCouples(couplesData);
  renderFramesLayer(couplesData);

  audioSynth.playChime();
  addDialog.close();
});

/* ==========================================================================
   CONTROLES DE ATMÓSFERA Y HUD
   ========================================================================== */
let petalEngine = null;

// Cambio de hora del día (Día, Tarde, Noche)
document.querySelectorAll('.theme-selector-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    currentTheme = theme;
    applyAtmosphereTheme(theme);

    let paletteKey = 'sakuraDay';
    if (theme === 'sunset') paletteKey = 'sunsetGold';
    if (theme === 'night') paletteKey = 'mysticNight';

    if (petalEngine) {
      petalEngine.setThemeColors(paletteKey);
    }
  });
});

// Control de viento
const btnWindToggle = document.getElementById('btn-wind-toggle');
btnWindToggle?.addEventListener('click', () => {
  if (!petalEngine) return;
  const isHigh = petalEngine.toggleWind();
  btnWindToggle.textContent = isHigh ? '🌸 VIENTO: FUERTE' : '🍃 VIENTO: NORMAL';
});

// Música BGM Retro 8-Bit
const btnMusicToggle = document.getElementById('btn-music-toggle');
btnMusicToggle?.addEventListener('click', () => {
  const isPlaying = audioSynth.toggleBgm();
  btnMusicToggle.classList.toggle('playing', isPlaying);
  btnMusicToggle.title = isPlaying ? 'Pausar música 8-bit' : 'Reproducir música 8-bit';
});

// Filtro Retro CRT
const btnToggleCrt = document.getElementById('btn-toggle-crt');
btnToggleCrt?.addEventListener('click', () => {
  document.body.classList.toggle('crt-active');
  const active = document.body.classList.contains('crt-active');
  btnToggleCrt.classList.toggle('btn-primary', active);
});

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sakura-canvas');
  if (canvas) {
    petalEngine = new SakuraPetalEngine(canvas);
  }

  renderFramesLayer(couplesData);
});
