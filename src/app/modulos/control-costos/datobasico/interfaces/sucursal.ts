export interface Sucursal {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
    nEstado: number;
    sEstado: string;
}

export interface Empresa{
    nId: number;
    sRUC: string;
    sDescripcion: string;
}

export interface SucEmpresa{
    nIdEmpSuc: number;
    bEstadoEmpSuc: number;
    sEstadoEmpSuc: string;
    //Sucursal
    nIdSucursal: number;
    sCodSucursal: string;
    sDescSucursal: string;
    //Usuario que lo creo
    nIdUsr_C: number;
    sNombreUsr_C: string;
    sFechaCreacion: string;
    //Usuario que lo modifico
    nIdUsr_M?: number;
    sNombreUsr_M?: string;
    sFechaModifico?: string;
}