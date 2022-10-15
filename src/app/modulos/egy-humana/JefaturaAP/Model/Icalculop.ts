export namespace nsCalculop {

    export interface IMain {
        nIdPersonal: number;
        nIdPerLab: number;
        sNombres: string;
        sTipo: string;
        sDocumento: string;
        dFechIni: Date;
        dFechFin?: Date;
        nIdPlla: number;
        sCodPlla: string;
        nIdRegPen: number;
        sRegPen: string;
        nTipoSalario: number;
        sTipoSalario: string;
        nMonto: number;
        nSucCod: number;
        sCiudad: string;
        nIngreso?: number;
        nDescuento?: number;
        nTotal?: number;
        bExpand?: boolean;
    }

    export interface IDetail {
        nIdPersonal: number;
        nIdPeriodo: number;
        bIntegrado: boolean;
        nIdConcepto: number;
        sCodConcepto?: string;
        sConcepto: string;
        nValor: number;
        sValor: string;
        nUnidad: number;
        nImporte: number;
        bCheck: boolean;
    }

    export interface IExpanded {
        nIdConcepto: number;
        sCodConcepto: string;
        sConcepto: string;
        nUnidad: number;
        nImporte: number;
    }

    export interface IDepositInfo {
        nIdDepPer: number;
        nIdDevengue: number;
        nEjercicio: number;
        nMes: number;
        nIdPeriodo: number;
        sPeriodo: string;
        nIdPlla: number;
        sPlanilla: string;
        sUsuario: string;
        dtReg: Date;
    }

    export interface IDepositBank {
        nIdDepPer: number;
        nIdBanco: number;
        sBanco: string;
        bExport: boolean;
        nCantPerso: number;
        nTotal: number;
        sUsuario: string;
        nEstado: number;
        sFileSustento?: string;
        dtReg?: Date;
    }

    export interface IDepositList {
        sNombres: string;
        sTipo: string;
        sDocumento: string;
        nImporte: number;
    }

    export interface IPeriodInfo {
        nEjercicio: number;
        nMes: number;
        sPeriodo: string;
        sPlanilla: string;
        sUsuario: string;
        dtIni: Date;
        dtFin: Date;
    }

    export interface IPeriodList {
        nIdDetDP: number;
        nIdPersonal: number;
        sNombres: string;
        sPlanilla: string;
    }

    export interface IPersonConcept {
        sConcepto: string;
        nUnidad: number;
        nImporte: number;
        nValor: number;
    }

    export interface IPersonSalary {
        sConcepto: string;
        nImporte: number;
    }

    export interface IPersonDeposit {
        sPeriodo: string;
        sBanco: string;
        nImporte: number;
    }
}
