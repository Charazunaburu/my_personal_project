# SPEC 02 — Refactorización y optimización del renderizado de imágenes

> **Status:** Borrador
> **Depends on:** SPEC 01
> **Date:** 2026-10-12
> **Objective:** Optimizar el rendimiento de renderizado web mediante compresión a WebP con doble resolución para recuerdos y fondos, animación de Bea por spritesheet CSS y compresión en cliente de fotos subidas por el usuario.

---

## Por qué existe esta especificación

Actualmente la aplicación descarga más de 17 MB de recursos visuales durante la carga inicial: cinco fotografías de recuerdos (`Cita_*.jpg`) que pesan entre 2.5 MB y 4.2 MB cada una para mostrar miniaturas de apenas 100x100 píxeles en el árbol, y dos fondos de alta resolución que suman otros 2 MB. Adicionalmente, el personaje de Bea anima su caminata intercambiando dinámicamente el atributo `src` de una etiqueta `<img>` en cada fotograma dentro del bucle de animación de JavaScript, provocando recalculo de decodificación y microparpadeos. Por último, cuando el usuario cuelga una nueva foto, se almacena la cadena cruda en Base64 en `localStorage`, alcanzando rápidamente el límite de 5 MB del navegador.

Esta especificación establece una estrategia integral de renderizado eficiente, reduciendo el peso de transferencia en más de un 85%, eliminando el costo de CPU/GPU del intercambio de imágenes en el personaje y blindando el almacenamiento de fotos personalizadas.

---

## Alcance

**Dentro del alcance:**

- **Optimización y entrega de fotos de recuerdos con doble resolución:**
  - Generación de miniaturas optimizadas (`Cita_xxx_thumb.webp`, ~40-60 KB) para los marcos suspendidos en el Árbol Sakura.
  - Generación de versiones completas optimizadas (`Cita_xxx_full.webp`, ~200-300 KB, máx. 1200px de resolución) para el visor modal de recuerdos (`photoDialog`).
  - Conservación de los archivos originales `Cita_*.jpg` pesados en el repositorio como respaldo histórico sin vincularlos en tiempo de ejecución.
- **Optimización de fondos de escenarios:**
  - Conversión de `france_street_bg.jpg` y `sakura_tree_bg.jpg` a formato WebP optimizado (~200-300 KB cada uno), reduciendo su peso a una cuarta parte sin pérdida perceptible de estética pixel art.
  - Inclusión de atributos de decodificación asíncrona (`decoding="async"`) en las etiquetas de fondo de `index.html`.
- **Migración de la animación de Bea a Spritesheet CSS:**
  - Utilización de la tira de fotogramas `bea_walk_sheet.png` (1024x620px, 4 cuadros) mediante propiedades CSS `background-image`, `background-position` y función de tiempo `steps(4)`.
  - Eliminación completa de la lógica de intercambio de `this.spriteImg.src` en `BeaCharacterController.animate()` dentro de `app.js`. El controlador únicamente alternará las clases de estado (`.idle`, `.walking`, `.jumping`).
- **Compresión en cliente de fotos subidas por el usuario:**
  - Al seleccionar una foto en el formulario "Colgar foto", procesarla en el navegador mediante un elemento `<canvas>` fuera de pantalla.
  - Redimensionamiento proporcional a un máximo de 800px de ancho/alto y compresión a WebP (con fallback a JPEG, calidad 0.8) antes de generar el Base64.
  - Generación simultánea de un thumbnail comprimido para renderizar en el árbol, evitando errores de cuota (`QuotaExceededError`) en `localStorage`.
- **Script reproducible de preparación de activos:**
  - Script en PowerShell (`scripts/optimize_assets.ps1`) para automatizar la generación de las variantes WebP a partir de las imágenes maestras.

**Fuera del alcance (para futuras especificaciones):**

- Alojamiento de imágenes en servicios de nube externos (AWS S3, Cloudinary o Firebase Storage).
- Soporte para formatos experimentales AVIF con dependencias de compiladores binarios externos.
- Paginación o carga infinita de recuerdos (el escenario actual mantiene una cantidad moderada de recuerdos colgados en el árbol).

---

## Modelo de datos

Actualización de la colección de recuerdos iniciales en `app.js` para soportar miniatura y resolución completa:

