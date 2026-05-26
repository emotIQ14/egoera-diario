'use client';

import { useEffect, useMemo, useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import DreamCanvas from '@/components/DreamCanvas';
import { useToast } from '@/components/toast/ToastProvider';
import {
  type Dream, type DreamPalette, type DreamFeeling,
  FEELINGS, PALETTES,
  loadDreams, saveDream, updateDream, deleteDream, makeDreamId,
  computeRender, markReady, formatDreamTime, dreamNumber, readyDreams, unreadyDreams,
} from '@/lib/dreams';

type Tab = 'capture' | 'gallery';

const BUILD_MS = 4500; // simulado: el "recreating" tarda ~4.5s

export default function SuenosPage() {
  const toast = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>('gallery');
  const [tick, setTick] = useState(0);

  // Compose state
  const [text, setText] = useState('');
  const [feelings, setFeelings] = useState<DreamFeeling[]>([]);
  const [palette, setPalette] = useState<DreamPalette>('aurora');
  const [intensity, setIntensity] = useState(3);
  const [recurring, setRecurring] = useState(false);
  const [building, setBuilding] = useState<Dream | null>(null);

  const [openedDream, setOpenedDream] = useState<Dream | null>(null);

  useEffect(() => { setHydrated(true); }, []);

  const dreams = useMemo(() => hydrated ? loadDreams() : [], [hydrated, tick]);
  const ready = useMemo(() => hydrated ? readyDreams() : [], [hydrated, tick]);
  const pending = useMemo(() => hydrated ? unreadyDreams() : [], [hydrated, tick]);

  // Auto-complete pending dreams después del intervalo (simula procesado IA)
  useEffect(() => {
    if (!building) return;
    const tm = setTimeout(() => {
      markReady(building.id);
      setBuilding(null);
      setTick(n => n + 1);
      toast.info('Sueño listo · ya puedes verlo');
    }, BUILD_MS);
    return () => clearTimeout(tm);
  }, [building, toast]);

  function toggleFeeling(f: DreamFeeling) {
    setFeelings(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  function onCapture() {
    if (!text.trim()) {
      toast.info('Cuenta el sueño con palabras propias');
      return;
    }
    // Seed = texto + feelings + intensidad → siempre mismo visual para mismo input
    const seedStr = text.trim() + '|' + feelings.join(',') + '|' + intensity + '|' + palette;
    const render = computeRender(seedStr, intensity);
    const occurredAt = new Date();
    occurredAt.setHours(3, Math.floor(Math.random() * 50) + 10, 0, 0);
    if (occurredAt > new Date()) occurredAt.setDate(occurredAt.getDate() - 1);
    const dream: Dream = {
      id: makeDreamId(),
      createdAt: new Date().toISOString(),
      occurredAt: occurredAt.toISOString(),
      text: text.trim(),
      feelings,
      palette,
      intensity,
      recurring,
      seed: seedStr,
      render,
      ready: false,
    };
    saveDream(dream);
    setBuilding(dream);
    setTick(n => n + 1);
    setText('');
    setFeelings([]);
    setRecurring(false);
    setTab('gallery');
  }

  function onDelete(id: string) {
    if (!window.confirm('¿Borrar este sueño?')) return;
    deleteDream(id);
    setTick(n => n + 1);
    setOpenedDream(null);
  }

  return (
    <>
      <Screen background="ink">
        <header className="head">
          <span className="kicker">— dream catcher —</span>
          <h1 className="title">
            recrea tus <em>sueños</em>.
          </h1>
          <p className="lede">
            Anota lo que recuerdas al despertar — colores, sensaciones, fragmentos.
            La app teje un visual cinemático de tu noche y lo guarda.
          </p>
        </header>

        <nav className="tabs">
          <button className={`tab ${tab === 'gallery' ? 'on' : ''}`} onClick={() => setTab('gallery')}>
            Galería <span className="b">{dreams.length}</span>
          </button>
          <button className={`tab ${tab === 'capture' ? 'on' : ''}`} onClick={() => setTab('capture')}>
            Capturar
          </button>
        </nav>

        {tab === 'capture' && (
          <section className="cap">
            {/* Preview en vivo del visual mientras escribe */}
            <div className="preview">
              <DreamCanvas
                dream={{
                  id: 'preview',
                  createdAt: new Date().toISOString(),
                  occurredAt: new Date().toISOString(),
                  text, feelings, palette, intensity, recurring: false,
                  seed: text || 'preview',
                  render: computeRender(text || 'preview', intensity),
                  ready: true,
                }}
                width={280}
                height={280}
              />
              <p className="preview-hint">— preview generado en vivo —</p>
            </div>

            <label className="block">
              <span className="lbl">cuenta el sueño</span>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Estaba en una casa que no era mía, pero la reconocía. Había una luz naranja al fondo..."
                rows={6}
                className="ta"
              />
            </label>

            <label className="block">
              <span className="lbl">qué sentiste</span>
              <div className="chips">
                {FEELINGS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip ${feelings.includes(f.id) ? 'on' : ''}`}
                    onClick={() => toggleFeeling(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="lbl">paleta del sueño</span>
              <div className="palettes">
                {PALETTES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`pal ${palette === p.id ? 'on' : ''}`}
                    onClick={() => setPalette(p.id)}
                    aria-label={p.label}
                  >
                    <span className="pal-swatch" style={{
                      background: `linear-gradient(135deg, ${p.stops[0]}, ${p.stops[1] ?? p.stops[0]}, ${p.stops[2] ?? p.stops[0]})`
                    }} />
                    <span className="pal-lbl">{p.label}</span>
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="lbl">intensidad — {intensity}/5</span>
              <input
                type="range"
                min={1} max={5} step={1}
                value={intensity}
                onChange={e => setIntensity(parseInt(e.target.value, 10))}
                className="range"
              />
              <span className="range-tip">cuán vívido fue · más intenso = más partículas y movimiento</span>
            </label>

            <label className="block ck">
              <input
                type="checkbox"
                checked={recurring}
                onChange={e => setRecurring(e.target.checked)}
              />
              <span>Es un sueño recurrente</span>
            </label>

            <button type="button" className="capture-btn" onClick={onCapture} disabled={!!building}>
              {building ? 'Recreando…' : 'Capturar sueño →'}
            </button>
          </section>
        )}

        {tab === 'gallery' && (
          <section className="gal">
            {building && (
              <BuildingCard dream={building} />
            )}

            {pending.length > 0 && pending.filter(d => d.id !== building?.id).map(d => (
              <BuildingCard key={d.id} dream={d} />
            ))}

            {ready.length === 0 && !building && pending.length === 0 ? (
              <Empty onCapture={() => setTab('capture')} />
            ) : (
              <div className="grid">
                {ready.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className="dream-card"
                    onClick={() => setOpenedDream(d)}
                    aria-label={`Sueño ${formatDreamTime(d.occurredAt)}`}
                  >
                    <DreamCanvas dream={d} width={160} height={200} still />
                    <span className="dc-when">{formatDreamTime(d.occurredAt)}</span>
                    {d.recurring && <span className="dc-rec" title="Recurrente">↻</span>}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </Screen>
      <TabBar />

      {openedDream && (
        <DreamPlayer
          dream={openedDream}
          onClose={() => setOpenedDream(null)}
          onDelete={() => onDelete(openedDream.id)}
        />
      )}

      <style jsx>{`
        .head { margin-bottom: 22px; }
        .kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.7);
        }
        .title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(34px, 9vw, 50px);
          line-height: 1.02;
          color: var(--crema);
          margin: 8px 0 14px;
        }
        .title em { color: var(--accent); }
        .lede {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: rgba(241,234,216,0.78);
          margin: 0 0 18px;
        }
        .tabs { display: flex; gap: 6px; margin-bottom: 18px; }
        .tab {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(241,234,216,0.22);
          color: var(--crema);
          padding: 10px 8px;
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .tab.on { background: var(--crema); color: var(--ink); border-color: var(--crema); }
        .b {
          background: rgba(255,255,255,0.18);
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 10px;
        }
        .tab.on .b { background: rgba(13,15,61,0.12); color: var(--ink); }

        /* Capture */
        .cap { display: flex; flex-direction: column; gap: 22px; }
        .preview {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 12px;
        }
        .preview-hint {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.55);
          margin: 0;
        }
        .block { display: flex; flex-direction: column; gap: 8px; }
        .lbl {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.6);
        }
        .ta {
          width: 100%;
          background: rgba(241,234,216,0.08);
          border: 1.5px solid rgba(241,234,216,0.18);
          border-radius: 14px;
          padding: 16px;
          font-family: var(--font-body);
          font-size: 15.5px;
          line-height: 1.55;
          color: var(--crema);
          resize: vertical;
          box-sizing: border-box;
        }
        .ta::placeholder { color: rgba(241,234,216,0.4); font-style: italic; }
        .ta:focus { outline: none; border-color: var(--accent); }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip {
          background: transparent;
          border: 1px solid rgba(241,234,216,0.22);
          color: var(--crema);
          padding: 7px 12px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .chip.on { background: var(--accent); border-color: var(--accent); color: var(--crema); }

        .palettes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .pal {
          background: transparent;
          border: 1.5px solid rgba(241,234,216,0.14);
          border-radius: 12px;
          padding: 8px 6px 6px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          cursor: pointer;
        }
        .pal.on { border-color: var(--crema); }
        .pal-swatch {
          width: 100%; aspect-ratio: 2 / 1;
          border-radius: 6px;
        }
        .pal-lbl {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.7);
        }

        .range {
          width: 100%;
          accent-color: var(--accent);
        }
        .range-tip {
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(241,234,216,0.55);
        }
        .ck { flex-direction: row; align-items: center; gap: 10px; }
        .ck input { accent-color: var(--accent); width: 18px; height: 18px; }
        .ck span { font-family: var(--font-body); color: var(--crema); font-size: 14px; }

        .capture-btn {
          background: var(--accent);
          color: var(--crema);
          border: none;
          border-radius: 999px;
          padding: 16px 22px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.15s, transform 0.15s ease;
        }
        .capture-btn:disabled { opacity: 0.6; cursor: wait; }
        .capture-btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.08); }

        /* Gallery */
        .gal { display: flex; flex-direction: column; gap: 18px; }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .dream-card {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s ease;
        }
        .dream-card:hover { transform: translateY(-3px); }
        .dream-card canvas {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 4 / 5;
          box-shadow: 0 16px 40px -16px rgba(0,0,0,0.6);
        }
        .dc-when {
          position: absolute;
          left: 10px; bottom: 10px;
          background: rgba(13,15,61,0.55);
          backdrop-filter: blur(6px);
          color: var(--crema);
          padding: 4px 10px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .dc-rec {
          position: absolute;
          top: 10px; right: 10px;
          background: var(--accent);
          color: var(--crema);
          width: 22px; height: 22px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
      `}</style>
    </>
  );
}

function BuildingCard({ dream }: { dream: Dream }) {
  return (
    <article className="bc">
      <div className="bc-orb"><DreamCanvas dream={dream} width={220} height={220} /></div>
      <h3 className="bc-h">Recreando<br/>tu sueño…</h3>
      <span className="bc-tag">✦ Building Scenes</span>
      <p className="bc-sub">Convirtiendo memorias, emociones y patrones en un visual cinemático.</p>
      <style jsx>{`
        .bc {
          background: rgba(241,234,216,0.05);
          border: 1px solid rgba(241,234,216,0.14);
          border-radius: 22px;
          padding: 28px 22px;
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px;
        }
        .bc-orb { display: flex; justify-content: center; }
        .bc-orb canvas {
          width: 220px !important;
          height: 220px !important;
          border-radius: 999px !important;
          box-shadow: 0 24px 60px -12px rgba(255,180,140,0.25);
        }
        .bc-h {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 26px;
          color: var(--crema);
          margin: 0;
        }
        .bc-tag {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.8);
          border: 1px solid rgba(241,234,216,0.22);
          padding: 6px 14px;
          border-radius: 999px;
        }
        .bc-sub {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(241,234,216,0.6);
          margin: 0;
          max-width: 280px;
        }
      `}</style>
    </article>
  );
}

function Empty({ onCapture }: { onCapture: () => void }) {
  return (
    <div className="empty">
      <p className="em-h">Tu bóveda de sueños está vacía.</p>
      <p className="em-sub">Cada noche que anotas se convierte en un visual único — solo para ti.</p>
      <button className="em-btn" onClick={onCapture}>Capturar el primero →</button>
      <style jsx>{`
        .empty {
          text-align: center; padding: 40px 20px;
          color: var(--crema);
          background: rgba(241,234,216,0.04);
          border-radius: 18px;
        }
        .em-h {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 22px;
          margin: 0 0 8px;
        }
        .em-sub {
          font-family: var(--font-body);
          font-size: 14.5px;
          color: rgba(241,234,216,0.65);
          margin: 0 0 18px;
        }
        .em-btn {
          background: var(--accent);
          color: var(--crema);
          border: none;
          border-radius: 999px;
          padding: 12px 22px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function DreamPlayer({ dream, onClose, onDelete }: { dream: Dream; onClose: () => void; onDelete: () => void }) {
  const dNum = useMemo(() => 2481 + dream.id.length, [dream.id]);
  return (
    <div className="bg" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="mod" onClick={e => e.stopPropagation()}>
        <header className="mh">
          <button className="bk" onClick={onClose} aria-label="Volver">←</button>
          <span className="num">Dream #{dNum}</span>
          <button className="del" onClick={onDelete} aria-label="Borrar">⋯</button>
        </header>
        <div className="player">
          <DreamCanvas dream={dream} width={340} height={420} />
        </div>
        <div className="meta">
          <span className="mt-when">{formatDreamTime(dream.occurredAt)}</span>
          {dream.feelings.length > 0 && (
            <span className="mt-feel">{dream.feelings.join(' · ')}</span>
          )}
        </div>
        <p className="text">{dream.text}</p>
      </div>
      <style jsx>{`
        .bg {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(12px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 16px;
          overflow-y: auto;
        }
        .mod {
          max-width: 520px; width: 100%;
          color: var(--crema);
          animation: in 0.35s cubic-bezier(0.34,1.4,0.64,1);
        }
        @keyframes in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .mh {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .bk, .del {
          background: rgba(255,255,255,0.08);
          border: none; color: var(--crema);
          width: 38px; height: 38px;
          border-radius: 999px;
          font-size: 18px;
          cursor: pointer;
        }
        .num {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 16px;
        }
        .player {
          display: flex; justify-content: center;
          margin-bottom: 18px;
        }
        .player canvas {
          width: min(100%, 340px) !important;
          height: auto !important;
          aspect-ratio: 4 / 5;
          border-radius: 20px;
          box-shadow: 0 30px 80px -10px rgba(0,0,0,0.7);
        }
        .meta {
          display: flex; gap: 10px; align-items: center;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(241,234,216,0.55);
          margin-bottom: 14px;
        }
        .mt-feel { color: var(--accent); }
        .text {
          font-family: var(--font-body);
          font-size: 15.5px;
          line-height: 1.6;
          color: var(--crema);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
