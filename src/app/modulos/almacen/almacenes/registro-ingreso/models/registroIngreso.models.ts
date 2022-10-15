export interface Detalle_Articulo {
    nId: number;
    nIdArticulo: number;
    sArticulo: string;
    sLote: string;
    sRutaArchivo: string;
    sFechaExpira: string; //DD/MM/YYYY
    sFechaIngreso: string; //DD/MM/YYYY
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
    sZona: string;
    nPorUbicar?: number;
    nIdControlLote?: number;
}

export interface Registro_Ingreso {
    //Para la mat Table
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    nIdAlmacen: number;
    sAlmacen: string;
    nIdCentroCosto: number;
    sCentroCosto: string;
    nIdProveedor: number;
    sProveedor: string;
    sGuiaRef: string;
    sDocRef: string;
    sDocReferencia: string;
    nTotalPeso: number;
    nTotalVolumen: number;
    nTotalUnd: number;
    sEstado: string;
    sSolicitante?: string;
}

export interface Registro_Ingreso_Detalle {
    //Para ver detalle de un registro
    nId: number;
    sNumeroDoc: string;
    sFecha: string;
    nIdAlmacen: number;
    nTipoAlmacen: number;
    sAlmacen: string;
    nIdOperacion?: number;
    sOperacion: string;
    nIdCentroCosto: number;
    sCentroCosto: string;
    sCliente: string;
    nIdSolicitante: number;
    sSolicitante: string;
    nIdProveedor: number;
    sProveedor: string;
    nIdDireccion: number;
    sPuntoRecup: string;
    sDireccion: string;
    sUbicacion: string;
    sGuiaRef: string;
    sFactRef: string;
    sDocRef: string;
    nIdEstado: number;
    sEstado: string;
    nIdUsrReg: number;
    sUserReg: string;
    sFechaReg: string;
    sObservacion: string;
    sObservacionDocRef: string;
}

export interface Ubicacion_Articulo {
    nId: number;
    nIdDetalleArticulo: number;
    sEmpresaActual: string;
    nIdUbicacion: number;
    sUbicacion: string;
    sCliente: string;
    sArticulo: string;
    sFechaIngreso: string;
    sFechaVence: string;
    nIngreso: number;
}