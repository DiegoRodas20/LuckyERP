export interface IMain {
    nIdPersonal: number;
    sNombres: string;
    sCodPlla: string;
    nIdTipoDoc: number;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    dFechIni: Date;
    dFechFin?: Date;
    sCiudad: string;
    nIdPerLab: number;
}

export interface IDetail {
    nIdDescuento: number;
    nIdMotivo: number;
    sMotivo: string;
    sDescripcion: string;
    dFechIni: Date;
    dFechFin: Date;
    nIdDireccion: number;
    sDireccion: string;
    nIdArea: number;
    sArea: string;
    nImporte: number;
    nSaldo: number;
    nCuota: number;
    nCant: number;
    bEstado: boolean;
}

export interface IDescuento {
    dFecha: Date;
    nImporte: number;
}

export interface IDatosScan {
    nIdAuthDesc: number;
    nombre_personal: string;
    direccion: string;
    area: string;
    motivo: string;
    nImporte: number;
    sCodPlla: string;
    sDesc: string;
}
