import { ComprobanteDetalleForCreation } from './comprobanteDetalleForCreation.entity';
export class ComprobanteForCreation {
    codigoComprobante: number;

    codigoEmpresa: number;
    codigoTipoServicio: number;
    codigoDocumento: number;
    sucursal: string;
    codigoSerie: number;
    numeroSerie: string;
    correlativoSerie: string;
    fechaComprobante: string;
    codigoAfectacion: number;
    codigoMoneda: number;
    codigoTipoCambio: number;
    codigoCliente: number; //del pptos ultima linea.     xdefinir   por default 152    
    ordenCompra: string;
    psOserv: string;
    aceptacion: string;
    glosa: string;
    observacion1: string;
    observacion2: string;
    codigoDetraccion: number;
    porcentajeDetraccion: number;
    totalDetraccion: number;

    codigoDescuentoLugar: number;
    lineasTotalDescuento: number; //xdefinir
    lineasTotalCargos: number;//xdefinir
    lineasTotalPptos: number;//xdefinir
    lineasTotalAnadidos: number;//xdefinir
    lineasValorVenta: number;    //xdefinir

    codigoImpuesto: number;
    impuestoSigla: string;
    importePorcentaje: number;
    importeTotal: number;
    importeTotalFinal: number;//xdefinir

    codigoEstado: number;  // PENDIENTE : 2237, ENVIADO : 2238 
    codigoCreaRegistro: number; 
    lineas:string;
    tipoComp: string;
    opc:number;
    codigoFormaPago: number;
    detalleComprobante?:ComprobanteDetalleForCreation[];

}


