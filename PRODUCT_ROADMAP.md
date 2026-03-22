# Gym Tracker — Roadmap de producto

Objetivo: pasar de app funcional a **producto escalable con monetización** (suscripción, planes Pro, etc.).

## Fases

### Fase 1 — Base de valor (hecho / en curso)
- [x] Sync multi-dispositivo (Firestore)
- [x] Dashboard semanal: volumen, días entrenados, tendencia vs semana anterior
- [x] Feedback visual 🔼 / ➖ / 🔽 (volumen y sugerencias)
- [x] Sugerencias de progresión simples (subir / mantener / revisar)
- [x] Plantillas: hipertrofía, fuerza, definición (sobre rutina base)
- [x] Clonar día de rutina a otro día
- [x] Exportar resumen semanal (texto + imprimir para PDF)

### Fase 2 — Profundidad
- [ ] PDF nativo (jsPDF) con branding
- [ ] Objetivos por ejercicio (reps/RPE) y motor de progresión con contador de “fallos”
- [ ] Notificaciones / recordatorios (PWA + FCM)
- [ ] Onboarding y paywall (Stripe / RevenueCat)

### Fase 3 — Escala
- [ ] Subcolecciones Firestore si el historial supera ~1 MB
- [ ] Analytics (BigQuery / Mixpanel)
- [ ] Coach / compartir rutina entre usuarios

## Monetización (sugerida)
- **Free:** 1 rutina activa, historial 30 días
- **Pro:** plantillas ilimitadas, export PDF, insights avanzados, backup

## Notas técnicas
- Las plantillas actuales **parten de la rutina base** y ajustan notas/descansos; se puede enriquecer con tablas de %1RM por objetivo.
