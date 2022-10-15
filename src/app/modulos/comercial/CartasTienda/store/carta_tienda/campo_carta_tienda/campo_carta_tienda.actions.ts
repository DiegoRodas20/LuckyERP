import { CampoFormatoCartaTienda } from '../formato_carta_tienda/formato_carta_tienda.model';

export class AgregarCampoAFormatoCartaTienda {
  static readonly type =
    '[CAMPODEFORMATOCARTATIENDA] Agrega un nuevo campo commun a la carta.';
  constructor(public payload: CampoFormatoCartaTienda[]) {}
}

export class ReemplazarCampoAFormatoCartaTienda {
  static readonly type = '[CAMPODEFORMATOCARTATIENDA] Reemplazar los datos.';
  constructor(public payload: CampoFormatoCartaTienda[]) {}
}

export class EliminarCampoAFormatoCartaTienda {
  static readonly type =
    '[CAMPODEFORMATOCARTATIENDA] Elimina un nuevo campo commun a la carta.';
  constructor(public payload: CampoFormatoCartaTienda[]) {}
}
