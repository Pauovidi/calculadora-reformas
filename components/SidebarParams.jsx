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

export default function SidebarParams({ params, setParams }) {
  const [local, setLocal] = useState(params || defaultParams);

  // Permite escribir vaciando el input (no fuerza 0 al escribir)
  const update = (path, raw) => {
    const next = JSON.parse(JSON.stringify(local));
    const segs = path.split(".");
    let ptr = next;
    for (let i = 0; i < segs.length - 1; i++) ptr = ptr[segs[i]];

    // si el campo queda vacío, guardamos "" temporalmente para no pelear con el teclado
    const val = raw === "" ? "" : parseFloat(raw);
    ptr[segs.at(-1)] = Number.isFinite(val) ? val : raw; // guarda número o string vacío

    setLocal(next);
    setParams?.(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Ciudad por defecto</label>
        <select
          className="select"
          value={local.ciudadPorDefecto}
          onChange={(e) => update("ciudadPorDefecto", e.target.value)}
        >
          {Object.keys(local.referenciaCiudad).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
              onChange={(e) => update(`precios.${k}`, e.target.value)}
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
              onChange={(e) => update(`factorCalidad.${k}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Referencias €/m²: 2 ciudades por fila */}
      <div className="space-y-2">
        <label className="label">Referencias (€/m²)</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(local.referenciaCiudad).map(([city, val]) => (
            <div key={city} className="flex items-end gap-2">
              <label className="text-sm flex-1">{city}</label>
              <input
                className="input w-24"
                type="number"
                step="1"
                value={val}
                onChange={(e) => update(`referenciaCiudad.${city}`, e.target.value)}
              />
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
