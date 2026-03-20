/* ============================================================
   GYM TRACKER — Carga Progresiva
   Single-file React SPA · Español Argentino
   ============================================================ */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ─── FIREBASE AUTH ──────────────────────────────────────────
function getFirebaseConfig() {
  const cfg = (window.FIREBASE_CONFIG || {});
  return cfg;
}

function ensureFirebaseInitialized() {
  if (!window.firebase) throw new Error('Firebase no cargó. Revisá los scripts en index.html.');
  if (firebase.apps && firebase.apps.length > 0) return;
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    throw new Error('Firebase no está configurado. Pegá FIREBASE_CONFIG en index.html.');
  }
  firebase.initializeApp(cfg);
}

function getAuth() {
  ensureFirebaseInitialized();
  return firebase.auth();
}

// ─── STORAGE LAYER ──────────────────────────────────────────
const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { value: raw } : null;
    } catch (e) { console.error('storage.get', e); return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { console.error('storage.set', e); }
  },
  async delete(key) {
    try { localStorage.removeItem(key); }
    catch (e) { console.error('storage.delete', e); }
  },
  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(prefix)) keys.push(k);
      }
      return keys;
    } catch (e) { console.error('storage.list', e); return []; }
  }
};

// ─── DAY CONFIG ─────────────────────────────────────────────
const DAY_CONFIG = [
  { key: 'lunes',     label: 'LUN', emoji: '🦵', title: 'Piernas',           color: '#ef4444', optional: false },
  { key: 'martes',    label: 'MAR', emoji: '💥', title: 'Empuje',            color: '#f97316', optional: false },
  { key: 'miercoles', label: 'MIÉ', emoji: '🍑', title: 'Glúteo/Core',      color: '#a855f7', optional: true  },
  { key: 'jueves',    label: 'JUE', emoji: '⚡', title: 'Full Body + Arms', color: '#22c55e', optional: false },
  { key: 'sabado',    label: 'SÁB', emoji: '🧲', title: 'Pull',             color: '#3b82f6', optional: false },
];

const DAY_MAP = {};
DAY_CONFIG.forEach(d => DAY_MAP[d.key] = d);

// ─── DEFAULT ROUTINES ───────────────────────────────────────
const DEFAULT_ROUTINES = {
  lunes: [
    { id: 'l1', name: 'Sentadilla barra',                topSet: '55–60 kg × 6–8',   backOff: '47–50 kg × 10–12',              rest: '2:30–3\'',  note: 'Si llegás a 8 reps limpias → +2.5 kg', order: 0 },
    { id: 'l2', name: 'Prensa 45° (3s bajada)',           topSet: '120 kg × 10',       backOff: '100–110 kg × 12–15',            rest: '2\'',       note: '',                                      order: 1 },
    { id: 'l3', name: 'Curl femoral',                     topSet: '1×10–12',           backOff: '1×12–15 (rest-pause opcional)', rest: '90–120s',   note: '',                                      order: 2 },
    { id: 'l4', name: 'RDL mancuernas',                   topSet: '55 kg × 8–12',      backOff: '—',                             rest: '2\'',       note: 'RIR 1–2, sin fallo',                    order: 3 },
    { id: 'l5', name: 'Extensión piernas (pausa 1s)',     topSet: '75 × 12',           backOff: '65 × 15',                       rest: '90s',       note: '',                                      order: 4 },
    { id: 'l6', name: 'Pantorrillas prensa',              topSet: '2–3×15–20',         backOff: '—',                             rest: '60s',       note: 'Squeeze arriba',                        order: 5 },
    { id: 'l7', name: 'Core máquina abdominal',           topSet: '3×12–15 (50 kg)',   backOff: '—',                             rest: '—',         note: 'Lento',                                 order: 6 },
  ],
  martes: [
    { id: 'm1', name: 'Press banca plano',                topSet: '60–65 kg × 6–8',   backOff: '55 kg × 10–12',                rest: '2:30–3\'',  note: 'AMRAP cada 2 semanas',                  order: 0 },
    { id: 'm2', name: 'Press inclinado mancuernas',       topSet: '48 kg × 6–8',      backOff: '44 kg × 10–12',                rest: '2\'',       note: '',                                      order: 1 },
    { id: 'm3', name: 'Press militar',                    topSet: '25 × 8',           backOff: '20 × 10–12',                   rest: '2\'',       note: '',                                      order: 2 },
    { id: 'm4', name: 'Elevaciones laterales',            topSet: '2–3×15–25',        backOff: '—',                             rest: '60–90s',    note: 'Controladas',                           order: 3 },
    { id: 'm5', name: 'Fondos / Polea tríceps',           topSet: '20 × 10',          backOff: '16–18 × 12',                   rest: '2\'',       note: '',                                      order: 4 },
    { id: 'm6', name: 'Copa tríceps',                     topSet: '2×10–15',          backOff: '—',                             rest: '90s',       note: 'Rango completo',                        order: 5 },
  ],
  miercoles: [
    { id: 'x1', name: 'Abductora',                        topSet: '3×15–25',          backOff: '—',                             rest: '60s',       note: '',                                      order: 0 },
    { id: 'x2', name: 'Bulgarian split squat',            topSet: '24–25 kg × 8–10', backOff: '20 kg × 12',                   rest: '2\'',       note: '',                                      order: 1 },
    { id: 'x3', name: 'Aducción máquina',                 topSet: '60 kg × 15',       backOff: '60 kg × 15',                   rest: '60s',       note: '',                                      order: 2 },
    { id: 'x4', name: 'Curl femoral',                     topSet: '1×10–12',          backOff: '1×12–15',                      rest: '2\'',       note: '',                                      order: 3 },
    { id: 'x5', name: 'Pantorrillas sentado',             topSet: '140–150 kg × 15–20', backOff: '140 kg × 15–20',            rest: '60s',       note: '',                                      order: 4 },
    { id: 'x6', name: 'Plancha',                          topSet: '3×45–60s',         backOff: '—',                             rest: '—',         note: '',                                      order: 5 },
  ],
  jueves: [
    { id: 'j1', name: 'Hip thrust',                       topSet: '80 × 8–10',        backOff: '70 × 12',                      rest: '2\'',       note: '10 sólido → +2.5–5 kg',                order: 0 },
    { id: 'j2', name: 'Remo Hammer',                      topSet: '85 × 8–10',        backOff: '75 × 12',                      rest: '2\'',       note: '',                                      order: 1 },
    { id: 'j3', name: 'Abductora',                        topSet: '2–3×15–25',        backOff: '—',                             rest: '45–60s',    note: 'Pausa 1s abierto',                      order: 2 },
    { id: 'j4', name: 'Elevación lateral polea 1 mano',   topSet: '2×12–20 (7.5 kg)', backOff: '—',                            rest: '60s',       note: '',                                      order: 3 },
    { id: 'j5', name: 'Curl martillo',                    topSet: '35 × 8–10',        backOff: '32 × 12',                      rest: '90s',       note: '',                                      order: 4 },
    { id: 'j6', name: 'Tríceps cuerda',                   topSet: '2×12–15 (20–22.5 kg)', backOff: '—',                        rest: '90s',       note: '',                                      order: 5 },
    { id: 'j7', name: 'Tríceps uni copa',                 topSet: '2×10–15',          backOff: '—',                             rest: '90s',       note: '',                                      order: 6 },
    { id: 'j8', name: 'Plancha',                          topSet: '3×45–60s',         backOff: '—',                             rest: '—',         note: '',                                      order: 7 },
  ],
  sabado: [
    { id: 's1', name: 'Peso muerto',                      topSet: '70 × 4–6',         backOff: '60 × 6–8',                     rest: '3\'',       note: 'Calidad > fatiga',                      order: 0 },
    { id: 's2', name: 'Jalón / dominadas',                topSet: '60 × 8',           backOff: '50 × 12',                      rest: '2\'',       note: '',                                      order: 1 },
    { id: 's3', name: 'Remo barra / T',                   topSet: '55–60 × 8',        backOff: '45–50 × 12',                   rest: '2\'',       note: '',                                      order: 2 },
    { id: 's4', name: 'Face pull',                         topSet: '2–3×15–20',        backOff: '—',                             rest: '60s',       note: '',                                      order: 3 },
    { id: 's5', name: 'Curl barra Z',                     topSet: '25–30 × 6–10',     backOff: '20–25 × 10–12',                rest: '90s',       note: '',                                      order: 4 },
    { id: 's6', name: 'Curl inclinado / cable',           topSet: '2×10–15',          backOff: '—',                             rest: '60–90s',    note: '',                                      order: 5 },
    { id: 's7', name: 'Ab wheel / máquina',               topSet: '3×10–15',          backOff: '—',                             rest: '—',         note: '',                                      order: 6 },
  ],
};

