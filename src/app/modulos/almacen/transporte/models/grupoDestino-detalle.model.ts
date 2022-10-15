export interface GRUPO_DESTINO_DETALLE {
  // nIdOperMov: number;
  // nIdDetGrupDesti: number;
  nIdGrupo: number;
  nPunto: number;
  sPunto: string;
  sNroTransporte: string;
  sCadenaOrigen: string;
  sSucursalOrigen: string;
  sCadenaDestino: string;
  sSucursalDestino: string;
  sCono: string;
  sColor: string;
  nCantidad: number;
  nPeso: number;
  nVolumen: number;
  sZona: string;
  sHora: string;
}

export interface Datos_Guia{
  sNumero: string;
  sFecha: string;
  sEstado: string;
  nIdGrupo: number;
  nPunto: number;
  sPunto: string;
  sOrigen: string;
  sDestino: string;
}
