export interface Listas {
    nId: number;
    sDescripcion: string;
}

export interface Operaciones_Traslado {
    nId: number;
    sDescripcion: string;
    nEsBaja: number;
}
export interface UsuarioAlmacen {
    nId: number;
    nIdAlmacen: number;
    sAlmacen: string;
    nIdUsuario: number;
    sUsuario: string;
    nIdEstado: number;
    sEstado: string;
    nNoPicking: number;
}

export interface OperacionAlmacen {
    nId: number;
    nIdAlmacen: number;
    sAlmacen: string;
    nIdOperacion: number;
    sOperacion: string;
    nIdEstado: number;
    sEstado: string;
}

export interface OperacionAlmacenDestino {
    nId: number;
    nIdAlmacen: number;
    sAlmacen: string;
    nIdOperacion: number;
    sOperacion: string;
    nIdAlmacenDestino: number;
    sAlmacenDestino: string;
    nIdEstado: number;
    sEstado: string;
}