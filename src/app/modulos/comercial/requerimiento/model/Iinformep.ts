export interface EquipoTrabajo {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    sTipo: string;
    sDocumento: string;
    dFechIni: Date;
}

export interface ListaInforme {
    nIdPersonal: number;
    sResponsable: string;
    sInforme: string;
    dFechaInforme: Date;
    sMotivo: string;
    sObervacion: string;
}

export interface ListaResp {
    nIdResp: number;
    sNombres: string;
}
