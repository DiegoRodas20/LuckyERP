export interface Reembolso{
    nIdGastoCosto?: number,
    nIdEmpresa?: string,
    sNombreComercial?:string,
    nIdCentroCosto?: string,
    sCodCC?: string,
    sDescCC?:string;
    nIdSolicitante?: string,
    sFullNom?:string,
    sTipoDoc?: string,
    sTitulo?: string,
    nIdTipoCambio?: string,
    nVenta?:string,
    nIdMoneda?: string,
    sDesc?:string,
    nEstado?:string,
    cEleNam?:string,
    nIdUsrRegistro?: number,
    dFechaRegistro?: string,
    dFechaModifico?: string,
    dFechaEnvio?:string,
    dFechaIni?:string,
    dFechaFin?:string,
    nNumero?:string,
    nReembolsable?:string,
    dFechaFinalizado?:string,
}

export interface Usuario{
    id?:number,
    nombre?:string,
}

export interface Detalle{
    nIdGastoDet?: number,
	nIdGastoCosto?: number,
	nIdCentroCosto?: number,
	nIdSucursal?: number,
	nIdPartida?: number,
	nIdDepositario?: number,
	nCantidad?: number,
	nPrecio?: string,
    sTitulo?: string,
    codCiudad?: string,
    ciudad?: string,
    codPartida?: string,
    partida?: string,
    sFullNom?: string,
    sDocumento?:string,
    sNroCuenta?:string,
    sDesc?:string,

}

export interface Partida {
    idCC?: number,
    idSuc?: number,
    sCod?: string,
    sDesc?: string,
    idPer?: number,
    NroDoc?: string,
    Nomper?: string,
    nIdPartida?: number,
    CodEsp?: string,
    desEsp?: string,
    nCantPersonal?: string
}

export interface Campana {
    nIdCentroCosto?: number;
    sCodCC?: string;
    sDescCC?: number;
    nIdCliente?: number;
    sRuc?: string;
    sNombreComercial?: string;
    dirGen?: string;
    dirCue?: string;
    genCue?: string;
    eje?: string;
    idCanal?: number;
    sCanal?: string;
    idsCanal?: number;
    ssCanal?: string;
    codMar?: number;
    desMar?: string;
    nIdMoneda?: number;
    sDesc?: string;
    dFecIni?: string;
    dFecFin?: string;
    nEstado?: string;
    cEleNam?: string;
}

export interface UsuarioNivel{
    nIdEmpUser?: number,
    nCodUser?: number,
    nameUser?: string,
    nIdEmp?: number,
    sRazonSocial?: string,
    nEleCod?: number,
    cEleNam?: string,
    nCodPer?: number,
    nMonto?:string,
    nombre?:string,
    aprobador?: boolean;
}