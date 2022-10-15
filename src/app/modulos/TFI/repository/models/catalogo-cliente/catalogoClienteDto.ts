export interface CatalogoClienteDto {
    codigoCliente: number;
    codigoEntidad: number;
    codigoContribuyente: number;
    codigoDocumento: number;
    ruc: string;
    razonSocial: string;
    nombreComercial: string;
    telefono1: string;
    telefono2: string;
    paginaWeb: string;
    contacto: string;
    contactoCorreo: string;
    contactoTelefono: string;
    contactoCargo: string;
    correoFactura: string;
    plazoPago: number;
    giroNegocio: number;
    negocio: string;
    estado: string;
    creado: string;
    modificado: string;
}

export interface TipoEntidad {
    codigoEntidad: number;
    descripcion: string;
}

export interface TipoContribuyente {
    codigoContribuyente: number;
    descripcion: string;
}

export interface TipoDocumentoIdentidad {
    codigoDocumento: number;
    descripcion: string;
    longitud1: number;
    longitud2: number;
    personaJuridica: number;
}

export interface NegocioActividad {
    codigoNegocio: number;
    descripcion: string;
}

export interface Ubigeo {
    codigoUbigeo: number;
    descripcion: string;
}

export interface DireccionCliente {
    codigoDireccion: number;
    direccion: string;
    referencia: string;
    departamento: string;
    provincia: string;
    distrito: string;
    estado: string;
    principal: string;
}

export interface Marca {
    codigoMarca: number;
    descripcion: string;
}

export interface MarcaCliente {
    codigoDetMarca: number;
    codigoMarca: number;
    categoria: string;
    linea: string;
    marca: string;
    estado: string;
}