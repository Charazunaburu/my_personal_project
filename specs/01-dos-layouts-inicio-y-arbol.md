# SPEC 01 — Dos niveles jugables: Francia y el Árbol Sakura de Recuerdos

> **Status:** Aprobado
> **Depends on:** None
> **Date:** 2026-09-30
> **Objective:** Separar la aplicación en dos niveles jugables: un primer nivel en Francia donde Bea camina junto a tres gallos animados y sigue un sendero de conexión, y un segundo nivel en el Árbol Sakura con fotos de recuerdos y lluvia de pétalos.

---

## Por qué existe esta especificación

Para transformar la experiencia en un auténtico videojuego de plataformas y exploración 2D con progresión narrativa. En lugar de ser un menú estático, el primer layout se convierte en un nivel jugable ambientado en una calle parisina donde el jugador controla a Bea, comparte el sen-dero con tres gallos galos animados, lee una dedicatoria romántica y avanza por un sendero interactivo que la transporta al segundo nivel: el sagrado Árbol Sakura en Japón.

---

## Alcance

**Dentro del alcance:**

- **Nivel 1 — Calle de Francia (`#layout-france`):**
  - Nivel jugable 2D con suelo de adoquines parisinos, farolas retro pixel art y ambientación de Francia.
  - Control total del personaje Bea (caminar a izquierda/derecha, saltar y animación de pasos).
  - 3 gallos galos pixel art deambulando de un lado a otro a ritmos variables y cambiando de dirección.
  - Tarjeta de dedicatoria inicial y visible en el escenario: *"Dedicado a Bea: Para que nunca olvides lo hermoso que es pasar cada segundo a tu lado."*.
  - Melodía francesa 8-bit (vals parisino chiptune).
  - Sendero señalizado en el extremo derecho de la pantalla ("Sendero hacia el Sakura 🌸 ➔").
  - Al caminar con Bea hasta el final del sendero derecho (umbral `x >= 92%`), se dispara la transición hacia el Nivel 2.
  - **Exclusión explícita:** La lluvia de pétalos de sakura y la música japonesa del árbol NO aparecen en este nivel.
- **Nivel 2 — Santuario del Árbol Sakura (`#layout-tree`):**
  - Escenario interactivo del cerezo sagrado en Japón.
  - Bea aparece entrando por el extremo izquierdo (`x = 8%`) y puede recorrer el sendero para acercarse a los marcos de fotos y abrirlos con la tecla E / Enter o clic.
  - Activación del lienzo de lluvia de pétalos de sakura y melodía Sakura 8-bit.
  - Sendero de retorno en el extremo izquierdo o botón en el HUD superior ("Volver a Francia") para regresar al Nivel 1.
- **Rediseño y mejora del personaje Bea:**
  - **Aumento de tamaño:** Escalar las dimensiones del sprite de Bea de 60x90px a aproximadamente 95x145px (un ~60% más grande) para mejorar su visibilidad, presencia y legibilidad en pantalla, junto con un redimensionamiento proporcional de su sombra y etiqueta de nombre.
  - **Animación de caminado viva:** Ciclo rítmico de pasos (`beaWalkCycle`) con balanceo de cuerpo, inclinación de zancadas y rebote vertical pixel art mientras se desplaza a la izquierda o derecha.
- **Sistema de Transición:** Fundido o cortinilla pixel art entre niveles que sincroniza la posición de Bea y conmuta los temas de audio.

**Fuera del alcance (para futuras especificaciones):**

- Enemigos, colisiones de daño o sistemas de vidas/salud.
- Minijuegos de atrapar o alimentar a los gallos.
- Niveles intermedios adicionales en otros países.
- Almacenamiento en la nube o sistema de puntuaciones.

---

## Modelo de datos

Gestión del estado de juego, niveles y posición de Bea en `app.js`:

```js
// Estado global de progresión de niveles
const gameState = {
  currentLevel: 'france', // 'france' | 'tree'
  isTransitioning: false,
  beaPosition: {
    france: { x: 15, y: 0 },
    tree: { x: 8, y: 0 }
  }
};

// Dimensiones actualizadas del personaje Bea
const BEA_CONFIG = {
  width: 95, // px (aumento desde 60px)
  height: 145, // px (aumento desde 90px)
  speed: 0.55 // % de pantalla por frame
};

// Configuración de los 3 gallos galos en Francia
const ROOSTERS_CONFIG = [
  { id: 'rooster-1', name: 'Pierre', speed: 1.2, minX: 5, maxX: 40, x: 12, dir: 1 },
  { id: 'rooster-2', name: 'Marcel', speed: 0.8, minX: 28, maxX: 68, x: 45, dir: -1 },
  { id: 'rooster-3', name: 'Jules',  speed: 1.5, minX: 58, maxX: 88, x: 70, dir: 1 }
];
```

Convenciones:

- Clases de nivel: `.game-level` como clase base, `.game-level.active` para el nivel visible y `.game-level.hidden` para el inactivo.
- Estados de animación de Bea: `.character-bea.idle` (respiración suave), `.character-bea.walking` (pasos rítmicos y rebote), `.character-bea.jumping` (estiramiento en el aire), `.character-bea.facing-left` (`scaleX(-1)`).
- Disparadores de sendero:
  - En Francia: si Bea alcanza `x >= 92%`, activar transición `switchLevel('tree')`.
  - En el Árbol: si Bea camina a `x <= 4%`, activar retorno `switchLevel('france')`.

