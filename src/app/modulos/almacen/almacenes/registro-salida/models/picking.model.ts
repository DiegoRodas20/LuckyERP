export interface Picking_RS {
    nId: number;
    sGuia: string;
    sCentroCosto: string;
    sDestino: string;
    sNota: string;
    sAlmacen: string;
    sEstado: string;
}

export interface Reporte_Picking {
    nId: number;
    sCodArticulo: string;
    sArticulo: string;
    sFechaExpira: string;
    sUbicacion: string;
    nCantidad: number;
}