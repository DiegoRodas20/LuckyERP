export interface Direccion {
    nIdDireccion: number;
    sCodigoDireccion: string;
    sDescripcion: string;
    bEstado: number;
    sEstado: string;
}

export interface Area {
    nIdArea: number
    sCodigoArea: string;
    sDescripcion: string;
    bEstado: number;
    sEstado: string;
}

export interface Cargo {
    nIdCargo: number;
    sCodigoCargo: string;
    sDescripcion: string;
    bEstado: number;
    sEstado: string;
}
export interface Moneda {
    nIdMoneda: number;
    sCodigoMoneda: string;
    sDescripcion: string;
    bEstado: number;
    sEstado: string;
    nParam: number;
}

export interface TiposCC {
    nIdTiposCC: number;
    sCodigoTiposCC: string;
    sDescripcion: string;
    bEstado: number;
    sEstado: string;
}

export interface CentroCosto {
    nIdCC: number;
    sCodCC: string;
    sDescCC: string;

    //Tipo de centro de costo
    nIdTipoCC: number;
    sCodTipoCC: string;
    sNombreTipoCC: string;

    //Direccion
    nIdDireccion: number;
    sCodDireccion: string;
    bEstadoDireccion: number;
    sDescDireccion: string;

    //Area
    nIdArea: number;
    sCodArea: string;
    bEstadoArea: string;
    sDescArea: string;

    //Cargo
    nIdCargo: number;
    sCodCargo: string
    bEstadoCargo: number;
    sDescCargo: string;

    ///////////////////////////////////////
    nSubCargo: number;
    sSubCargo: string;
    nIdPuesto: number;
    sCodSubCargo:string;

    sFechaIni: string;
    sFechaFin: string;

    //Moneda
    nIdMoneda: number;
    sCodMoneda: string;
    bEstadoMoneda: string;
    sDescMoneda: string;
    sAbrevMoneda: string;

    ///////////////////////////////////////////////////

    nEstadoCC: number;
    sEstadoCC: string;

    //Usuario que lo creo
    nIdUsr_C: number;
    sNombreUsr_C: string;
    /////////////////////////////////////////////////
    sFechaCreacion: string;

    //Usuario que lo modifico
    nIdUsr_M?: number;
    sNombreUsr_M?: string;
    /////////////////////////////////////////////////

    sFechaModifico?: string;

    ///Empresa en la que se registro
    nIdEmp: number;
    sCodEmp: string;
    sRUCEmp: string;
    sRazonSocialEmp: string;
}

export interface EmpresaSucursal {
    nIdEmpSuc: number;
    bEstadoEmpSuc: number;
    sEstadoEmpSuc: string;
    //Empresa 
    nIdEmp: number;
    sCodEmp: string;
    sRazonsSocialEmp: string;
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

export interface DetalleCC {
    nIdCCS: number;
    bEstadoCCS: number;
    sEstadoCCS: string;
    //Sucursal
    nIdEmpS: number;
    nIdSucursal?: number;
    sCodEmpS: string;
    sDescSucursal: string;
    //Usuario que lo creo
    nIdUsr_C: number;
    sNombreUsr_C: string;
    sFechaCreacion: string;
    //Usuario que lo modifico
    nIdUsr_M?: number;
    sNombreUsr_M?: string;
    sFechaModifico?: string;
    pOpcion?: number;
}

export interface Personal {
    nId: number;
    sDescripcion: string;
}

export interface Cargo {
    nId: number;
    nCodigoPartida: number;
    sDescripcion: string;
}

export interface CCS_Personal {
    nIdCCSP: number;
    nEstadoCCSP: number;
    sEstadoCCSP: string;
    nIdCCS: number;
    nIdPersonal: number;
    sDescPers: string;
    sDocumentoPersonal: string;
    //Usuario que lo creo
    nIdUsr_C: number;
    sNombreUsr_C: string;
    sFechaCreacion: string;
    //Usuario que lo modifico
    nIdUsr_M?: number;
    sNombreUsr_M?: string;
    sFechaModifico?: string;
    pOpcion?: number;
}

export interface Empresa {
    nId: number;
    sCod: string;
    sDesc: string;
}