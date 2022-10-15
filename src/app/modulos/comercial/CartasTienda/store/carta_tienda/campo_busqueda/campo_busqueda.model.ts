export class CampoBusquedaStateModel {
    camposBusqueda: CampoBusqueda[];
}

export interface CampoBusqueda {
    pId: number;
    pNombre: string;
    pTipo:number;
}