// ─── DEFAULT CARDIO SETTINGS ───────────────────────────────
// Se guarda separado de las rutinas de pesas para no romper la estructura existente.
const DEFAULT_CARDIO_SETTINGS = (() => {
  const map = {};
  DAY_CONFIG.forEach(d => {
    map[d.key] = { enabled: false, minutes: 30, type: 'LISS' };
  });
  return map;
})();

function makeCardioId() {
  return `c_${uid()}`;
}

// ─── REST TIPS ──────────────────────────────────────────────
const REST_TIPS = [
  'Estirá cuádriceps 🦵', 'Tomá agua 💧', 'Respirá profundo 🫁',
  'Estirá hombros 🤸', 'Activá glúteos 🍑', 'Relajá el cuello 😌',
  'Sacudí las manos ✋', 'Estirá isquios 🧘', 'Apretá abdominales 💪',
  'Movilidad de muñecas 🔄', 'Estirá pecho en el marco 🚪', 'Hacé rotación torácica 🔁',
];

// ─── UTILITIES ──────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekNumber(weekId) {
  const m = weekId.match(/W(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

function getWeekYear(weekId) {
  const m = weekId.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 2026;
}

function getCurrentDayKey() {
  const jsDay = new Date().getDay();
  const map = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 6: 'sabado' };
  if (map[jsDay]) return map[jsDay];
  const order = ['lunes', 'martes', 'miercoles', 'jueves', 'sabado'];
  const dayNums = [1, 2, 3, 4, 6];
  let closest = 'lunes';
  let minDist = 7;
  dayNums.forEach((dn, i) => {
    const dist = ((dn - jsDay) + 7) % 7;
    if (dist < minDist) { minDist = dist; closest = order[i]; }
  });
  return closest;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calculateVolume(sets) {
  return sets.reduce((sum, s) => sum + ((s.kg || 0) * (s.reps || 0)), 0);
}

function getLastSession(logs, dayKey, exerciseName) {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].dayKey === dayKey) {
      const ex = logs[i].exercises.find(e => e.name === exerciseName);
      if (ex) return { session: logs[i], exercise: ex };
    }
  }
  return null;
}

function getTopSetKg(exerciseSets) {
  return Math.max(0, ...exerciseSets.map(s => s.kg || 0));
}

function detectPR(exerciseName, currentKg, logs) {
  let maxKg = 0;
  logs.forEach(log => {
    log.exercises.forEach(ex => {
      if (ex.name === exerciseName) {
        ex.sets.forEach(s => { if ((s.kg || 0) > maxKg) maxKg = s.kg; });
      }
    });
  });
  return currentKg > maxKg;
}

function getProgressionArrow(currentKg, previousKg) {
  if (currentKg > previousKg) return { arrow: '⬆️', color: 'text-green-400', label: 'Subiste' };
  if (currentKg < previousKg) return { arrow: '⬇️', color: 'text-red-400', label: 'Bajaste' };
  return { arrow: '➡️', color: 'text-yellow-400', label: 'Igual' };
}

function getExerciseHistory(logs, exerciseName, limit = 8) {
  const points = [];
  logs.forEach(log => {
    log.exercises.forEach(ex => {
      if (ex.name === exerciseName) {
        const topKg = getTopSetKg(ex.sets);
        if (topKg > 0) points.push({ date: log.date, kg: topKg });
      }
    });
  });
  return points.slice(-limit);
}

// Parse "55–60 kg × 6–8" or "120 kg × 10" into { kg, reps }
function parseSetString(str) {
  if (!str || str === '—') return { kg: 0, reps: 0 };
  // Try patterns like "55–60 kg × 6–8" or "120 × 10" or "55 kg × 8–12"
  const kgMatch = str.match(/([\d.]+)(?:\s*[–\-]\s*[\d.]+)?\s*(?:kg)?\s*[×x]/i);
  const repsMatch = str.match(/[×x]\s*([\d.]+)/i);
  return {
    kg: kgMatch ? parseFloat(kgMatch[1]) : 0,
    reps: repsMatch ? parseInt(repsMatch[1]) : 0,
  };
}

