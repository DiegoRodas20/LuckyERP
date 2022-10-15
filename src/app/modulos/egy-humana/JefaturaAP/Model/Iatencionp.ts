export namespace nsAtencionp {
  export interface SearchPerson {
    nId: number;
    nIdPlla: number;
    sCodPlla: string;
    sNombres: string;
    sDscPlla: string;
    nIdTipoDoc: number;
    sTipo: string;
    sDscTipo: string;
    sDocumento: string;
    dFechIni: Date;
    dFechFin: Date;
    sCategoria: string;
    nIdEmp: number;
    nEstado: number;
    nModo: boolean;
  }

  export interface IPeriodosLaborales {
    periodoLaboralId: number;
    nIdPersonal: number;
    sFechIni: string;
    sFechFin: string;
  }

  export interface IPeriodosCalculados {
    position: number;
    periodoLaboralId: number;
    anio: string;
    nroMes: number;
    mes: string;
    montoIngresos: number;
    montoDescuento: number;
    montoNeutro: number;
    montoNeto: number;
  }

  export interface IConceptosCalculados {
    periodoLaboralId: number;
    anio: string;
    nroMes: number;
    mes: string;
    concepto: string;
    importe: number;
    valor: number;
  }

  export interface IAtencionPersonal {
    periodosLaborales: IPeriodosLaborales[];
    periodosCalculados: IPeriodosCalculados[];
    conceptosCalculados: IConceptosCalculados[];
  }

  export interface IPeriodoLaboral {
    periodoLaboralId: number;
    fechaInicio: string;
    fechaFin: string;
  }

  export interface IAnio {
    value: string;
    text: string;
    periodoLaboralId: number;
  }

  export interface IMes {
    value: number;
    text: string;
    anio: string;
  }

  export interface IRemuneracion {
    periodosLaborales: IPeriodosLaborales[];
    periodosCalculados: IPeriodosCalculados[];
    tiposPeriodo: ITipoPeriodo[];
  }

  export interface ITipoPeriodo {
    id: string;
    descripcion: string;
  }

  export interface ITipoRemuneracion {
    id: number;
    descripcion: string;
  }

  export interface IRemuneracionData {
    tipoId: number;
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
    importe: number;
    valor1: string;
    valor2: string;
  }

  export interface IRemuneracionCabecera {
    periodo: string;
    tipoId: number;
    tipo: string;
    dias: number;
    importe: number;
  }

  export interface IRemuneracionDetalle {
    tipoId: number;
    tipo: string;
  }

  export interface IExpandedAsistencia {
    periodo: string,
    supervisor: string;
    cliente: string;
    dias: number;
  }

  export interface IExpandedSubsidio {
    periodo: string,
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
    dias: number;
  }

  export interface IExpandedVacaciones {
    periodo: string,
    responsable: string;
    fechaInicio: string;
    fechaFin: string;
    dias: number;
  }

  export interface IExpandedKPI {
    periodo: string,
    tipo: string;
    campania: string;
    cliente: string;
    importe: number;
  }

  export interface IBoleta {
    sueldoBasico: number;
    descuentoEps: number;
    fondoPensiones: number;
    seguroInvalidez: number;
    comisionVariable: number;
    periodoLaboralId: number;
  }

  export interface IRenunciaPersonal {
    personal: IPersonal;
    renunciaVigente: IRenunciaVigente;
    motivosRenuncia: IMotivoRenuncia[];
  }

  export interface IPersonal {
    personalId: number;
    personal: string;
    supervisorId: number;
    supervisor: string;
    campaniaId: string;
    campania: string;
    clienteId: number;
    nombreComercial: string;
    centroCostoId: number;
    fechaInicioContrato: Date;
    fechaFinContrato: Date;
    periodoLaboralId: number;
  }

  export interface IRenunciaVigente {
    personalId: number;
    personal: string;
    supervisorId: number;
    supervisor: string;
    campaniaId: string;
    campania: string;
    clienteId: number;
    nombreComercial: string;
    centroCostoId: number;
    fechaInicioContrato: Date;
    fechaFinContrato: Date;
    periodoLaboralId: number;
    fechaRenuncia: Date;
    telefonoMovil: string;
    motivoId: number;
    observacion: string;
    adeuda: string;
    renunciaId: number;
  }

  export interface IMotivoRenuncia {
    motivoId: number;
    motivo: string;
  }

  export interface IDescuento {
    descripcion: string;
    fechaPrestamo: string;
    importe: number;
    cuotas: number;
    nroCuota: number;
    fechaPago: string;
    importePagado: number;
    saldo: number;
    anio: string;
    nroMes: string;
    mes: string;
    tipoPeriodo: string;
  }
}
