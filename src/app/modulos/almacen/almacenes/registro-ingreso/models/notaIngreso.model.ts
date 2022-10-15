export interface Nota_Ingreso_RI {
    nId: number;
    sDocumento: string;
    nIdCentroCosto: number;
    sDescripcion: string;
    nIdAlmacen: number;
    sAlmacen: string;
    sSolicitante: string;
    sFecha: string;
    sHora: string;
    sHoraFin: string;
    nIdServicio: number;
    sServicio: string;
    sSubCanal: string;
    sNombreComercial: string;
    sFechaIni: string;
    sFechaFin: string;
    sDirector: string;
    sEjecutivo: string;
    sObservacionNota: string;
    sNombreCreador: string;
    sFechaCreado: string;
    nEstadoNota: number;
    sEstadoNota: string;
}

export interface Articulo_NI {
    nIdDetOperMov: number;
    sArticulo: string;
    nCantidad: number;
    sObservacion: string;
}