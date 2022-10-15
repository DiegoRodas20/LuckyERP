export interface Vehiculo {
    nIdVehiculo: number;
    nIdTipoVehiculo: number;
    sTipoVehiculo: string;
    sDescripcion: string;
    sPlaca: string;
    sMarca: string;
    sColor: string;
    sAnio: string;
    sModelo: string;
    nPasajero: number;
    nPesoCarga: number;
    nAlto: number;
    nAncho: number;
    nLargo: number;
    nVolumenCarga: number;
    nNumPuerta: number;
    dFechaTecnica: string;
    dFechaSoat: string;
    dVenceCirculacion: string;
    dVenceExtintor: string;
    dFechaVenceCert: string;
    nLucky: number;
    sLucky: string;
}


export interface Vehiculo_Empresa {
    nId: number;
    nIdVehiculo: number;
    nIdTipoVehiculo: number;
    sTipoVehiculo: string;
    sDescripcion: string;
    sPlaca: string;
    sMarca: string;
    sColor: string;
    sAnio: string;
    sModelo: string;
    nPasajero: number;
    nPesoCarga: number;
    nAlto: number;
    nAncho: number;
    nLargo: number;
    nVolumenCarga: number;
    nNumPuerta: number;
    dFechaTecnica: string;
    dFechaSoat: string;
    dVenceCirculacion: string;
    dVenceExtintor: string;
    dFechaVenceCert: string;
    nLucky: number;
    sLucky: string;
    nIdEstado: number;
    sEstado: string;
}

export interface Archivo_Vehiculo {
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