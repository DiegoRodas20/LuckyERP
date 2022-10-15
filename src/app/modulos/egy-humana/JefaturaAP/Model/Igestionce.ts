export namespace nsGestionce {

    export interface IMain {
        dFechDevengue: Date;
        nIdCentroCosto: number;
        sCentroCosto: string;
        nIdConcepto: number;
        sConcepto: string;
        nUnidad: number;
        nImporte: number;
    }

    export interface IExpanded {
        nIdSucursal: number;
        sSucursal: string;
        nIdCargo: number;
        sCargo: string;
        nIdPuesto: number;
        sPuesto: string;
        nIdPerfil: number;
        sPerfil: string;
        nIdCanal: number;
        sCanal: string;
        nUnidad: number;
        nImporte: number;
    }

    export interface IHistory {
        nIdCostoEmpresa: number;
        nIdDevengue: number;
        dFechDevengue: Date;
        nIdPersonal: number;
        sNombres: string;
        nIdPlla: number;
        sPlanilla: string;
        nIdCentroCosto: number;
        sCentroCosto: string;
        sTipoCC: string;
        nIdConcepto: number;
        sConcepto: string;
        nIdSucursal: number;
        sSucursal: string;
        nIdCargo: number;
        sCargo: string;
        nIdPuesto?: number;
        sPuesto?: string;
        nIdPerfil?: number;
        sPerfil?: string;
        nIdCanal?: number;
        sCanal?: string;
        nUnidad: number;
        nImporte: number;
        nIdRegUser: number;
        dtReg: Date;
    }

    export interface ICostoEmpresa {
        nIdCostoEmpresa: number;
        nIdDevengue: number;
        nIdPersonal: number;
        nIdPlla: number;
        nIdCentroCosto: number;
        nIdConcepto: number;
        nIdSucursal?: number;
        nIdCargo?: number;
        nIdPuesto?: number;
        nIdPerfil?: number;
        nIdCanal?: number;
        nUnidad: number;
        nImporte: number;
        nIdRegUser?: number;
        dtReg?: Date;
    }

    export interface IDetailCostoEmpresa {
        nIdDetCE?: number;
        nIdCostoEmpresa: number;
        nIdGrupo: number;
        nImporte: number;
    }

    export interface IParam {
        nIdPCE: number;
        nIdPlla: number;
        sPlanilla: string;
        nIdGrupo: number;
        sGrupo: string;
        nPorcentaje: number;
        sConcepto: string;
    }

    export interface IGrupo {
        nIdTipEle: number;
        sDesc: string;
    }

    export interface IConcepto {
        nIdConcepto: number;
        sConcepto: string;
    }

    export interface IPlanilla {
        nIdPlla: number;
        sPlanilla: string;
    }

    export interface IParamCostoEmpresa {
        nIdPCE: number;
        nIdPlla: number;
        nIdGrupo: number;
        nPorcentaje: number;
        sFormula: string;
        sConcepto: string;
    }
}