```js
// Estructura actualizada de recuerdos
const INITIAL_COUPLES = [
  {
    id: 'couple-1',
    names: 'Yoha & Bea',
    date: '2024-04-12',
    dateFormatted: '12 Abril 2024',
    title: 'Cita en El Espino',
    quote: 'Rodeados de naturaleza, aire fresco y la sonrisa más hermosa del mundo. Cada instante a tu lado se siente como el mejor día.',
    thumbnail: 'assets/Cita_espino_01_thumb.webp',
    image: 'assets/Cita_espino_01_full.webp',
    posX: 22,
    posY: 16,
    swayType: 'sway-1'
  },
  // ... resto de recuerdos con sus respectivas variantes _thumb y _full
];
```

Reglas de compatibilidad:

- Para recuerdos guardados previamente en `localStorage` o recuerdos personalizados nuevos: si el objeto no posee `thumbnail`, se utiliza `couple.image` como alternativa transparente.
- En la creación de nuevos recuerdos:
  ```js
  const newCouple = {
    id: `custom-${Date.now()}`,
    names: names,
    date: dateVal,
    dateFormatted: dateFormatted,
    quote: quote,
    thumbnail: compressedThumbnailBase64,
    image: compressedFullBase64,
    posX: branchInfo.x,
    posY: branchInfo.y,
    swayType: branchInfo.sway
  };
  ```

Configuración de sprites en CSS:

```css
/* Contenedor del sprite de Bea usando spritesheet CSS */
.bea-sprite-container {
  width: 95px;
  height: 145px;
  position: relative;
  overflow: hidden;
}

.bea-sprite-view {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;
  image-rendering: pixelated;
}

/* Estado de reposo */
.character-bea.idle .bea-sprite-view {
  background-image: url('assets/bea_idle.png');
}

/* Ciclo de caminata con steps(4) */
.character-bea.walking .bea-sprite-view {
  background-image: url('assets/bea_walk_sheet.png');
  background-size: 400% 100%;
  animation: beaSpriteWalkCycle 0.65s steps(4) infinite;
}

@keyframes beaSpriteWalkCycle {
  from { background-position: 0% 0%; }
  to { background-position: 100% 0%; }
}
```

---

## Plan de implementación

1. **Crear script de procesamiento de activos (`scripts/optimize_assets.ps1`):** Diseñar un script PowerShell que lea las imágenes fuente (`Cita_*.jpg` y los fondos `.jpg`), genere las versiones `_thumb.webp` (máx. 240px ancho), `_full.webp` (máx. 1200px ancho) y los fondos WebP comprimidos en `assets/`.
2. **Ejecutar la optimización de activos:** Generar los archivos WebP en `assets/` y validar que el peso total combinado de los activos web pase de ~17 MB a menos de ~2 MB, verificando que los archivos `.jpg` originales permanezcan intactos como respaldo.
3. **Refactorizar la estructura de fondo en `index.html`:** Sustituir las referencias de fondo `assets/france_street_bg.jpg` y `assets/sakura_tree_bg.jpg` por sus equivalentes `assets/france_street_bg.webp` y `assets/sakura_tree_bg.webp`, incorporando `decoding="async"`.
4. **Actualizar el marcado y estilos del sprite de Bea:** Reemplazar en `index.html` la etiqueta `<img id="bea-sprite-img">` por un elemento estructurado `<div class="bea-sprite-view" id="bea-sprite-view">` dentro de `.bea-sprite-container`. Añadir en `style.css` las reglas de animación por spritesheet con `steps(4)` descritas en el modelo de datos.
5. **Actualizar la lista de recuerdos en `app.js`:** Incorporar las propiedades `thumbnail` y `image` apuntando a las variantes WebP en `INITIAL_COUPLES` y en las rutas de respaldo (`fallbackImages`).
6. **Actualizar el renderizado de marcos y el modal en `app.js`:** Modificar `renderFramesLayer` para que la etiqueta `<img>` del marco use `couple.thumbnail || couple.image`, con `loading="lazy"` y `decoding="async"`. En `openCoupleModal`, cargar la versión `couple.image` de alta resolución.
7. **Simplificar `BeaCharacterController` en `app.js`:** Suprimir la lógica de temporización manual `walkTick`, `walkFrameIndex` y la mutación repetitiva de `img.src` en cada llamada a `requestAnimationFrame`. La actualización visual se limitará a alternar las clases CSS de estado `.walking`, `.idle`, `.jumping` y `.facing-left`.
8. **Implementar utilidad de compresión en cliente (`compressImage`):** Añadir en `app.js` una función asíncrona basada en `<canvas>` que redimensione imágenes subidas por el usuario a un tamaño máximo acotado (800px para la vista completa y 200px para el thumbnail) y genere cadenas Base64 en WebP/JPEG con calidad 0.8.
9. **Integrar la compresión al formulario de colgar foto:** Conectar la utilidad al evento de selección de archivo (`inputPhotoFile.change`) y al envío del formulario (`formAddCouple.submit`), guardando ambas variantes en el objeto del nuevo recuerdo.

