export interface CabeceraModel {
    ruc: string;
    razon_social: string;
    direccion: string;
    distrito: string;
    provincia: string;
    departamento: string;
    contacto_nombre: string;
    contacto_cargo: string;
    contacto_telefono: string;
    contacto_email: string;
    cuenta_banco: string;
    cuenta_nro: string;
    comprador: string;
    email: string;
    cliente: string;
    ppto: string;
    solicitante: string;
    lugar_entrega: string;
    plazo_pago: string;
    moneda: string;
    observaciones: string;
    fecha_entrega: string;
    subtotal: number;
    servicios: number;
    igv: number;
    total: number;
    usuario: string;
    sDocumento?: string;
    sSimboloMoneda?: string;
    igvPorc?: number;
    servicioPorc?: number;
    sTipoOC?: string;
    sFechaEmision?: string;
    nIdEmp?: number;
    sRucEmpresa?: string;
    sDireccionEmp?: string;
    sEmpresa?: string; 
    sEstado?: string;
    scVinculada:string;
  }
  
  export interface DetalleModel {
    item: number;
    codigo: number;
    descripcion: string;
    detalle: string;
    cant: number;
    u_med: number;
    precio: number;
    total: number;
  }