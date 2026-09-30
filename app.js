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
    names: 'Yoha & Bea',
    date: '2024-04-12',
    dateFormatted: '12 Abril 2024',
    title: 'Cita en El Espino',
    quote: 'Rodeados de naturaleza, aire fresco y la sonrisa más hermosa del mundo. Cada instante a tu lado se siente como el mejor día.',
    image: 'assets/Cita_espino_01.jpg',
    posX: 22, // % de ancho
    posY: 16, // % de alto
    swayType: 'sway-1'
  },
  {
    id: 'couple-2',
    names: 'Yoha & Bea',
    date: '2024-04-12',
    dateFormatted: '12 Abril 2024',
    title: 'Sendero en El Espino',
    quote: 'Caminando entre los senderos verdes de El Espino. No importa lo largo del camino mientras sea de tu mano.',
    image: 'assets/Cita_espino_02.jpg',
    posX: 38,
    posY: 25,
    swayType: 'sway-2'
  },
  {
    id: 'couple-3',
    names: 'Yoha & Bea',
    date: '2024-05-18',
    dateFormatted: '18 Mayo 2024',
    title: 'Noche de Pizza',
    quote: 'Cena romántica, pizza deliciosa y risas que alegran el alma. Verte sonreír hace que cualquier momento sea mágico.',
    image: 'assets/Cita_pizza.jpg',
    posX: 58,
    posY: 14,
    swayType: 'sway-3'
  },
  {
    id: 'couple-4',
    names: 'Yoha & Bea',
    date: '2024-06-22',
    dateFormatted: '22 Junio 2024',
    title: 'Cita de Postre & Espejo',
    quote: 'Combinando de rojo, endulzando el día con un rico postre y guardando este recuerdo frente al espejo para siempre.',
    image: 'assets/Cita_postre.jpg',
    posX: 77,
    posY: 22,
    swayType: 'sway-1'
  },
  {
    id: 'couple-5',
    names: 'Yoha & Bea',
    date: '2024-07-15',
    dateFormatted: '15 Julio 2024',
    title: 'Cita de Sushi en SOHO',
    quote: 'Esperando nuestro sushi favorito en SOHO. Buena comida, miradas cómplices y la mejor compañía de mi vida.',
    image: 'assets/Cita_sushi.jpg',
    posX: 48,
    posY: 34,
    swayType: 'sway-2'
  }
];

// Almacenamiento local para parejas personalizadas
function getStoredCouples() {
  try {
    const raw = localStorage.getItem('sakura_couples_list_v3');
    if (raw) return JSON.parse(raw);

    // Cargar recuerdos actualizados sin likes
    return INITIAL_COUPLES;
  } catch (e) {
    console.warn('No se pudo acceder a localStorage:', e);
    return INITIAL_COUPLES;
  }
}

