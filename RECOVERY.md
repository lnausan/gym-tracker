# Historial y migración local → Firestore

## Comportamiento actual

- Cada **cuenta** (Firebase Auth) tiene su historial en **`userData/{uid}`** en Firestore: campos `workoutLogs` y `cardioLogs`.
- Al **primer inicio de sesión**, si todavía había datos viejos en `localStorage` (`gym-logs`, etc.), la app los **fusiona** con la nube y limpia el local (una sola vez).

## Si no ves sesiones antiguas

- Revisá que estés en la **misma cuenta** que cuando las registraste.
- Desde **Firebase Console → Firestore → `userData` → tu `uid`** podés verificar el campo `workoutLogs`.

La app ya **no incluye** botones de “fusionar navegador” ni importación JSON en pantalla; el guardado día a día es siempre en la nube por perfil.
