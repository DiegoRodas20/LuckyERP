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

export interface IMain {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    dFechIni: Date;
    dFechFin?: Date;
    sCiudad: string;
    nCant: number;
}

export interface IDetail {
    nIdReqVac: number;
    nIdPersonal: number;
    nIdResp: number;
    dFechIni: Date;
    dFechFin: Date;
    nIdEstado: number;
    sEstado: string;
}

export interface IVac {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    sDscTipo: string;
    sDocumento: string;
    nCant: number;
}
