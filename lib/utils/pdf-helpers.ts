import jsPDF from 'jspdf';

/**
 * Download PDF file to user's device
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

/**
 * Open PDF in new browser window/tab
 */
export function openPDFInNewWindow(doc: jsPDF) {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}
