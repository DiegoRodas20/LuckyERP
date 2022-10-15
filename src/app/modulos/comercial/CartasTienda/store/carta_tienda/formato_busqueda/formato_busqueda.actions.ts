import { FormatoBusqueda } from "../../carta_tienda/formato_busqueda/formato_busqueda.model";

export class AgregarFormatoBusqueda {
  static readonly type = "[FORMATOBUSQUEDA] Agrega un nuevo formato";
  constructor(public payload: FormatoBusqueda) {}
}

export class CargarFormatoBusqueda {
  static readonly type =
    "[FORMATOBUSQUEDA] Llama a la API para cargar los datos de la busqueda";
  constructor(public carta_id: number) {}
}
