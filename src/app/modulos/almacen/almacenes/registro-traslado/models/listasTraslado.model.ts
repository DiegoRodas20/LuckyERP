import { Almacen_RI, Presupuesto_Almacen } from "../../registro-ingreso/models/listasIngreso.model";
import { Detalle_Articulo } from "./registroTraslado.model";

export interface Listas_RT {
    nId: number;
    sDescripcion: string;
}

export interface input_ModalArt {
    vCentroCosto: Presupuesto_Almacen;
    vAlmacen: Almacen_RI;
    lDetalle: Detalle_Articulo[];
    nIdTipoOperacion: number;
    bNoPicking: boolean;
    bEsLogisticoSatelite: boolean
}

export interface input_ModalArtDetalle {
    vCentroCosto: Presupuesto_Almacen;
    vAlmacen: Almacen_RI;
    lDetalle: Detalle_Articulo[];
    nIdTipoOperacion: number;
    vDetalle: Detalle_Articulo;
    bNoPicking: boolean;
    bEsLogisticoSatelite: boolean
}

export interface Articulo_Stock {
    nIdArticulo: number;
    sLote: string;
    nStock: number;
    sFechaIngreso: string;
    sFechaVence: string;
    nPrecioUnidad: number;
}

export interface Operacion_RT {
    nId: number;
    sDescripcion: string;
    nIdTipoOperacion: number;
}