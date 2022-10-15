export interface ListaPuntosU {
  nIdDPP: number;
  nIdAsistencia: number;
  nIdRuta: number;
  sDireccion: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
  sFileSustento: string;
  nLatitud: number;
  nLongitud: number;
  nIdEstado: number;
  dFechaAsistencia: Date;
  nIdJustificacion: number;
  nIdGestion: number;
}

export interface IDatoAsistencia {
  nIdPlanning: number;
  sResponsable: string;
  dFecha: Date;
  sHoraIni: string;
  sHoraFin: string;
  sCliente: string;
}

export interface IInfoPuntoAsistencia {
  sResponsable: string;
  sCliente: string;
  dFecha: Date;
  sDireccion: string;
  sFileSustento: string;
  nIdEstado: number;
  nIdJustificacion: number;
}

export interface IJustificacionCombo {
  nIdJustificacion: number;
  sJustificacion: string;
}

export interface IGestionCombo {
  nIdGestion: number;
  sGestion: string;
}