function saveCouples(couples) {
  try {
    localStorage.setItem('sakura_couples_list_v3', JSON.stringify(couples));
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

    // Inactivo completamente si el jugador se encuentra en el Nivel 1 (Francia)
    if (typeof currentLevel !== 'undefined' && currentLevel !== 'tree') {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

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
      this.ctx.fillRect(-s, -s / 2, s * 2, s);
      this.ctx.fillRect(-s / 2, -s, s, s * 2);

      // Borde de sombra sutil pixel art
      this.ctx.fillStyle = 'rgba(219, 39, 119, 0.4)';
      this.ctx.fillRect(s / 2, s / 2, 2, 2);

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
        </div>
        <div class="photo-caption">
          <strong class="photo-couple-names">${couple.names}</strong>
          <span class="photo-date-tag">${couple.title || couple.dateFormatted || couple.date}</span>
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

  const titleEl = document.getElementById('dialog-title');
  if (titleEl) {
    titleEl.textContent = couple.title ? `🌸 ${couple.title.toUpperCase()}` : 'RECUERDO ETERNO';
  }

  document.getElementById('view-photo-img').src = couple.image;
  document.getElementById('view-photo-img').alt = `Fotografía de ${couple.names}`;
  document.getElementById('view-couple-names').textContent = couple.names;
  document.getElementById('view-date-tag').textContent = `📅 ${couple.dateFormatted || couple.date}`;
  document.getElementById('view-quote-text').textContent = `"${couple.quote}"`;

  if (photoDialog && typeof photoDialog.showModal === 'function') {
    photoDialog.showModal();
  }
}

// Cierre de modales
document.getElementById('btn-close-view')?.addEventListener('click', () => {
  photoDialog.close();
});

document.getElementById('btn-close-view-footer')?.addEventListener('click', () => {
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
    'assets/Cita_espino_01.jpg',
    'assets/Cita_espino_02.jpg',
    'assets/Cita_pizza.jpg',
    'assets/Cita_postre.jpg',
    'assets/Cita_sushi.jpg'
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
    swayType: branchInfo.sway
  };

  couplesData.push(newCouple);
  saveCouples(couplesData);
  renderFramesLayer(couplesData);
  if (beaController) {
    beaController.couples = couplesData;
  }

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
   GESTIÓN Y PRECARGA DE SPRITES DE BEA (IDLE + CICLO DE CAMINATA 4 CUADROS)
   ========================================================================== */
const BEA_SPRITES = {
  idle: 'assets/bea_idle.png',
  walk: [
    'assets/bea_walk_1.png',
    'assets/bea_walk_2.png',
    'assets/bea_walk_3.png',
    'assets/bea_walk_4.png'
  ],
  jump: 'assets/bea_walk_1.png'
};

function processBeaSprite() {
  // Precargar todos los cuadros para que no haya micro-parpadeos al caminar
  const allUrls = [BEA_SPRITES.idle, ...BEA_SPRITES.walk];
  allUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });

  document.querySelectorAll('.bea-sprite-img, .start-bea-preview').forEach(el => {
    el.src = BEA_SPRITES.idle;
  });
}

/* ==========================================================================
   PERSONAJE 2D: CONTROLADOR DE BEA Y MOVIMIENTO EN EL ESCENARIO
   ========================================================================== */
class BeaCharacterController {
  constructor(element, couples) {
    this.el = element;
    this.couples = couples;
    this.speechBubble = document.getElementById('bea-speech-bubble');
    this.bubbleText = document.getElementById('bubble-text');

    // Estado físico
    this.posX = 26; // % horizontal inicial
    this.offsetY = 0; // px vertical (salto)
    this.velY = 0;
    this.speed = 0.52; // % por fotograma
    this.isGrounded = true;
    this.facing = 'right';
    this.isMoving = false;
    this.nearbyCouple = null;

    // Referencia al sprite y gestión de fotogramas de caminata
    this.spriteImg = this.el?.querySelector('.bea-sprite-img') || document.getElementById('bea-sprite-img');
    this.walkFrameIndex = 0;
    this.walkTick = 0;
    this.currentFrameSrc = BEA_SPRITES.idle;

    // Teclas
    this.keys = {
      left: false,
      right: false,
      jump: false
    };

    this.targetPosX = null; // Para clic/tap en el sendero
    this.stepCounter = 0;

    this.initControls();
    this.animate();
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      // Ignorar si un diálogo modal está abierto
      if (document.querySelector('dialog[open]')) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.keys.left = true;
        this.targetPosX = null;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.keys.right = true;
        this.targetPosX = null;
      }
      if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && this.isGrounded) {
        e.preventDefault();
        this.jump();
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        if (currentLevel === 'tree' && this.nearbyCouple) {
          e.preventDefault();
          openCoupleModal(this.nearbyCouple);
        } else if (currentLevel === 'france' && this.posX >= 86) {
          e.preventDefault();
          switchLevel('tree');
        } else if (currentLevel === 'tree' && this.posX <= 8) {
          e.preventDefault();
          switchLevel('france');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.keys.jump = false;
    });

    // Controles táctiles en pantalla
    const btnLeft = document.getElementById('btn-touch-left');
    const btnRight = document.getElementById('btn-touch-right');
    const btnJump = document.getElementById('btn-touch-jump');

    const bindTouch = (btn, key) => {
      if (!btn) return;
      const start = (e) => { e.preventDefault(); this.keys[key] = true; this.targetPosX = null; };
      const end = (e) => { e.preventDefault(); this.keys[key] = false; };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', end);
      btn.addEventListener('pointerleave', end);
      btn.addEventListener('pointercancel', end);
    };

    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    if (btnJump) {
      btnJump.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.isGrounded) this.jump();
      });
    }

    // Clic en la parte inferior del escenario para caminar hacia allí
    const bindStageClick = (stageEl) => {
      stageEl?.addEventListener('click', (e) => {
        if (e.target.closest('button, .photo-card, .bea-speech-bubble, dialog, .france-dedication-card')) return;
        const rect = stageEl.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        if (clickY > rect.height * 0.40) {
          const clickPercent = ((e.clientX - rect.left) / rect.width) * 100;
          this.targetPosX = Math.max(6, Math.min(94, clickPercent));
        }
      });
    };

    bindStageClick(document.getElementById('sakura-stage'));
    bindStageClick(document.getElementById('france-stage'));

    // Clic en el bocadillo de interacción
    this.speechBubble?.addEventListener('click', () => {
      if (currentLevel === 'tree' && this.nearbyCouple) {
        openCoupleModal(this.nearbyCouple);
      } else if (currentLevel === 'france' && this.posX >= 86) {
        switchLevel('tree');
      } else if (currentLevel === 'tree' && this.posX <= 8) {
        switchLevel('france');
      }
    });
  }

  jump() {
    this.isGrounded = false;
    this.velY = -12.5;
    audioSynth.playJumpSound();
    this.createDust();
  }

  createDust() {
    const dust = document.createElement('div');
    dust.className = 'footstep-dust';
    dust.style.left = `${this.posX}%`;
    dust.style.bottom = `${70 + this.offsetY}px`;
    const currentContainer = currentLevel === 'france' 
      ? document.getElementById('france-stage') 
      : document.getElementById('sakura-stage');
    currentContainer?.appendChild(dust);
    setTimeout(() => dust.remove(), 500);
  }

  checkProximity() {
    if (currentLevel === 'france') {
      if (this.posX >= 86) {
        if (this.speechBubble) {
          this.speechBubble.style.display = 'flex';
          this.bubbleText.textContent = `[E] Al Sakura 🌸 ➔`;
        }
      } else {
        const nearbyRooster = ROOSTERS_DATA.find(r => Math.abs(this.posX - r.x) < 7);
        if (nearbyRooster && this.speechBubble) {
          this.speechBubble.style.display = 'flex';
          this.bubbleText.textContent = nearbyRooster.greeting;
        } else if (this.speechBubble) {
          this.speechBubble.style.display = 'none';
        }
      }
      return;
    }

    // Nivel 2: Árbol Sakura
    if (this.posX <= 8) {
      if (this.speechBubble) {
        this.speechBubble.style.display = 'flex';
        this.bubbleText.textContent = `[E] Volver a París 🥐`;
      }
      return;
    }

    this.nearbyCouple = null;
    let minDistance = 999;
    let closestCouple = null;

    for (const c of this.couples) {
      const dist = Math.abs(this.posX - c.posX);
      if (dist < 8.5 && dist < minDistance) {
        minDistance = dist;
        closestCouple = c;
      }
    }

    if (closestCouple) {
      this.nearbyCouple = closestCouple;
      if (this.speechBubble) {
        this.speechBubble.style.display = 'flex';
        this.bubbleText.textContent = `[E] ${closestCouple.title || closestCouple.names}`;
      }
    } else {
      if (this.speechBubble) {
        this.speechBubble.style.display = 'none';
      }
    }
  }

  animate() {
    let movingNow = false;

    // Movimiento horizontal
    if (this.keys.left) {
      this.posX -= this.speed;
      this.facing = 'left';
      movingNow = true;
    } else if (this.keys.right) {
      this.posX += this.speed;
      this.facing = 'right';
      movingNow = true;
    } else if (this.targetPosX !== null) {
      const diff = this.targetPosX - this.posX;
      if (Math.abs(diff) > 0.6) {
        this.facing = diff > 0 ? 'right' : 'left';
        this.posX += (diff > 0 ? 1 : -1) * this.speed;
        movingNow = true;
      } else {
        this.targetPosX = null;
      }
    }

    // Umbrales de transición automática entre niveles por sendero
    if (currentLevel === 'france' && this.posX >= 91 && !isLevelTransitioning) {
      switchLevel('tree');
      return;
    } else if (currentLevel === 'tree' && this.posX <= 4 && !isLevelTransitioning) {
      switchLevel('france');
      return;
    }

    // Límites del escenario
    this.posX = Math.max(5, Math.min(94, this.posX));

    // Salto y gravedad
    if (!this.isGrounded) {
      this.offsetY += this.velY;
      this.velY += 0.65; // gravedad

      if (this.offsetY >= 0) {
        this.offsetY = 0;
        this.velY = 0;
        this.isGrounded = true;
        this.createDust();
      }
    }

    // Partículas de pisadas
    if (movingNow && this.isGrounded) {
      this.stepCounter++;
      if (this.stepCounter % 14 === 0) {
        this.createDust();
      }
    }

    // Aplicar al elemento DOM
    this.el.style.left = `${this.posX}%`;
    this.el.style.transform = `translateX(-50%) translateY(${this.offsetY}px)`;

    this.el.classList.toggle('walking', movingNow && this.isGrounded);
    this.el.classList.toggle('idle', !movingNow && this.isGrounded);
    this.el.classList.toggle('jumping', !this.isGrounded);
    this.el.classList.toggle('facing-left', this.facing === 'left');

    // Actualizar animación de sprites auténtica (caminado cuadro por cuadro)
    if (!this.spriteImg || !this.spriteImg.isConnected) {
      this.spriteImg = this.el?.querySelector('.bea-sprite-img') || document.getElementById('bea-sprite-img');
    }

    if (movingNow && this.isGrounded) {
      if (this.currentFrameSrc === BEA_SPRITES.idle) {
        // Al comenzar a caminar, iniciar de inmediato con el paso 1
        this.walkFrameIndex = 0;
        this.walkTick = 0;
        const firstSrc = BEA_SPRITES.walk[0];
        if (this.spriteImg) {
          this.spriteImg.src = firstSrc;
          this.currentFrameSrc = firstSrc;
        }
      } else {
        this.walkTick++;
        // Cambiar de fotograma cada 7 ticks (~115ms a 60 FPS)
        if (this.walkTick >= 7) {
          this.walkTick = 0;
          this.walkFrameIndex = (this.walkFrameIndex + 1) % BEA_SPRITES.walk.length;
          const nextSrc = BEA_SPRITES.walk[this.walkFrameIndex];
          if (this.spriteImg && this.currentFrameSrc !== nextSrc) {
            this.spriteImg.src = nextSrc;
            this.currentFrameSrc = nextSrc;
          }
        }
      }
    } else {
      this.walkTick = 0;
      this.walkFrameIndex = 0;
      const targetSrc = !this.isGrounded ? BEA_SPRITES.jump : BEA_SPRITES.idle;
      if (this.spriteImg && this.currentFrameSrc !== targetSrc) {
        this.spriteImg.src = targetSrc;
        this.currentFrameSrc = targetSrc;
      }
    }

    this.checkProximity();

    requestAnimationFrame(() => this.animate());
  }
}

