export interface DispositivoMatrizDTO {
    nIdDispositivoMatriz: number;
    nIdDispositivo: number;
    sDispositivo: string;
    nIdDispositivoParte: number;
    sDispositivoParte: string;
    bOpcional: boolean;
    bAplicaDescuento: boolean;
    sAplicaDescuento?: string;
    sOpcional: string;
    bEstado: boolean;
    sEstado: string;
}