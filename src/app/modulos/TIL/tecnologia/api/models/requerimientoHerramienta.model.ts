export interface PersonalRqHerramientaDTO {
    nIdPersonal: number;
    sDocumento: string;
    sNombreCompleto: string;
    nIdCargo: number;
    sCargo: string;
    nIdSucursal: number;
    sSucursal: string;
}

export interface PresupuestoRqHerramientaDTO {
    nIdCentroCosto: number;
    sCentroCosto: string;
    sCliente: string;
    sEjecutivoCuenta: string;
    sServicio: string;
    sCanal: string;
    sFechas: string;
}

export interface ArticuloRqHerramientaDTO {
    nIdArticulo: number;
    sHerramienta: string;
    nPrecio: number;
    nUnidades: number;
    bPlanDatos?: boolean;
}

export interface PartidaRqHerramientaDTO {
    nIdPartida: number;
    sCodPartida: string;
    sPartida: string;
}
export interface HerramientaRqDetalleTable {
    nIdDetalle: number;
    nIdDepositario: number;
    sDepositario: string;
    nIdCargo: number;
    sCargo: string;
    nIdSucursal: number;
    sSucursal: string;
    nIdArticulo: number;
    sHerramienta: string;
    nIdPartida: number;
    sPartida: string;
    nUnidades: number;
    nPrecio: number;
    nTotal: number;
}

export interface RequerimientoHerramientaCabeceraDTO {
    nIdGastoCosto: number;
    nIdEmpresa: number;
    nIdCentroCosto: number;
    nIdSolicitante: number;
    sTipoDoc: string;
    sTitulo: string;
    nIdTipoCambio: number;
    nIdMoneda: number;
    dFecha: string;
    nIdUsrRegistro: number;
    dFechaRegistro: Date | string | null;
    nIdUsrModifico: number;
    nNumero: number;
    nEstado: number;
    sIdPais: string;
    sObservacion: string;
    detalle: DetalleRequerimientoHerramientaDTO[];
}

export interface DetalleRequerimientoHerramientaDTO {
    nIdGastoDet: number;
    nIdGastoCosto: number;
    nIdSucursal: number;
    nIdPartida: number;
    nIdDepositario: number;
    nCantidad: number;
    nPrecio: number;
    nIdArticulo: number;
    nIdCargo: number;
}

export interface RequerimientoHerramientaTableDTO {
    nIdRq: number;
    nIdCentroCosto: number;
    sCentroCosto: string;
    sNumero: string;
    sSolicitante: string;
    sTitulo: string;
    dFechaEnvio: Date | string | null;
    nTotal: number;
    nIdEstado: number;
    sEstado: string;
}

export interface RequerimientoHerramientaUnoDTO {
    nIdRq: number;
    nIdSolicitante: number;
    sSolicitante: string;
    nIdCentroCosto: number;
    sNumero: string;
    sTitulo: string;
    sFechaSolicitud: string;
    nIdUsrRegistro: number;
    sUsuarioRegistro: string;
    sFechaRegistro: string;
    nIdEstado: number;
    sEstado: string;
    sObservacion: string;
    detalle: HerramientaRqDetalleTable[];
}

export interface RqHerramientaEstado {
    nIdGastoCosto: number;
    nIdUsuario: number;
    nIdEstado: number;
    nIdEmpresa: number;
    sIdPais: string;
    sMensaje: string;
}

export interface HistorialEstadoRqHerramienta {
    nIdGastoEstado: number;
    sUsuario: string;
    nIdEstado: number;
    sEstado: string;
    sFecha: string;
}