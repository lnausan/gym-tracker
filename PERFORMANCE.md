# Por qué la app puede tardar al abrir

## Causas principales

1. ~~**Babel en el navegador**~~ **Hecho:** `npm run build` genera `app.compiled.js` con **esbuild**; el HTML ya no usa Babel en el cliente (arranque mucho más rápido).

2. ~~**Tailwind CDN**~~ **Hecho:** `src/input.css` + `tailwind.config.js` → **`app.compiled.css`** en build (sin JIT en el navegador).

3. **Varios scripts en cadena**  
   Firebase (3 archivos) + React + ReactDOM + `app.compiled.js` + **una hoja CSS** estática.

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
