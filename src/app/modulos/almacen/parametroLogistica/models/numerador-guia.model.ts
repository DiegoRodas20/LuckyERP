export interface NumeradorGuia {
    nId: number;
    sCodigoSerie: string;
    sCodigoSerie2: string;
    sDescripcion: string;
    nGuia: number;
    nCantLong: number;
    nIdTipoDoc: number;
    sTipoDoc: string;
    nIdEstado: number;
    sEstado: string;
}

export interface DetalleNumerador {
    nId: number;
    nIdUsuario: number;
    sNombreUser: string;
    sUser: string;
    nTipoUser: number;
    sTipoUser: string;
    nIdEstado: number;
    sEstado: string;
}

export interface ListasGuia {
    nId: number;
    sDescripcion: string;
}

export interface UsuarioNumerador {
    nId: number;
    sNombreUser: string;
    sNombre: string;
}