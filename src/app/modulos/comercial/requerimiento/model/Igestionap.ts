export interface IPlanning {
  nIdPlanning: number;
  dFecha: Date;
  nIdPersonal: number;
  sNombres: string;
  sCodPlla: string;
  sTipo: string;
  sDocumento: string;
  dFechIni: Date;
  sEstado: string;
}

export interface IPuntosA {
  nIdDetPlanning: number;
  sDireccion: string;
  nLatitud_A: number;
  nLongitud_A: number;
  sFileSustento: string;
  nLatitud_P: number;
  nLongitud_P: number;
  nIdEstado: number;
  sObservacion?: string;
}

export interface IInfoPersonal {
  nIdPersonal: number;
  sNombres: string;
  sTipoDoc: string;
  sDocumento: string;
}

export interface IInfoAsistencia {
  sResponsable: string;
  dFecha: Date;
  sHoraIni: string;
  sHoraFin: string;
  sCliente: string;
}

export interface IAsistenciaPersonalDataBruta {
  nIdPlanning: number;
  nIdRuta: number;
  nIdAsistencia: number;
  nIdPersonal: number;
  dFecha: Date;
  nIdDia: number;
  sAsistenciaDia: string;
  sNombres: string;
  sCodPlla: string;
  sDescPlla: string;
  sAbrev: string;
  sDesc: string;
  sDocumento: string;
  dFechIni: Date;
  nIdEstado: number;
  sRutaEstado: string;
  nIdJustificacion: number;
  nIdGestion: number;
  sFileSustento: string;
}

export interface IDatosAsistencia {
  dFecha: Date;
  sHoraIni: string;
  sHoraFin: string;
  sResponsable: string;
  sCliente: string;
}

export interface IPuntoAsistencia {
  nIdRuta: number;
  nIdTienda: number;
  sDireccion: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
  nIdEstado: number;
  puntoVisualizado: boolean;
  modificable: boolean;
  sFileSustento: string;
  nIdJustificacion: number;
  nIdGestion: number;
  sTexto: string;
  sJustificacion: string;
  sGestion: string;
}

export interface IInfoPuntoAsistencia {
  nIdRuta: number;
  nLatitud: number;
  nLongitud: number;
  sFileSustento: string;
}

export interface IInfoAsistenciaTiendaRuta {
  nIdTienda: number;
  nTiendaLatitud: number;
  nTiendaLongitud: number;
  nIdRuta: number;
  nRutaLatitud: number;
  nRutaLongitud: number;
  sFileSustento: string;
  nIdEstado: number;
}

export interface IJustificacionPuntoAsistencia {
  nIdTienda: number;
  nIdRuta: number;
  nIdAsistencia: number;
  nIdDPP: number;
  sDireccion: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
}

export interface IPlanillaCombo {
  nIdPlla: number;
  sDesc: string;
  sCodPlla: string;
}

export interface IEstadoCombo {
  nIdEstado: number;
  sDesc: string;
}

export interface IJustificacionCombo {
  nIdJustificacion: number;
  sJustificacion: string;
}

export interface IGestionCombo {
  nIdGestion: number;
  sGestion: string;
}
