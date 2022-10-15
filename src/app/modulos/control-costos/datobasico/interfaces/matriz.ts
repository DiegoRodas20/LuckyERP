export interface Partida {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
}

export interface Cargo {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
}

export interface Planilla {
    nId: number;
    sCodigo: string;
    sDescripcion: string;
    nCantidad: number;
}

export interface CargoPartida {
    nId: number;
    nIdCargo: number;
    sCodCargo: string;
    sDescCargo: string;
    nIdPartida: number;
    sCodPartida: string;
    sDescPartida: string;
    nEstado: number;
    sEstado: string;
}

export interface PlanillaPartida {
    nId: number;
    nIdPlanilla: number;
    sCodPlanilla: string;
    sDescPlanilla: string;
    nIdPartida: number;
    sCodPartida: string;
    sDescPartida: string;
    nEstado: number;
    sEstado: string;
}