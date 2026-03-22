# Por qué la app puede tardar al abrir

## Causas principales

1. **Babel en el navegador**  
   El archivo `app.jsx` se compila **en tu celular o PC en cada carga** con `@babel/standalone`. No es un JS ya listo: el navegador descarga ~2000+ líneas, las parsea y las transpila. Eso es **la mayor parte del tiempo** de arranque.

2. **Tailwind CDN (`cdn.tailwindcss.com`)**  
   Genera estilos en el cliente; añade trabajo y descarga.

3. **Varios scripts en cadena**  
   Firebase (3 archivos) + React + ReactDOM + Babel + descarga de `app.jsx`.

4. **Red y Firebase**  
   Después de que React arranca, hay que conectar con Auth/Firestore y leer el documento del usuario (`userData/{uid}`). En 3G o con latencia, se nota “Cargando rutinas…”.

## Qué ya hace el proyecto

- Pantalla **“GYM TRACKER / Cargando app…”** apenas abrís la página (antes de que termine Babel).
- `preload` de React/ReactDOM para que el navegador los pida pronto.

## Cómo mejorar de verdad (siguiente paso técnico)

- **Build con Vite (o similar):** compilar JSX **una vez** al publicar (`npm run build`) y servir un JS minificado **sin** Babel en el cliente. Suele reducir muchísimo el tiempo de arranque.
- **CSS:** Tailwind generado en build en lugar del CDN de desarrollo.
- **Code splitting:** cargar vistas pesadas al cambiar de pestaña (opcional).

---

*Resumen: la lentitud es esperable con “JSX en el navegador”; es el trade-off de no tener paso de build. Para producto, conviene pasar a build estático.*
