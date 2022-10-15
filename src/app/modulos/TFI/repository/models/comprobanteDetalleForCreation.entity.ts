export class ComprobanteDetalleForCreation {
    codigoDetalle?: number;
    codigoComprobante?: number;
    codigoCentroCosto: number;
    codigoArticulo: number;
    detalle: string;
    codUniMedida: number;
    cantidad: number;
    precio: number;
    cuenta: number;
    totalAnadido: number;
    subTotal: number;
    importeImpuesto: number;
    total;
    codServicio: number;
    cuentaCont: string;
}

export interface ComprobanteDetalle {
    nIdComprobanteDET: number;
    nIdComprobante:    number;
    centroCosto:       number;
    codigoPpto:        string;
    pptos:             string;
    totalPptos:        number;
    nIdArticulo:       number;
    nombreMedida:        string;
    nombreMaterial:        string;
    detalle:           null;
    unidadMedida:      number;
    cantidad:          number;
    valorVenta:        number;
    aCuenta:           number;
    acuentatotal:           number;
    anadir:            number;
    nSubTotal:         number;
    impuesto:          number;
    total:             number;
    nIdServicio:       number;
    sCuentaCont:       string;
    codigoMaterial:    number;
    precioUnitario:    number;
    subTotal:          number;
    igv:               number;
    cuenta:            string;
    facT_TIPO:         string;
    nIdCliente:        string;
    nombrePresupuesto: string;
    nombreCliente:     string;
    presupuesto:       string;
    descripcionPresupuesto:string;
}