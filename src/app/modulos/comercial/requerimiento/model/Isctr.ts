export interface ListaSctr {
    codPresu: number;
    nombrePresu: string;
    tipoDoc: string;
    nroRq: string;
    titulo: string;
    enviado: string;
    total: number;
    estado: string;
}

export interface Sctr {
    nIdGastoCosto?:number;	
	nIdEmpresa?:number;
	sNombreComercial?:string;
	nIdCentroCosto?:number;
	sCodCC?:string;
	sDescCC?:string;
	nIdSolicitante?:number;
	sFullNom?:string;	
	sTipoDoc?:string;	
	sTitulo?:string;	
	nIdTipoCambio?:number;	
	nIdMoneda?:number;	
	sDesc?:string;
	nEstado?:number;
	cEleNam?:string;
	dFechaRegistro?:string;	
    dFechaModifico?:string;
    dFechaEnvio?:string;
    dFechaFinalizado?:string;
    dFecha?: string;
    mes?:string;
    nNumero?:string;
    venta?: string;
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

export interface Detalle{
    nIdGastoDet?: number,
	nIdGastoCosto?: number,
	nIdCentroCosto?: number,
	nIdSucursal?: number,
	nIdPartida?: number,
    nIdDepositario?: number,
    sDocumento?: string,
	nCantidad?: number,
	nPrecio?: number,
    sTitulo?: string,
    codCiudad?: string,
    ciudad?: string,
    codPartida?: string,
    partida?: string,
    sFullNom?: string
}

export interface Beneficiario{
    nIdPersonal?: number,
    sDocumento?: string,
    sFullNom?: string,
    sDesc?: string,
    nTelMovil?: string,
    cUser?: string,
    email?: string,
    nameUser?: string,
    nImporte?: number,
    concepto?: string
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
    venta?:number,
    aprobador?: boolean;
}

export interface cboMes {
    cod?:string,
    mes?:string,
    activo?:number,
}

export interface Aprobacion{
    nIdGastoEstado?:string,
    nIdGastoCosto?:string,
    nIdUsuario?:string,
    dFecha?:string,
    nIdEstado?:string,
    sFullNom?:string,
    estado?:string,
    nEleCod?:string,
    cargo?:string,
}

