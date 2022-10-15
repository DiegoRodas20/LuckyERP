import { ImprimirModel } from './imprimir.model';

export class ReemplazarDataImprimir {
  static readonly type =
    '[IMPRIMIR] Reemplaza la data que se tiene almacenada.';
  constructor(public payload: ImprimirModel[]) {}
}
