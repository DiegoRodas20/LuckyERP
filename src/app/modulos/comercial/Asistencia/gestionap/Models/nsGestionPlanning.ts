export namespace nsGestionPlanning {
  export interface IInfoPersona {
    nIdPersonal: number;
    sDocumento: string;
    sNombres: string;
    sTipo: string;
  }

  export interface IListClient {
    nIdCliente: number;
    sNombreComercial: string;
  }

  export interface IListCampana {
    nIdCentroCosto: number;
    sDescription: string;
  }

  export interface IListCanal {
    nIdCanal: number;
    sCanal: string;
  }

  export interface IListPerfil {
    nIdPerfil: number;
    sPerfil: string;
  }

  export interface IListPlanning {
    nIdPlanning: number;
    dFechIni: string;
    dFechFin: string;
    nIdCliente: number;
    sCliente: string;
    nIdCentroCosto: number;
    sCampana: string;
    nPersona: number;
    sCodCC: string;
  }

  export interface ILIstPlanningDetail {
    nIdDPP: number;
    nIdPlanning: number;
    nIdPersonal: number;
    sPersonal: string;
    sPila: string;
    sTDoc: string;
    sDocumento: string;
    sCiudad: string;
    nIdCanal: number;
    sCanal: string;
    nIdPerfil: number;
    sPerfil: string;
    sIngreso: string;
    sCese: string;
  }

  export interface IListPersonFilter {
    nIdPlanning: number;
    nIdPersonal: number;
    sPersonal: string;
    sDocumento: string;
  }

  export interface ICentro_Costo {
    nIdCentroCosto: number;
    sCodCC: string;
    sCentroCosto: string;
    sCliente: string;
  }

  export interface ILista_Persona {
    nIdPersonal: number;
    sTDoc: string;
    sNombre: string;
    sIngreso: string;
    sCese: string;
    sCodPlla: string;
    sSucursal: string;
    nCategoria: number;
    sCategoria: string;
    nCanal: number;
    sCanal: string;
  }

  export interface ILista_Categoria {
    nCategoria: number;
    sCategoria: string;
  }

  export interface ILista_Canal {
    nCanal: number;
    sCanal: string;
  }

  export interface E_Lista_Detalle_Persona {
    nIdPersonal: number;
    sNombreCompleto: string;
    nIdPlla: string;
    sTDoc: string;
    sDocumento: string;
    sSucursal: string;
    sHoraIni: string;
    sHoraFin: string;
    nCanal: number;
    sCanal: string;
    nIdCargo: number;
    sPerfil: string;
    nDias: number;
  }

  export interface E_Lista_Horario {
    nCodEle: string;
    cNomEle: string;
  }
}
