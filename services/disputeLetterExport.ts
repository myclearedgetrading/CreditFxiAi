import { jsPDF } from 'jspdf';

/** Download dispute letter text as a print-ready PDF (US Letter, multi-page). */
export function downloadDisputeLetterPdf(body: string, filenameBase: string): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 14;
  const lines = doc.splitTextToSize(body, maxWidth);

  let y = margin;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(`${filenameBase}.pdf`);
}
