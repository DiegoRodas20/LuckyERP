export interface Concepto {
  id: string;
  dsc: string;
  importe: number;
}

export interface ListaPersonal {
  nId: number;
  sCodPlla: string;
  sTipo: string;
  sDocumento: string;
  sNombres: string;
  dFechIni: Date;
  dFechFin?: Date;
  sCategoria: string;
}

export interface DatosPostulante {
  nPerCod: number;
  nIdTipoDoc: number;
  cIdeNum: string;
  cFirLasNam: string;
  cSecLasNam: string;
  cFirNam: string;
  cSecNam: string;
  dBirDay: Date;
  nGenCod: number;
  nMsCod: number;
  nNatCode: number;
  cPhoneCel: string;
  cEmailMain: string;
  cAddress: string;
  cRef: string;
  cAddGeoLoc: string;
  nIdTipoCC: number;
  nIdCentroCosto: number;
  sCentroCosto: string;
  sCliente: string;
  nIdSupervisor: number;
  nIdPlla: number;
  nIdCargo: number;
  dFecha: Date;
  nIdCliente: number;
}

export interface DatosPlanilla {
  nPerCod: number;
  sNombres: string;
}

export interface IComboCentroCosto {
  cEleCod: string;
  cEleIni: string;
  cEleNam: string;
  nEleCod: number;
}

export interface IComboResponsable {
  nIdResp_: number;
  sNombres: string;
}

// export interface ListaPersonal {
//   codPostulante: number;
//   nIdPlla: number;
//   sCodPlla: string;
//   tipDoc: string;
//   numDoc: string;
//   apePat: string;
//   apeMat: string;
//   primNom: string;
//   segNom: string;
//   nFecIni: Date;
//   estado: string;
// }
