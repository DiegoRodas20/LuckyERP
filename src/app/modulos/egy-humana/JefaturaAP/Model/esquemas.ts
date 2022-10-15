import { SecurityErp } from "src/app/modulos/AAHelpers";

export interface EsquemaAfpNetDto {
  sNombreCompleto: string;
  sTipoDocumento: string;
  sNumeroDocumento: string;
  sFechaIni: string;
  sFechaFin: string;
  sCargo: string;
  sNombreAfp: string;
  sCiudad: string;
  nImporte: string;
  sUserReg: string;
  sFechaReg: string;
}

export class EsquemaAfpNetFilter {
  dFechaDesde: string;
  dFechaHasta: string;
  sRegPensionarios: string;
  nCodUser: number;
  sIdPais: string;
  nIdEmpresa: number;
  constructor(filter: any, session: SecurityErp) {
    this.dFechaDesde = filter.dFechaDesde?.format('YYYY-MM-DD');
    this.dFechaHasta = filter.dFechaHasta?.format('YYYY-MM-DD');
    this.sRegPensionarios = filter?.nRegPensionario.join(',');
    this.nCodUser = filter?.nCodUser;
    this.sIdPais = session.getPais();
    this.nIdEmpresa = Number(session.getEmpresa());
  }
}
export namespace Esquema {
  export interface InfoPersonalDto {
    sNombreCompleto: string;
    sFechaNacimiento: string;
    sSexo: string;
    sEstCivil: string;
    sNroCelular: string;
    sCorreo: string;
    bDiscapacidad: string;
    sResponsable: string;
    sNacionalidad: string;
    sTipoDocumento: string;
    sNroDocumento: string;
    sDireccion: string;
    sDepartamento: string;
    sProvincia: string;
    sDistrito: string;
    sReferencia: string;
    sCodUbigeo: string;
    sFechaIni: string;
    sFechaFin: string;
    sMotivo: string;
    sPlanilla: string;
    sArea: string;
    sCargo: string;
    sPuesto: string;
    sEspecialidad: string;
    sRegTipo: string;
    sRegPensionario: string;
    sRegCuspp: string;
    sHaberesBanco: string;
    sHaberesCuenta: string;
    sHaberesMoneda: string;
    sHaberesDocumento: string;
    sCTSBanco: string;
    sCTSCuenta: string;
    sCTSMoneda: string;
    sCTSDocumento: string;
    sSueldoTipo: string;
    sSueldoBasico: string;
    sSucursal: string;
  }
  export class InfoPersonalFilter {
    dFechaDesde?: string;
    dFechaHasta?: string;
    sRegPensionarios?: string;
    nCodUser?: number;
    constructor(filter: any) {
      this.dFechaDesde = filter.dFechaDesde?.format('YYYY-MM-DD');
      this.dFechaHasta = filter.dFechaHasta?.format('YYYY-MM-DD');
      this.sRegPensionarios = filter?.nRegPensionario.join(',');
      this.nCodUser = filter?.nCodUser;
    }
  }
}

export interface EsquemaColumn {
  header: string;
  field: string;
  type?: string;
  width?: number;
  align?: string;
  disable?: boolean;
  isHeader?: boolean;
  columns?: EsquemaColumn[];
}

export namespace EEsquema {
  export enum AfpNet {
    REGIMEN_PENSIONARIO = 2,
    USUARIO = 3
  }
  export enum InfoPersonal {
    PERSONAL = 2,
    PLANILLA = 3,
    SUCURSAL = 4,
    GENERO = 5,
    ESTADO_CIVIL = 6,
    NACIONALIDAD = 7,
    JEFE_INMEDIATO = 8,
    DIRECCION = 10,
    AREA = 11,
    BANCO = 12,
    REGIMEN_PENSIONARIO = 13,
  }
  export enum TipoBanco {
    HABERES = 440,
    CTS = 441
  }
}

export namespace Ubigeo{
  export interface DepaDto {
    sCodDepa: string;
    sNomDepa: string;
    provincias: ProvDto[];
  }
  
  export interface ProvDto {
    sCodProv: string;
    sNomProv: string;
    distritos: DistDto[];
  }
  
  export interface DistDto {
    sCodDist: string;
    sNomDist: string;
  }
}