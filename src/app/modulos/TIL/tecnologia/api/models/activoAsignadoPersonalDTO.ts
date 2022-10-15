export interface ActivoAsignadoPersonalDTO {
}

export interface ActivosPersonalDTO {
    nIdDetActivoAsigna: number;
    nIdPersonal: number;
    nIdEmpPersonal: number;
    nIdTipoDispositivo: number;
    sTipoActivo: string;
    nIdActivo: number;
    sActivo: string;
    nIdArticulo: number;
    sArticulo: string;
    sObservacion: string;
    nIdEstado: number;
    sEstado: string;
    dFechaEntrega: Date | string | null;
    dFechaDevolucion: Date | string | null;
    sRutaArchivo: string
    nCantActivos: number
    nMontoPenalizacion: number;
    sMonedaPenalizacion?: string;
    nMonto: number;
}

export interface ComponentesActivoDTO {
    nIdDetAddendaArticulo: number;
    nIdAddenda: number;
    nIdTipoDispositivo: number;
    sTipoDispositivo: string;
    nIdArticulo: number;
    sArticulo: string;
    sRutaArchivo: string;
    nRevision: number;
    nReposicion: number;
    nMontoPenalizacion: number;
    nMonto: number;
    bAplicaDescuento: boolean;
}

export interface PersonalCargoDTO {
    nIdSucursal: number;
    sSucursal: string;
    nIdPersonal: number;
    nIdTipoDoc: number;
    sTipoDoc: string;
    sDocumento: string;
    sNombreCompleto: string;
    nIdCargo: number;
    sPlanilla: string;
    sCargo: string;
}

export interface PersonalSolicitudTicketDTO {
    nIdPersonal: number;
    sDocumento: string;
    sNombreCompleto: string;
    bEsActual: boolean;
    sDatosPersonal: string;
    nIdEmpresa: number;
}


export interface SolicitudTicketDTO {
    nIdTicket: number;
    nIdTipoTicket: number;
    nIdSolicitante: number;
    nIdArticulo: number;
    nIdAsignado: number;
    nIdEmpAsignado: number;
    sObservacion: string;
    nIdUsuarioCrea: number;
    sIdPais: string;
    nIdActivo: number | null;
    nEsCuenta: number; //Para saber si se dcta de cuentas 
    nIdEmpresa: number;
    sAnio: string;
    nMes: number;
    nIdDetActivoAsigna: number;
    nMonto: number;
    detalle: DetalleGastoTicketDTO[];
}

export interface TicketUsuarioDTO {
    nIdTicket: number;
    sTicket: string;
    nIdSolicitante: number;
    sSolicitante: string;
    nIdTipoTicket: number;
    sTipoTicket: string;
    nIdArticulo: number;
    sArticulo: string;
    dFechaCrea: Date | string | null;
    nIdEstado: number;
    sEstado: string;
    bReposicion: boolean | null;
    nIdEmpPersonal: number;
    nMonto: number;
    nIdCargo: number;
    sCargo: string;
    nIdSucursal: number;
    sSucursal: string;
    nIdDetActivoAsigna: number | null;
    nIdActivo: number | null;
    bRevisadoTI?: boolean;
}

export interface PptoPartidaSolicitud {
    nId: number;
    nIdPresupuesto: number;
    sPresupuesto: string;
    sSucursal: string;
    nIdPartida: number;
    sPartida: string;
    nMonto: number;
}

export interface DetalleGastoTicketDTO {
    nIdGastoCosto: number;
    nIdSucursal: number;
    nIdPartida: number;
    nCantidad: number;
    nPrecio: number;
    nIdArticulo: number;
    nIdCargo: number;
    nIdDepositario: number;
    nIdCentroCosto: number;
}

export interface ActivoAsignadoPersonalSelectItemDTO{
    nId?: number;
    sDescripcion?: string;
}