export interface IYearCreditNotes {
    year: string;
}

export interface IDocumentTypeCreditNotes {
    codigoTipoDoc: number;
    nombreTipoDoc: string
}

export interface IListCreditNotes {
    codigoNotaCredito: number;
    tipoDocumento: string
    serie: string;
    numero: string;
    nombreCliente: string;
    fecha: string;
    fechaRegistro: string;
    tipo: string;
    total: number;
    estado: string;
}

export interface ISerieCreditNotes {
    codigoSerie: number;
    nombreSerie: string
}

export interface IDocumentCreditNotes {
    codigoDocumento: number;
    nombreDocumento: string;
}

export interface ISerieDocCreditNotes {
    codigoSerieDoc: number;
    nombreSerieDoc: string;
}

export interface INumberDocCreditNotes {
    codigoNumeroDoc: number;
    nombreNumeroDoc: string;
}

export interface ISubTypeCreditNotes {
    codigoSubTipo: number;
    nombreSubTipo: string;
}

export interface IPresupuestoCreditNotes {
    codigoPresupuesto: number;
    nombrePresupuesto: string;
}

export interface IArticleCreditNotes {
    codigoArticulo: number;
    nombreArticulo: string;
}

export interface IComprobanteCreditNotes {
    codigoTipoSerMat: number
    parametroTipoSerMat: string
    nombreTipoSerMat: string
    codigoTipoCambio: number
    tipoCambio: number
    codigoMoneda: number
    moneda: string
    codigoTipoAfectacion: number
    nombreTipoAfectacion: string
    nombreOrdenServ: string
    nombreAceptacionServ: string
    nombreSerieDoc: string
    nombreNumeroDoc: string
    observacion1: string
    observacion2: string
    estado: string
    bExistencia: number;
}

export interface IServiceCreditNotes {
    codigoComprobanteDet: number;
    codigoPresupuesto: number;
    nombrePresupuesto: string;
    totalPresupuesto: number;
    cantidadACuenta: number;
    totalAniadido: number;
    subTotal: number;
    impuesto: number;
    total: number;
}

export interface IMaterialCreditNotes {
    codigoComprobanteDet: number;
    codigoArticulo: number;
    nombreArticulo: string;
    detalleArticulo: string;
    codigoUnidadMedida: string;
    nombreUnidadMedida: string;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
    impuesto: number;
    total: number;
}

export interface ITableCreditNotes {
    codigoComprobanteDet: number;
    codigoPresupuesto: number;
    nombrePresupuesto: string;
    totalPresupuesto: number;
    cantidadACuenta: number;
    totalAniadido: number;
    codigoArticulo: number;
    nombreArticulo: string;
    detalleArticulo: string;
    codigoUnidadMedida: number;
    nombreUnidadMedida: string;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
    impuesto: number;
    total: number;
}

export interface IMotiveCreditNotes {
    codigoMotivo: number;
    nombreMotivo: string
}

export interface IStateCreditNotes {
    codigoEstado: number;
    nombreEstado: string
}

export interface ILinesCreditNotesDTO {
    nIdComprobanteDET: number;
}

export interface ICabeceraCreditNotesDTO {
    nIdNotaCredito: number;   
    nIdUsuario: number;
    sPais: string;
    nIdEmpresa: number;
    sSucursal: string
    nIdTipoDocumento:number;

    nIdSerie: number;
    sNombreSerie: string;
    sDocSerie: string;
    sDocNumero: string;

    dDocFecha: string;
    sGlosa: string;
    nSubTipoNC: number;
    nRefIdComprobante: number;
    nIdMotivo: number;
    nIdTipoSerMat:number;
}

export interface ICreditNotesDTO {
    nIdNotaCredito: number;    
    nIdUsuario: number;
    sPais: string;
    nIdEmpresa: number;
    sSucursal: string
    nIdTipoDocumento:number;

    nIdSerie: number;
    sNombreSerie: string;
    sDocSerie: string;
    sDocNumero: string;

    dDocFecha: string;
    sGlosa: string;
    nSubTipoNC: number;
    nRefIdComprobante: number;
    nIdMotivo: number;
    nIdTipoSerMat:number;

    nTotalPptos: number;
    nTotalAñadidos: number;
    nTotalValorVenta: number;
    nImpTotal: number;
    nTotalFinal: number;


    detalleNotaCredito: ILinesCreditNotesDTO[];
    detalleNotaCreditoParcial: ITableCreditNotes[];
}

export interface ICreditNotesById {
    codigoNotaCredito: number;
    codigoTipoDoc:number;
    codigoSerie: number;
    numero: string;
    codigoDocumento: number;
    codigoSerieDoc: number;
    codigoNumeroDoc: number;
    fechaDocumento: string;
    codigoTipoSerMat: number;
    codigoSubTipo: number;
    codigoMotivo: number;
    fechaPicker: string;
    glosa:string;
    codigoEstado:number;
    estado:string;
}

export interface ICreditNotesHistorial {
    codigoNotaCredito: number;
    usuario:string;
    estado:string;
    fecha:string;
    mensaje:string;
}

export interface ICreditNotesCabeceraEditDTO {
    nIdNotaCredito: number;
    nIdUsuario: number;
    sPais: string;
    nIdEmpresa: number;    
    dDocFecha: string;
    sGlosa: string;    
    nIdMotivo: number;
    nSubTipoNC:number;
    nIdTipoSerMat:number;
    
}


export interface ICreditNotesEditDTO {
    nIdNotaCredito: number;
    nIdUsuario: number;
    sPais: string;
    nIdEmpresa: number;    
    dDocFecha: string;
    sGlosa: string;    
    nIdMotivo: number;
    nSubTipoNC:number;
    nIdTipoSerMat:number;

    nTotalPptos: number;
    nTotalAñadidos: number;
    nTotalValorVenta: number;
    nImpTotal: number;
    nTotalFinal: number;
    
    detalleNotaCreditoParcial: ITableCreditNotes[];
}

export interface ICreditNotesChangeDTO {
    nIdNotaCredito: number;
    nIdUsuario: number;
    nSftp: number;
    sPais: string;    
    letraEstado:string
}