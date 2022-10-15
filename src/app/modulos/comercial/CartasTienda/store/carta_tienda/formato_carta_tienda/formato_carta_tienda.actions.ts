import { FormatoCartaTienda } from './formato_carta_tienda.model';

export class AgregarFormatoAFormatoCartaTienda {
  static readonly type = '[FORMATOCARTATIENDA] Agrega un nuevo formato carta.';
  constructor(public payload: FormatoCartaTienda) {}
}

export class ReemplazarFormatoAFormatoCartaTienda {
  static readonly type = '[FORMATOCARTATIENDA] Reemplaza la data interior.';
  constructor(public payload: FormatoCartaTienda[]) {}
}

export class EliminarFormatoAFormatoCartaTienda {
  static readonly type = '[FORMATOCARTATIENDA] Elimina un nuevo formato carta.';
  constructor(public payload: FormatoCartaTienda) {}
}
