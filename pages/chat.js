import { useEffect, useMemo, useRef, useState } from "react";
import { calcularPresupuesto } from "@/lib/calculo";
import SummaryCard from "@/components/SummaryCard";
import SidebarParams, { defaultParams } from "@/components/SidebarParams";

const steps = [
  { key: "ciudad", label: "¿En qué ciudad es la reforma?", type: "select", optionsFrom: (p)=>Object.keys(p.referenciaCiudad) },
  { key: "calidad", label: "¿Qué nivel de calidad buscas?", type: "chips", options: ["Basico", "Estandar", "Premium"] },
  { key: "m2", label: "¿Cuántos m² tiene?", type: "number", placeholder: "Ej. 100" },
  { key: "incluirDerribo", label: "¿Incluimos derribo base?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "tabiqueria_tipo", label: "¿Tabiquería de Obra o Pladur?", type: "chips", options: ["Obra","Pladur","Ninguna"] },
  { key: "tabiqueria_m2", label: "¿Cuántos m² de tabiquería?", type: "number", placeholder: "0 si no aplica" },
  { key: "cocina", label: "¿Incluye cocina fija?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "numHabitaciones", label: "¿Número de habitaciones?", type: "number" },
  { key: "falsoTecho_m2", label: "¿m² de falso techo?", type: "number" },
];

export default function Chat(){
  // Evita hidratos raros: inicializamos sin undefined
  const [params, setParams]   = useState(defaultParams);
  const [openParams]          = useState(false); // lo plegamos desde <details>
  const [idx, setIdx]         = useState(0);
  const [messages, setMsgs]   = useState([]);
  const [composer, setComp]   = useState("");

  const [input, setInput] = useState({
    ciudad: defaultParams.ciudadPorDefecto,
    calidad: "Estandar",
    m2: 0,
    incluirDerribo: false,
    tabiqueria_tipo: "Ninguna",
    tabiqueria_m2: 0,
    cocina: false,
    numHabitaciones: 0,
    falsoTecho_m2: 0,
  });

  const current = steps[idx] || null;
  const endRef = useRef(null);

  // Si no hay mensajes, arrancamos con la 1ª pregunta
  useEffect(() => {
    if (messages.length === 0 && steps.length > 0) {
      setMsgs([{ role: "bot", text: steps[0].label }]);
    }
  }, [messages.length]);

  // Auto-scroll
  useEffect(() => {
    try { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); } catch {}
  }, [messages]);

  // Cálculo
  const resultado = useMemo(() => {
    try {
      return calcularPresupuesto(
        {
          ...input,
          tabiqueria_tipo: input.tabiqueria_tipo === "Ninguna" ? "" : input.tabiqueria_tipo,
        },
        params
      );
    } catch {
      return { total: 0, desglose: [] };
    }
  }, [input, params]);

  // Helpers
  const pushBot = (i) => {
    const s = steps[i]; if (!s) return;
    setMsgs((m) => m.concat({ role: "bot", text: s.label }));
  };

  const normalizeFromText = (step, raw) => {
    if (!step) return raw;
    const txt = String(raw).trim();
    if (step.type === "number") return Number(txt) || 0;
    if (step.type === "chips") {
      const match = (step.options || []).find((o) => o.toLowerCase() === txt.toLowerCase());
      return step.map ? step.map(match || txt) : (match || txt);
    }
    if (step.type === "select") {
      const opts = step.optionsFrom ? step.optionsFrom(params) : (step.options || []);
      const match = opts.find((o) => o.toLowerCase() === txt.toLowerCase());
      return match || txt;
    }
    return txt;
  };

  const handleAnswer = (raw) => {
    const s = steps[idx]; if (!s) return;
    const value = normalizeFromText(s, raw);
    setInput((prev) => ({ ...prev, [s.key]: value }));
    setMsgs((m) => m.concat({ role: "user", text: String(raw) }));

    const next = idx + 1;
    setIdx(next);
    if (next < steps.length) pushBot(next);
    else setMsgs((m) => m.concat({ role: "bot", text: "¡Listo! Ya tengo todo para calcular tu presupuesto." }));

    setComp("");
  };

  const goBack = () => {
    if (idx === 0) return;
    // reconstruimos quitando la última pareja (user + bot)
    setMsgs((m) => {
      const arr = m.slice();
      // quitar mensaje "¡Listo!" si está al final
      if (arr.length && arr[arr.length - 1].role === "bot" && String(arr[arr.length - 1].text).startsWith("¡Listo!")) {
        arr.pop();
      }
      // quitar último user
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].role === "user") { arr.splice(i, 1); break; }
      }
      // quitar último bot
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].role === "bot") { arr.splice(i, 1); break; }
      }
      return arr;
    });
    setIdx((i) => (i > 0 ? i - 1 : 0));
  };

  const handlePDF = async () => {
    const { exportarPDF } = await import("@/lib/pdf");
    await exportarPDF({ input, resultado });
  };

  // UI
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button className="btn" onClick={goBack} disabled={idx === 0}>← Atrás</button>
        <button className="btn btn-primary" onClick={handlePDF}>Export PDF</button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Chat */}
        <section className="space-y-4">
          <div className="card p-0 flex flex-col h-[70vh]">
            {/* mensajes */}
            <div className="flex-1 overflow-y-auto px-4 pt-4">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[80%] ${m.role === "user" ? "bg-slate-900 text-white" : "bg-gray-100"}`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {/* chips o select del paso actual */}
              {current && current.type === "chips" && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {current.options.map((opt) => (
                    <button key={opt} className="chip" onClick={() => handleAnswer(opt)}>{opt}</button>
                  ))}
                </div>
              )}
              {current && current.type === "select" && (
                <div className="mb-3">
                  <select
                    className="select max-w-xs"
                    value={input[current.key]}
                    onChange={(e) => handleAnswer(e.target.value)}
                  >
                    {(current.optionsFrom ? current.optionsFrom(params) : current.options || [])
                      .map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* composer SIEMPRE visible */}
            <div className="border-t bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder={current?.placeholder || "Escribe tu respuesta…"}
                  value={composer}
                  onChange={(e) => setComp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAnswer(composer); }}
                />
                <button className="btn btn-primary" onClick={() => handleAnswer(composer)}>Enviar</button>
              </div>
            </div>
          </div>
        </section>

        {/* Derecha: precio + desglose + parámetros */}
        <aside className="space-y-6">
          <div className="rounded-2xl p-5 bg-slate-900 text-white shadow-soft">
            <div className="text-sm opacity-80 mb-2">Presupuesto estimado</div>
            <div className="text-4xl font-bold mb-1">
              {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(resultado?.total || 0)} €
            </div>
            <div className="text-xs opacity-80">Con parámetros actuales.</div>
          </div>

          <SummaryCard resultado={resultado} />

          <details className="rounded-2xl bg-gray-100 border">
            <summary className="px-4 py-3 cursor-pointer select-none font-semibold">Parámetros</summary>
            <div className="p-4">
              <SidebarParams params={params} setParams={setParams} />
            </div>
          </details>
        </aside>
      </div>
    </>
  );
}
