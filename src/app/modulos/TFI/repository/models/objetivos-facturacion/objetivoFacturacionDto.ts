export interface ObjetivoFacturacionDto {
    razonSocial: string;
    anio: number;
    objetivoTotal: number;

}

export interface Direccion {
    directora: string;
}

export interface Mes {
    codigoMes: string;
    mes: string;
}

export interface Cliente {
    codigoCliente: number;
    cliente: string;
}

export interface Ejecutivo {
    codigoPersonal: number;
    nombreCompleto: string;
}

export interface ObjetivoMensual {

    codigoObjGrupo: number;
    anio: number;
    direccion: string;
    cliente: string;
    mes: string;
    montoObjetivo: number;
    montoRegularizacion: number;
    motivo: string;
    montoObjCovid: number;

}

export interface ClienteGrupo {
    codigoObjCliente: number;
    codigoRuc: string;
    razonSocial: string;
    montoObjetivo: number;
    montoObjCovid: number;
    codigoIdCliente: number;
}

export interface ObjetivoEjecutivo {
    codigoObjEjecutivo: number;
    codigoEjecutivo: number;
    documento: string;
    nombre: string;
    montoObjetivo: number;
    montoRegularizacion: number;
    motivo: string;
    montoObjCovid: number;
}