/* ==========================================================================
   SISTEMA DE NIVELES: FRANCIA (NIVEL 1) & ÁRBOL SAKURA (NIVEL 2)
   ========================================================================== */
let currentLevel = 'france';
let isLevelTransitioning = false;

function switchLevel(targetLevel) {
  if (isLevelTransitioning || currentLevel === targetLevel) return;
  isLevelTransitioning = true;

  const layoutFrance = document.getElementById('layout-france');
  const layoutTree = document.getElementById('layout-tree');
  const charEl = document.getElementById('character-bea');

  if (targetLevel === 'tree') {
    audioSynth.playGameStartSound();
    audioSynth.stopFrenchBgm();
    const btnFranceMusic = document.getElementById('btn-france-music');
    btnFranceMusic?.classList.remove('playing');

    // Iniciar BGM de Sakura en el Nivel 2
    audioSynth.startSakuraBgm();
    const btnMusicToggle = document.getElementById('btn-music-toggle');
    btnMusicToggle?.classList.add('playing');

    layoutFrance?.classList.remove('active');
    layoutFrance?.classList.add('hidden');

    layoutTree?.classList.remove('hidden');
    layoutTree?.classList.add('active');

    // Trasladar a Bea al escenario del árbol
    const sakuraStage = document.getElementById('sakura-stage');
    if (charEl && sakuraStage && !sakuraStage.contains(charEl)) {
      sakuraStage.appendChild(charEl);
    }
    if (beaController) {
      beaController.posX = 10;
      beaController.targetPosX = null;
      setTimeout(() => beaController.jump(), 280);
    }

    currentLevel = 'tree';
  } else {
    audioSynth.playChime();
    audioSynth.stopSakuraBgm();
    const btnMusicToggle = document.getElementById('btn-music-toggle');
    btnMusicToggle?.classList.remove('playing');

    // Reanudar Vals Francés en el Nivel 1
    audioSynth.startFrenchBgm();
    const btnFranceMusic = document.getElementById('btn-france-music');
    btnFranceMusic?.classList.add('playing');

    layoutTree?.classList.remove('active');
    layoutTree?.classList.add('hidden');

    layoutFrance?.classList.remove('hidden');
    layoutFrance?.classList.add('active');

    // Trasladar a Bea al escenario de Francia
    const franceStage = document.getElementById('france-stage');
    if (charEl && franceStage && !franceStage.contains(charEl)) {
      franceStage.appendChild(charEl);
    }
    if (beaController) {
      beaController.posX = 84;
      beaController.targetPosX = null;
      setTimeout(() => beaController.jump(), 280);
    }

    currentLevel = 'france';
  }

  setTimeout(() => {
    isLevelTransitioning = false;
    if (beaController) {
      beaController.animate();
    }
  }, 600);
}

