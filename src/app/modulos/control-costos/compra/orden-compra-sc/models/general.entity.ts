export class Solicitante {
    nId: number;
    sDescripcion: string;
}
export class Cotizaciones {
    nIdCotizacion: number;
    sCorrelativo: string;
    codigoCentroCosto: number;
}

export class SolicitanteCotizaciones {
    sTitulo: string;
    sNombreComercial: string;
    sCodCC: string;
    dFchEntregaDeseada: Date;
    direccion: string;
    descripcionServicio: string;
    codigoLugarEntrega: number;
    codigoServicio: number;
}

export class TipoServicio {
    codigoServicio: number;
    descripcionServicio: string;
}

export class Proveedor {
    codigoProveedor: number;
    sNombreComercial: string;
    nPlazoPago: number;
    sContacto: string;
}

export class BancoProveedor {
    codigoBanco: number;
    sDesc: string;
    codigoClienteBanco: number
}

export class LugarEntrega {
    codigoLugarEntrega: number;
    lugarEntrega: string;
    direccion: string
}


export class Moneda {
    codigoMoneda: number;
    nombreMoneda: string;
    codigoBanco: number
}

export class GeneralData {
    nIdCotizacionDet: number;
    codigoPartida: number;
    descripcionPartida: string;
    codigoSucursal: number;
    descripcion: string;
    codigoArticulo: number;
    descripcionArticulo: string;
    cantidad: number;
    total?: number;
    precio?: number;
    precioLucky?: number;
    precioProv?: number;
    totalProv?: number;
    totalLucky?: number;
    editable: boolean;
}
export class Documento {
    nId: number;
    sDescripcion: string;    
}