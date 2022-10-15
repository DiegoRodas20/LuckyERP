import { SafeUrl } from "@angular/platform-browser";

export interface ActivoAsignacionTableTIDTO {
    nIdActivoAsigna: number;
    sEmpresa: string;
    sCodRQ: string;
    sNombreSolicitante: string;
    sDocumento: string;
    sNombreComercial: string;
    sCargoSolicitante: string;
    nVacante: number;
    nCantMovil: number;
    nCantPC: number;
    nCantCorreo: number;
    dFechaSolicitud: Date | string;
    dFechaAtencion: Date | string | null;
    nIdEstado: number;
    sEstado: string;
    sPresupuesto: string;
}

export interface ActivoAsignaUnoTIDTO {
    nIdActivoAsigna: number;
    sCodRQ: string;
    sNroDoc: string;
    sNombreSolicitante: string;
    sCorreo: string;
    sCargoSolicitante: string;
    sTelefono: string;
    sMotivo: string;
    sNombreComercial: string;
    sCanal: string;
    sPresupuesto: string;
    sCargo: string;
    dFecIni: Date | string | null;
    dFecFin: Date | string | null;
    sPLanilla: string;
    nVacante: number;
    dFechaAtencion: Date | string | null;
    dFechaTerminado: Date | string | null;
    dFecha: Date | string | null;
    sTipoContrato: string;
    sObservacion: string;
    sTituloGastoCosto: string | null;
    sFechaGastoCosto: string | null;
    sServicio: string | null;
    sFechasCC: string | null;
    nIdEstado: number;
    sEstado: string;
    nIdTipoAsigna: number;
    detalleAsignacionActivos: DetalleAsignacionActivoTableTIDTO[];
    detallePersonal: PersonalAsignacionActivoTIDTO[];
}


export interface DetalleAsignacionActivoTableTIDTO {
    nIdActivoAsigna: number;
    nIdSubFamilia: number;
    sTipoActivo: string;
    nCantidad: number;
    sNombrePerfil: string;
    nIdArticulo: number;
    sCodArticulo: string;
    sNombreProducto: string;
    sRutaArchivo: string;
}

export interface PersonalAsignacionActivoTIDTO {
    nIdEnv: number;
    sCodRQ: string;
    nIdCentroCosto: string;
    nIdPersonal: number;
    sNroDoc: string;
    sNombrePersonal: string;
    nIdCargo: number;
    sCargo: string;
    sPresupuesto: string;
    sArea: string;
    sNombreComercial: string;
    sCanal: string;
}

export interface ArticuloAsignacionActivoTableTIDTO {
    nIdDetActivoAsigna: number;
    nIdPersonal: number
    sRecurso: string
    sPerfil: string
    nIdActivo: number
    sActivo: string
    sArticulo: string
    sAddenda: string
    sAutorizaDcto: string
    sObservacion: string
    nIdArticulo: number;
    sRutaArchivo: string;
    sRutaArchivoDetalle: string;
    nDescuento: number;
    nIdDescuento: number;
}
export interface AsignacionActivoTIDTO {
    nIdActivoAsigna: number;
    nIdTipoAsigna: number;
    nIdRq: number;
    nIdSolicitante: number;
    nIdCentroCosto: number;
    nIdUsuario: number;
    dFecha: Date | string | null;
    nIdEstado: number;
    nIdUsrAtencion: number;
    dFechaAtencion: Date | string | null;
    nIdUsrTerminado: number;
    dFechaTerminado: Date | string | null;
    sObservacion: string;
    sIdPais: string;
    detalleAsignacionActivo: DetalleAsignacionActivoTIDTO[];
}

export interface DetalleAsignacionActivoTIDTO {
    nIdDetActivoAsigna: number;
    nIdActivoAsigna: number;
    nIdEnv: number;
    nIdActivo: number;
    nIdTicket: number;
    nIdPersonal: number;
    sObservacion: string;
    dFechaEntrega: Date | string | null;
    nIdDescuento: number;
    dFechaDevolucion: Date | string | null;
    nIdUsrDevolucion: number;
    dFecha: Date | string | null;
    bEstado: boolean;
    nIdUsuario: number;
    sIdPais: string;
    detalleArchivo: DetalleAsignacionActivoArchivoTIDTO[];
    nIdEmp: number;
    nDescuento: number;
}

export interface DetalleAsignacionActivoArchivoTIDTO {
    nIdDetActivoAsignaArchivo: number;
    nIdDetActivoAsigna: number;
    nTipoAccion: number;
    sRutaArchivo: string;
    nNumero: number;
    sObservacion: string;
    fileString: string;
    extension: string;
}

export interface FotosRqActivo {
    nIdActivo: number
    nNumero: number
    fileString: string
    extension: string
    urlImage: SafeUrl
    sObservacion: string
}

export interface DetalleDocumentoAsignacionActivoTIDTO {
    nIdDetActivoAsigna: number;
    sRutaArchivo: string;
    sBase64: string; // Base 64 del documento de descuento
    fileType: string; // Tipo del archivo  
}