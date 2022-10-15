export interface Parametro {
  nIdParametro: number;
  sIdPais: string;
  bNotaMismoDia: number;
  bHoraBloqueoDia: number;
  sHoraTopeDia: string;
  bNotaSabado: number;
  bHoraBloqueoSabado: number;
  sHoraTopeSabado: string;
  bNotaDomingo: number;
  bHoraBloqueoDomingo: number;
  sHoraTopeDomingo: string;
  bCierreAutomatico: number;
  nCierreAutoTiempo: number;
  nTaxiPeso: number;
  nTaxiVolumen: number;
  nAlmacenMovilPrecio: number;
  nAlmacenMovilPeso: number;
}

export interface AlmacenParametros {
  nIdDetParamCentroAlmacen: number;
  nIdParametro: number;
  nIdAlmacen: string;
  sCodAlmacen: string;
  sDescripcion: string;
  sEstado: string;
}

export interface PresupuestoParametros {
  nIdDetParamCentroAlmacen: number;
  nIdParametro: number;
  nIdCentroCosto: number;
  nIdCodigo: string;
  sDescripcion: string;
  sNombreComercial: string;
  sEstado: string;
}

export interface costos {}
