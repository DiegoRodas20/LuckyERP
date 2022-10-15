import { FormControl } from "@angular/forms";

export interface HistoricoDepositoDetallePersonal {
  nIdDP: number;
  nIdDDP: number;
  nIdPersonalUser: number;
  sNombresUser: string;
  bTipoDeposito: boolean;
  dtRegDeposito: Date;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
  nIdDevengue: number;
  nMes: number;
  nEjercicio: number;
  nIdPersonal: number;
  sNombres: string;
  nIdPlla: number;
  sCodPlla: string;
  sDescPlla: string;
  dFechIni: Date;
  dFechFin: Date;
  nImporte: number;
  sDocumento: string;
  sDscTipo: string;
  sTipo: string;
  sFileSustento: string;
}
export interface IDepositoProvis {
  nIdDP: number;
  nIdDDP: number;
  nIdPersonalUser: number;
  sNombresUser: string;
  bTipoDeposito: boolean;
  dtRegDeposito: Date;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
  nIdDevengue: number;
  nMes: number;
  nEjercicio: number;
  nIdPlla: number;
  sCodPlla: string;
  sDescPlla: string;
  nTotal: number;
  personal: IPersonalDetalleDeposito[];
}

export interface IPersonalDetalleDeposito {
  nIdDP: number;
  nIdDDP: number;
  nIdPersonal: number;
  sNombres: string;
  sCodPlla: string;
  dFechIni: Date;
  dFechFin: Date;
  nImporte: number;
  sDocumento: string;
  sDscTipo: string;
  sTipoDoc: string;
  sFileSustento: string;
}

export interface IDevengueCombo {
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstado: number;
}

export interface IPlanillaCombo {
  nIdPlla: number;
  sDesc: string;
  sCodPlla: number;
}

export interface ITipoCombo {
  nIdTipEle: number;
  sDesc: string;
}

export interface IEstadoCombo {
  nEleCod: number;
  cEleNam: string;
}

export interface IPersonalGenerarDeposito {
  nIdPersonal: number;
  nIdPerlab: number;
  sNombres: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
  nIdResp: number;
  nIdCentroCosto: number;
  nIdTipoCC: number;
  nIdOrganizacion: number;
  nIdContacto: number;
  nIdDP: number;
  nIdDDP: number;
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdIncidenciap: number;
  nIdDevengueInci: number;
  bTipoInci: boolean;
  nImporteDDP: number;
  nImporte: number;
}

export interface IPersonalGenerarDepositoInciertoSelect {
  nIdPersonal: number;
  nIdPerlab: number;
  sNombres: string;
  sCodPlla: string;
  sTipo: string;
  sDscTipo: string;
  sDocumento: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
  nIdResp: number;
  nIdCentroCosto: number;
  nIdTipoCC: number;
  nIdOrganizacion: number;
  nIdContacto: number;
  nIdDP: number;
  nIdDDP: number;
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdIncidenciap: number;
  nIdDevengueInci: number;
  bTipoInici: boolean;
  nTipo: FormControl;
  nImporte: number;
}

export interface IDevengue {
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstado: number;
}

export interface IOpcionFb {
  icon: string;
  tool: string;
  disabled: boolean;
}

export interface IPlanilla {
  nIdPlla: number;
  sDesc: string;
  sCodPlla: string;
}

export interface InfoDeposito {
  nIdHistDeposito: number;
  nIdDP: number;
  bTipo: boolean;
  dtRegDeposito: Date;
  nIdPlla: number;
  sCodPlla: string;
  sDescPlla: string;
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
  sFileSustento: string;
  nIdPersonalUser: number;
  sNombresUser: string;
}

export interface IDepositoPorDevengue {
  nIdHistDeposito: number;
  nIdDp: number;
  nMes: number;
  nEjercicio: number;
  nImporte: number;
  nIdPlla: number;
  sCodPlla: string;
  sDescPlla: string;
}

export interface ISustentoDeposito {
  nIdDP: number;
  dtReg: Date;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
}

export interface IInformacionDetallePersonal {
  nIdPersonal: number;
  sNombres: string;
  sDocumento: string;
  sDscTipo: string;
  sTipo: string;
  sCodPlla: string;
  sDescPlla: string;
  dFechIni: Date;
  dFechFin: Date;
  sCiudad: string;
}

export interface IDepositoDevengueDetallePersonal {
  nIdHistDeposito: number;
  nIdDP: number;
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
  bTipo: boolean;
  dtRegDeposito: Date;
}

export interface IDepositoDetallePersonal {
  nIdDDP: number;
  nIdHistDeposito: number;
  sFileSustento: string;
  nIdDP: number;
  nIdDevengue: number;
  nEjercicio: number;
  nMes: number;
  nIdEstadoDeposito: number;
  sEstadoDeposito: string;
  bTipo: boolean;
  dtRegDeposito: Date;
  nIdPlla: number;
  sCodPlla: string;
  sDescPlla: string;
  nImporte: number;
}

export interface IImporteDetallePersonal {
  sTipo: string;
  sNombresResponsable: string;
  sDireccionCliente: string;
  sCampaniaArea: string;
  nImporte: number;
}

export interface IOpcionComboIncierto {
  valor: number;
  nombre: string;
}

export interface IInfoEmpresa {
  nIdEmp: number;
  sCodEmp: string;
  sRuc: string;
  sRazonSocial: string;
  sAbrev: string;
}
