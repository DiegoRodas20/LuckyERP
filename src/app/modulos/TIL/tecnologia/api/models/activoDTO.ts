// Tabla principal
export interface ActivoDTO {
  nIdActivo: number;
  nIdAddenda: Number;
  nIdTipo: Number;
  sTipo: String;
  nIdArticulo: Number;
  sCodActivo: String;
  sDescripcion: string;
  sMarca: String
  sSerie: String;
  sNumeroParte: String;
  sNumeroSim: String;
  sCodigoSimCard: String;
  sImei: String;
  dFechaAlta: Date;
  dFechaBaja: Date;
  nIdSimCard: Number;
  sRutaArchivo: string;
  nIdUsuarioCrea: Number;
  dFechaCrea: Date;
  nIdUsuarioModifica: Number;
  dFechaModifica: Date;
  nIdEstado: Number;
  sEstado: string;
  bCelularAsignado: boolean;
  bRepotenciado: boolean;
}

// Detalle (Activo seleccionado)
export interface ActivoRegistroDTO {
  nIdActivo?: Number;
  nIdAddenda?: Number;
  nIdTipo?: Number;
  nIdArticulo?: Number;
  sArticulo?: string;
  sCodActivo?: string;
  nIdMarca?: Number;
  sSerie?: String;
  sNumeroParte?: String;
  sNumeroSim?: String;
  sCodigoSimCard?: String;
  sImei?: String;
  dFechaAlta?: Date;
  dFechaBaja?: Date;
  nIdSimCard?: Number;
  nIdUsuarioCrea?: Number;
  sNombreUsuarioCrea?: String;
  dFechaCrea?: Date;
  nIdUsuarioModifica?: Number;
  sNombreUsuarioModifica?: String;
  dFechaModifica?: Date;
  nIdUsuarioBaja?: number;
  sNombreUsuarioBaja?: string;
  nIdEstado?: number;
  sEstado?: string;
  sRutaArchivo?: String;
  nIdProveedor?: Number;
  nProductoKey?: string;
  sAddenda?: string;
  nNumero?: number;
  sPais?: string;
  nIdSubFamilia?: number;
  nIdTipoDispositivo?: number;
}

// Detalle (Activo Desktop)
export interface ActivoRegistroDesktopDTO {
  nIdActivo: Number;
  nIdAddenda: Number;
  nIdTipo: Number;
  nIdArticulo: Number;
  sCodActivo: String;
  nIdMarca: Number;
  sSerie: String;
  sNumeroParte: String;
  sNumeroSim: String;
  sCodigoSimCard: String;
  sImei: String;
  dFechaAlta: Date;
  dFechaBaja: Date;
  nIdSimCard: Number;
  nIdUsuarioCrea: Number;
  sNombreUsuarioCrea: String;
  dFechaCrea: Date;
  nIdUsuarioModifica: Number;
  sNombreUsuarioModifica: String;
  dFechaModifica: Date;
  nIdUsuarioBaja: number;
  sNombreUsuarioBaja: string;
  nIdEstado: Number;
  sEstado: string;
  sRutaArchivo: String;
  nIdProveedor: Number;
  nProductoKey: string;
  sPais?: string;
  detalle: ActivoDetalleDesktopDTO [];
}

// Creacion / Actualizacion de Simcard
export interface ActivoSimcardTIDTO{
  nIdActivo?: Number;
  nIdTipo?: Number;
  nIdArticulo?: Number;
  sCodActivo?: String;
  sNumeroSim?: String;
  sCodigoSimCard?: String;
  dFechaAlta?: Date;
  dFechaBaja?: Date;
  nIdUsuarioCrea?: Number;
  dFechaCrea?: Date;
  nIdUsuarioModifica?: Number;
  dFechaModifica?: Date;
  nIdEstado?: Number;
  sPais?: string;
}

// Creacion / Actualizacion de Movil
export interface ActivoMovilTIDTO{
  nIdActivo?: Number;
  nIdTipo?: Number;
  nIdArticulo?: Number;
  sCodActivo?: String;
  sImei?: String;
  dFechaAlta?: Date;
  dFechaBaja?: Date;
  nIdSimCard?: Number;
  nIdUsuarioCrea?: Number;
  dFechaCrea?: Date;
  nIdUsuarioModifica?: Number;
  dFechaModifica?: Date;
  nIdEstado?: Number;
  sPais?: string;
}

// Creacion / Actualizacion de Laptop
export interface ActivoLaptopDesktopTIDTO{
  nIdActivo?: Number;
  nIdTipo?: Number;
  nIdAddenda?: Number;
  nIdArticulo?: Number;
  sCodActivo?: String;
  sNumeroParte?: String;
  sSerie?: String;
  dFechaAlta?: Date;
  dFechaBaja?: Date;
  nIdUsuarioCrea?: Number;
  dFechaCrea?: Date;
  nIdUsuarioModifica?: Number;
  dFechaModifica?: Date;
  nIdEstado?: Number;
  sPais?: string;
}

