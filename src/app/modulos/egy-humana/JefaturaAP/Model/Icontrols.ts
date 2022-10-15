export interface IMain {
    nIdPersonal: number;
    nIdPerLab: number;
    sNombres: string;
    sCodPlla: string;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    dFechIni: Date;
    dFechFin?: Date;
    sCiudad: string;
}

export interface IDetail {
    nIdSub: number;
    nIdPerLab: number;
    nTipoSub: number;
    sTipoSub: string;
    dFechIni: Date;
    dFechFin: Date;
    sCITT: string;
}
