export interface ListasLogistica {
    nId: number;
    sDescripcion: string;
}

export interface Tipo_Operaciones {
    nId: number;
    sDescripcion: string;
    nReqIngreso: number;
    nEsUnicaOp: number;
}
export interface OperacionLogistica {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
    nIdTipoOp: number;
    sTipoOp: string;
    nIdOperacionAuto: number;
    sOperacionAuto: string;
    nAfectaUb: number;
    sAfectaUb: string;
    nIdEstado: number;
    sEstado: string;
}