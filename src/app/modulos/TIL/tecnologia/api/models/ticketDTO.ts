export interface TicketTableDTO {
    nIdTicket: number;
    sEmpresa: string;
    sTipoTicket: string;
    sNumero: string;
    sPersonalSolicitante: string;
    sArea: string;
    sTelfSolicitante: string;
    dFechaCrea: Date | string | null;
    sTicketAsignado: string;
    sCargo: string;
    sReposicion: string;
    sDetalle: string;
    sPrioridad: string;
    sColorPrioridad: string;
    nIdEstado: number;
    sEstado: string;
}

export interface TicketTableDetalleDTO {
    nIdTicket?: number;
    nIdEmp?: number;
    sEmpresa?: string;
    nIdSolicitante?: number;
    nTelefonoSolicitante?: number;
    sSolicitante?: string;
    nIdTipoTicket?: number;
    sTipoTicket?: string;
    nIdArticulo?: number;
    sArticulo?: string;
    sObservacion?: string;
    bReposicion?: boolean;
    nIdActivo?: number;
    sActivo?: string;
    nIdEstadoActivo?: number;
    nIdAsignado?: number;
    nTelefonoAsigna?: number;
    sAsignado?: string;
    nIdPersonalTi?: number;
    sPersonalTi?: string;
    sFechaEntrega?: string;
    sHoraEntrega?: string;
    nIdUsuarioCrea?: number;
    sUsuarioCrea?: string;
    dFechaCrea?: Date;
    nIdUsrModifica?: number;
    sNumero?: string;
    nIdEstado?: number;
    sEstado?: string;
    sPais: string;
    nIdPrioridad?: number;
    bEnrrolado?: boolean;
    // Campos por si es un prestamo de activo
    sFechaDevolucion?: string;
    bSeAsignaActivo?: boolean;
    bActivoAsignado?: boolean;

    // Campos del archivo txt de comentario
    sArchivoTexto?: string;
    sFilenameComentario?: string;
    sComentario?: string;
    //atencion?: TicketTableDetalleAtencionDTO;
}

export interface TicketTableDetalleAtencionDTO {
    nIdTicketAtencion?: number;
    nIdTicket?: number;
    nIdPersonalTi?: number;
    nIdUsuario?: number;
    dFecha?: Date;
    bEstado?: boolean;
    sPais: string;
}

export interface TicketTableDetalleAtencionTiempoDTO{
    nIdTicketAtencionTiempo?: number;
    nIdTicketAtencion?: number;
    nIdPersonalTi?: number;
    dFechaInicio?: Date;
    nIdUsrInicio?: number;
    dFechaFin?: Date;
    nIdUsrFin?: number;
    bEstado?: boolean;
    sPais: string;
    bSeAsignaActivo?: boolean;
    sObservacionAsignacion?: string;
    nIdPersonalAsignado?: number;
}

export interface TicketSelectItemDTO {
    nId: number;
    sDescripcion: string;
}

export interface TicketImagenAsignacionDTO {
    sObservacion: number;
    sRutaArchivo: string;
}

export interface TicketSelectItemPersonalAsignadoDTO {
    nId: number;
    sDescripcion: string;
    nIdCargo: number;
    sCargo: string;
}

export interface TicketTiempoAtencionDTO {
    sUsuarioInicio: string;
    sFechaInicio: string;
    sHoraInicio: string;
    sUsuarioFin: string;
    sFechaFin: string;
    sHoraFin: string;
    nCantidadDias: number;
    bEstado: boolean;
}

export interface TicketSelectItemPrioridadDTO {
    nId: number;
    sDescripcion: string;
    sColor: string;
}

export interface TicketMontoDescuentoReposicionDTO {
    nIdTicket?: number;
    nIdDescuento?: number;
    nImporteInicial?: number;
    nIdDescuentoEfectivo?: number;
    nImporteEfectivo?: number;
    nPenalidad?: number;
    nDescuentoPerfil?: number;
    nIdDetActivoAsigna?: number;
    bTipoDescuento?: boolean;
    sRutaDescuentoInicial?: string;
    sRutaDescuentoEfectivo?: string;
    nIdUsuarioRegistro?: number;
    sPais?: string;
    nIdEmp?: number;
}

export interface TicketAtencionReposicionValidacionDTO{
    bDescuento: boolean;
    bReposicion: boolean;
}

export interface TicketGarantiaActivoDTO{
    dFechaAlta: Date;
    dFechaAsignacion: Date;
    bTieneGarantia: boolean;
    nDiasRestantes: number;
}

export interface ActivoTicketCaracteristicasDTO{
    sDescripcion?: string;
    bRepotenciado?: boolean;
  }