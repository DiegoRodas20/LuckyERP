export interface PptoPendienteFacturarDto {
    anio: number;
    directoraGeneral: string;
    gerenteCuentas: string;
    ejecutivo: string;
    presupuesto: string;
    nombrePresupuesto: string;
    estadoPresupuesto: string;
    servicio: string;
    fechaInicio: string;
    fechaFin: string;
    cliente: string;
    estadoFacturacion: string;
    subTotal: number;
    descuento: number;
    totalFee: number;
    totalPresupuesto: number;
    ciudad: string;
    totalCiudad: number;
    pendienteFacturar: number;
    importePendiente: number;
}

export interface Anio {
    anio: number;
}