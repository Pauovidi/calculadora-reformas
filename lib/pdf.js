export async function exportarPDF({ input, resultado }) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Presupuesto de Reforma", 14, 18);
  doc.setFontSize(10);
  doc.text(`Ciudad: ${input.ciudad || ""} · Calidad: ${input.calidad || "Estandar"} · Ref m²: ${resultado.refCiudad} €/m²`,14,26);
  autoTable(doc, { startY: 32, head: [["Concepto","Detalle","Importe (€)"]], body: resultado.desglose.map(d=>[d.concepto,d.detalle, Intl.NumberFormat("es-ES").format(d.importe)]), styles:{fontSize:10}, headStyles:{fillColor:[17,24,39]} });
  const y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${Intl.NumberFormat("es-ES").format(resultado.total)} €`, 14, y);
  doc.save("presupuesto_reforma.pdf");
}
