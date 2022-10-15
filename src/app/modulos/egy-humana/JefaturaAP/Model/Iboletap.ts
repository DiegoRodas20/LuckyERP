import { ISelectItem } from "src/app/modulos/AAHelpers";

export interface PersonalDto {
  trabajador: TrabajadorDto;
  boletas: BoletaDevengueDto[];
  anios: ISelectItem[];
}

export interface BoletaDevengueDto {
  nOrden: number;
  nId: number;
  nAnio: number;
  sMes: string;
  nIngreso: number;
  nDescuento: number;
  nNeto: number;
  sFileBoleta: string;
  nCantView: number;
}

export interface TrabajadorDto {
  sTipoDocumento: string;
  sNumeroDocumento: string;
  sNombreCompleto: string;
  nCodPlanilla: number;
  sFechaIngreso: string;
  sFechaCese: string;
}

export namespace nsBoletap {

  export interface IBoletaPago {
    datosPersonal: IPersonal;
    //periodosLaborales: IPeriodosLaborales[];
    periodosCalculados: IPeriodosCalculados[];
  }

  export interface IPersonal {
    personalId: number;
    personal: string;
    tipoDocumento: string;
    numeroDocumento: string;
    planilla: string;
    fechaIngreso: Date;
    fechaCese: Date;
  }

  // export interface IPeriodosLaborales {
  //   periodoLaboralId: number;
  //   nIdPersonal: number;
  //   sFechIni: string;
  //   sFechFin: string;
  // }

  export interface IPeriodosCalculados {
    position: number;
    id: number;
    periodoLaboralId: number;
    anio: string;
    nroMes: number;
    mes: string;
    montoIngresos: number;
    montoDescuento: number;
    montoNeutro: number;
    montoNeto: number;
    visualizado: number;
  }

  export interface IAnio {
    value: string;
    text: string;
    periodoLaboralId: number;
  }
}

