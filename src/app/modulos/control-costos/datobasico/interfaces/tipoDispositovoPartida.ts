export interface E_ListasPartidaDispositivo {
    nId: number;
    sDescripcion: string;
}

export interface E_PartidaDispositivo {
    nIdPartidaDispositivo: number;
    nIdPartida: number;
    sCodPartida: string;
    sPartida: string;
    nIdPartGen: number;
    sPartGen: string;
    nIdTipoDispositivo: number;
    sTipoDispositivo: string;
    nEstado: number;
    sEstado: string;
}