export interface ISelectItem {
  nId: number | string;
  sDescripcion: string;
}

export enum ETipoProcesoNota {
  ACTUALIZAR = 9,
  ELIMINAR = 10,
}

export const tipoProcesoName: Map<ETipoProcesoNota, string> = new Map([
  [ETipoProcesoNota.ACTUALIZAR, 'actualiza'],
  [ETipoProcesoNota.ELIMINAR, 'elimina'],
]);

export class Question {
  title: string = '';
  text: string;
  icon: string = 'question';
  showCancelButton: boolean = true;
  confirmButtonColor: string = '#3085d6';
  cancelButtonColor: string = '#d33';
  confirmButtonText: string = 'Aceptar';
  cancelButtonText: string = 'Cancelar';
  constructor(pText?: string) {
    this.text = pText ? pText : '¿Está seguro que desea continuar?';
  }
}