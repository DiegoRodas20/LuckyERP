export interface Presupuesto {
    nIdCentroCosto: number;
    sCodigo: string;
    sPresupuesto: string;
    sFechaIni: string;
    sFechaFin: string;
    nIdCliente: number;
    sCliente: string;
    nIdUserCreo: number;
    sUserCreo: string;
    sFechaCreo: string;
    sHoraCreo: string;
}

export interface CC_Sucursal {
    nIdCCS: number;
    nIdEmpS: number;
    nIdSucursal: number;
    sCodEmpS: string;
    sDescSucursal: string;
}

export interface CCS_Personal {
    nId: number;
    nIdPersonal: number;
    sDocumento: string;
    sDescripcion: string;
}

export interface PartidaPersonal{
    nId: number;
    nIdPartida: number;
    sCodPartida: string;
    sDescPartida: string;
    nIdCC: number;
    nIdSucursal: number;
    sCodSucursal: string;
    sDescSucursal: string;
    nIdCanal: number;
    sDescCanal: string;
    nIdCategoria: number;
    sDescCategoria: number;
    nCantPersonal: number;
    nDias: number;
    nTotalDias: number;
}

export interface Asistencia {
    sAnio: string;
    sMes: string;
    sPeriodo: string;
    sQF: string;
    sTipo: string;
    sDoc: string;
    sPersonalAsistencia: string;
    sPlanilla: string;
    sUsr: string;
    sFechaRegistro: string;
    nTotalNeto: number;
    nTotalPers: number;
    nTotalDias: number;
}