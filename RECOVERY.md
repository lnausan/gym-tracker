# Recuperar historial (localStorage → Firestore)

## Qué pasaba antes

Si tu cuenta **ya tenía** un documento en Firestore (por ejemplo creado desde la PC) y en el **celular** tenías sesiones solo en `localStorage`, al abrir la app se **cargaba la nube** y se **borraba el almacenamiento local** sin subir el historial del teléfono. Eso podía hacer “desaparecer” lo cargado en jueves/sábado en el móvil.

**Desde la versión actual:** al iniciar sesión se **fusionan** automáticamente `gym-logs` y `gym-cardio-logs` locales con `workoutLogs` / `cardioLogs` en Firestore antes de borrar el local.

## Si todavía no ves datos

1. **Mismo dispositivo/navegador** donde entrenaste (Safari vs Chrome = almacenamiento distinto).
2. En la app: **Historial** → botón **“Recuperar / fusionar historial local”**.
3. Si el aviso dice que no hay nada en local, esas claves ya se borraron o nunca existieron en **ese** navegador.

## Claves en `localStorage`

- `gym-logs` — sesiones de pesas (JSON array)
- `gym-cardio-logs` — cardio

## Si ya no hay copia local

Revisá en **Firebase Console → Firestore → `userData` → tu `uid` → campo `workoutLogs`**. Si ahí están las sesiones, el problema es de la app o de la cuenta; si el array está vacío y no hay backup, no se puede reconstruir solo desde el cliente.
