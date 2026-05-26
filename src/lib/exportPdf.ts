/**
 * Egoera · Diario emocional — Export entries a PDF.
 *
 * Cliente-only. Usa jsPDF para generar el PDF dinámicamente en el navegador
 * con la identidad visual de Egoera (cobalto + crema + accent coral).
 *
 * No requiere backend ni almacenamiento — el PDF se descarga directamente.
 * El usuario puede llevarse su diario a cualquier sitio.
 */

import { jsPDF } from 'jspdf';
import { loadEntries, type DiaryEntry } from './storage';
import { EMOTIONS } from './types';

const COBALTO = '#1d2bdb';
const CREMA = '#f1ead8';
const INK = '#0a0a18';
const INK_MUTE = '#3a3850';
const ACCENT = '#d97757';
const RULE = '#e6dec5';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function emotionLabel(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

type ExportOptions = {
  userName?: string;
  from?: Date;
  to?: Date;
};

export async function exportDiaryToPdf(opts: ExportOptions = {}): Promise<void> {
  const entries = loadEntries();
  const filtered = entries.filter((e) => {
    const d = new Date(e.createdAt);
    if (opts.from && d < opts.from) return false;
    if (opts.to && d > opts.to) return false;
    return true;
  });
  if (filtered.length === 0) {
    throw new Error('No hay entradas en el rango seleccionado.');
  }

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const W = doc.internal.pageSize.getWidth();   // 595
  const H = doc.internal.pageSize.getHeight();  // 842
  const MX = 56;                                 // margen lateral
  const MT = 70;                                 // margen superior

  // ─── PORTADA ─────────────────────────────────────────────────────────
  doc.setFillColor(...hexToRgb(CREMA));
  doc.rect(0, 0, W, H, 'F');

  // Cinta cobalto superior
  doc.setFillColor(...hexToRgb(COBALTO));
  doc.rect(0, 0, W, 8, 'F');

  // Kicker mono
  doc.setTextColor(...hexToRgb(COBALTO));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('— EGOERA · DIARIO EMOCIONAL —', MX, 96, { charSpace: 1.6 });

  // Título
  doc.setTextColor(...hexToRgb(INK));
  doc.setFont('times', 'italic');
  doc.setFontSize(40);
  doc.text('Tu cuaderno', MX, 180);
  doc.text('emocional.', MX, 222);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(INK_MUTE));
  const subline = opts.userName
    ? `Lo escribió ${opts.userName} · entre el ${formatLongDate(filtered[filtered.length - 1].createdAt)} y el ${formatLongDate(filtered[0].createdAt)}`
    : `Entre el ${formatLongDate(filtered[filtered.length - 1].createdAt)} y el ${formatLongDate(filtered[0].createdAt)}`;
  const subWrap = doc.splitTextToSize(subline, W - MX * 2);
  doc.text(subWrap, MX, 268);

  // Stats card
  const statY = 330;
  doc.setFillColor(...hexToRgb('#ede0bd'));
  doc.roundedRect(MX, statY, W - MX * 2, 140, 12, 12, 'F');
  // 3 columnas
  const colW = (W - MX * 2) / 3;
  const stats = [
    [String(filtered.length), 'ENTRADAS'],
    [(filtered.reduce((s, e) => s + e.mood, 0) / filtered.length).toFixed(1), 'MOOD MEDIO'],
    [String(new Set(filtered.flatMap((e) => e.emotions)).size), 'EMOCIONES'],
  ];
  stats.forEach(([num, label], i) => {
    const cx = MX + colW * i + colW / 2;
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(34);
    doc.setTextColor(...hexToRgb(COBALTO));
    doc.text(num, cx, statY + 70, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(INK_MUTE));
    doc.text(label, cx, statY + 100, { align: 'center', charSpace: 1.4 });
  });

  // Cita central
  doc.setFont('times', 'italic');
  doc.setFontSize(15);
  doc.setTextColor(...hexToRgb(INK));
  const quote = '«Lo que se escribe deja de pesar de la misma manera.»';
  doc.text(quote, W / 2, 550, { align: 'center' });

  // Footer portada
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(INK_MUTE));
  doc.text(`Exportado el ${formatLongDate(new Date().toISOString())}`, MX, H - 60, { charSpace: 1.2 });
  doc.text('diario.egoera.es', W - MX, H - 60, { align: 'right', charSpace: 1.2 });

  // ─── ENTRADAS ────────────────────────────────────────────────────────
  // Página nueva + render una entrada por sección
  let y = MT;
  let pageNum = 2;

  function newPage(): void {
    doc.addPage();
    doc.setFillColor(...hexToRgb(CREMA));
    doc.rect(0, 0, W, H, 'F');
    // Header tenue
    doc.setTextColor(...hexToRgb(INK_MUTE));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('EGOERA · DIARIO', MX, 40, { charSpace: 1.4 });
    doc.text(`p. ${pageNum}`, W - MX, 40, { align: 'right', charSpace: 1.2 });
    // Línea inferior
    doc.setDrawColor(...hexToRgb(RULE));
    doc.line(MX, 52, W - MX, 52);
    y = MT;
    pageNum++;
  }

  // Agrupar por mes
  const byMonth = new Map<string, DiaryEntry[]>();
  for (const e of filtered) {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  doc.addPage();
  doc.setFillColor(...hexToRgb(CREMA));
  doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(...hexToRgb(INK_MUTE));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('EGOERA · DIARIO', MX, 40, { charSpace: 1.4 });
  doc.text(`p. ${pageNum - 1}`, W - MX, 40, { align: 'right', charSpace: 1.2 });
  doc.setDrawColor(...hexToRgb(RULE));
  doc.line(MX, 52, W - MX, 52);
  y = MT;

  for (const [monthKey, group] of byMonth) {
    const [year, month] = monthKey.split('-');
    // Header de mes
    if (y > H - 180) newPage();
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(...hexToRgb(COBALTO));
    doc.text(`${MONTHS[parseInt(month) - 1]} ${year}`, MX, y);
    y += 24;
    doc.setDrawColor(...hexToRgb(COBALTO));
    doc.setLineWidth(0.8);
    doc.line(MX, y, MX + 60, y);
    y += 28;

    for (const e of group) {
      // Saltar página si quedan menos de 130pt
      if (y > H - 140) newPage();

      // Fecha + hora + mood
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(INK_MUTE));
      const dateLine = `${formatLongDate(e.createdAt)} · ${formatTime(e.createdAt)}`;
      doc.text(dateLine, MX, y, { charSpace: 1.2 });
      // Mood en círculo
      doc.setFillColor(...hexToRgb(ACCENT));
      doc.circle(W - MX - 14, y - 4, 14, 'F');
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(14);
      doc.setTextColor(...hexToRgb(CREMA));
      doc.text(String(e.mood), W - MX - 14, y, { align: 'center' });
      y += 14;

      // Emociones (chips inline)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb(COBALTO));
      const emoText = e.emotions.map(emotionLabel).join(' · ');
      doc.text(emoText, MX, y, { charSpace: 1.2 });
      y += 18;

      // Contexto
      if (e.context && e.context.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...hexToRgb(INK_MUTE));
        doc.text(`En contexto · ${e.context.join(' · ')}`, MX, y, { charSpace: 1.1 });
        y += 14;
      }

      // Texto del usuario
      if (e.text && e.text.trim()) {
        doc.setFont('times', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(...hexToRgb(INK));
        const wrapped = doc.splitTextToSize(e.text.trim(), W - MX * 2);
        for (const line of wrapped) {
          if (y > H - 80) newPage();
          doc.text(line, MX, y);
          y += 15;
        }
        y += 4;
      }

      // Separador dashed entre entradas
      doc.setDrawColor(...hexToRgb(RULE));
      doc.setLineDashPattern([3, 3], 0);
      doc.line(MX, y, W - MX, y);
      doc.setLineDashPattern([], 0);
      y += 22;
    }
  }

  // ─── PÁGINA CIERRE ────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(...hexToRgb(COBALTO));
  doc.rect(0, 0, W, H, 'F');

  doc.setTextColor(...hexToRgb(CREMA));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('— PARA LLEVAR —', W / 2, 200, { align: 'center', charSpace: 1.6 });

  doc.setFont('times', 'italic');
  doc.setFontSize(28);
  const closing = [
    'Lo que has escrito',
    'no se ha perdido.',
    '',
    'Tu diario sigue contigo',
    'en diario.egoera.es',
  ];
  let cy = 280;
  for (const line of closing) {
    doc.text(line, W / 2, cy, { align: 'center' });
    cy += 36;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...hexToRgb(CREMA));
  doc.text('egoera · psicología, despacio', W / 2, H - 80, { align: 'center', charSpace: 1.4 });

  // Descargar
  const filename = `egoera-diario-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
