import { Detalle_Articulo, Ubicacion_Articulo } from "./registroIngreso.models";

export interface Presupuesto_Almacen {
    nId: number;
    sDescripcion: string;
    sCliente: string;
}

export interface Lista_Registro_Ingreso {
    //Para listas simples
    nId: number;
    sDescripcion: string;
}

export interface Entidad_Almacen {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
}

export interface Direccion_Proveedor {
    nId: number;
    sCodigo: string;
    sDestino: string;
    sUbigeo: string;
    sDireccion: string;
    sReferencia: string;
    sDepartamento: string;
    sProvincia: string;
    sDistrito: string;
    sTipoZona: string;
}

export interface Articulo_RI {
    nIdArticulo: number;
    sCodArticulo: string;
    sDescripcion: string;
    sRutaArchivo: string;
    sCodUndMedida: string;
    nPesoUnd: number;
    nVolumenUnidad: number;
    nPesoEmpac2: number;
    nVolumenEmpac2: number;
    nPesoEmpac3: number;
    nVolumenEmpac3: number;
    nIdControlLote: number;
    sControlLote: string;
    nCantidadOc: number;
    nPrecioOc: number;
}

export interface Almacen_RI {
    nId: number;
    sDescripcion: string;
    nTipoAlmacen: number;
    sTipoAlmacen: string;
    nNoUbica?: number;
}

export interface TipoCambio_RI {
    nId: number;
    nVenta: number;
}

export interface input_ModalArt {
    dFechaIngreso: moment.Moment;
    vCentroCosto: Presupuesto_Almacen;
    vAlmacen: Almacen_RI;
    lDetalle: Detalle_Articulo[];
    bEsOrdenCompra: boolean;
    lArticuloOC: Articulo_RI[];
    vDetalle?: Detalle_Articulo;
    bEsLogisticoSatelite: boolean
}

export interface input_ModalArt_Detalle {
    nIdCentroCosto: number;
    vAlmacen: Almacen_RI;
    vArticulo: Detalle_Articulo;
    lDetalle?: Detalle_Articulo[];
    vFechaIngreso?: moment.Moment;
    bEsLogisticoSatelite: boolean
}

export interface input_ModalUbic {
    vArticuloDetalle: Detalle_Articulo;
    sCliente: string;
    nIdAlmacen: number;
    lUbicacion: Ubicacion_Articulo[];
    bRegistrando: boolean; //Para saber si se esta registrando o se esta consultando
    lUbicacionesAlmacen: Lista_Registro_Ingreso[];
    vEmpresaActual: Lista_Registro_Ingreso;
}