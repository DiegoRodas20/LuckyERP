export interface IRejectionRuta {
  nIdRuta: number;
  sNombres: string;
  dFecha: Date;
  sResponsable: string;
  sCliente: string;
  nIdEstado: number;
  sEstado: string;
  sObservacion: string;
  sDireccion: string;
  sHoraIni: string;
  sHoraFin: string;
}

export interface IEstadoRutaCombo {
  nEleCod: number;
  cEleCod: string;
  cEleNam: string;
  cEleIni: string;
}
