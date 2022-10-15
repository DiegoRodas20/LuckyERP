export interface ICabeceraNuevaSolicitudMovilidad {
  numero_movilidad: string;

  solicitante_id: number;
  solicitante: string;

  campania_id: number;
  campania_numero: string;
  campania: string; 
  
  cargo_id: number;
  cargo_codigo: string;
  cargo: string;
  zona: string;

  anio: string;

  fecha_del: string;
  fecha_al: string;

  partida_id: number;
  partida: string;
  partida_codigo: string;

  estado_id: string;
  estado: string;

  creado_por: string;
  enviado_por: string;
  aprobado_por: string;
  terminado_por: string;
}
