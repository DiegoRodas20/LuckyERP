export interface ArticuloTIDTO {
  nIdArticulo: number;
  sCodArticulo: string;
  sNombreProducto: string;
  sPartNumber: string;
  sRutaArchivo: string;
}

export interface ArticuloRqActivoTIDTO extends ArticuloTIDTO {
  nIdActivo: number;
  sCodActivo: string;
  sAddenda: string;
  sNombrePerfil: string;
  sDatosActivo: string;
  nDescuento: number | null;
}

export interface InformacionArticuloTIDTO {
  nIdArticulo: number;
  sInformacion: string;
  bRepotenciado: boolean;
}

export interface ArticuloDto {
  nIdArticulo: number;
  sCodArticulo: string;
  sArticulo: string;
  sLote: string;
  sCategoria: string;
  sMarca: string;
  sFoto: string;
  sAreaRegistro: string;
  sEstado: string;
  sImagen: string;
  sNumeroParte: string;
}

export enum EArticulo {
  SUBFAMILIA = 2,
  MARCA = 3,
  TIPO_UNIDAD = 4,
  CARACTERISTICAS = 8
}

export interface ArticuloTI {
  sCategoria: string;
  nIdSubFamilia: number;
  nIdMarca: number;
  sNombreProducto: string;
  sCaracteristica: string;
  sPresentacion: string;
  nIdPresenMedida: number;
  sCodArticulo: string;
  sCreacion: string;
  sModificacion: string;
  sEstado: string;
  sImagen: string;
  sArchivo: string;
  sCodBarra: string;
  sRutaQr: string;
  sIdPais: string;
  nIdUser: number;
  nIdTipoDispositivo: number;
  sNumeroParte: string;
  componentes: ComponenteTI[];
}

export interface ArticuloTIResponse {
  nIdArticulo: number;
  result: string;
}

export interface ComponenteTI {
  nIdComponente: number;
  sDescripcion: string;
  sName: string;
}

export interface ArticuloTIPrecioDTO{
  nIdDetArticuloPrecio?: number;
  nIdArticulo?: number;
  nPrecio?: number;
  nIdMoneda?: number;
  sMoneda?: string;
  nIdUsrRegistro?: number;
  sUsuarioRegistro?: string;
  dFechaRegistro?: Date;
  bEstado?: boolean;
  sEstado?: string;
  sPais?: string;
}