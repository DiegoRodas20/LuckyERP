export interface PptoNoConsiderarDto {
    
    presupuestoEmpresaID: number;
    razonSocial: string;
    anio: number;
    cantidadPresupuesto: string;
    estado: string;

}

export interface Empresa {
    
    empresaID: number;
    razonSocial: string;

}

export interface Presupuesto {

    presupuestoID: number;
    codigoPresupuesto: string;
    descripcionPresupuesto: string;
    razonSocial: string;

}

export interface PresupuestoxEmpresa {
    
    presupuestoDetalleID: number;
    codigoPresupuesto: string;
    descripcionPresupuesto: string;
    razonSocial: string;
    
}