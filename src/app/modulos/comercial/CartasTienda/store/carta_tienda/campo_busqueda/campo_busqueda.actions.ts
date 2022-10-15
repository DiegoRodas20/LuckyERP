import { CampoBusqueda } from './campo_busqueda.model';

export class AgregarCampoBusqueda {
  static readonly type = '[CAMPOBUSQUEDA] Agrega un nuevo campo';
  constructor( public payload:  CampoBusqueda) {}
}

export class CargarCamposBusqueda {
  static readonly type = '[CAMPOBUSQUEDA] Llama a la API para cargar los datos de la busqueda';
  constructor( public payload: string ) {}
}