export interface ElementoTIDTO {
    elementoId: number;
    codigo: string;
    nombre: string;
    inicial: string;
    descripcion: string;
}

export interface CaracteristicaArticuloTIDTO extends ElementoTIDTO {
    bEstado: boolean;
    sEstado: string;
    elementoIdDad: number;
    idSubFamilia: number;
}

export interface TipoDispositivoTIDTO extends ElementoTIDTO {
    bEstado: boolean;
    sEstado: string;
    elementoIdDad: number;
    idSubFamilia: number;
    bPartNumber: boolean;
}