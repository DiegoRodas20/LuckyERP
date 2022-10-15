import { CampoBusqueda } from "../campo_busqueda/campo_busqueda.model";

export class FormatoBusquedaStateModel {
    formatosBusqueda: FormatoBusqueda[];
}

export interface FormatoBusqueda {
    pId: number;
    pNombre: string;
}