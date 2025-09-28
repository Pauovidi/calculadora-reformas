export default function SummaryCard({ resultado }) {
  if (!resultado) return null;

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Desglose</h3>
        <span className="text-sm">{new Date().toLocaleDateString("es-ES")}</span>
      </div>

      <table className="w-full table-auto text-sm">
        <thead>
          <tr>
            <th className="text-left font-medium py-1.5 px-2 md:px-3">Concepto</th>
            <th className="text-right font-medium py-1.5 px-2 md:px-3">Importe</th>
          </tr>
        </thead>
        <tbody>
          {resultado.desglose.map((d, i) => (
            <tr key={i}>
              <td className="py-1.5 px-2 md:px-3">{d.concepto}</td>
              <td className="py-1.5 px-2 md:px-3 text-right">
                {new Intl.NumberFormat("es-ES").format(d.importe)} €
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="py-1.5 px-2 md:px-3 font-semibold">TOTAL</td>
            <td className="py-1.5 px-2 md:px-3 text-right font-semibold">
              {new Intl.NumberFormat("es-ES").format(resultado.total)} €
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