// Creacion / Actualizacion de Desktop
export interface ActivoDesktopTIDTO{
  nIdActivo?: Number;
  nIdTipo?: Number;
  nIdAddenda?: number;
  nIdArticulo?: Number;
  sCodActivo?: String;
  nProductoKey?: string;
  dFechaAlta?: Date;
  dFechaBaja?: Date;
  nIdUsuarioCrea?: Number;
  dFechaCrea?: Date;
  nIdUsuarioModifica?: Number;
  dFechaModifica?: Date;
  nIdEstado?: Number;
  sEstado?: string;
  sPais?: string;
  detalle?: ActivoDetalleDesktopDTO [];
}

// Detalle del Desktop (Componentes de la computadora)
export interface ActivoDetalleDesktopDTO{
  nIdDetActivo: number;
  nIdActivo: number;
  nIdTipoParte: number;
  nIdArticulo: number;
  sArticulo: string;
  sTipoParte: string;
  sSerie: string;
  sNumeroParte: string;
  sRutaArchivo: string;
}

// Combobox tipo (Tabla principal)
export interface ActivoTipoDTO {
  nId: number;
  sDescripcion: string;
  nIdSubFamilia: number;
}

// Combobox (Controles)
export interface ActivoSelectItemDTO {
  nId: number;
  sDescripcion: string;
}

// Combobox Addendas (Laptop/Desktop)
export interface ActivoSelectItemAddendaDTO {
  nId: Number;
  sDescripcion: String;
  sEstado: String;
}

// Combobox articulo (Incluye la ruta de la imagen y el tipo de dispositivo)
export interface ActivoSelectItemArticuloDTO {
  nId: number;
  sDescripcion: string;
  sRutaArchivo: string;
  sTipoDispositivo: string;
  nIdDetAddenda?: number;
  sNumeroParte?: string;
}

// Detalle de la addenda (Activo Laptop/Desktop)
export interface ActivoDetalleAddendaDTO {
  sCantidad: String;
  dFechaInicio: Date;
  dFechaFin: Date;
}

// Plan de datos con operadores (Insersion masiva del excel / Activo Simcard)
export interface ActivoPlanDatosOperadorDTO {
  nIdPlan: Number;
  sPlan: String;
  nIdOperador: Number;
  sOperador: String;
}

// Historial de asignaciones
export interface ActivoHistorialAsignacionDTO {
  nIdDetActivoAsigna: number;
  sEmpresa: string;
  nIdActivo: number;
  nIdTipoActivo: number;
  nIdPersonal: number;
  sUsuarioAsignado: string;
  sObservacion: string;
  nImporte: number;
  nIdUsuario: number;
  sUsuarioEntrega: string;
  dFechaEntrega: Date;
  sUsuarioDevolucion: string;
  dFechaDevolucion: Date;
  dFecha: Date;
  nIdPenalidad?: number;
  nPenalidad: number;
  sEstado: string;
}

// Plantilla del Excel para Laptop / Desktop
export interface ActivoExcelLaptopDesktopDTO{
  nIdActivo: number,
  sProveedor: string,
  sAddenda: string,
  sTipoActivo: string,
  nIdDetAddenda: number;
  sArticulo: string,
  sDescripcion: string,
  sCodigoEquipo: string,
  sPartNumber: string,
  sNumeroSerie: string
}

// Plantilla del Excel para SIMCard
export interface ActivoExcelSimcardDTO{
  sNumeroSim: string;
  sCodigoSimCard: string;
  sOperador: string;
  dFechaAlta: Date;
  sPlanDatos: string;
}

// Codigo autogenerado Laptop / Desktop
export interface ActivoCodigoLaptopDesktopDTO{
  sCodActivo: string;
  sPrefijo: string;
}

// Control del Excel para el SQL 
export interface ActivoExcelLaptopDesktopCabeceraDTO extends ActivoExcelLaptopDesktopDTO{
  dFechaCrea: Date,
  nCantidad: number,
  nIdAddenda: number;
}

// Resumen de activos general
export interface ActivoResumenDTO{
  nIdTipoDispositivo?: number;
  nIdArticulo?: number;
  sTipoActivo?: string;
  sArticulo?: string;
  sComponentes?: string;
  nGabetaStock?: number;
  nStockProvincia?: number;
  nGabetaRevision?: number;
  nAsignado?: number;
  nAsignadoRevision?: number;
  nReposicion: number;
  nTotalActivos?: number;
  sRutaArchivo?: string;
}

export interface ActivoRelacionadoDTO{
  nIdDetActivoRelacion?: number ;
  nIdActivo?: number ;
  nIdActivoRelacion?: number ;
  sActivoRelacion?: string;
  nIdUsuario?: number ;
  sUsuario?: string;
  dFecha?: Date;
  bEstado?: boolean;
  sPais?: string;
  sRutaArchivo?: string;
}

export interface ActivoDescuentosPersonalDTO{
  sDocumento?: string;
  nIdPersonal?: number;
  sPersonal?: string;
  nImporte?: number;
  dFecha?: Date;
  dFechaInicio?: Date;
  dFechaFin?: Date;
}

export interface ActivoCaracteristicasDTO{
  sDescripcion?: string;
  bRepotenciado?: boolean;
}