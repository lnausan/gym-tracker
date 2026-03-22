# Firestore — Gym Tracker

## Modelo de datos (1 documento por usuario)

**Colección:** `userData`  
**Documento ID:** `{uid}` del usuario autenticado (Firebase Auth)

| Campo | Tipo | Descripción |
|--------|------|-------------|
| `schemaVersion` | number | Versión del esquema (actual: `1`) |
| `routines` | map | Rutinas de pesas por día (mismo objeto que antes en `localStorage`) |
| `cardioSettings` | map | Config de cardio por día |
| `dayPreferences` | map | Por cada día (`lunes`…`domingo`): `{ optional: boolean }`. Solo afecta la etiqueta **OPC** / “Opcional” en la UI; cada usuario elige qué días marcar. |
| `trainingWeekDays` | array de strings | Subconjunto ordenado de días de la semana en los que entrenás (ej. `["lunes","martes",…]`). Por defecto los 5 días históricos de la app; podés sumar **viernes**, **domingo** o los 7. Controla qué días aparecen en el selector principal. |
| `workoutLogs` | array | Historial de sesiones de gimnasio (**por usuario**; cada perfil solo ve lo suyo) |
| `cardioLogs` | array | Registros de cardio (**por usuario**) |
| `updatedAt` | timestamp | Última escritura (servidor) |

> Límite práctico: un documento Firestore ≤ 1 MB. Si el historial crece mucho, en el futuro se puede pasar `workoutLogs` / `cardioLogs` a subcolecciones.

## Reglas de seguridad (Firebase Console → Firestore → Rules)

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

1. Creá la base **Firestore** en modo producción (o prueba con reglas de arriba).
2. Pegá las reglas y publicá.

## Habilitar Firestore

En Firebase Console: **Build → Firestore Database → Create database**.

No hace falta crear colecciones a mano: la app crea `userData/{uid}` al guardar.
