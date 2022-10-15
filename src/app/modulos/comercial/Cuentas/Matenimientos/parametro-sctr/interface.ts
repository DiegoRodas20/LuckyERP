export interface Parametria {
    nIdPara?: number;
    nIdAseg?: number;
    sruc?: string;
    srazonSocial?: string;
    snombreComercial?: string;
    nAnio?: number;
    nVersion?: number;
    mPorcSalud?: number;
    mPorcPencion?: number;
    mTasaEspecial?: number;
    bestado?: number;
}

export interface Aseguradora {
    nIdAseg?: number;
    sruc?: string;
    srazonSocial?: string;
    snombreComercial?: string;
    bestado?: number;
}
