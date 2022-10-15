export interface Detalle_CCPresS {
  nIdDCCPreS: number;
  nIdCCS: number;
  nIdPartida: number;
  sCodPartida?: string;
  sDescPartida: string;
  nImporte: number;
  nResguardo: number;
}

export interface Sucursal_CC {
  nId: number;
  nIdSucursal: number;
  sCodSucursal: string;
  sSucursal: string;
  sEstado: string;
  nPresupuesto: number;
  sUsrCreado: string;
  sFechaCreado: string;
  sUsrModifico: string;
  sFechaModificado: string;
}

export interface Presupuesto_Mensual {
  nId: number;
  nIdPartida: number;
  sCodPartida: string;
  sPartida: string;
  nResguardo: number;
  nRepartir: number;
  nImporte: number;
  nEnero: number;
  nFebrero: number;
  nMarzo: number;
  nAbril: number;
  nMayo: number;
  nJunio: number;
  nJulio: number;
  nAgosto: number;
  nSetiembre: number;
  nOctubre: number;
  nNoviembre: number;
  nDiciembre: number;
}

export interface GastosPartida {
  nEnero: number;
  nFebrero: number;
  nMarzo: number;
  nAbril: number;
  nMayo: number;
  nJunio: number;
  nJulio: number;
  nAgosto: number;
  nSeptiembre: number;
  nOctubre: number;
  nNoviembre: number;
  nDiciembre: number;
}

export interface Detalle_CCPresSMes {
  nIdDetCCSMes: number;
  nIdDetCCS: number;
  nIdMes: number;
  sCodMes: string;
  sDescMes: string;
  nImporte: number;
  nGasto?: number;
  nMinimo?: number;
}

export interface Partida {
  nIdPartida: number;
  sCodPartida: string;
  sDescPartida: string;
}

export interface TipoPartida {
  nIdPartida: number;
  sCodPartida: string;
  sDescPartida: string;
}

export interface CentroCosto_Asig {
  nIdCC: number;
  sCodCC: string;
  sDescCC: string;
  nImporte: number;
  nImplemento: number;

  //Direccion
  nIdDireccion: number;
  sCodDireccion: string;
  sDescDireccion: string;

  //Area
  nIdArea: number;
  sCodArea: string;
  sDescArea: string;

  //Cargo
  nIdCargo: number;
  sCodCargo: string
  bEstadoCargo: number;
  sDescCargo: string;

  nSubCargo: number;
  sSubCargo: string;
  sFechaIni: string;
  sFechaFin: string;

  //Moneda
  nIdMoneda: number;
  sCodMoneda: string;
  bEstadoMoneda: string;
  sDescMoneda: string;
  sAbrevMoneda: string;

  nEstadoCC: number;
  sEstadoCC: string;

  //Usuario que lo creo
  nIdUsr_C: number;
  sNombreUsr_C: string;
  sFechaCreacion: string;

}

export interface Anio {
  sAnio: string;
}
