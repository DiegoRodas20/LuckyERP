/* tslint:disable */
/* eslint-disable */
export interface TipoElementoDto {
    tipoElementoId: number;
    codigo: string;
    descripcion: string;
    descripcionCorta: string;
    tipoElementoPadreId: number;
    paisId: string;
}

export interface SubFamiliaTIDto extends TipoElementoDto {
    countCaracteristica: number;
    countTipoDisp: number;
    bEstado: boolean;
    sEstado: string;
}

export interface SelecItem {
    nId: number;
    sDescripcion: string;
    nParam?: number;
}