export interface IInfoPersona {
  nIdPersonal: number;
  sNombres: string;
  sTipo: string;
  sDocumento: string;
}

export interface IPlanillaCombo {
  nIdPlla: number;
  sDesc: string;
  sCodPlla: string;
}

export interface IEstadoCombo {
  nEleCod: number;
  cEleCod: string;
  cEleNam: string;
  cEleIni: string;
}

export interface ITrabajador {
  nIdPersonal: number;
  nIdPerLab: number;
  sNombres: string;
  sCiudad: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  dFechIniEm: Date;
  dFechFinEm: Date;
  nIdCitaEM: number;
  nIdExamenM: number;
  nEleCodEstado: number;
  cEleNamEstado: string;
}

export interface IRangoFechasCita {
  nIdRangoEM: number;
  dFechIni: Date;
  dFechFin: Date;
}

export interface IRangoPersonasCantidad {
  nCantidad: number;
  dFecha: Date;
}

export interface IBuscadorPersonaCitaMedica {
  nIdPersonal: number;
  nIdPerLab: number;
  sNombres: string;
  sCiudad: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  dFechIniEm: Date;
  dFechFinEm: Date;
  nIdCitaEM: number;
  nIdExamenM: number;
  nEleCodEstado: number;
  cEleNamEstado: string;
  dFechCita: Date;
}

export interface IPersonaAsignadaCitaMedica {
  nIdPerlab: number;
  nIdCitaEM: number;
  sNombres: string;
  sCodPlla: string;
  sDocumento: string;
  sAbrev: string;
  nIdTipoDoc: number;
  eliminado: boolean;
  nIdExamenM: number;
}

export interface ICitaPorResposablePersonalDetalle {
  nIdCitaEM: number;
  nIdExamenM: number;
  dFecha: Date;
  dFechIni: Date;
  dFechFin: Date;
  sEstado: string;
  nEstado: number;
}
