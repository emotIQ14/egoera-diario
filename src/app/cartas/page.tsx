'use client';

import { useEffect, useMemo, useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import EgoeraMascot from '@/components/illustrations/EgoeraMascot';
import { useToast } from '@/components/toast/ToastProvider';
import {
  STAMPS, COLORS,
  type Letter, type LetterStamp, type LetterColor,
  loadLetters, saveLetter, deliverLetter, deleteLetter, makeLetterId,
  scheduledLetters, deliveredLetters, readyLetters, autoDeliverDue,
  daysUntil, formatDeliveryDate,
} from '@/lib/letters';

type Tab = 'write' | 'scheduled' | 'inbox';

const PRESETS = [
  { label: '1 mes',    days: 30 },
  { label: '6 meses',  days: 180 },
  { label: '1 año',    days: 365 },
  { label: '5 años',   days: 1825 },
];

function isoFromDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function inputDateValue(iso: string): string {
  // YYYY-MM-DD para <input type=date>
  return new Date(iso).toISOString().slice(0, 10);
}

function isoFromInput(value: string): string {
  const d = new Date(value + 'T09:00:00');
  return d.toISOString();
}

export default function CartasPage() {
  const toast = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>('write');
  const [tick, setTick] = useState(0);

  // Compose state
  const [body, setBody] = useState('');
  const [stamp, setStamp] = useState<LetterStamp>('cherry-blossom');
  const [color, setColor] = useState<LetterColor>('#d97757');
  const [deliverISO, setDeliverISO] = useState<string>(isoFromDaysAhead(365));
  const [openedLetter, setOpenedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    setHydrated(true);
    // Auto-mover cartas vencidas a inbox
    const n = autoDeliverDue();
    if (n > 0) toast.info(`Te llegó${n > 1 ? 'n ' + n : ''} carta${n > 1 ? 's' : ''} tuya${n > 1 ? 's' : ''}`);
  }, []);

  const scheduled = useMemo(() => hydrated ? scheduledLetters() : [], [hydrated, tick]);
  const delivered = useMemo(() => hydrated ? deliveredLetters() : [], [hydrated, tick]);
  const readyCount = useMemo(() => hydrated ? readyLetters().length : 0, [hydrated, tick]);

  function onSend() {
    if (!body.trim()) {
      toast.info('Escribe algo antes de enviarla');
      return;
    }
    const deliverAt = deliverISO;
    if (new Date(deliverAt).getTime() <= Date.now() + 1000 * 60 * 60) {
      toast.info('La fecha de entrega debe ser al menos en 1 día');
      return;
    }
    const letter: Letter = {
      id: makeLetterId(),
      createdAt: new Date().toISOString(),
      deliverAt,
      body: body.trim(),
      stamp, color,
      delivered: false,
    };
    saveLetter(letter);
    toast.info(`Programada · te llega ${formatDeliveryDate(deliverAt)}`);
    setBody('');
    setTick(n => n + 1);
    setTab('scheduled');
  }

  function onOpenInbox(l: Letter) {
    setOpenedLetter(l);
  }

  function onDelete(id: string) {
    if (!window.confirm('¿Borrar esta carta? No se puede deshacer.')) return;
    deleteLetter(id);
    setTick(n => n + 1);
  }

  return (
    <>
      <Screen background="cream">
        <header className="head">
          <div className="hero">
            <EgoeraMascot variant="holding-letter" size={120} />
          </div>
          <span className="kicker">— cartas al futuro —</span>
          <h1 className="title">
            escríbete <em>despacio</em>.
          </h1>
          <p className="lede">
            Una carta para tu yo de mañana, de seis meses, de cinco años.
            La guardas hoy y te llega cuando llegue la fecha. Nadie más la lee.
          </p>
        </header>

        <nav className="tabs" aria-label="Vista de cartas">
          <button type="button" className={`tab ${tab === 'write' ? 'on' : ''}`} onClick={() => setTab('write')}>
            Escribir
          </button>
          <button type="button" className={`tab ${tab === 'scheduled' ? 'on' : ''}`} onClick={() => setTab('scheduled')}>
            Programadas <span className="badge">{scheduled.length}</span>
          </button>
          <button type="button" className={`tab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>
            Recibidas <span className="badge">{delivered.length + readyCount}</span>
          </button>
        </nav>

        {tab === 'write' && (
          <section className="compose" aria-label="Escribir nueva carta">
            <div className="envelope">
              <div className="stamp" style={{ background: color }} aria-hidden="true">
                {STAMPS.find(s => s.id === stamp)?.icon}
              </div>
              <div className="addr">
                <span className="to">Para</span>
                <span className="me">— mi yo de —</span>
                <strong className="when">{formatDeliveryDate(deliverISO)}</strong>
              </div>
            </div>

            <label className="block">
              <span className="lbl">Tu carta</span>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Querido yo:..."
                rows={10}
                className="ta"
              />
            </label>

            <label className="block">
              <span className="lbl">¿Cuándo te llega?</span>
              <div className="presets">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    className="preset"
                    onClick={() => setDeliverISO(isoFromDaysAhead(p.days))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={inputDateValue(deliverISO)}
                onChange={e => setDeliverISO(isoFromInput(e.target.value))}
                min={inputDateValue(isoFromDaysAhead(1))}
                className="date"
              />
            </label>

            <label className="block">
              <span className="lbl">Sello</span>
              <div className="stamps">
                {STAMPS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`stbtn ${stamp === s.id ? 'on' : ''}`}
                    onClick={() => setStamp(s.id)}
                    aria-label={s.label}
                  >
                    <span>{s.icon}</span>
                    <span className="stlbl">{s.label}</span>
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="lbl">Color del sello</span>
              <div className="colors">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`cbtn ${color === c.id ? 'on' : ''}`}
                    style={{ background: c.id }}
                    onClick={() => setColor(c.id)}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </label>

            <button type="button" className="send-btn" onClick={onSend}>
              Enviar al futuro →
            </button>
          </section>
        )}

        {tab === 'scheduled' && (
          <section className="list" aria-label="Cartas programadas">
            {scheduled.length === 0 ? (
              <Empty
                title="Sin cartas en camino."
                body="Escribe una y te llegará el día que decidas."
                onClick={() => setTab('write')}
                ctaLabel="Escribir la primera"
              />
            ) : scheduled.map(l => (
              <article key={l.id} className="env-card">
                <div className="env-stamp" style={{ background: l.color }}>
                  {STAMPS.find(s => s.id === l.stamp)?.icon}
                </div>
                <div className="env-body">
                  <span className="env-when">
                    en {daysUntil(l.deliverAt)} {daysUntil(l.deliverAt) === 1 ? 'día' : 'días'}
                  </span>
                  <h3 className="env-title">{formatDeliveryDate(l.deliverAt)}</h3>
                  <p className="env-preview">{l.body.slice(0, 80)}{l.body.length > 80 ? '…' : ''}</p>
                  <button type="button" className="env-del" onClick={() => onDelete(l.id)} aria-label="Borrar">
                    Borrar
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'inbox' && (
          <section className="list" aria-label="Cartas recibidas">
            {readyCount > 0 && (
              <div className="ready-bn">
                Tienes <strong>{readyCount}</strong> carta{readyCount > 1 ? 's' : ''} esperándote
              </div>
            )}
            {delivered.length === 0 && readyCount === 0 ? (
              <Empty
                title="Tu bandeja está vacía."
                body="Las cartas que te escribas aparecerán aquí cuando llegue su fecha."
                onClick={() => setTab('write')}
                ctaLabel="Escribir una carta"
              />
            ) : delivered.map(l => (
              <button key={l.id} type="button" className="env-card open" onClick={() => onOpenInbox(l)}>
                <div className="env-stamp" style={{ background: l.color }}>
                  {STAMPS.find(s => s.id === l.stamp)?.icon}
                </div>
                <div className="env-body">
                  <span className="env-when">recibida</span>
                  <h3 className="env-title">{formatDeliveryDate(l.deliverAt)}</h3>
                  <p className="env-preview">{l.body.slice(0, 80)}{l.body.length > 80 ? '…' : ''}</p>
                </div>
              </button>
            ))}
          </section>
        )}
      </Screen>
      <TabBar />

      {openedLetter && (
        <ReaderModal letter={openedLetter} onClose={() => setOpenedLetter(null)} />
      )}

      <style jsx>{`
        .head { margin-bottom: 24px; text-align: left; }
        .hero { display: flex; justify-content: center; margin-bottom: 10px; }
        .kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cobalto);
        }
        .title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(36px, 9vw, 52px);
          line-height: 1.02;
          margin: 8px 0 14px;
          color: var(--ink);
        }
        .title em { color: var(--cobalto); }
        .lede {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          opacity: 0.78;
          margin: 0 0 22px;
        }
        .tabs { display: flex; gap: 6px; margin-bottom: 22px; }
        .tab {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(13,15,61,0.18);
          color: var(--ink);
          padding: 10px 8px;
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .tab.on { background: var(--cobalto); color: var(--crema); border-color: var(--cobalto); }
        .badge {
          background: rgba(255,255,255,0.22);
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 10px;
        }
        .tab:not(.on) .badge {
          background: rgba(13,15,61,0.08);
          color: var(--cobalto);
        }

        .compose { display: flex; flex-direction: column; gap: 18px; }
        .envelope {
          position: relative;
          background: #fff;
          border: 1.5px solid rgba(13,15,61,0.18);
          border-radius: 14px;
          padding: 18px 18px 16px;
          min-height: 120px;
          box-shadow: 0 8px 22px -16px rgba(15,27,170,0.3);
        }
        .stamp {
          position: absolute;
          top: 12px; right: 14px;
          width: 50px; height: 60px;
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          color: var(--crema);
          border: 2px dashed rgba(255,255,255,0.6);
        }
        .addr {
          display: flex; flex-direction: column; gap: 4px;
          font-family: var(--font-body);
          padding-right: 70px;
        }
        .addr .to { font-size: 13px; opacity: 0.6; }
        .addr .me {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
        }
        .addr .when {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 26px;
          color: var(--cobalto);
        }

        .block { display: flex; flex-direction: column; gap: 8px; }
        .lbl {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.6;
        }
        .ta {
          width: 100%;
          background: #fff;
          border: 1.5px solid rgba(13,15,61,0.18);
          border-radius: 14px;
          padding: 16px;
          font-family: var(--font-body);
          font-size: 15.5px;
          line-height: 1.55;
          color: var(--ink);
          resize: vertical;
          box-sizing: border-box;
        }
        .ta:focus { outline: none; border-color: var(--cobalto); }

        .presets { display: flex; gap: 6px; flex-wrap: wrap; }
        .preset {
          background: transparent;
          border: 1px solid rgba(13,15,61,0.18);
          color: var(--ink);
          padding: 7px 12px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .preset:hover { border-color: var(--cobalto); color: var(--cobalto); }
        .date {
          margin-top: 8px;
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 16px;
          border: 1.5px solid rgba(13,15,61,0.18);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
        }
        .date:focus { outline: none; border-color: var(--cobalto); }

        .stamps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .stbtn {
          background: #fff;
          border: 1.5px solid rgba(13,15,61,0.14);
          border-radius: 12px;
          padding: 10px 8px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          cursor: pointer;
          color: var(--ink);
        }
        .stbtn > :first-child { font-size: 22px; }
        .stlbl {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.6;
        }
        .stbtn.on { border-color: var(--cobalto); background: rgba(29,43,219,0.06); }

        .colors { display: flex; gap: 10px; flex-wrap: wrap; }
        .cbtn {
          width: 36px; height: 36px;
          border-radius: 999px;
          border: 2px solid rgba(13,15,61,0.18);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .cbtn.on {
          transform: scale(1.15);
          border-color: var(--ink);
          box-shadow: 0 0 0 3px rgba(13,15,61,0.12);
        }

        .send-btn {
          background: var(--cobalto);
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
        .send-btn:hover { background: var(--cobalto-deep, #0f1baa); transform: translateY(-1px); }

        .list { display: flex; flex-direction: column; gap: 12px; }
        .ready-bn {
          background: var(--accent);
          color: var(--crema);
          padding: 14px 16px;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 14.5px;
        }
        .ready-bn strong { font-weight: 700; }

        .env-card {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 14px;
          padding: 16px;
          background: #fff;
          border: 1px solid rgba(13,15,61,0.12);
          border-radius: 14px;
          text-align: left;
          color: var(--ink);
          cursor: default;
          transition: border-color 0.15s, transform 0.15s ease;
        }
        .env-card.open {
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, var(--crema-soft) 0%, #fff 100%);
        }
        .env-card.open:hover { transform: translateY(-2px); }
        .env-stamp {
          width: 56px; height: 66px;
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          color: var(--crema);
          border: 2px dashed rgba(255,255,255,0.6);
        }
        .env-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .env-when {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
        }
        .env-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 22px;
          color: var(--cobalto);
          margin: 0;
        }
        .env-preview {
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          opacity: 0.78;
          margin: 4px 0 0;
          line-height: 1.45;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .env-del {
          background: transparent;
          border: none;
          color: var(--ink);
          opacity: 0.4;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 8px 0 0;
          cursor: pointer;
          text-align: left;
          align-self: flex-start;
        }
        .env-del:hover { opacity: 0.85; color: var(--accent); }
      `}</style>
    </>
  );
}

function Empty({ title, body, ctaLabel, onClick }:
  { title: string; body: string; ctaLabel: string; onClick: () => void; }) {
  return (
    <div style={{
      textAlign: 'center', padding: '40px 16px',
      background: 'var(--crema-soft)', borderRadius: 16, color: 'var(--ink)'
    }}>
      <EgoeraMascot variant="sleeping" size={100} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: '8px 0 6px' }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, opacity: 0.78, margin: '0 0 16px' }}>{body}</p>
      <button type="button" onClick={onClick} style={{
        background: 'var(--cobalto)', color: 'var(--crema)', border: 'none', borderRadius: 999,
        padding: '12px 22px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: 'pointer'
      }}>{ctaLabel}</button>
    </div>
  );
}

function ReaderModal({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  const stampIcon = STAMPS.find(s => s.id === letter.stamp)?.icon ?? '✦';
  const createdDate = new Date(letter.createdAt);
  const createdLabel = createdDate.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return (
    <div role="dialog" aria-modal="true" className="reader-bg" onClick={onClose}>
      <div className="reader" onClick={e => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="Cerrar">×</button>
        <header className="rh">
          <div className="rs" style={{ background: letter.color }}>{stampIcon}</div>
          <div>
            <p className="rm">Carta de</p>
            <p className="rd">{createdLabel}</p>
          </div>
        </header>
        <div className="rb">
          {letter.body.split('\n').map((line, i) => (
            <p key={i}>{line || ' '}</p>
          ))}
        </div>
        <p className="rf">— tu yo de {createdLabel}</p>
      </div>
      <style jsx>{`
        .reader-bg {
          position: fixed; inset: 0;
          background: rgba(13,15,61,0.6);
          z-index: 9999;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 16px;
          overflow-y: auto;
          animation: bgIn 0.25s ease;
        }
        @keyframes bgIn { from { opacity: 0; } to { opacity: 1; } }
        .reader {
          background: var(--crema-soft);
          border-radius: 18px;
          padding: 28px 24px 32px;
          max-width: 520px;
          width: 100%;
          position: relative;
          animation: cardIn 0.35s cubic-bezier(0.34,1.4,0.64,1);
          color: var(--ink);
          box-shadow: 0 20px 60px -20px rgba(0,0,0,0.5);
        }
        @keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .x {
          position: absolute; top: 12px; right: 14px;
          background: transparent; border: none;
          font-size: 28px; line-height: 1; cursor: pointer;
          color: var(--ink); opacity: 0.55;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
        }
        .x:hover { opacity: 1; }
        .rh { display: flex; gap: 14px; align-items: center; margin-bottom: 18px; padding-right: 32px; }
        .rs {
          width: 52px; height: 60px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; color: var(--crema);
          border: 2px dashed rgba(255,255,255,0.6);
        }
        .rm {
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.22em; text-transform: uppercase;
          opacity: 0.55; margin: 0;
        }
        .rd {
          font-family: var(--font-display); font-style: italic;
          font-weight: 600; font-size: 22px; margin: 2px 0 0;
          color: var(--cobalto);
        }
        .rb {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink);
        }
        .rb p { margin: 0 0 12px; }
        .rf {
          font-family: var(--font-display); font-style: italic;
          margin: 20px 0 0;
          opacity: 0.7;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
