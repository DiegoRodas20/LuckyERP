export interface SerieDto {

    codigoSerie: number;
    codigoEmpresa: number;
    codigoDocumento: number;
    tipoDocumento: string;
    sucursal: string;
    numeroSerie: string;
    anchoNumerador: number;
    numerador: string;
    descripcion: string;
    estado: string;
    electronica: string;
    bEstado: boolean;
    bElectronica: boolean;
    
}

export interface Empresa {
    
    empresaID: number;
    razonSocial: string;

}

export interface TipoDocumento {

    codigoDocumento: number;
    nombreDocumento: string;

}

export interface NumeradorSerie {

    correlativo: string;
    
}