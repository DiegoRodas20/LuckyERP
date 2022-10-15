import { CalendarEvent } from "angular-calendar";
import { SecurityErp } from "src/app/modulos/AAHelpers";

export interface MainAbsence {
  // nIdInasistencia: number;
  nIdPersonal: number;
  sNombres: string;
  nIdPlla: number;
  sCodPlla: string;
  // sPllaDescripcion: string;
  nIdTipoDoc: number;
  sTipoDoc: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
  sDevengueActual: string;
  bTieneInasistencia: boolean;
  detalleInasistencias: AbsenceDetail[];
}

export interface AbsenceDetail {
  dFecha: Date;
  sMotivo: string;
}

export interface FilterMain {
  nCompanyId: number;
  nResponsibleId: number;
}

export interface AbsenceHistory {
  dDevengue: Date;
  nNroInasistencias: Number;
  detalleInasistencias: AbsenceDetail[];
}

export interface PersonalGeneralDto {
  dDevengueActual: Date;
  responsable: ResponsableDto;
  personalList: PersonalIDto[];
}

export interface ResponsableDto {
  nIdResponsable: string;
  sNombreCompleto: string;
  sTipoDoc: string;
  sDocumento: string;
}

export interface PersonalIDto {
  nIdPersonal: number;
  sNombreCompleto: string;
  sCodPlla: string;
  sTipoDoc: string;
  sDocumento: string;
  dFechaIni: Date;
  sFechaIni: string;
  dFechaFin: Date;
  sFechaFin: string;
  sSucursal: string;
  sCelular: string;
  sCorreo: string;
  inasistencias: AbsenceDto[];
  eventos: CalendarEvent<AbsenceDto>[];
}

export interface AbsenceDto {
  nId: number;
  dFecha: Date;
  nIdMotivo: number;
  sMotivo: string;
  sObservacion: string;
  sUserReg: string;
  sUserMod: string;
  nIdEstado: number;
  color: string;
}

export enum EModalAbsence {
  NONE,
  CRUD,
  DETAIL
}

export enum EAbsence {
  PLANILLA = 2,
  MOTIVO = 3,
}

export enum EAbsenceAction {
  REGISTRAR,
  MODIFICAR,
  ELIMINAR
}

export interface AbsenceUI {
  nIdMotivo: number;
  sObservacion: string;
}

export class AbsenceRequest {
  nIdPersonal: number;
  nIdResponsable: number;
  dFecha: Date;
  nIdMotivo: number;
  nCodUser: number;
  nIdEmp: number;
  sObservacion: string;
  sIdPais: string;
  nAprobado: boolean;
  constructor(data: AbsenceUI, storage: SecurityErp, nIdPersonal?: number, nIdResponsable?: number, daySelected?: Date) {
    this.nIdPersonal = nIdPersonal ? nIdPersonal : 0;
    this.nIdResponsable = nIdResponsable;
    this.dFecha = daySelected ? daySelected : null;
    this.nIdMotivo = data.nIdMotivo;
    this.nCodUser = Number(storage.getUsuarioId());
    this.nIdEmp = Number(storage.getEmpresa());
    this.sObservacion = data.sObservacion;
    this.sIdPais = storage.getPais();
  }
}

export interface AbsenceHistoricoDto {
  nAnio: number;
  nMes: number;
  dViewdate: Date;
  sDevengue: string;
  nCantIna: number;
  inasistencias: AbsenceDto[];
}