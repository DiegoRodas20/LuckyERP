export interface IInformacionResponsable {
  nIdPersonal: number;
  sNombres: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
}

export interface IInformacionPersonal {
  nIdPersonal: number;
  nIdPerlab: number;
  sNombres: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
}

export interface IDevengue {
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstado: number;
}

export interface IPlanillaCombo {
  nIdPlla: number;
  sDesc: string;
  sCodPlla: string;
}

export interface ICiudadCombo {
  nIdTipEle: number;
  sCod: string;
  sDesc: string;
}

export interface IEstadoExamenCombo {
  nEleCod: number;
  cEleNam: string;
}

export interface ITipoCombo {
  nEleCod: number;
  cEleCod: string;
  cEleNam: string;
  nEleCodDad: number;
}

export interface IDireccionClienteCombo {
  nIdTipoCC: number;
  nIdOrganizacion: number;
  sOrganizacion: string;
}

export interface ICitaExamenPersonal {
  nIdCitaEm: number;
  nIdPerLab: number;
  nIdRangoEM: number;
  dFecha: Date;
}

export interface IExamenMedicoInfo {
  nIdExamenM: number;
  nIdCitaEM: number;
  nIdPerlab: number;
  sFileSustento: string;
  dFechIni: Date;
  dFechFin: Date;
  dFechCita: Date;
}
