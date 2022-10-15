

export interface IRetencion {
  retencionId: number;
  tipoDocumentoDemandado: string;
  nroDocumentoDemandado: string;
  personalId: string;
  demandado: string;
  tipoRetencionId: string;
  tipoRetencion: string;
  tipoDocumentoIdBeneficiario: string;
  tipoDocumentoBeneficiario: string;
  nroDocumentoBeneficiario: string;
  beneficiario: string;
  bancoId: string;
  banco: string;
  nroCuenta: string;
  nroCuentaI: string;
  monedaId: string;
  moneda: string;
  fechaIngreso: string;
  fechaCese: string;
  fechaInicio: Date;
  fechaTermino: Date;
  monto: number;
  conceptoId: string;
  concepto: string;
  urlSustento: string;
  tieneDeposito: string;

  // Datos del personal
  sNombres: string;
  sCodPlla: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
}

export interface IConcepto {
  checked: boolean;
  id: string;
  nombre: string;
}

export interface ITipoDocumento {
  id: string;
  nombre: string;
}

export interface ITipoRetencion {
  id: string;
  nombre: string;
}

export interface IBanco {
  id: string;
  nombre: string;
}

export interface IMoneda {
  id: string;
  nombre: string;
}

export interface IDetalleConcepto {
  id: string;
  nombre: string;
}

export interface IDetalleBeneficiario {
  tipoDocumento: string;
  nroDocumento: string;
  beneficiario: string;
  banco: string;
  nroCuenta: string;
  nroCuentaI: string;
  moneda: string;
}

export interface IEstado {
  id: string;
  nombre: string;
}

export interface IMes {
  id: string;
  nombre: string;
}

export interface IAnio {
  id: string;
  nombre: string;
}

export interface IDeposito {
  retencionId: number;
  tipoDocumentoTrabajador: string;
  nroDocumentoTrabajador: string;
  trabajadorId: string;
  trabajador: string;
  tipoDocumentoIdBeneficiario: string;
  tipoDocumentoBeneficiario: string;
  nroDocumentoBeneficiario: string;
  beneficiario: string;
  bancoId: string;
  banco: string;
  nroCuenta: string;
  nroCuentaI: string;
  monedaId: string;
  moneda: string;
  tipoRetencionId: string;
  tipoRetencion: string;
  monto: string;
  anio: string;
  mes: string;
  devengueId: string;
  devengue: string;
  fechaDeposito: string;
  conceptoId: string;
  concepto: string;
  importe: string;
  importeRetenido: string;
  estadoId: string;
  estado: string;
  urlSustento: string;
  depositoId: string;
  fechaDevengue: Date;
}

export interface IConceptosPorPersona {
  personalId: string;
  conceptoId: string;
  concepto: string;
  importe: number;
}

export interface IDepositoDevengue {
  depositoId: string;
  devengueId: string;
}