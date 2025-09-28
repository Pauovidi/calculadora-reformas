export default function SummaryCard({ resultado }){
  if(!resultado) return null;
  return (<div className="card">
    <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Desglose</h3><span className="text-sm">{new Date().toLocaleDateString("es-ES")}</span></div>
    <table className="table"><thead><tr><th>Concepto</th><th className="text-right">Importe</th></tr></thead><tbody>
      {resultado.desglose.map((d,i)=>(<tr key={i}><td>{d.concepto}</td><td className="text-right">{new Intl.NumberFormat("es-ES").format(d.importe)} €</td></tr>))}
    </tbody><tfoot><tr><td className="font-semibold">TOTAL</td><td className="text-right font-semibold">{new Intl.NumberFormat("es-ES").format(resultado.total)} €</td></tr></tfoot></table>
  </div>);
}
