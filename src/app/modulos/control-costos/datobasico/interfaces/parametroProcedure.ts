export class ParametroProcedureInterface {

    pEntidad: number;
    pOpcion: number;
    pParametro: string;    // nIdTipEle|nIdPais|ndDadTipEle|nParam
    pTipo: number;
    pParametroDet: string; // este se encarga de cargar los detalles
}

export interface Partida {
    idTipEle: number;
    descripcion: string;
    estado: number;
    idDadTipEle: number;
    idPais: number;
    nParam: number;
    listaDetalle: any;
};

export interface Personal {
    nIdPartida: number;
    sCodPartida: string;
    sDescripcion: string;
    dTopeDiario: number;
    dTopeMensual: number;
}