---

## Criterios de aceptación

- [ ] La transferencia de red inicial de imágenes en una carga limpia pasa de ~17 MB a menos de 2.2 MB.
- [ ] Los fondos de la calle francesa y del Árbol Sakura se renderizan desde sus variantes WebP optimizadas con `decoding="async"`.
- [ ] Los marcos de fotos suspendidos en el árbol cargan las miniaturas ligeras (`_thumb.webp`) con `loading="lazy"`.
- [ ] Al hacer clic o interactuar con un marco de recuerdo, el diálogo modal muestra la imagen en alta resolución (`_full.webp`) con nitidez visual.
- [ ] Al caminar con Bea a izquierda o derecha, la animación de pasos se ejecuta mediante el spritesheet CSS `bea_walk_sheet.png` con `steps(4)` de forma fluida y sin parpadeos.
- [ ] No se produce ninguna mutación de atributos `src` en el DOM de Bea durante el bucle de animación de JavaScript (`requestAnimationFrame`).
- [ ] Al subir una imagen pesada (mayor a 2 MB) a través del modal "Colgar foto", la imagen se comprime en el navegador a menos de 150 KB antes de almacenarse en `localStorage`.
- [ ] Los recuerdos creados por el usuario persisten correctamente en `localStorage` y se renderizan sin lanzar errores de cuota de almacenamiento.
- [ ] Los recuerdos previos que no tengan la propiedad `thumbnail` se siguen visualizando correctamente utilizando `image` como valor de rescate.
- [ ] Los archivos `.jpg` maestros de alta resolución originales se conservan intactos en la carpeta del repositorio como respaldo.

---

## Decisiones

- **Sí:** Generar variantes duales (`_thumb.webp` y `_full.webp`). Razón: Cargar miniaturas de 40 KB en los marcos evita descargar imágenes de 3 MB para tarjetas de 100px en pantalla, reservando la resolución mayor para cuando el usuario abre el modal.
- **Sí:** Conservar los archivos `.jpg` maestros originales en el repositorio. Razón: Mantiene la fuente sin pérdidas para futuras exportaciones o cambios de resolución sin alterar el historial.
- **Sí:** Animación de Bea mediante CSS `steps(4)` sobre `bea_walk_sheet.png`. Razón: La GPU y el motor de renderizado del navegador manejan las transiciones de coordenadas de textura de forma mucho más eficiente que sustituir el `src` de una etiqueta `<img>` 6 veces por segundo en JavaScript.
- **Sí:** Compresión en cliente con `<canvas>` al subir fotos. Razón: Protege el límite de 5 MB de `localStorage` y previene que una sola fotografía sature la memoria del navegador del usuario.
- **No:** Migrar inmediatamente a IndexedDB. Razón: La compresión en cliente a ~80-120 KB por foto permite almacenar decenas de recuerdos dentro del margen estándar de `localStorage` sin añadir complejidad asíncrona de base de datos relacional/objeto.
- **No:** Uso de AVIF. Razón: WebP cuenta con compatibilidad superior al 97% en navegadores modernos y se puede generar directamente en scripts de PowerShell sin dependencias complejas.

---

## Riesgos

| Riesgo | Mitigación |
| :--- | :--- |
| Navegador antiguo sin soporte nativo de exportación a WebP en `canvas.toDataURL()` | Fallback automático a `image/jpeg` con calidad 0.8 si `toDataURL('image/webp')` no es soportado por el motor del cliente. |
| Incompatibilidad con datos antiguos guardados en `localStorage` sin campo `thumbnail` | Lectura segura mediante `couple.thumbnail || couple.image` tanto en `renderFramesLayer` como en el controlador de proximidad. |
| Posición de pies desalineada en la animación por spritesheet CSS | Utilizar las dimensiones exactas calculadas previamente para cada cuadro (256x620px) con `background-size: 400% 100%` y alineación vertical inferior (`bottom`). |

---

## Qué **no** incluye esta especificación

- Subida de archivos a servidores backend o almacenamiento en la nube (S3, Firebase, Cloudinary).
- Eliminación o descarte de las fotos maestras originales de recuerdos.
- Modificaciones en la mecánica de niveles o físicas de salto del personaje Bea más allá de su renderizado de textura.
