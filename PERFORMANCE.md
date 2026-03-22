# Por qué la app puede tardar al abrir

## Causas principales

1. ~~**Babel en el navegador**~~ **Hecho:** `npm run build` genera `app.compiled.js` con **esbuild**; el HTML ya no usa Babel en el cliente (arranque mucho más rápido).

2. ~~**Tailwind CDN**~~ **Hecho:** `src/input.css` + `tailwind.config.js` → **`app.compiled.css`** en build (sin JIT en el navegador).

3. **Varios scripts en cadena**  
   Firebase (3 archivos desde `gstatic`) + **`app.compiled.js`** (incluye React; ya no hay peticiones extra a unpkg) + CSS estático.

### Por qué en Vercel podía sentirse peor que “antes”

- **Scripts en `<head>`** bloquean el parseo del `<body>`: el splash no aparecía hasta terminar Firebase + React (6 peticiones externas seguidas). Ahora **no hay scripts en el head**; el splash pinta enseguida y Firebase carga **al final del body**.
- **unpkg.com** añade latencia extra (a veces notable desde LATAM). React va **dentro de `app.compiled.js`** servido desde el mismo dominio (Vercel CDN).
- Tras un deploy, el primer visitante puede notar **cold cache**; las visitas siguientes suelen ir más rápido.

4. **Red y Firebase**  
   Después de que React arranca, hay que conectar con Auth/Firestore y leer el documento del usuario (`userData/{uid}`). En 3G o con latencia, se nota “Cargando rutinas…”.

## Qué ya hace el proyecto

- Pantalla **“GYM TRACKER / Cargando app…”** apenas abrís la página.
- `preload` de React/ReactDOM para que el navegador los pida pronto.
- **Build:** `npm run build` → `app.compiled.css` + `app.compiled.js` (Netlify ejecuta `npm run build` en deploy).

## Cómo mejorar más (opcional)

- **Code splitting:** cargar vistas pesadas al cambiar de pestaña (opcional).

---

*Resumen: JS y CSS van precompilados; ya no hay Babel ni Tailwind CDN en el cliente.*
