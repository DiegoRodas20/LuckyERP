export interface IList {
  codDevengue: string;
  codPlla: string;
  glosa: string;
  totalDebe: string;
  totalHaber: string;
  planilla: string;
  codigo: string;
  asiento: string;
  fecha: string;
  cuentaContable: string;
  centroCosto: string;
  sTipo;
}
export interface IDetail {
  codigo: string;
  centroCosto: string;
  codCentroCosto: string
  cuentaContable: string;
  importe: string;
}
export interface Icalcular {
  codPlla: string;
  glosa: string;
  totalDebe: string;
  totalHaber: string;
  planilla: string;
  codigo: string;
  asiento: string;
  fecha: string;
  cuentaContable: string;
  centroCosto: string;
  sTipo;
}
export interface ICalcDetalle {
  codigo: string;
  centroCosto: string;
  codCentroCosto: string
  cuentaContable: string;
  importe: string;
}
export interface IMantenimiento{
  codigo: string;
  codPlla: string;
  planilla: string;
  codConcepto: string;
  concepto: string;
  tipo: boolean;
  cuentaContable: string;
}
export class IMatriz
{
  constructor(
    public codigo?: number,
    public codPlla?: string,
    public codConcepto?: string,
    public tipo?: boolean,
    public aTipo?: string,
    public cuentaContable?: string,
    public accion?: string
  ){}
}
export interface IDevengue {
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstado: number;
}

export interface IConcepto {
  codDevengue: string;
  codPlla: string;
  planilla: string;
  totalConcepto: string;
  totalImporte: string;
}

export interface IDetConcepto {
  codPlla: string;
  concepto: string;
  codConcepto: string;
  importe: string;
}

