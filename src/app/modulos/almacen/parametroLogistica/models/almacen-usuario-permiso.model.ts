export interface Almacen_Usuario_Permiso {
    nIdAlmacenUsuario: number;
    nIdUsuario: number;
    sUsuario: string;
    nIdDireccion: number;
    sAlmacen: string;
    sDireccion: string;
    sUbicacion: string;
    nOperBaja: number;
    sOperBaja: string;
    nEstado: number;
    sEstado: string;
}

export interface Lista_Alm_Usr_Permiso {
    nId: number;
    sDescripcion: string;
}

export interface Direccion_Alm_Usr_Permiso {
    nIdDireccion: number;
    sDescripcion: string;
    sDireccion: string;
    sUbicacion: string;
}