function parseRestSeconds(restStr) {
  if (!restStr || restStr === '—') return 120;
  const m1 = restStr.match(/(\d+)[:\'](\d+)?/);
  if (m1) {
    const mins = parseInt(m1[1]);
    const secs = m1[2] ? parseInt(m1[2]) : 0;
    if (restStr.includes('\'') || restStr.includes(':')) return mins * 60 + secs;
  }
  const m2 = restStr.match(/(\d+)\s*s/);
  if (m2) return parseInt(m2[1]);
  const m3 = restStr.match(/(\d+)/);
  if (m3) {
    const n = parseInt(m3[1]);
    return n <= 10 ? n * 60 : n;
  }
  return 120;
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseSuggestion(note, lastExercise) {
  if (!note || !lastExercise) return null;
  const match = note.match(/(\d+)\s*reps.*?\+\s*([\d.]+)\s*kg/i);
  if (!match) return null;
  const targetReps = parseInt(match[1]);
  const increment = parseFloat(match[2]);
  const topSet = lastExercise.sets.find(s => s.setType === 'top');
  if (topSet && topSet.reps >= targetReps) {
    return { newKg: (topSet.kg || 0) + increment, reps: targetReps, increment };
  }
  return null;
}

function getWeekDates(weekId) {
  const year = getWeekYear(weekId);
  const week = getWeekNumber(weekId);
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

function shiftWeek(weekId, delta) {
  const year = getWeekYear(weekId);
  const week = getWeekNumber(weekId);
  let newWeek = week + delta;
  let newYear = year;
  if (newWeek < 1) { newYear--; newWeek = 52; }
  if (newWeek > 52) { newYear++; newWeek = 1; }
  return `${newYear}-W${String(newWeek).padStart(2, '0')}`;
}

// ─── COMPONENTS ─────────────────────────────────────────────

// -- Mini Sparkline SVG --
function MiniSparkline({ data, color = '#3b82f6', width = 120, height = 32 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points.join(' ')} />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={x} cy={y} r={i === values.length - 1 ? 3 : 1.5} fill={i === values.length - 1 ? color : 'rgba(255,255,255,0.4)'} />;
      })}
    </svg>
  );
}

