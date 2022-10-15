import { FormBuilder, FormGroup } from "@angular/forms";

export interface E_Liquidacion_Transporte {
  nId: number;
  sVehiculo: string;
  nPesoCapacidad: number;
  nVolumenCapacidad: number;
  nPesoCargado: number;
  nVolumenCargado: number;
  sTipoVehiculo: string;
  sChofer: string;
  sZona: string;
  nCantPunto: number;
  sEsLucky: string;
  sFecha: string;
  sEstado: string;
  nPrecioBase: number;
  nPrecioCarreta: number;
  nPrecioPeaje: number;
  nPrecioEstacionamiento: number;
  nPrecioAyudante: number;
  nPrecioTotal: number;
  nIdMotivoCambioPrecio: number;
  nIdSucursal: number;
  sSucursal: string;
  bTerminado: boolean;
  detalleList: E_Liquidacion_Transporte_Punto[];
}

export interface E_Liquidacion_Transporte_Punto {
  nIdGrupo: number;
  nPunto: number;
  sPunto: string;
  sCodTransporte: string;
  sCadenaOrigen: string;
  sLugarOrigen: string;
  sCadenaDestino: string;
  sSucursalDestino: string;
  sZona: string;
  sCono: string;
  sClientes: string;
}

export class E_Liquidacion_Transporte_Guia {
  nPunto: number;
  nIdOperMov: number;
  sNombreEmpresa: string;
  sAlmacen: string;
  sCodPresupuesto: string;
  sNota: string;
  sGuia: string;
  nUnidades: number;
  nPeso: number;
  nVolumen: number;
  sCodPartida: string;
  bLiquidado: boolean;
  bCostoCero: boolean;
  sSituacion: string;

  static asFormGroup(item: E_Liquidacion_Transporte_Guia): FormGroup {
    const form = new FormBuilder().group({
      nIdOperMov: [item.nIdOperMov],
      sNombreEmpresa: [item.sNombreEmpresa],
      sAlmacen: [item.sAlmacen],
      sCodPresupuesto: [item.sCodPresupuesto],
      sNota: [item.sNota],
      sGuia: [item.sGuia],
      nUnidades: [item.nUnidades],
      nPeso: [item.nPeso],
      nVolumen: [item.nVolumen],
      //nCostoCero: [item.nCostoCero],
      sSituacion: [item.sSituacion],
      sCodPartida: [item.sCodPartida],
      //isCheck: [item.nSelec == 1 ? true : false]
    });
    return form;
  }
}

export interface E_Liquidacion_Transporte_Articulo {
  nIdOperMov: number;
  nId: number;
  nIdArticulo: number;
  sCodArticulo: string;
  sDescripcion: string;
  sUndMedida: string;
  sRutaFoto: string;
  sLote: string;
  nUnidades: number;
  nPesoTotal: number;
  nVolumenTotal: number;
}

export interface E_Liquidacion_Transporte_Prorrateo {
  nIdEmp: number;
  sEmpresa: string;
  nIdCentroCosto: number;
  nIdTipoCC: number;
  nIdTipoAuxCC: number;
  sCodPresupuesto: string;
  sPresupuesto: string;
  nPeso: number;
  nVolumen: number;
  nCostoTraslado: number;
}