export interface Proveedor {
    nId: number;
    sRUC: string;
    sRazonSocial: string;
    sNombreComercial: string;
    sContacto: string;
    sDepartamento: string;
    sProvincia: string;
    sDistrito: string;
    sDireccion: string;
    sTelefono1: string;
    sTelefono2: string;
    sCorreo: string;
}

export interface EmpresaTransporte {
    nId: number;
    nIdCliente: number;
    sRUC: string;
    sRazonSocial: string;
    sNombreComercial: string;
    sContacto: string;
    sDepartamento: string;
    sProvincia: string;
    sDistrito: string;
    sDireccion: string;
    sTelefono1: string;
    sTelefono2: string;
    sCorreo: string;
    nVehiculo: number;
    nChofer: number;
    nIdEstado: number;
    sEstado: string;
}

export interface ListasTransporte {
    nId: number;
    sDescripcion: string;
}