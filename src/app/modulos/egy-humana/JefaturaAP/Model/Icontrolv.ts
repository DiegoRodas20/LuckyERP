export interface IList {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    dFechIni: Date;
    dFechFin?: Date;
    sCiudad: string;
    dIniVac?: Date;
    dFinVac?: Date;
    nIdEstado: number;
}

export interface IDescuento {
    dFecha: Date;
    nImporte: number;
}

export interface IMain {
    nIdPersonal: number;
    nIdReqVac: number;
    sSolicitante: string;
    nIdResp: number;
    sSupervisor: string;
    sCodPlla: number;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    sCiudad: string;
    nIdEstado:number;
    sDias: number;
    sEstado: string;
    sFechaIngreso: string;
    sFechaCese: string;
}

export interface IExpanded {
    nIdPersonal: number;
    nIdResp: number;
    sSupervisor: string;
    dFechIni: Date;
    dFechFin: Date;
    sDias: number;
    nIdEstado: number;
    sEstado: string;
}

export interface IDetail {
    nIdReqVac: number;
    nIdPersonal: number;
    nIdResp: number;
}

export interface IVac {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    sDscTipo: string;
    sDocumento: string;
    nCant: number;
}
