export interface Registro_Traslado {
    //Para la mat Table
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    sAlmacen: string;
    sCentroCosto: string;
    sCliente: string;
    sAlmacenDestino: string;
    sCentroCostoDestino: string;
    nNumDocumento: string;
    nTotalPeso: number;
    nTotalVolumen: number;
    nTotalUnd: number;
    nIdEstado: number;
    sEstado: string;
    sSolicitante: string;
}

export interface Registro_Traslado_Detalle {
    //Para ver detalle de un registro
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    sHora: string;
    nIdAlmacen: number;
    sAlmacen: string;
    nIdAlmacenDestino: number;
    sAlmacenDestino: string;
    sOperacion: string;
    sCentroCosto: string;
    sCentroCostoDestino: string;
    sCliente: string;
    sClienteDestino: string;
    sSolicitante: string;
    nNumDoc_ref: string;
    nIdEstado: number;
    sEstado: string;
    nIdUsrReg: number;
    sUserReg: string;
    sFechaReg: string;
    sObservacion: string;
    sObservacionNota: string;
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
    nVolumenTotal: number;
    nPesoTotal: number;
    sObservacion: string;
    nIdControlLote?: number
}

export interface Archivo_Traslado {
    nId: number;
    nIdTipoDoc: number;
    sTipoDoc: string;
    sRuta: string;
    sNombreArchivo: string;
    sExtension: string;
    nIdUser: number;
    sUser: string;
    sFechaSubio: string;
    sHoraSubio: string;
    nEstado: number;
    sEstado: string;
}