/* ==========================================================================
   ANIMACIÓN Y PATRULLA DE LOS 3 GALLOS GALOS (PIERRE, MARCEL, JULES)
   ========================================================================== */
const ROOSTERS_DATA = [
  { id: 'rooster-1', name: 'Pierre', x: 12, minX: 5, maxX: 40, speed: 0.12, dir: 1, greeting: '¡Cocorico! Pierre 🐓', el: null },
  { id: 'rooster-2', name: 'Marcel', x: 45, minX: 28, maxX: 68, speed: 0.08, dir: -1, greeting: '¡Bonjour! Marcel 🥖', el: null },
  { id: 'rooster-3', name: 'Jules',  x: 70, minX: 58, maxX: 88, speed: 0.15, dir: 1, greeting: '¡Salut! Jules 🥐', el: null }
];

function initRoosters() {
  ROOSTERS_DATA.forEach(r => {
    r.el = document.getElementById(r.id);
    r.el?.addEventListener('click', () => {
      r.el.style.transform = 'translateY(-10px)';
      audioSynth.playChimeSound();
      setTimeout(() => {
        if (r.el) r.el.style.transform = '';
      }, 240);
    });
  });

  function updateRoosters() {
    if (currentLevel === 'france') {
      ROOSTERS_DATA.forEach(r => {
        if (!r.el) return;
        r.x += r.speed * r.dir;
        if (r.x >= r.maxX) {
          r.x = r.maxX;
          r.dir = -1;
        } else if (r.x <= r.minX) {
          r.x = r.minX;
          r.dir = 1;
        }
        r.el.style.left = `${r.x}%`;
        r.el.classList.toggle('facing-left', r.dir === -1);
      });
    }
    requestAnimationFrame(updateRoosters);
  }

  requestAnimationFrame(updateRoosters);
}

