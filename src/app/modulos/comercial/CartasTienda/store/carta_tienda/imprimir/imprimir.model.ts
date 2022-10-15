export class ImprimirStateModel {
  documentos: ImprimirModel[];
}

export interface ImprimirModel {
  formatoId: number;
  contenido: string;
}
