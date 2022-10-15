export interface AsignacionDirectaCabeceraDTO {
  nIdPersonal: number;
  sEmpresa: string;
  sDocumento: string;
  sNombreCompleto: string;
  sTelefono: string;
  sLaptop: string;
  sCelular: string;
  sCorreo: string;
  sCanal: string;
  dFechaIngreso: Date;
  dFechaCese?: Date;
}

export interface AsignacionDirectaSeleccionDTO {
  nIdActivoAsigna: number;
  nIdTipoAsigna: number;
  nIdSolicitante: number;
  sDocumento?: string;
  sColaborador?: string;
  nIdCentroCosto: number;
  sCentroCosto?: string;
  nIdUsuarioCreacion: number;
  sUsuarioCreacion?: string;
  dFechaCreacion?: Date;
  // dFechaAtencion?: Date;
  // dFechaCese?: Date;
  nIdEstado: number;
  sEstado?: string;
  nIdEmpUsuarioRegistro: number;
  nIdCargo?: number;
  sPais?: string;
  detalle?: AsignacionDirectaSeleccionDetalleDTO[];
}

export interface AsignacionDirectaSelectItemDTO {
  nId: number;
  sDescripcion: string;
  nIdArticulo?: number;
  sRutaArchivo: string;
}

export interface AsignacionDirectaDetalleColaboradorDTO {
  sTelefono: string;
  nIdEmp: number;
  sEmpresa: string;
  nIdCargo: number;
  sCargo: string;
  sCuenta: string;
  sCanal: string;
  nIdCentroCosto: number;
  sCentroCosto: string;
}

export interface AsignacionDirectaSeleccionDetalleDTO {
  nIdDetActivoAsigna?: number;
  nIdActivoAsigna?: number;
  nIdActivo?: number;
  sActivo?: string;
  nIdTipoActivo?: number;
  sTipoActivo?: string;
  nIdEstadoActivo?: number;
  sArticulo?: string;
  nIdPersonal?: number;
  sObservacion?: string;
  nIdDescuento?: number;
  nIdDescuentoEfectivo?: number;
  nIdUsuarioEntrega?: number;
  sUsuarioEntrega?: string;
  dFechaEntrega?: Date;
  nIdUsuarioDevolucion?: number;
  sUsuarioDevolucion?: string;
  dFechaDevolucion?: Date;
  dFecha?: Date;
  bEstado?: boolean;
  nRepos?: number;
  sAddenda?: string;
  nIdEmp?: number;
  sEmpresa?: string;
  sPais?: string;
  nImporte?: number;
  nImporteEfectivo?: number;
  sRutaArchivo?: string;
  sBase64?: string;// Base 64 del documento de descuento
  fileType?: string; // Tipo del archivo
  nIdTicket?: number;
  nIdCargo?: number;
  nIdEmpUsuarioRegistro?: number;
  bTipoDescuento?: boolean; // 1: Inicial, 0: Efectivo
  sImeiSerie?: string;
  nIdTicketReposicion?: number;
  nIdPenalidad?: number;
  nPenalidad?: number;
  observaciones?: AsignacionDirectaSeleccionDetalleArchivoDTO[]
}

export interface AsignacionDirectaSeleccionDetalleArchivoDTO extends AsignacionDirectaArchivo{
  nIdDetActivoAsignaArchivo: number;
  nIdDetActivoAsigna: number;
  nTipoAccion: number;
  nIdActivo: number;
  sRutaArchivo: string;
  nNumero: number;
  sObservacion: string;
  sBase64: string;
  nTipoObservacion: number;
}

export interface AsignacionDirectaReposicionDTO {
  nIdDetActivoAsigna?: number;
  nIdTicket?: number;
  nIdPenalidad: number;
  nIdPersonal: number;
  nImporte: number;
  sObservacion?: string;
  nIdUsuario?: number;
  nIdEmp?: number;
  sPais?: string;
}

export interface AsignacionDirectaArchivo{
  file?: File;
}

export interface AsignacionDirectaCambioPartesActivoDTO{
  nIdDetActivoActual?: number;
  nIdDetActivoPrestamo?: number;
  sTipoParte?: string;
  sArticuloActual?: string;
  sNumeroParteActual?: string;
  sRutaArchivoActual?: string;
  bParteCompartida?: boolean;
  nIdDetActivoCambio?: number;
  sArticuloCambio?: string;
  sNumeroParteCambio?: string;
  sRutaArchivoCambio?: string;
  bParteDisponible?: boolean;
  nIdUsuarioAsigno?: number;
  sPais?: string;
  nIdActivoCambio?: number;
}