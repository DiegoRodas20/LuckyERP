export interface IFiltersAjusteCongelado {
    nIdEmpresa: number;
    sNroTransporte: string;
    nIdPresupuesto: number;
    dtFecha: Date
}

export interface E_Ajuste_Congelado {
    nId: number;
    sCiudad: string;
    sFechaOperMov: string;
    sCodTransporte: string;
    sNota: string;
    sCliente: string;
    sCodAlmacen: string;
    sSucursal: string;
    sDestino: string;
    sZona: string;
    sTipoVehiculo: string;
    nPeso: number;
    nVolumen: number;
    nPrecio: number;
    sEstado: string;
}
