export interface DepositoDto {
  historicoDepositoId?: number;
  empresaId?: number;
  empresa?: null | string;
  direccionId?: number;
  direccion?: null | string;
  areaId?: number;
  area?: null | string;
  estadoId?: number;
  estado?: null | string;
  tipoDepositoId?: number;
  tipoDeposito?: null | string;
  usuarioId?: number;
  codigoUsuario?: null | string;
  nombreUsuario?: null | string;
  bancoId?: number;
  nMes?: number;
  nEjercicio?: number;
  nPersonas?: number;
  nTotal?: number;
  dFechaDeposito?: null | string;
}

export interface EmpresaDto {
  codigo?: null | string;
  direccion?: null | string;
  empresaId?: number;
  paisId?: null | string;
  razonSocial?: null | string;
  ruc?: null | string;
}

export interface BancoDto {
  bancoId?: number;
  codigo?: null | string;
  descripcion?: null | string;
  descripcionCorta?: null | string;
  paisId?: null | string;
}

export interface TipoElementoDto {
  codigo?: null | string;
  descripcion?: null | string;
  descripcionCorta?: null | string;
  paisId?: null | string;
  tipoElementoId?: number;
  tipoElementoPadreId?: number;
}

export interface ElementoDto {
  codigo?: null | string;
  elementoId?: number;
  elementoPadreId?: number;
  nombre?: null | string;
}

export interface RetencionJudicialDto {
  historicoDepositoId?: number;
  retencionJudicialId?: number;
  tipoDocumento?: null | string;
  nroDocumento?: null | string;
  trabajadorId?: number;
  trabajador?: null | string;
  tipoRetencionId?: number;
  tipoRetencion?: null | string;
  bancoId?: number;
  banco?: null | string;
  monto?: number;
}