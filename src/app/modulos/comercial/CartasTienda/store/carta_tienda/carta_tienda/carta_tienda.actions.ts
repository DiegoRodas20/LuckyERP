import { CartaTienda } from './carta_tienda.model';

export class ReemplazarCartaTienda {
  static readonly type =
    '[CAMPOSGENERALESCARTA] Reemplaza los datos de los campos generales';
  constructor(public payload: CartaTienda) {}
}
