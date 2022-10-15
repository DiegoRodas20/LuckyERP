export interface IMain {
  nIdPersonal: number;
  sNombres: string;
  sCodPlla: string;
  nIdTipoDoc: number;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin?: Date;
  sCiudad: string;
  sTipoCta?: string;
  nIdPerLab: number;
}

export interface IDetail {
  nIdDPLB: number;
  nIdBanco: number;
  sBanco: string;
  sNroCuenta: string;
  nIdMoneda: number;
  dFechIni: Date;
  dFechFin: Date;
  nIdTipoCta: number;
  sTipoCta: string;
  nIdTipoDoc: number;
  sDocumento: string;
}

export interface IPersonalExcelImport {
  nIdPersonal: number;
  sNombres: string;
  sAbrev: string;
  sDocumento: string;
  dFechaIniCuenta: Date;
  sNroCuenta: string;
  nIdPlla: number;
  sObservacion: string;
  nStatus: number;
  nIdPerLab: number;
  dFechaFinCuenta: Date;
  nIdTipoDoc: number;
}

export interface IPersonalImportReplace {
  nIdPersonal: number;
  sNombres: string;
  sDocumento: string;
  sAbrev: string;
  dFechIni: Date;
  nIdPlla: number;
  sNroCuenta: string;
  nIdPerLab: number;
  nIdTipoDoc: number;
  sAbrevBanco: string;
  dFechIniCuenta: Date;
}
