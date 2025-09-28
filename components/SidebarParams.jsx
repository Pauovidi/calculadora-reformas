import { useState } from "react";

const defaultParams = {
  precios: {
    falsoTecho_m2: 25,
    falsoTechoTecnico_m2: 40,
    tecnico_hora: 30,
    habitacion_fija: 500,
    cocina_fija: 3000,
    tabiqueria_obra_m2: 50,
    tabiqueria_pladur_m2: 35,
    derribo_base: 500,
    fontaneria_base: 0,
    electricidad_base: 0,
  },
  factorCalidad: { Basico: 1, Estandar: 1.15, Premium: 1.25 },
  referenciaCiudad: { madrid: 55, barcelona: 50, valencia: 40, sevilla: 38 },
  ciudadPorDefecto: "valencia",
};

// util para setear valores por path "a.b.c"
const setAt = (obj, path, value) => {
  const segs = path.split(".");
  let ptr = obj;
  for (let i = 0; i < segs.length - 1; i++) ptr = ptr[segs[i]];
  ptr[segs.at(-1)] = value;
};

export default function SidebarParams({ params, setParams }) {
  // guardamos una copia "local" que acepta strings durante la edición
  const [local, setLocal] = useState(params || defaultParams);

  // onChange: permite escribir (incluido vacío) sin forzar 0
  const updateRaw = (path, raw) => {
    const next = JSON.parse(JSON.stringify(local));
    setAt(next, path, raw);
    setLocal(next);
  };

  // onBlur: consolida a número (o 0) y propaga a setParams
  const commitNumber = (path) => {
    const next = JSON.parse(JSON.stringify(local));
    const segs = path.split(".");
    let ptr = next;
    for (let i = 0; i < segs.length - 1; i++) ptr = ptr[segs[i]];
    const k = segs.at(-1);
    const n = parseFloat(ptr[k]);
    ptr[k] = Number.isFinite(n) ? n : 0;
    setLocal(next);
    setParams?.(next);
  };

  // chunk de 2 en 2: garantiza 2 ciudades por fila SIEMPRE
  const cityEntries = Object.entries(local.referenciaCiudad);
  const pairs = [];
  for (let i = 0; i < cityEntries.length; i += 2) {
    pairs.push(cityEntries.slice(i, i + 2));
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Ciudad por defecto</label>
        <select
          className="select"
          value={local.ciudadPorDefecto}
          onChange={(e) => {
            const next = JSON.parse(JSON.stringify(local));
            next.ciudadPorDefecto = e.target.value;
            setLocal(next);
            setParams?.(next);
          }}
        >
          {Object.keys(local.referenciaCiudad).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Precios */}
      <div className="grid md:grid-cols-2 gap-3">
        {Object.entries(local.precios).map(([k, v]) => (
          <div key={k}>
            <label className="label">{k.replaceAll("_", " ")}</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={v}
              onChange={(e) => updateRaw(`precios.${k}`, e.target.value)}
              onBlur={() => commitNumber(`precios.${k}`)}
            />
          </div>
        ))}
      </div>

      {/* Factores */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(local.factorCalidad).map(([k, v]) => (
          <div key={k}>
            <label className="label">Factor {k}</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={v}
              onChange={(e) => updateRaw(`factorCalidad.${k}`, e.target.value)}
              onBlur={() => commitNumber(`factorCalidad.${k}`)}
            />
          </div>
        ))}
      </div>

      {/* Referencias €/m² — 2 ciudades por fila, 100% fiable */}
      <div className="space-y-2">
        <label className="label">Referencias (€/m²)</label>

        <div className="space-y-3">
          {pairs.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              {row.map(([city, val]) => (
                <div key={city} className="flex items-end gap-2">
                  <label className="text-sm flex-1">{city}</label>
                  <input
                    className="input w-24"
                    type="number"
                    step="1"
                    value={val}
                    onChange={(e) => updateRaw(`referenciaCiudad.${city}`, e.target.value)}
                    onBlur={() => commitNumber(`referenciaCiudad.${city}`)}
                  />
                </div>
              ))}
              {/* si la fila tiene 1 ciudad (número impar), dejamos un hueco vacío */}
              {row.length === 1 && <div />}
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn w-full"
        onClick={() => {
          setLocal(defaultParams);
          setParams?.(defaultParams);
        }}
      >
        Restablecer por defecto
      </button>
    </div>
  );
}

export { defaultParams };