// -- Bottom Tab Bar --
function BottomTabBar({ active, onChange }) {
  const tabs = [
    { key: 'entrenar',  icon: '💪', label: 'Entrenar' },
    { key: 'cardio',    icon: '🏃‍♂️', label: 'Cardio' },
    { key: 'historial', icon: '📊', label: 'Historial' },
    { key: 'rutina',    icon: '⚙️', label: 'Rutina' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {tabs.map(t => (
          <button key={t.key} onClick={() => onChange(t.key)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${active === t.key ? 'text-white scale-105' : 'text-white/40 hover:text-white/60'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// -- Day Selector --
function DaySelector({ active, onChange, logs }) {
  const sessionDays = useMemo(() => {
    if (!logs) return {};
    const map = {};
    logs.forEach(l => { map[l.dayKey] = true; });
    return map;
  }, [logs]);

  return (
    <div className="flex gap-2 justify-center px-2 py-3 overflow-x-auto scroll-hide">
      {DAY_CONFIG.map(d => {
        const isActive = active === d.key;
        const hasDot = sessionDays[d.key];
        return (
          <button key={d.key} onClick={() => onChange(d.key)}
            style={{ '--day-color': d.color, borderColor: isActive ? d.color : 'transparent' }}
            className={`relative flex flex-col items-center min-w-[56px] px-3 py-2 rounded-xl border-2 transition-all duration-200 ${isActive ? 'day-glow bg-white/10 scale-105' : 'bg-white/5 hover:bg-white/8'}`}>
            <span className="text-lg">{d.emoji}</span>
            <span className={`text-xs font-bold tracking-wider ${isActive ? 'text-white' : 'text-white/50'}`}>{d.label}</span>
            {d.optional && <span className="absolute -top-1 -right-1 text-[8px] bg-purple-500/30 text-purple-300 px-1 rounded-full">OPC</span>}
            {hasDot && <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />}
          </button>
        );
      })}
    </div>
  );
}

// -- Rest Timer --
function RestTimer({ seconds: initialSeconds, dayColor, onClose }) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const tip = useMemo(() => REST_TIPS[Math.floor(Math.random() * REST_TIPS.length)], []);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  return (
    <div className={`fixed inset-x-0 top-0 z-50 glass-strong ${finished ? 'timer-flash' : ''}`}
      style={{ borderBottom: `2px solid ${dayColor}` }}>
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
        <div className={`font-heading text-4xl tracking-wider ${running ? 'animate-pulse-glow' : ''}`}
          style={{ color: dayColor }}>
          {formatTimer(remaining)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 truncate">{finished ? '¡Listo! A meterle 💪' : tip}</p>
        </div>
        <div className="flex gap-2">
          {!finished && (
            <button onClick={() => { setRunning(!running); }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20">
              {running ? '⏸' : '▶️'}
            </button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VISTA ENTRENAR ─────────────────────────────────────────

function WorkoutSetRow({ set, index, dayColor, onChange, onToggle }) {
  const hasData = (set.kg > 0) || (set.reps > 0);
  return (
    <div className="rounded-xl transition-all"
      style={{
        padding: '10px 8px',
        border: set.completed ? '2px solid rgba(34,197,94,0.3)' : hasData ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        background: set.completed ? 'rgba(34,197,94,0.08)' : 'transparent',
      }}>
      {/* Hint: previous / suggested value */}
      {set.hint && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: set.completed ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
            {set.setType === 'top' ? 'TOP' : set.setType === 'backoff' ? 'B-OFF' : `SET ${index + 1}`}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: `${dayColor}15`, color: dayColor }}>
            {set.hint}
          </span>
        </div>
      )}
      {!set.hint && (
        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
          style={{ color: set.completed ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
          {set.setType === 'top' ? 'TOP' : set.setType === 'backoff' ? 'B-OFF' : `SET ${index + 1}`}
        </span>
      )}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <div className="relative">
            <input type="number" inputMode="decimal" step="0.5" value={set.kg || ''} placeholder="0"
              onChange={e => onChange(index, 'kg', parseFloat(e.target.value) || 0)}
              className="w-20 h-12 rounded-xl text-center text-lg font-bold border-2 text-white placeholder-white/20"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: set.kg ? dayColor : 'rgba(255,255,255,0.12)' }} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest" style={{ color: dayColor }}>KG</span>
          </div>
          <span className="text-white/25 text-lg font-light">×</span>
          <div className="relative">
            <input type="number" inputMode="numeric" value={set.reps || ''} placeholder="0"
              onChange={e => onChange(index, 'reps', parseInt(e.target.value) || 0)}
              className="w-16 h-12 rounded-xl text-center text-lg font-bold border-2 text-white placeholder-white/20"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: set.reps ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-white/30">REPS</span>
          </div>
          <select value={set.rpe || ''} onChange={e => onChange(index, 'rpe', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-14 h-12 rounded-xl text-center text-sm text-white/60 border-2 appearance-none"
            style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <option value="">RPE</option>
            {[6,6.5,7,7.5,8,8.5,9,9.5,10].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <button onClick={() => onToggle(index)}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all text-lg font-bold"
          style={set.completed
            ? { background: 'rgba(34,197,94,0.25)', color: '#4ade80', border: '2px solid rgba(34,197,94,0.5)' }
            : { background: `${dayColor}20`, color: dayColor, border: `2px solid ${dayColor}40` }
          }>
          {set.completed ? <span className="animate-check">✓</span> : '○'}
        </button>
      </div>
    </div>
  );
}

function WorkoutExercise({ exercise, routineExercise, lastExerciseData, dayColor, logs, onUpdate, onStartTimer }) {
  const [expanded, setExpanded] = useState(true);
  const allDone = exercise.sets.length > 0 && exercise.sets.every(s => s.completed);
  const suggestion = parseSuggestion(routineExercise.note, lastExerciseData);
  const currentTopKg = getTopSetKg(exercise.sets);
  const lastTopKg = lastExerciseData ? getTopSetKg(lastExerciseData.sets) : 0;
  const isPR = exercise.sets.some(s => s.completed && s.kg > 0) && detectPR(exercise.name, currentTopKg, logs);
  const progression = lastTopKg > 0 && currentTopKg > 0 ? getProgressionArrow(currentTopKg, lastTopKg) : null;

  const handleSetChange = (setIndex, field, value) => {
    const newSets = [...exercise.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    onUpdate({ ...exercise, sets: newSets });
  };

  const handleToggle = (setIndex) => {
    const newSets = [...exercise.sets];
    newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
    onUpdate({ ...exercise, sets: newSets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    onUpdate({
      ...exercise,
      sets: [...exercise.sets, { setType: 'extra', kg: lastSet?.kg || 0, reps: lastSet?.reps || 0, rpe: null, completed: false, hint: '' }]
    });
  };

  const restSeconds = parseRestSeconds(routineExercise.rest);

  // Build last session detail string
  const lastDetail = lastExerciseData ? lastExerciseData.sets.map(s =>
    `${s.kg || 0}kg × ${s.reps || 0}${s.rpe ? ' @' + s.rpe : ''}`
  ).join('  ·  ') : null;

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${allDone ? 'opacity-60' : ''}`} style={{ borderColor: allDone ? 'rgba(34,197,94,0.3)' : undefined }}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
        <span className={`text-lg transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>›</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate">{exercise.name}</span>
            {allDone && <span className="text-green-400 text-sm">✅</span>}
            {isPR && <span className="animate-pr-pop text-sm">🏆</span>}
            {progression && <span className={`text-xs ${progression.color}`}>{progression.arrow}</span>}
          </div>
        </div>
        {routineExercise.rest && routineExercise.rest !== '—' && (
          <button onClick={e => { e.stopPropagation(); onStartTimer(restSeconds); }}
            className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            style={{ color: dayColor }}>
            ⏱ {routineExercise.rest}
          </button>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 animate-fade-in">
          {/* Last session badge — prominent */}
          {lastDetail && (
            <div className="mb-3 px-3 py-2 rounded-xl border-2 flex items-start gap-2"
              style={{ borderColor: `${dayColor}44`, background: `${dayColor}0d` }}>
              <span className="text-base mt-0.5">📋</span>
              <div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-0.5">Última sesión</p>
                <p className="text-sm font-bold" style={{ color: dayColor }}>{lastDetail}</p>
                {lastExerciseData.observation && (
                  <p className="text-[11px] text-white/30 italic mt-0.5">"{lastExerciseData.observation}"</p>
                )}
              </div>
            </div>
          )}

          {suggestion && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
              💡 Subí a {suggestion.newKg} kg (llegaste a {suggestion.reps} reps, +{suggestion.increment} kg)
            </div>
          )}

          <div className="space-y-2">
            {exercise.sets.map((set, i) => (
              <WorkoutSetRow key={i} set={set} index={i} dayColor={dayColor} onChange={handleSetChange} onToggle={handleToggle} />
            ))}
          </div>
          <button onClick={addSet}
            className="mt-2 w-full py-1.5 rounded-lg bg-white/5 text-xs text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors">
            + Set
          </button>

          {/* Observation field */}
          <div className="mt-3">
            <textarea
              value={exercise.observation || ''}
              onChange={e => onUpdate({ ...exercise, observation: e.target.value })}
              placeholder="Observación (ej: molestia en rodilla, sentí pesado, etc.)"
              rows={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 resize-none focus:border-white/30"
              style={{ '--day-color': dayColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutSummary({ session, logs, onClose }) {
  const totalVolume = session.exercises.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0);
  const prs = session.exercises.filter(ex => {
    const topKg = getTopSetKg(ex.sets);
    return topKg > 0 && detectPR(ex.name, topKg, logs.filter(l => l.id !== session.id));
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-strong rounded-3xl p-6 w-full max-w-sm animate-slide-up">
        <h2 className="font-heading text-4xl text-center mb-4">¡TREMENDO! 🔥</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/5">
            <span className="text-white/50 text-sm">Duración</span>
            <span className="font-bold">{session.duration} min</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/5">
            <span className="text-white/50 text-sm">Ejercicios</span>
            <span className="font-bold">{session.exercises.length}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/5">
            <span className="text-white/50 text-sm">Volumen total</span>
            <span className="font-bold">{totalVolume.toLocaleString()} kg</span>
          </div>
          {prs.length > 0 && (
            <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-300 text-sm font-bold mb-1">🏆 PRs nuevos</p>
              {prs.map((ex, i) => (
                <p key={i} className="text-yellow-200/70 text-xs">{ex.name}: {getTopSetKg(ex.sets)} kg</p>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 font-bold text-sm hover:bg-white/20 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function EntrenarView({ routines, cardioSettings, logs, activeDay, onDayChange, onSaveLog }) {
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timer, setTimer] = useState(null);
  const [summary, setSummary] = useState(null);

  const dayConfig = DAY_MAP[activeDay];
  const dayRoutine = routines[activeDay] || [];
  const cardioCfg = cardioSettings?.[activeDay] || DEFAULT_CARDIO_SETTINGS[activeDay];

  const startWorkout = () => {
    const exercises = dayRoutine.map(ex => {
      const last = getLastSession(logs, activeDay, ex.name);
      const lastSets = last ? last.exercise.sets : [];

      // Parse suggested values from routine template
      const suggestedTop = parseSetString(ex.topSet);
      const suggestedBack = parseSetString(ex.backOff);

      // Pre-fill from last session, fallback to routine suggestion
      const prevTop = lastSets.find(s => s.setType === 'top');
      const prevBack = lastSets.find(s => s.setType === 'backoff');

      const topSet = {
        setType: 'top',
        kg: prevTop ? prevTop.kg : suggestedTop.kg,
        reps: prevTop ? prevTop.reps : suggestedTop.reps,
        rpe: prevTop ? prevTop.rpe : null,
        completed: false,
        hint: prevTop ? `Anterior: ${prevTop.kg}kg × ${prevTop.reps}` : `Sugerido: ${ex.topSet}`,
      };

      const sets = [topSet];

      if (ex.backOff && ex.backOff !== '—') {
        sets.push({
          setType: 'backoff',
          kg: prevBack ? prevBack.kg : suggestedBack.kg,
          reps: prevBack ? prevBack.reps : suggestedBack.reps,
          rpe: prevBack ? prevBack.rpe : null,
          completed: false,
          hint: prevBack ? `Anterior: ${prevBack.kg}kg × ${prevBack.reps}` : `Sugerido: ${ex.backOff}`,
        });
      }

      return { name: ex.name, sets, observation: '' };
    });
    setWorkoutExercises(exercises);
    setStartTime(Date.now());
    setWorkoutActive(true);
  };

  const updateExercise = (index, updated) => {
    const newExercises = [...workoutExercises];
    newExercises[index] = updated;
    setWorkoutExercises(newExercises);
  };

  const finishWorkout = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    const session = {
      id: uid(),
      date: todayStr(),
      dayKey: activeDay,
      duration,
      exercises: workoutExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(s => (s.kg > 0) || (s.reps > 0)).map(s => ({ setType: s.setType, kg: s.kg || 0, reps: s.reps || 0, rpe: s.rpe })),
        observation: ex.observation || ''
      })).filter(ex => ex.sets.length > 0),
      // Cardio se carga por separado en la pestaña "Cardio"
    };
    onSaveLog(session);
    setSummary(session);
    setWorkoutActive(false);
    setWorkoutExercises([]);
    setStartTime(null);
  };

  return (
    <div className="pb-20">
      {timer && <RestTimer seconds={timer} dayColor={dayConfig.color} onClose={() => setTimer(null)} />}
      {summary && <WorkoutSummary session={summary} logs={logs} onClose={() => setSummary(null)} />}

      <DaySelector active={activeDay} onChange={onDayChange} logs={logs} />

      <div className="text-center py-2">
        <h1 className="font-heading text-3xl tracking-wider" style={{ color: dayConfig.color }}>
          {dayConfig.emoji} {dayConfig.title}
        </h1>
        {dayConfig.optional && <span className="text-xs text-purple-300/60 bg-purple-500/10 px-2 py-0.5 rounded-full">Opcional</span>}
      </div>

      {!workoutActive ? (
        <div className="px-4 space-y-3">
          {cardioCfg?.enabled && (
            <div className="glass rounded-2xl p-4" style={{ borderColor: `${dayConfig.color}33`, background: `${dayConfig.color}0a` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">🏃‍♂️ Cardio</p>
                  <p className="text-xs text-white/40 mt-0.5">Lo cargás por separado (pestaña Cardio)</p>
                  <p className="text-[11px] text-white/25 italic mt-1">
                    Meta: {cardioCfg.minutes} min · {cardioCfg.type}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: `${dayConfig.color}15`, color: dayConfig.color }}>
                    Checklist aparte
                  </span>
                </div>
              </div>
            </div>
          )}
          {dayRoutine.map((ex, i) => {
            const last = getLastSession(logs, activeDay, ex.name);
            const lastSets = last ? last.exercise.sets : [];
            const lastDetail = lastSets.map(s => `${s.kg || 0}kg × ${s.reps || 0}`).join('  ·  ');
            return (
              <div key={ex.id} className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <h3 className="font-bold text-sm mb-1">{ex.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                  <span>Top: <span className="text-white/60">{ex.topSet}</span></span>
                  {ex.backOff && ex.backOff !== '—' && <span>Back-off: <span className="text-white/60">{ex.backOff}</span></span>}
                  {ex.rest && ex.rest !== '—' && <span>⏱ {ex.rest}</span>}
                </div>
                {ex.note && <p className="text-[11px] text-white/25 italic mt-1">{ex.note}</p>}
                {last ? (
                  <div className="mt-2 px-3 py-2 rounded-xl border flex items-center gap-2"
                    style={{ borderColor: `${dayConfig.color}33`, background: `${dayConfig.color}0a` }}>
                    <span className="text-sm">📋</span>
                    <div>
                      <span className="text-[10px] text-white/35 block">Última sesión ({last.session.date})</span>
                      <span className="text-xs font-bold" style={{ color: dayConfig.color }}>{lastDetail}</span>
                      {last.exercise.observation && (
                        <span className="text-[10px] text-white/25 italic block">💬 {last.exercise.observation}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <span className="text-[10px] text-white/20">Sin datos previos — sugerido: {ex.topSet}</span>
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={startWorkout}
            className="w-full py-4 rounded-2xl font-heading text-2xl tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] text-black"
            style={{ background: dayConfig.color }}>
            INICIAR WORKOUT
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {cardioCfg?.enabled && (
            <div className="glass rounded-2xl p-4" style={{ borderColor: `${dayConfig.color}33`, background: `${dayConfig.color}0a` }}>
              <p className="font-bold text-sm">🏃‍♂️ Cardio</p>
              <p className="text-xs text-white/40 mt-0.5">Se registra en la pestaña Cardio (otro horario).</p>
            </div>
          )}
          {workoutExercises.map((ex, i) => (
            <WorkoutExercise
              key={i}
              exercise={ex}
              routineExercise={dayRoutine[i] || {}}
              lastExerciseData={getLastSession(logs, activeDay, ex.name)?.exercise}
              dayColor={dayConfig.color}
              logs={logs}
              onUpdate={updated => updateExercise(i, updated)}
              onStartTimer={secs => setTimer(secs)}
            />
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setWorkoutActive(false); setWorkoutExercises([]); setStartTime(null); }}
              className="flex-1 py-3 rounded-xl bg-white/5 text-sm text-white/40 hover:bg-white/10 transition-colors">
              Cancelar
            </button>
            <button onClick={finishWorkout}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] text-black"
              style={{ background: dayConfig.color }}>
              Terminar Workout 🏁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VISTA HISTORIAL ────────────────────────────────────────

function HistorialView({ logs, activeDay, onDayChange }) {
  const dayConfig = DAY_MAP[activeDay];

  // Get all logs for this day, sorted newest first
  const dayLogs = useMemo(() =>
    logs.filter(l => l.dayKey === activeDay).slice().reverse(),
    [logs, activeDay]
  );

  // Count sessions with data for each day (for the dots)
  const sessionDots = useMemo(() => {
    const map = {};
    logs.forEach(l => { map[l.dayKey] = true; });
    return map;
  }, [logs]);

  const exportHistory = () => {
    let text = `📊 Historial — ${dayConfig.emoji} ${dayConfig.title}\n\n`;
    dayLogs.forEach(log => {
      text += `📅 ${log.date} (${log.duration} min)\n`;
      log.exercises.forEach(ex => {
        text += `  • ${ex.name}: `;
        text += ex.sets.map(s => `${s.kg}kg×${s.reps}`).join(', ');
        if (ex.observation) text += ` — "${ex.observation}"`;
        text += '\n';
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text).then(() => alert('Copiado al portapapeles 📋'));
  };

  return (
    <div className="pb-20">
      <DaySelector active={activeDay} onChange={onDayChange} logs={logs} />

      <div className="text-center py-2">
        <h1 className="font-heading text-2xl tracking-wider" style={{ color: dayConfig.color }}>
          {dayConfig.emoji} {dayConfig.title}
        </h1>
        <p className="text-xs text-white/30">{dayLogs.length} sesión{dayLogs.length !== 1 ? 'es' : ''} registrada{dayLogs.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        {dayLogs.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <p className="text-4xl mb-2">🏋️</p>
            <p className="text-sm">No hay sesiones para este día</p>
            <p className="text-xs mt-1">Iniciá un workout y van a aparecer acá</p>
          </div>
        ) : (
          dayLogs.map((session, si) => {
            const totalVolume = session.exercises.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0);
            return (
              <div key={session.id} className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${si * 40}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{session.date}</p>
                    <p className="text-xs text-white/30">{session.duration} min · Vol: {totalVolume.toLocaleString()} kg</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {session.exercises.map((ex, i) => {
                    const history = getExerciseHistory(logs, ex.name);
                    const topKg = getTopSetKg(ex.sets);
                    const isPR = topKg > 0 && detectPR(ex.name, topKg, logs.filter(l => l.id !== session.id));
                    return (
                      <div key={i} className="px-3 py-2.5 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-medium text-sm flex-1">{ex.name}</span>
                          {isPR && <span className="text-xs">🏆 PR</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {ex.sets.map((s, j) => (
                            <span key={j} className="px-2.5 py-1 rounded-lg font-medium"
                              style={{ background: `${dayConfig.color}15`, color: dayConfig.color }}>
                              {s.kg}kg × {s.reps} {s.rpe ? `@${s.rpe}` : ''}
                            </span>
                          ))}
                        </div>
                        {ex.observation && (
                          <p className="mt-1.5 text-[11px] text-white/30 italic">💬 {ex.observation}</p>
                        )}
                        {history.length >= 2 && (
                          <div className="mt-2 flex items-center gap-2">
                            <MiniSparkline data={history} color={dayConfig.color} />
                            <span className="text-[10px] text-white/20">{history[0].kg}→{history[history.length - 1].kg} kg</span>
                          </div>
                        )}
                        {history.length < 2 && history.length > 0 && (
                          <p className="mt-1 text-[10px] text-white/15 italic">Necesitás más sesiones para ver la progresión</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {dayLogs.length > 0 && (
          <button onClick={exportHistory}
            className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-white/40 hover:bg-white/10 transition-colors">
            📋 Copiar historial
          </button>
        )}
      </div>
    </div>
  );
}

// ─── VISTA RUTINA (EDITOR) ──────────────────────────────────

function RutinaExerciseEditor({ exercise, index, total, dayColor, onSave, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(exercise);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in" style={{ borderColor: `${dayColor}44` }}>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre del ejercicio"
          className="w-full h-10 rounded-lg bg-white/10 px-3 text-sm font-medium text-white border-0" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/30 uppercase mb-1 block">Top Set</label>
            <input value={form.topSet} onChange={e => setForm({ ...form, topSet: e.target.value })}
              className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase mb-1 block">Back-off</label>
            <input value={form.backOff} onChange={e => setForm({ ...form, backOff: e.target.value })}
              className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase mb-1 block">Descanso</label>
            <input value={form.rest} onChange={e => setForm({ ...form, rest: e.target.value })}
              className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase mb-1 block">Notas</label>
            <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: `${dayColor}33`, color: dayColor }}>
            Guardar
          </button>
          <button onClick={() => { setEditing(false); setForm(exercise); }}
            className="flex-1 py-2 rounded-lg bg-white/5 text-xs text-white/40 hover:bg-white/10 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 animate-slide-up">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">{exercise.name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/40 mt-1">
            <span>Top: <span className="text-white/60">{exercise.topSet}</span></span>
            {exercise.backOff && exercise.backOff !== '—' && <span>B-off: <span className="text-white/60">{exercise.backOff}</span></span>}
            {exercise.rest && exercise.rest !== '—' && <span>⏱ {exercise.rest}</span>}
          </div>
          {exercise.note && <p className="text-[11px] text-white/25 italic mt-0.5">{exercise.note}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <button onClick={() => onMove(-1)} disabled={index === 0}
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/30 disabled:opacity-20 hover:bg-white/10">
              ↑
            </button>
            <button onClick={() => onMove(1)} disabled={index === total - 1}
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/30 disabled:opacity-20 hover:bg-white/10">
              ↓
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs hover:bg-white/10">
              ✏️
            </button>
            {confirmDelete ? (
              <button onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-xs text-red-400">
                ✓
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs hover:bg-red-500/10">
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RutinaView({ routines, cardioSettings, onUpdateRoutines, onUpdateCardioSettings, activeDay, onDayChange }) {
  const [adding, setAdding] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', topSet: '', backOff: '—', rest: '2\'', note: '' });
  const [confirmReset, setConfirmReset] = useState(false);

  const dayConfig = DAY_MAP[activeDay];
  const dayRoutine = routines[activeDay] || [];
  const cardioCfg = cardioSettings?.[activeDay] || DEFAULT_CARDIO_SETTINGS[activeDay];

  const saveCardio = (updated) => {
    const next = { ...(cardioSettings || DEFAULT_CARDIO_SETTINGS), [activeDay]: updated };
    onUpdateCardioSettings(next);
  };

  const saveRoutine = (newDayRoutine) => {
    const updated = { ...routines, [activeDay]: newDayRoutine };
    onUpdateRoutines(updated);
  };

  const handleSaveExercise = (index, updatedExercise) => {
    const newRoutine = [...dayRoutine];
    newRoutine[index] = updatedExercise;
    saveRoutine(newRoutine);
  };

  const handleDelete = (index) => {
    const newRoutine = dayRoutine.filter((_, i) => i !== index);
    newRoutine.forEach((ex, i) => ex.order = i);
    saveRoutine(newRoutine);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= dayRoutine.length) return;
    const newRoutine = [...dayRoutine];
    [newRoutine[index], newRoutine[newIndex]] = [newRoutine[newIndex], newRoutine[index]];
    newRoutine.forEach((ex, i) => ex.order = i);
    saveRoutine(newRoutine);
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;
    const ex = {
      id: uid(),
      name: newExercise.name.trim(),
      topSet: newExercise.topSet || '—',
      backOff: newExercise.backOff || '—',
      rest: newExercise.rest || '—',
      note: newExercise.note || '',
      order: dayRoutine.length,
    };
    saveRoutine([...dayRoutine, ex]);
    setNewExercise({ name: '', topSet: '', backOff: '—', rest: '2\'', note: '' });
    setAdding(false);
  };

  const handleReset = () => {
    saveRoutine(DEFAULT_ROUTINES[activeDay] || []);
    setConfirmReset(false);
  };

  return (
    <div className="pb-20">
      <DaySelector active={activeDay} onChange={onDayChange} />

      <div className="text-center py-2">
        <h1 className="font-heading text-3xl tracking-wider" style={{ color: dayConfig.color }}>
          {dayConfig.emoji} {dayConfig.title}
        </h1>
      </div>

      <div className="px-4 space-y-3">
        <div className="glass rounded-2xl p-4 space-y-3" style={{ borderColor: `${dayConfig.color}33`, background: `${dayConfig.color}0a` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">🏃‍♂️ Cardio</p>
              <p className="text-xs text-white/40 mt-0.5">Elegí en qué días querés hacerlo.</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/70 select-none">
              <input
                type="checkbox"
                checked={!!cardioCfg.enabled}
                onChange={e => saveCardio({ ...cardioCfg, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 accent-green-400"
              />
              Activar
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/30 uppercase mb-1 block">Minutos</label>
              <input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                value={cardioCfg.minutes}
                onChange={e => saveCardio({ ...cardioCfg, minutes: parseInt(e.target.value) || 0 })}
                disabled={!cardioCfg.enabled}
                className="w-full h-10 rounded-lg bg-white/10 px-3 text-xs text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase mb-1 block">Tipo</label>
              <select
                value={cardioCfg.type}
                onChange={e => saveCardio({ ...cardioCfg, type: e.target.value })}
                disabled={!cardioCfg.enabled}
                className="w-full h-10 rounded-lg bg-white/10 px-3 text-xs text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {['LISS', 'HIIT', 'Caminata', 'Bici'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {dayRoutine.map((ex, i) => (
          <RutinaExerciseEditor
            key={ex.id}
            exercise={ex}
            index={i}
            total={dayRoutine.length}
            dayColor={dayConfig.color}
            onSave={updated => handleSaveExercise(i, updated)}
            onDelete={() => handleDelete(i)}
            onMove={dir => handleMove(i, dir)}
          />
        ))}

        {adding ? (
          <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in" style={{ borderColor: `${dayConfig.color}44` }}>
            <input value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
              placeholder="Nombre del ejercicio"
              className="w-full h-10 rounded-lg bg-white/10 px-3 text-sm font-medium text-white border-0"
              autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/30 uppercase mb-1 block">Top Set</label>
                <input value={newExercise.topSet} onChange={e => setNewExercise({ ...newExercise, topSet: e.target.value })}
                  placeholder="ej: 60 kg × 8"
                  className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase mb-1 block">Back-off</label>
                <input value={newExercise.backOff} onChange={e => setNewExercise({ ...newExercise, backOff: e.target.value })}
                  placeholder="ej: 50 kg × 12"
                  className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase mb-1 block">Descanso</label>
                <input value={newExercise.rest} onChange={e => setNewExercise({ ...newExercise, rest: e.target.value })}
                  className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase mb-1 block">Notas</label>
                <input value={newExercise.note} onChange={e => setNewExercise({ ...newExercise, note: e.target.value })}
                  className="w-full h-9 rounded-lg bg-white/10 px-3 text-xs text-white border-0" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddExercise}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ background: `${dayConfig.color}33`, color: dayConfig.color }}>
                Agregar
              </button>
              <button onClick={() => setAdding(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-xs text-white/40 hover:bg-white/10 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-sm text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors">
            + Agregar ejercicio
          </button>
        )}

        <div className="pt-4">
          {confirmReset ? (
            <div className="flex gap-2">
              <button onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-medium">
                Confirmar reset
              </button>
              <button onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-xs text-white/40">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-white/20 hover:text-red-400/50 transition-colors">
              🔄 Resetear a rutina original
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VISTA CARDIO (CHECKLIST INDEPENDIENTE) ──────────────────
function CardioView({ cardioSettings, cardioLogs, onSaveCardioLog, activeDay, onDayChange }) {
  const dayConfig = DAY_MAP[activeDay];
  const cfg = cardioSettings?.[activeDay] || DEFAULT_CARDIO_SETTINGS[activeDay];

  const [done, setDone] = useState(false);
  const [minutes, setMinutes] = useState(cfg.minutes || 30);
  const [type, setType] = useState(cfg.type || 'LISS');

  // Inicializa form cuando cambia el día
  useEffect(() => {
    setDone(false);
    setMinutes(cfg.minutes || 30);
    setType(cfg.type || 'LISS');
  }, [activeDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayLogs = useMemo(() => {
    return (cardioLogs || []).filter(l => l.dayKey === activeDay).slice().reverse();
  }, [cardioLogs, activeDay]);

  const saveToday = () => {
    if (!cfg.enabled) return;
    const entry = {
      id: makeCardioId(),
      date: todayStr(),
      dayKey: activeDay,
      done: !!done,
      minutes: minutes || cfg.minutes || 0,
      type: type || cfg.type || 'LISS',
    };
    onSaveCardioLog(entry);
    // feedback rápido
    setDone(false);
  };

  return (
    <div className="pb-20">
      <DaySelector active={activeDay} onChange={onDayChange} logs={null} />

      <div className="text-center py-2">
        <h1 className="font-heading text-3xl tracking-wider" style={{ color: dayConfig.color }}>
          🏃‍♂️ Cardio · {dayConfig.emoji} {dayConfig.title}
        </h1>
        {!cfg.enabled && (
          <p className="text-xs text-white/30 mt-1">
            Cardio desactivado para este día. Activálo en Rutina ⚙️
          </p>
        )}
      </div>

      <div className="px-4 space-y-3">
        <div className="glass rounded-2xl p-4 space-y-3" style={{ borderColor: `${dayConfig.color}33`, background: `${dayConfig.color}0a` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">Checklist (otro horario)</p>
              <p className="text-xs text-white/40 mt-0.5">Cargá tu cardio cuando lo hagas.</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/70 select-none">
              <input
                type="checkbox"
                checked={done}
                onChange={e => setDone(e.target.checked)}
                disabled={!cfg.enabled}
                className="w-4 h-4 rounded border-white/20 accent-green-400 disabled:opacity-40"
              />
              Hecho
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/30 uppercase mb-1 block">Minutos</label>
              <input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                value={minutes}
                onChange={e => setMinutes(parseInt(e.target.value) || 0)}
                disabled={!cfg.enabled}
                className="w-full h-10 rounded-lg bg-white/10 px-3 text-xs text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase mb-1 block">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                disabled={!cfg.enabled}
                className="w-full h-10 rounded-lg bg-white/10 px-3 text-xs text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {['LISS', 'HIIT', 'Caminata', 'Bici'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={saveToday}
            disabled={!cfg.enabled}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 text-black"
            style={{ background: dayConfig.color }}
          >
            Guardar cardio de hoy
          </button>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="font-bold text-sm mb-2">Historial (este día)</p>
          {dayLogs.length === 0 ? (
            <p className="text-xs text-white/30">Todavía no cargaste cardio para este día.</p>
          ) : (
            <div className="space-y-2">
              {dayLogs.slice(0, 12).map((l) => (
                <div key={l.id} className="px-3 py-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/30">{l.date}</p>
                    <p className="text-sm font-bold" style={{ color: dayConfig.color }}>
                      {l.minutes} min · {l.type}
                    </p>
                  </div>
                  <span className="text-sm">{l.done ? '✅' : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ───────────────────────────────────────────

function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const auth = getAuth();
        const cred = await auth.signInWithEmailAndPassword(email, password);
        onAuth(cred.user);
      } else if (mode === 'register') {
        const auth = getAuth();
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        // Si querés verificación por email, activala en Firebase y descomentá:
        // await cred.user.sendEmailVerification();
        onAuth(cred.user);
      } else if (mode === 'forgot') {
        const auth = getAuth();
        await auth.sendPasswordResetEmail(email);
        setMessage('Te enviamos un email para restablecer tu contraseña.');
      }
    } catch (err) {
      const code = err?.code || '';
      const msg = err?.message || 'Error desconocido';
      if (code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || code === 'auth/user-not-found') setError('Email o contraseña incorrectos');
      else if (code === 'auth/email-already-in-use') setError('Este email ya está registrado');
      else if (code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres');
      else if (code === 'auth/invalid-email') setError('Ingresá un email válido');
      else if (msg.includes('Firebase no está configurado')) setError(msg);
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 70%)' }}>
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316, #a855f7, #22c55e, #3b82f6)', padding: '2px' }}>
            <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ background: '#0a0a0f' }}>
              <span className="text-3xl">🏋️</span>
            </div>
          </div>
          <h1 className="font-heading text-5xl tracking-wider mb-1">GYM TRACKER</h1>
          <p className="text-white/30 text-sm">Control de carga progresiva</p>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="font-heading text-2xl tracking-wider text-center mb-5">
            {mode === 'login' ? 'INICIAR SESIÓN' : mode === 'register' ? 'CREAR CUENTA' : 'RECUPERAR CONTRASEÑA'}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 px-4 py-2.5 rounded-xl text-sm text-green-300" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required autoComplete="email"
                className="w-full h-12 rounded-xl px-4 text-sm text-white placeholder-white/20 border-2 border-white/10 focus:border-white/30 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-1.5 block">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required={mode !== 'forgot'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  className="w-full h-12 rounded-xl px-4 text-sm text-white placeholder-white/20 border-2 border-white/10 focus:border-white/30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-heading text-xl tracking-wider text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
              {loading ? '...' : mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'REGISTRARME' : 'ENVIAR EMAIL'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-5 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors block mx-auto">
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="flex items-center gap-3 justify-center pt-1">
                  <span className="text-xs text-white/20">¿No tenés cuenta?</span>
                  <button onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                    Registrate
                  </button>
                </div>
              </>
            )}
            {mode === 'register' && (
              <div className="flex items-center gap-3 justify-center">
                <span className="text-xs text-white/20">¿Ya tenés cuenta?</span>
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  Iniciá sesión
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-xs text-white/30 hover:text-white/50 transition-colors">
                ← Volver al login
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/10 mt-6">Gym Tracker · Carga Progresiva</p>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ──────────────────────────────────────────

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('entrenar');
  const [activeDay, setActiveDay] = useState(() => getCurrentDayKey());
  const [routines, setRoutines] = useState(null);
  const [cardioSettings, setCardioSettings] = useState(null);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [logs, setLogs] = useState([]);

  // Check auth session on mount
  useEffect(() => {
    let unsubscribe = null;
    try {
      const auth = getAuth();
      unsubscribe = auth.onAuthStateChanged((u) => {
        setUser(u || null);
        setAuthLoading(false);
      });
    } catch (e) {
      console.error(e);
      setUser(null);
      setAuthLoading(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Load data once authenticated
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const routinesData = await storage.get('gym-routines');
        const cardioData = await storage.get('gym-cardio');
        const cardioLogsData = await storage.get('gym-cardio-logs');
        const logsData = await storage.get('gym-logs');
        setRoutines(routinesData ? JSON.parse(routinesData.value) : DEFAULT_ROUTINES);
        setCardioSettings(cardioData ? JSON.parse(cardioData.value) : DEFAULT_CARDIO_SETTINGS);
        setCardioLogs(cardioLogsData ? JSON.parse(cardioLogsData.value) : []);
        setLogs(logsData ? JSON.parse(logsData.value) : []);
      } catch (e) {
        console.error('Error loading data:', e);
        setRoutines(DEFAULT_ROUTINES);
        setCardioSettings(DEFAULT_CARDIO_SETTINGS);
        setCardioLogs([]);
        setLogs([]);
      }
      setLoading(false);
    })();
  }, [user]);

  // Save routines
  const updateRoutines = useCallback(async (newRoutines) => {
    setRoutines(newRoutines);
    await storage.set('gym-routines', JSON.stringify(newRoutines));
  }, []);

  // Save cardio settings per day
  const updateCardioSettings = useCallback(async (newCardioSettings) => {
    setCardioSettings(newCardioSettings);
    await storage.set('gym-cardio', JSON.stringify(newCardioSettings));
  }, []);

  const saveCardioLog = useCallback(async (entry) => {
    setCardioLogs(prev => {
      const updated = [...prev, entry];
      storage.set('gym-cardio-logs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save log
  const saveLog = useCallback(async (session) => {
    setLogs(prev => {
      const updated = [...prev, session];
      storage.set('gym-logs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Total sessions count
  const totalSessions = logs.length;

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setRoutines(null);
    setCardioSettings(null);
    setCardioLogs([]);
    setLogs([]);
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-5xl tracking-wider animate-pulse">GYM TRACKER</p>
          <p className="text-white/30 text-sm mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login
  if (!user) {
    return <LoginScreen onAuth={setUser} />;
  }

  // Data loading
  if (loading || !routines || !cardioSettings) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-5xl tracking-wider animate-pulse">GYM TRACKER</p>
          <p className="text-white/30 text-sm mt-2">Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-heading text-2xl tracking-wider">GYM TRACKER</h1>
          <div className="flex items-center gap-2">
            {totalSessions > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-medium text-orange-400">{totalSessions}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={user.email}>
              <span className="text-xs text-white/40 max-w-[80px] truncate hidden sm:inline">{user.email}</span>
              <span className="text-xs text-white/30">↗</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'entrenar' && (
          <EntrenarView routines={routines} logs={logs} activeDay={activeDay}
            cardioSettings={cardioSettings}
            onDayChange={setActiveDay} onSaveLog={saveLog} />
        )}
        {activeTab === 'cardio' && (
          <CardioView
            cardioSettings={cardioSettings}
            cardioLogs={cardioLogs}
            onSaveCardioLog={saveCardioLog}
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
        )}
        {activeTab === 'historial' && (
          <HistorialView logs={logs} activeDay={activeDay} onDayChange={setActiveDay} />
        )}
        {activeTab === 'rutina' && (
          <RutinaView routines={routines} cardioSettings={cardioSettings} onUpdateCardioSettings={updateCardioSettings}
            onUpdateRoutines={updateRoutines}
            activeDay={activeDay} onDayChange={setActiveDay} />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <BottomTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

// ─── RENDER ─────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
