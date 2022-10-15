export namespace nsPlanningT {
    export interface IMain {
        // nIdPlanning: number;
        nCentroCosto: number;
        sCodCentroCosto: string;
        sCentroCosto: string; 
        sCliente: string; 
        nlat: number; 
        nlon: number; 
        lPersonal?: IPersonal[];
    } 

    export interface IPersonal {
        nPersonal: number;
        sTDoc: string;
        sDoc: string; 
        sNombre: string; 
        sCodPla: string; 
        sCese: string; 
        sIngreso: string; 
        sSuc: string; 
        lCategoria: IPerfil[];
    }

    export interface IPerfil {
        nDet: number;
        sDet: string; 
        lDet: IPerfil[];
    } 

    export interface IPlanning {
        nDet: number;
        nPersona: number;
        sNombres: string; 
        sCodPlla: string; 
        sTipoDoc: string; 
        sDocumento: string; 
        sCiudad: string; 
        inicio: string; 
        cese: string; 
        nCanal: number; 
        sCanal: string; 
        nPerfil: number; 
        sPerfil: string; 
        Lpdv: IL_PDV[]; 
        Ipdv: IL_PDV; 
        estado: string; 
    } 

    export interface IPla_PDV {
        nIdPDV: number; 
        sDireccion: string; 
        nLatitud: number; 
        nLongitud: number; 
        sPrimero: string; 
        sSegundo: string; 
        sTercero: string; 
    } 

    export interface IL_PDV {
        sNro?: number; 
        sPdv?: string;   
        nLatitud?: number; 
        nLongitud?: number; 
    } 
 
}