---

## Plan de implementación

1. Reestructurar `index.html` creando los dos niveles secuenciales: `<section id="layout-france" class="game-level active">` (con la calle francesa, la dedicatoria, el contenedor de gallos y el cartel del sendero este) y `<div id="layout-tree" class="game-level hidden">` (con el árbol Sakura, marcos y HUDs).
2. Escalar el tamaño de Bea en `style.css` (~95x145px), ajustando el contenedor `.bea-sprite-container`, la sombra inferior y la etiqueta de nombre, garantizando que sus pies toquen el suelo adecuadamente en ambos niveles.
3. Implementar en `style.css` la nueva animación de caminado de Bea (`@keyframes beaWalkStep`) para `.character-bea.walking`, combinando elevación alternada de pasos, balanceo sutil y compresión al apoyar el pie.
4. Diseñar en `style.css` la escenografía de Francia: adoquines, farola retro, cartel señalizador ("🌸 Hacia el Sakura ➔") y la tarjeta de dedicatoria a Bea.
5. Crear en `style.css` los sprites y animaciones pixel art de los 3 gallos galos (cresta roja, plumaje, balanceo al caminar y volteo `scaleX`).
6. Ampliar `style.js` con la melodía francesa 8-bit (`playFrenchBgm`) en `PixelAudioSynth`, diferenciada de la melodía Sakura (`playSakuraBgm`).
7. Adaptar en `app.js` el controlador de Bea (`BeaController`) para que aplique dinámicamente la clase `.walking` durante el movimiento horizontal, responda con suavidad a las teclas de movimiento en ambos escenarios y detecte el final del sendero francés (`x >= 92%`).
8. Implementar en `app.js` la transición suave hacia el Árbol Sakura, apagando la música francesa, encendiendo los pétalos y música Sakura, y posicionando a Bea al inicio del sendero del árbol (`x = 8%`).
9. Conectar el sendero de retorno en el árbol (`x <= 4%`) y el botón del HUD superior para permitir a Bea volver a caminar por la calle francesa en cualquier momento.

---

## Criterios de aceptación

- [ ] El sprite de Bea es visiblemente más grande y nítido en pantalla (~95x145px, un ~60% más grande que el original).
- [ ] Al mantener presionadas las teclas de movimiento horizontal (flechas o A/D), Bea ejecuta una animación de caminado rítmica con pasos visibles y balanceo natural.
- [ ] Al soltar las teclas, Bea se detiene de inmediato y entra en estado de reposo (`idle`) sin deformaciones.
- [ ] Al cargar la página, se inicia en el Nivel 1 (Francia) con una ambientación parisina de adoquines y la dedicatoria: *"Dedicado a Bea: Para que nunca olvides lo hermoso que es pasar cada segundo a tu lado."*.
- [ ] El jugador puede controlar a Bea en el Nivel 1 (Francia) para desplazarse y saltar libremente.
- [ ] 3 gallos pixel art deambulan de un lado a otro a lo largo de la calle francesa mientras Bea camina.
- [ ] La lluvia de pétalos de sakura del canvas y la música del árbol están completamente inactivas en Francia; suena el vals parisino 8-bit.
- [ ] En el extremo derecho de la calle en Francia se encuentra señalizado el sendero hacia el Árbol Sakura.
- [ ] Al guiar a Bea hasta el final del sendero derecho (`x >= 92%`), se dispara una transición fluida al Nivel 2 (Árbol Sakura).
- [ ] Al ingresar al Nivel 2, Bea aparece en el lado izquierdo del árbol, se activa la lluvia de pétalos de sakura, la música japonesa tradicional y los marcos de fotos son accesibles.
- [ ] Guiar a Bea hacia el extremo izquierdo del árbol (`x <= 4%`) o pulsar "Volver a Francia" en el HUD la traslada de vuelta al Nivel 1 de forma fluida.

---

## Decisiones

- **Sí:** Nivel 1 jugable con movimiento de Bea en vez de menú estático. Razón: Convierte la experiencia en una aventura interactiva mucho más inmersiva y emotiva.
- **Sí:** Sendero físico en el extremo derecho como mecanismo de transición. Razón: Sensación clásica de videojuego de pasar al siguiente nivel caminando por el sendero.
- **Sí:** Melodía francesa en el nivel 1 y melodía Sakura en el nivel 2. Razón: Marca de forma clara el contraste cultural y geográfico entre París y el jardín japonés.
- **Sí:** Retorno bidireccional entre niveles. Razón: Permite a Bea pasear libremente entre Francia con los gallos y el árbol con los recuerdos cuando lo desee.

---

## Riesgos

| Riesgo | Mitigación |
| :--- | :--- |
| Disparo continuo del evento de transición al permanecer en el borde del sendero | Bandera booleana `isTransitioning` que ignora detecciones adicionales hasta que el cambio de nivel se completa y Bea se reubica. |
| Posición de Bea descalibrada al cambiar de pantalla | Al llegar al nivel destino, restablecer `x` al inicio del sendero del nuevo nivel (e.g. `x = 8%` al entrar a Sakura, `x = 88%` al regresar a Francia). |

---

## Qué **no** incluye esta especificación

- Combates, obstáculos que resten vidas o temporizadores de nivel.
- Minijuegos interactivos para atrapar a los gallos.
- Editor de niveles o mundos adicionales más allá de Francia y Sakura.
