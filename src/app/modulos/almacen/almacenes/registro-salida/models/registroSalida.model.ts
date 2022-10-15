export interface Registro_Salida {
    //Para la mat Table
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    sAlmacen: string;
    sCentroCosto: string;
    sCliente: string;
    sGuiaRef: string;
    nNumDocumento: string;
    nTotalPeso: number;
    nTotalVolumen: number;
    nTotalUnd: number;
    nIdEstado: number;
    sEstado: string;
    sCodTrasladoNu: string;
    sSolicitante?: string;
}

export interface Detalle_Articulo {
    nId: number;
    nIdArticulo: number;
    sArticulo: string;
    sLote: string;
    sRutaArchivo: string;
    sFechaExpira: string;
    sFechaIngreso: string;
    sUndMedida: string;
    nStock: number;
    nUnidades: number;
    nCostoUnit: number;
    nPesoUnd: number;
    nVolumenUnd: number;
    nCostoTotal: number;
    nCostoCourier?: number;
    nVolumenTotal: number;
    nPesoTotal: number;
    sObservacion: string;
    nIdControlLote?: number;
    nEsCotizado?: number;
}

export interface Registro_Salida_Detalle {
    //Para ver detalle de un registro
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    sHora?: string;
    nIdAlmacen: number;
    sAlmacen: string;
    sOperacion: string;
    nIdCentroCosto: number;
    sCentroCosto: string;
    sCliente: string;
    sSolicitante: string;
    sDestinatario: string;
    sEntidad: string;
    sPuntoRecup: string;
    sDireccion: string;
    sUbicacion: string;
    sGuia: string;
    nNumDoc_ref: string;
    sMotivo: string;
    sTipoMovilidad: string;
    nIdEstado: number;
    sEstado: string;
    nIdUsrReg: number;
    sUserReg: string;
    sFechaReg: string;
    sObservacion: string;
    sObservacionNota: string;
    sCodTrasladoNu: string;
}

export interface CantidadRegistros {
    nNotaSalida: number;
    nNotaCourier: number;
}