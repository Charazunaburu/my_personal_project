# Proyecto Sakura Pixel

> Experiencia interactiva y videojuego 2D en estética **Pixel Art** que combina exploración lateral, música retro 8-bit sintetizada en tiempo real y un álbum interactivo de recuerdos colgados en las ramas de un sagrado cerezo Sakura japonés.

---

## 🎮 Niveles y Mecánicas

1. **Nivel 1 — Calle de París (`#layout-france`):**
   - Camina con **Bea** a lo largo de una ambientación parisina al atardecer con adoquines y farolas retro.
   - Comparte el sendero con 3 gallos galos animados (*Pierre*, *Marcel* y *Jules*) que deambulan por la calle.
   - Melodía francesa en estilo vals chiptune 8-bit.
   - Sendero este señalizado que transporta al jugador hacia el Nivel 2.

2. **Nivel 2 — Santuario del Árbol Sakura (`#layout-tree`):**
   - Recorre el jardín japonés bajo una lluvia de pétalos animados en Canvas.
   - Marcos de fotos estilo polaroid suspendidos de las ramas del cerezo.
   - Acércate a cualquier recuerdo o haz clic en él para abrir la dedicatoria en alta resolución.
   - Formulario interactivo para colgar nuevas fotos de pareja directamente en las ramas del árbol con persistencia local.
   - Melodía tradicional japonesa 8-bit y controles de viento y atmósfera (Día / Tarde / Noche).

---

## 🕹️ Controles del Juego

| Acción | Teclado | Táctil / Ratón |
| :--- | :--- | :--- |
| **Mover a la izquierda** | <kbd>◀</kbd> o <kbd>A</kbd> | Botón táctil `◀` o clic en el suelo |
| **Mover a la derecha** | <kbd>▶</kbd> o <kbd>D</kbd> | Botón táctil `▶` o clic en el suelo |
| **Saltar** | <kbd>▲</kbd> o <kbd>Espacio</kbd> | Botón táctil `▲ SALTO` |
| **Interactuar / Abrir recuerdo** | <kbd>E</kbd> o <kbd>Enter</kbd> | Tocar el bocadillo de diálogo o la foto |
| **Filtro Retro CRT** | Botón **📺 CRT** en el HUD | Botón **📺 CRT** en el HUD |

---

## 🚀 Cómo Ejecutar el Proyecto

> [!IMPORTANT]
> Debido a que el proyecto utiliza módulos estándar de JavaScript (`<script type="module">`), los navegadores restringen la carga directa con doble clic (`file:///`) por políticas de seguridad CORS. **Es necesario servirlo a través de un servidor HTTP local.**

Elige cualquiera de las siguientes opciones según tus herramientas instaladas:

### Opción 1: Con Python (Recomendada si tienes Python)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Python 3
python -m http.server 8000
```

Luego abre tu navegador en:
👉 [http://localhost:8000](http://localhost:8000)

---

### Opción 2: Con Node.js / npx (Sin instalación previa)

Si tienes Node.js instalado, puedes usar `serve` o `http-server` directamente:

```bash
npx -y serve .
```
o
```bash
npx -y http-server -p 8000 -c-1
```

Luego abre en tu navegador la URL que indique la consola (por ejemplo, `http://localhost:3000` o `http://localhost:8000`).

---

### Opción 3: Con la extensión Live Server (VS Code / Antigravity)

1. Abre la carpeta del proyecto en **VS Code** o **Antigravity IDE**.
2. Si tienes instalada la extensión **Live Server** (de *Ritwick Dey*):
   - Haz clic derecho sobre el archivo `index.html`.
   - Selecciona **"Open with Live Server"**.
3. Se abrirá automáticamente en tu navegador predeterminado en `http://127.0.0.1:5500/index.html`.

---

## 📁 Estructura del Proyecto

```text
bea_project/
├── index.html            # Estructura principal y layouts de los dos niveles
├── style.css             # Estilos pixel art, animaciones, filtros y diseño responsive
├── style.js              # Sintetizador Web Audio API (vals francés y melodía sakura 8-bit)
├── app.js                # Lógica del juego, controlador 2D de Bea, gallos y canvas
├── assets/               # Sprites del personaje, fondos de escenario y fotografías
├── specs/                # Especificaciones técnicas del flujo spec-driven
├── scripts/              # Scripts auxiliares de generación y optimización de activos
├── .github/workflows/    # Pipeline de despliegue automático a GitHub Pages
└── README.md             # Documentación de ejecución
```

---

## 🌐 Despliegue en Producción (GitHub Pages)

El proyecto cuenta con un flujo automatizado en `.github/workflows/jekyll-gh-pages.yml`. Para desplegarlo en la web:

1. Sube tu código a un repositorio en GitHub.
2. En GitHub, ve a **Settings** ➔ **Pages**.
3. En **Build and deployment** ➔ **Source**, selecciona **GitHub Actions**.
4. Cada vez que hagas `git push origin main`, tu sitio se publicará automáticamente en tu URL de GitHub Pages (`https://<usuario>.github.io/<repositorio>/`).

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3 nativo:** Sin frameworks externos ni dependencias pesadas; diseño pixel art con variables CSS, animaciones GPU y contención de layout.
- **JavaScript Moderno (ES6+ Modules):** Lógica física 2D con delta time, ciclo de animación rAF optimizado y gestión de estado.
- **HTML5 Canvas 2D:** Motor de partículas interactivo para la caída de pétalos de Sakura.
- **Web Audio API:** Síntesis de ondas de pulso y melodías 8-bit sin necesidad de archivos de audio MP3 pesados.
