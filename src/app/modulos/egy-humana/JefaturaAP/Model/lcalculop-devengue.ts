export interface DevengueQuery{
  nIdPlla: number;
  nIdRemu: number;
  nIdRegPen: number;
  nIdSuc: number;
}

export interface IPersonalDto {
  nIdPersonal: number;
  sNombre: string;
  sDocumento: string;
  nIdPlanilla: number;
  nRegimen: number;
  sRegPension: string;
  nIdTipoRemu: number;
  sTipoRemu: string;
  nIdSucursal: number;
  sSucursal: string;
  nTotalIngreso: number;
  nTotalDescuento: number;
  nTotalNeto: number;
  concepts: IConceptDto[];
}

export interface IConceptDto {
  nIdPersonal: number;
  nIdConcepto: number;
  sConcepto: string;
  nUnidad: number;
  nImporte: number;
  nValor: number;
}

export interface PeriodoDto {
  nIdDevengue: number;
  nAnio: number;
  sMes: string;
  periodos: PeriodoDev[];
}

export interface PeriodoDev {
  nAnio: number;
  detail: PeriodoDeta[];
}

export interface PeriodoDeta {
  nIdDevengue: number;
  sMes: string;
  nIdEstado: number;
  dFechaInicio: Date;
}

export enum EDevengue {
  PLANILLA = 4,
  REMUNERACION_TIPO = 5,
  REGIMEN_PENSIONARIO = 6,
  SUCURSAL = 7
}

export interface PersonalResponse {
  nIdPersonal: number;
  sFileBoleta: string;
}