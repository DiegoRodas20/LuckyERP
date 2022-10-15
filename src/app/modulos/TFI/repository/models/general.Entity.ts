import { Moneda } from '../../../control-costos/centroCosto/Models/centroCostos/ICentroCosto';

export class AfectacionEntity {
    public codigoAfectacion: number;
    public descripcionLarga: string;
    public desCodigo: string;
}

export class DetraccionEntity {
    public codigoDetracion: number;
    public descripcionLarga: string;
    public desCodigo: string;
    public porcentaje: number;
    public totalDetraccion: number;
}

export class DocumentoEntity {
    public codigoDocumento: number;
    public descripcionLarga: string
    public descripcionCorta: string;
}

export class ServicioEntity {
    public codigoServicio: number;
    public descripcionLarga: string    
    public descripcionCorta: string;
}

export class EmpresaEntity {
    public codigoEmpresa: number;
    public nombreEmpresa: string;
}

export class ImpuestoEntity {
    public codigoImpuesto: number;
    public descripcionCorta: string;
    public importePorcenje: number;

}

export class MonedaEntity {
    public codigoMoneda: number;
    public descripcionCorta: string;
}

export class PaisEntity {
    public codigoPais: string
    public nombrePais: string;
}

export class TipoCambioEntity {
    public codigoTipoCambio: number;
    public codigoPais: number;
    public fechaConsulta: Date;
    public precioCompra: number;
    public precioVenta: string;
}

export class ComprobanteEntity {
    public documento: string;
    public serie: string;
    public numero: string;
    public fecha: string;
    public cliente: string;
    public cantidad: string;
    public total: string;
    public codigoComprobante: number;
    public tipo: string;

}
export class PresupuestoEntity {
    codigoCliente: number;
    centroCosto: number;
    total: number;
    totalFormato: number;
    codigoPpto: string;
    cliente: string;
    descPpto: string;
    ruc: string;
    aCuenta:number;
    moneda:string;
    cuentaContable: string;
    codigoServicio: number;
    razonSocial: string;
    aprobacionPre: string;
    estado: number;
}

export class ComprobanteYear {
    year: string;
}



// entidades de consultas para comprobante Materiales

export class MaterialesEntity {
    codigoMaterial: number;
    sCodArticulo: string; 
    nombreMaterial: string;
    nombreMedida: string;
}


export class tablaColMaterial {
    codigoComprobanteDet?: number;
    cuenta: any;
    sarticuloServicio?: string;
    articuloServicio: any;
    detalle: string;
    unidadMedida: string;
    cantidad: any;
    precioUnitario: any;
    subTotal: any;
    igv: number;
    total: number;
    ssubTotal?: string;
    sigv?: string;
    stotal?: string;
    editable: boolean;
}


// columnas de las tablas:servicios/materiales
export class ColumnasTablas {

    //Columnas tabla Servicios
    codigoComprobanteDet: number;
    centroCosto: number;
    pptos?: string;
    totalPptos?: number;
    aCuenta?: any;
    anadir?: number;   
    valorVentaPorcentaje?: any;   
    valorVenta?: any;
    impuesto?: number;
    total?: number;
    //Columnas tabla Materiales
    cuenta?: number;
    aCuentaEstatica?: any; // Este campo es para la cuenta inicia
    articuloServicio?: string;
    detalle?: string;
    unidadMedida?: string;
    cantidad?: number;
    precioUnitario?: number;
    subTotal?: number;
    igv?: number;
    editable: boolean;
    cuentaContable?: string;
    codigoServicio?: number;
    cliente?: string;
    codigoCliente?: number;
    moneda?: string;
    isConvertMoneda?: boolean;

    
    ssubTotal ?: string;
    sanadir ?: string;
    simpuesto?: string;
    stotal?: string;
}

export class FormaPago {
    codigoFormaPago: number;
    descripcion: string;
}









