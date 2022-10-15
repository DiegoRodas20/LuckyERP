export interface ListasTarifa {
    nId: number;
    sDescripcion: string;
}

export interface Tarifa_Movilidad {
    nId: number;
    nIdTipoZona: number;
    sTipoZona: string;
    nIdTipoMovil: number;
    sTipoMovil: string;
    nPeso: number;
    nVolumen: number;
    nPuntos: number;
    nPrecio: number;
    nEstado: number;
    sEstado: string;
}

export interface Tarifa_Courier {
    nId: number;
    nIdTipoCourier: number;
    sTipoCourier: string;
    nProveedor: number;
    sProveedor: string;
    nIdSucursal: number;
    sSucursal: string;
    nPrecioKilo: number;
    nPrecioAdicional: number;
    nEstado: number;
    sEstado: string;
}
