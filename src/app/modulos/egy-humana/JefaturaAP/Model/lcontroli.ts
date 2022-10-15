export interface ControlIDto {
  dDevengueActual: Date;
  personalList: ControlPersonalDto[];
}
export interface ControlPersonalDto {
  nIdPersonal: number;
  sNombreCompleto: string;
  sCodPlla: string;
  sTipoDocumento: string;
  sDocumento: string;
  sFechaIni: string;
  sFechaFin: string;
  nIdSucursal: number;
  sSucursal: string;
  nIdResponsable: number;
  sResponsable: string;
  nCantIna: number;
  sEstado: string;
  sCelular: string;
  sCorreo: string;
}

export enum EModalControlAbsence {
  NONE,
  REVIEW,
  SEARCH
}

export enum EControlAbsence {
  PLANILLA = 3,
  SUCURSAL = 4,
  ESTADO = 5
}

export enum EControlAbsenceEstado {
  PENDIENTE = 2611,
  APROBADO = 2612,
  DESESTIMADO = 2613
}

export interface ControlAbsenceDto {
  nId: number;
  dFecha: Date;
  sMotivo: string;
  sObservacion: string;
  sUserReg: string;
  nIdEstado: number;
  sRespNombre: string;
  sRespCel: string;
  sRespCorreo: string;
  color: string;
}

export interface ControlAbsenceRequest {
  nIdInasistencia: number;
  nIdEstado: number;
  nCodUser: number;
  sIdPais: string;
}

export interface ControlAbsenceChange {
  sUsuario: string;
  sEstado: string;
  sFechaRegistro: string;
}
