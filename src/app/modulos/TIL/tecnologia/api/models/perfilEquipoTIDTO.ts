import { TipoElementoDto } from "./tipoElementoDTO";

export interface PerfilEquipoTIDTO {
    nIdPerfilEquipo: number;
    sNombrePerfil: string;
    nIdArticulo: number;
    nMeses: number;
    nAnios: number;
    nCosto: number;
    nIdUsrCreacion: number;
    dFechaCreacion: Date | string;
    nIdUsrModifica: number;
    dFechaModifica: Date | string;
    bEstado: boolean;
    nIdTipoActivo: number;
    nIdTipoDispositivo: number;
    nIdMoneda: number;
}

export interface DetallePerfilEquipoTIDTO {
    nIdPerfilEquipoCargo: number;
    nIdPerfilEquipo: number;
    nIdCargo: number;
    bEstado: boolean;
}

export interface DetallePerfilEquipoArticuloTIDTO {
    nIdPerfilEquipoArticulo: number;
    nIdPerfilEquipo: number;
    nIdArticulo: number;
    bEstado: boolean;
}
export interface DetallePerfilEquipoArticuloTableTIDTO{
    nIdPerfilEquipoArticulo: number;
    nIdPerfilEquipo: number;
    nIdArticulo: number;
    sArticulo: string;
    sCaracteristica: string;
    sRutaArchivo: string;
    bEstado: boolean;
}

export interface PerfilEquipoCabeceraTIDTO {
    nIdPerfilEquipo: number;
    sNombrePerfil: string;
    nIdArticulo: number;
    nMeses: number;
    nAnios: number;
    nCosto: number;
    nIdUsrCreacion: number;
    dFechaCreacion: Date | string;
    nIdUsrModifica: number;
    dFechaModifica: Date | string;
    bEstado: boolean;
    sIdPais: string;
    nIdTipoActivo: number;
    nIdMoneda: number;
    nIdTipoDispositivo: number;
    detallePerfilEquipos: DetallePerfilEquipoTIDTO[];
    detalleArticulo: DetallePerfilEquipoArticuloTIDTO[];
}

export interface PerfilEquipoTableTIDTO {
    nIdPerfilEquipo: number;
    sSubFamilia: string;
    sNombreProducto: string;
    sRutaArchivo: string;
    nCosto: number;
    sNombrePerfil: string;
    sCargos: string;
    sTiempoGarantia: string;
    bEstado: boolean;
    sEstado: string;
}


export interface PerfilEquipoUnoTIDTO {
    nIdPerfilEquipo: number;
    sNombrePerfil: string;
    nIdArticulo: number;
    nIdSubFamilia: number;
    nMeses: number;
    nAnios: number;
    nCosto: number;
    nIdUsrCreacion: number;
    sUsrCreacion: string;
    dFechaCreacion: string;
    nIdUsrModifica: number;
    sUsrModifica: string;
    dFechaModifica: string;
    bEstado: boolean;
    sEstado: string;
    nIdTipoActivo: number;
    nIdMoneda: number;
    nIdTipoDispositivo: number;
    nIdPenalidad: number;
    detallePerfilEquipos: TipoElementoDto[];
    detalleArticulo: DetallePerfilEquipoArticuloTableTIDTO[];
}

export interface PerfilEquipoEstadoTIDTO {
    nIdPerfilEquipo: number;
    bEstado: boolean;
    nIdUsrModifica: number;
    sIdPais: string;
}

export interface MonedaPerfilTIDTO {
    nIdTipEle: number;
    sDesc: string;
    bEsOficial: boolean;
}

export interface PerfilEquipoPenalidadDTO{
    nIdPenalidad?: number;
    nIdPerfilEquipo?: number;
    nCosto?: number;
    nPrecioVenta?: number;
    nNoDevolucion?: number;
    nIdUsrRegistro?: number;
    dfechaRegistro?: Date;
    bEstado?: boolean;
    sPais?: string;
    detalle?: PerfilEquipoPenalidadDetalleDTO[];
}

export interface PerfilEquipoPenalidadDetalleDTO{
    nIdDetPenalidad?: number;
    nIdPenalidad?: number;
    nMesSiniestro?: number;
    nPrecioCalculado?: number;
    nNoDevolucion?: number;
    nCostoNuevo?: number;
    nPrecioTotal?: number;
}

export interface PerfilEquipoSelectItemDTO{
    nId: number;
    sDescripcion: string;
}