function initLevelSystem() {
  const btnFranceSkip = document.getElementById('btn-france-skip');
  const pathToSakura = document.getElementById('path-to-sakura');
  const btnFranceMusic = document.getElementById('btn-france-music');
  const btnToggleCrtFrance = document.getElementById('btn-toggle-crt-france');

  btnFranceSkip?.addEventListener('click', () => switchLevel('tree'));
  pathToSakura?.addEventListener('click', () => switchLevel('tree'));

  btnFranceMusic?.addEventListener('click', () => {
    const isPlaying = audioSynth.toggleFrenchBgm();
    btnFranceMusic.classList.toggle('playing', isPlaying);
  });

  btnToggleCrtFrance?.addEventListener('click', () => {
    document.body.classList.toggle('crt-active');
    const active = document.body.classList.contains('crt-active');
    btnToggleCrtFrance.classList.toggle('btn-primary', active);
    const btnToggleCrtTree = document.getElementById('btn-toggle-crt');
    btnToggleCrtTree?.classList.toggle('btn-primary', active);
  });

  const btnShowStart = document.getElementById('btn-show-start');
  const pathToFrance = document.getElementById('path-to-france');
  btnShowStart?.addEventListener('click', () => switchLevel('france'));
  pathToFrance?.addEventListener('click', () => switchLevel('france'));

  // Inicio de audio tras la primera interacción del usuario (requisito de políticas de navegador)
  const handleFirstInteraction = () => {
    window.removeEventListener('keydown', handleFirstInteraction);
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    audioSynth.init();
    if (currentLevel === 'france' && !audioSynth.isPlayingFrenchBgm) {
      audioSynth.startFrenchBgm();
      btnFranceMusic?.classList.add('playing');
    }
  };
  window.addEventListener('keydown', handleFirstInteraction, { once: true });
  window.addEventListener('click', handleFirstInteraction, { once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { once: true });
}

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
let beaController = null;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sakura-canvas');
  if (canvas) {
    petalEngine = new SakuraPetalEngine(canvas);
  }

  renderFramesLayer(couplesData);
  processBeaSprite();
  initLevelSystem();
  initRoosters();

  const charEl = document.getElementById('character-bea');
  if (charEl) {
    beaController = new BeaCharacterController(charEl, couplesData);
  }
});
