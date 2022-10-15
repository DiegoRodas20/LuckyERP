import { Almacen_RI, Presupuesto_Almacen } from "../../registro-ingreso/models/listasIngreso.model";
import { Detalle_Articulo } from "./registroSalida.model";

export interface Listas_RS {
    nId: number;
    sDescripcion: string;
}

export interface input_ModalArt {
    vCentroCosto: Presupuesto_Almacen;
    vAlmacen: Almacen_RI;
    lDetalle: Detalle_Articulo[];
    bNoPicking: boolean;
    bEsLogisticoSatelite: boolean;
}

export interface input_ModalArtDetalle {
    vCentroCosto: Presupuesto_Almacen;
    vAlmacen: Almacen_RI;
    lDetalle: Detalle_Articulo[];
    vDetalle: Detalle_Articulo;
    bNoPicking: boolean;
    bEsLogisticoSatelite: boolean;
}

export interface input_ModalModulo{
    nIdAlmacen: number;
    nIdEntidad: number;
}
export interface Articulo_Stock {
    nIdArticulo: number;
    sLote: string;
    nStock: number;
    sFechaIngreso: string;
    sFechaVence: string;
    nPrecioUnidad: number;
}

export interface Resultado_NC {
    nPrecioCourier?: number;
    nSaldo: number;
    sMensaje: string;
    nSaldoResguardo?: number;
    nIdTipoCC?: number;
    sCentroCosto: string;
    sSucursal: string;
    sPartida: string;
}

export interface Historial_Costo_NS {
    nId: number;
    nIdUsuario: number;
    sUsuario: string;
    sFecha: string;
    nIdEstado: number;
    sEstado: string;
    nPrecio: number;
}