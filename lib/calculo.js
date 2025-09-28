export function calcularPresupuesto(input, params){
  const p=params.precios;
  const f=params.factorCalidad[input.calidad||"Estandar"]??1;
  const ref=params.referenciaCiudad[input.ciudad||params.ciudadPorDefecto]??25;
  const precioM2=(input.precioBaseM2&&input.precioBaseM2>0)?input.precioBaseM2:ref;
  const manoObra=(Number(input.m2)||0)*precioM2;
  const derribo=(input.derribo_importe&&input.derribo_importe>0)?Number(input.derribo_importe):(input.incluirDerribo?(p.derribo_base??0):0);
  const alic=(m2,apl,mat)=>(Number(m2)||0)*((Number(apl)||0)+(Number(mat)||0));
  const alicSuelo=alic(input.alic_suelo_m2,input.alic_suelo_apl,input.alic_suelo_mat);
  const alicCocina=alic(input.alic_cocina_m2,input.alic_cocina_apl,input.alic_cocina_mat);
  const alicBano=alic(input.alic_bano_m2,input.alic_bano_apl,input.alic_bano_mat);
  const alicatados=alicSuelo+alicCocina+alicBano;
  const falsoTecho=(Number(input.falsoTecho_m2)||0)*(p.falsoTecho_m2??0);
  const falsoTechoTec=(Number(input.falsoTechoTec_m2)||0)*(p.falsoTechoTecnico_m2??0);
  const habitaciones=(Number(input.numHabitaciones)||0)*(p.habitacion_fija??0);
  const cocinaFija=input.cocina?(p.cocina_fija??0):0;
  const fontaneria=input.incluirFontaneria?(p.fontaneria_base??0):0;
  const electricidad=input.incluirElectricidad?(p.electricidad_base??0):0;
  let tabiqueria=0;
  if(input.tabiqueria_tipo==="Obra"){tabiqueria=(Number(input.tabiqueria_m2)||0)*(p.tabiqueria_obra_m2??0);}
  else if(input.tabiqueria_tipo==="Pladur"){tabiqueria=(Number(input.tabiqueria_m2)||0)*(p.tabiqueria_pladur_m2??0);}
  const subtotal=manoObra+derribo+alicatados+falsoTecho+falsoTechoTec+habitaciones+cocinaFija+fontaneria+electricidad+tabiqueria;
  const total=Math.round(subtotal*f);
  const desglose=[
    {concepto:"Mano de obra",detalle:`${input.m2||0} m² × ${precioM2} €/m²`,importe:manoObra},
    {concepto:"Derribo",detalle:derribo?"Incluido":"No",importe:derribo},
    {concepto:"Alicatados",detalle:`Suelo ${alicSuelo}€, Cocina ${alicCocina}€, Baño ${alicBano}€`,importe:alicatados},
    {concepto:"Falso techo",detalle:`${input.falsoTecho_m2||0} m² × ${(p.falsoTecho_m2??0)} €/m²`,importe:falsoTecho},
    {concepto:"Falso techo técnico",detalle:`${input.falsoTechoTec_m2||0} m² × ${(p.falsoTechoTecnico_m2??0)} €/m²`,importe:falsoTechoTec},
    {concepto:"Habitaciones",detalle:`${input.numHabitaciones||0} × ${(p.habitacion_fija??0)} €`,importe:habitaciones},
    {concepto:"Cocina",detalle:input.cocina?`1 × ${(p.cocina_fija??0)} €`:"No",importe:cocinaFija},
    {concepto:"Fontanería",detalle:input.incluirFontaneria?`Base ${(p.fontaneria_base??0)} €`:"No",importe:fontaneria},
    {concepto:"Electricidad",detalle:input.incluirElectricidad?`Base ${(p.electricidad_base??0)} €`:"No",importe:electricidad},
    {concepto:"Tabiquería",detalle:input.tabiqueria_tipo?`${input.tabiqueria_tipo} — ${input.tabiqueria_m2||0} m²`:"N/A",importe:tabiqueria},
    {concepto:"Subtotal",detalle:"",importe:Math.round(subtotal)},
    {concepto:"Factor acabados",detalle:`${input.calidad||"Estandar"} (${f}x)`,importe:Math.round(subtotal*(f-1))}
  ];
  return { total, subtotal, factor:f, desglose, refCiudad:precioM2 };
}
