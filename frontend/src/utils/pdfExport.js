/**
 * Shared PDF export utility for the Transport System.
 * Provides a standardized header and table generation consistent
 * with the existing export pattern in Asignaciones.jsx / Alertas.jsx.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND_COLOR = [3, 36, 72];   // Deep navy  (rgb)
const ACCENT_COLOR = [0, 109, 199]; // Primary blue (rgb)

/**
 * Build a PDF document with a professional branded header.
 * @param {string} title   - Module name (e.g. "GREMIOS Y FEDERACIONES")
 * @param {string} subtitle - Optional subtitle / description line
 * @param {string} systemName - System name from branding config
 * @param {number} totalRecords
 * @returns {{ doc: jsPDF, startY: number }}
 */
export function buildPdfHeader(title, subtitle, systemName = 'TRANSPORTE ARAGUA DIGITAL', totalRecords = 0) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // ── Header band ──────────────────────────────────────────────────
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent stripe
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(0, 38, pageWidth, 2, 'F');

  // System name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(systemName.toUpperCase(), 14, 18);

  // Report title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`REPORTE: ${title}`, 14, 28);

  if (subtitle) {
    doc.setFontSize(7.5);
    doc.text(subtitle, 14, 35);
  }

  // Date (right-aligned)
  doc.setTextColor(200, 220, 255);
  doc.setFontSize(8);
  doc.text(date, pageWidth - 14, 20, { align: 'right' });

  // Meta: total records
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(14, 46, pageWidth - 28, 12, 2, 2, 'F');
  doc.setTextColor(30, 30, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de registros: ${totalRecords}`, 19, 54);

  const startY = 65;
  return { doc, startY };
}

/**
 * Append an autoTable and save the PDF.
 * @param {jsPDF} doc
 * @param {number} startY
 * @param {string[][]} head  - Array of column header strings
 * @param {string[][]} body  - Array of row data arrays
 * @param {string} filename  - Output filename without path
 */
export function addTableAndSave(doc, startY, head, body, filename, extraOptions = {}) {
  autoTable(doc, {
    head: [head],
    body,
    startY,
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 248, 255]
    },
    styles: {
      overflow: 'linebreak',
      lineColor: [210, 220, 240],
      lineWidth: 0.1
    },
    didDrawPage: (data) => {
      // Footer on each page
      const pWidth = doc.internal.pageSize.getWidth();
      const pHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(...BRAND_COLOR);
      doc.rect(0, pHeight - 10, pWidth, 10, 'F');
      doc.setTextColor(180, 200, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Secretaría de Transporte – Gobernación del Estado Aragua · Documento generado automáticamente · Confidencial', pWidth / 2, pHeight - 3.5, { align: 'center' });
    },
    ...extraOptions
  });

  doc.save(filename);
}
