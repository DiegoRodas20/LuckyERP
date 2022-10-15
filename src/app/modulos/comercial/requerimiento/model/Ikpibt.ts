export namespace nsBonoT {

    export interface IInfoUser {
        nIdPersonal: number;
        sNombres: string;
        sTipo: string;
        sDocumento: string;
    }

    export interface IDevengue {
        nIdDevengue: number;
        nEjercicio: number;
        nMes: number;
    }

    export interface IPlanilla {
        nIdPlla: number;
        sDesc: string;
        sCodPlla: string;
    }

    export interface IMain {
        nIdBonoT: number;
        nIdCentroCosto: number;
        sCentroCosto: string;
        nCentroCosto: string;
        nIdCliente: number;
        sCliente: string;
        nIdDevengue: number;
        dFecha: Date;
        nIdPlla: number;
        sPlla: string;
        nIdPartida: number;
        nCant: number;
        nIdEstado: number;
        sEstado: string;
        sFileSustento: string;
    }

    export interface IPerso {
        nIdBonoT: number;
        sNombres: string;
        sDocumento: string;
    }

    export interface IExpanded {
        nIdBonoT: number;
        sNombres: string;
        sCodPlla: string;
        sDscTipo: string;
        sDocumento: string;
        sCiudad: string;
        nNeto: number;
        nBruto: number;
    }

    export interface ITeamResp {
        nIdPersonal: number;
        sNombres: string;
        sCodPlla: string;
        sTipo: string;
        sDscTipo: string;
        sDocumento: string;
        dFechIni: Date;
        dFechFin?: Date;
        nIdSucursal: number;
        sCiudad: string;
        nMontoRegPen: number;
        nStat: number;
    }

    export interface IPlanilla {
        nIdPlla: number;
        sDesc: string;
        sCodPlla: string;
    }

    export interface ICentroCosto {
        nIdCentroCosto: number;
        sCentroCosto: string;
        nIdCliente: number;
        sCliente: string;
    }

    export interface ISaldoCC {
        nIdSucursal: number;
        sCiudad: string;
        nResguardo: number;
        nImporte: number;
        nSaldo: number;
    }

    export interface IGastoCC {
        nIdBonoT: number;
        nIdSucursal: number;
        nGasto: number;
    }

    export interface IValidarFechaCC {
        nIdPersonal: number;
        dFecha: string;
        dFechaLimite: string;
    }

    export interface IBonoT {
        nIdPersonal: number;
        sNombres: string;
        sCodPlla: string;
        sTipo: string;
        sDscTipo: string;
        sDocumento: string;
        dFechIni: Date;
        dFechFin?: Date;
        nIdSucursal: number;
        sCiudad: string;
        nMontoRegPen: number;
        nNeto: number;
        nBruto: number;
    }

    export interface IListaResp {
        nIdResp: number;
        sNombres: string;
        sTipo: string;
        sDocumento: string;
    }
}
