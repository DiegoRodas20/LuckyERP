export interface Chofer {
    nId: number;
    nIdTipoDoc: number;
    sTipoDoc: string;
    sNumDocumento: string;
    sBrevete: string;
    dVence: string;
    sPrimerNom: string;
    sSegundoNom: string;
    sApePaterno: string;
    sApeMaterno: string;
}

export interface Chofer_Empresa {
    nId: number;
    nIdChofer: number;
    nIdTipoDoc: number;
    sTipoDoc: string;
    sNumDocumento: string;
    sBrevete: string;
    dVence: string;
    sPrimerNom: string;
    sSegundoNom: string;
    sNombreCompleto: string;
    sApePaterno: string;
    sApeMaterno: string;
    sApeCompleto: string;
    nIdEstado: number;
    sEstado: string;
}

export interface input_Chofer {
    nIdEmpresaTransporte: number;
    vChofer: Chofer_Empresa;
}