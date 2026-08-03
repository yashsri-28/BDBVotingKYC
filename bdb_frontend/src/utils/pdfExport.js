import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generic PDF export — takes a title, column headers, and row data
 * (array of objects, same shape as what used to go into XLSX.utils.json_to_sheet),
 * and downloads a formatted PDF table.
 */
export function exportToPDF({ title, rows, filename }) {
  if (!rows || rows.length === 0) return false;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });

  // Title + generated-on timestamp at the top of the page
  doc.setFontSize(14);
  doc.text(title, 40, 30);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 45);

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((h) => (row[h] === null || row[h] === undefined ? "" : String(row[h]))));

  autoTable(doc, {
    head: [headers],
    body,
    startY: 55,
    styles: { fontSize: 7, cellPadding: 4 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  return true;
}