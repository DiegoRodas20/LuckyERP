export interface DetalleAddendaTableTIDTO {
    nIdDetAddenda: number
    nIdTipoDispositivo: number;
    sTipoActivo: string
    nIdAddenda: number
    nIdArticulo: number
    sArticulo: string
    sCaracteristica: string
    nCantidad: number
    sRutaArchivo: string
    sPartNumber: string
}
export interface DetalleAddendaTIDTO {
    nIdDetAddenda: number;
    nIdAddenda: number;
    nIdArticulo: number;
    nCantidad: number;
    detalleArticulo: DetalleAddendaArticuloTIDTO[];
}

export interface ParametroTIDTO {
    nIdParametro: number;
    nIdProveedor: number;
    nAnioAddenda: number;
}
export interface AddendaCabeceraTIDTO {
    nIdAddenda: number;
    nIdProveedor: number;
    nNumero: number;
    dFechaInicio: string;
    dFechaFin: string;
    nIdUsrRegistro: number;
    dFechaRegistro: string;
    nIdEstado: number;
    sIdPais: string;
    detalleAddenda: DetalleAddendaTIDTO[];
}

export interface AddendaTableTIDTO {
    nIdAddenda: number;
    sProveedor: string;
    sNumero: string;
    sTipoActivo: string;
    nCantidad: number;
    nCantidadRestante: number;
    sFechaInicio: string;
    sFechaFin: string;
    nIdEstado: number;
    sEstado: string;
}

export interface AddendaUnoTIDTO {
    nIdAddenda: number;
    sNumero: string;
    nIdProveedor: number;
    sFechaInicio: string;
    sFechaFin: string;
    nIdUsrRegistro: number;
    sUsrCreacion: string;
    dFechaCreacion: string;
    nIdEstado: number;
    sEstado: string;
    bEditar: boolean;
    detalleAddenda: DetalleAddendaTableTIDTO[];
    detalleAddendaArticulo: DetalleAddendaArticuloTableTIDTO[];
}

export interface DetalleAddendaDetalleTableTIDTO {
    sEquipo: string;
    sSerie: string;
    sFechaAsignacion: string;
    bEstado: boolean;
    sEstado: string;
    sUsuarioAsignado: string;
    dFechaRemplazo: Date;
    sEquipoNuevo: string;
    sSerieNueva: string;
}

export interface TipoDispositivoParteTIDTO {
    nIdTipoArticulo: number;
    sDescripcionBase: string;
    nIdDispositivoParte: number;
    sDescripcionParte: string;
    bOpcional: boolean;
}

export interface DetalleAddendaArticuloTableTIDTO {
    nIdDetAddenda: number
    nIdDetAddendaArticulo: number;
    nIdTipoDispositivo: number;
    sTipoDispositivo: string;
    nIdArticulo: number;
    sPartNumber: string;
    sArticulo: string;
    sRutaArchivo: string;
}

export interface DetalleAddendaArticuloTIDTO {
    nIdDetAddendaArticulo: number;
    nIdDetAddenda: number;
    nIdDispositivoParte: number;
    nIdArticulo: number;
}

export interface AddendaArchivoDTO {
    nIdDetAddendaArchivo: number
    nIdAddenda: number
    sRutaArchivo: string
    sNombreArchivo: string
    nIdUsrSubio: number
    sUsrSubio: string
    dFechaSubio: string
    fileString: string
    type: string
    extension: string
    sIdPais: string
}