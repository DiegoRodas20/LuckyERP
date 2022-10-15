import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

export interface ISelectItem {
  nId: number | string;
  sDescripcion: string;
}

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

export class ModalOptions {
  size: string;
  centered: boolean = true;
  scrollable: boolean = true;
  keyboard: boolean = false;
  backdrop: any = 'static';
  windowClass: string = 'modal-holder';
  constructor(size?: string) {
    this.size = size ? size : 'xl';
  }
};

export const colors = {
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  },
  neutro: {
    primary: '#fff',
    secondary: '#fff',
  },
};

export const colorsDetail = [
  {
    primary: '#f9d466',
    secondary: '#f5e4b2',
  },
  {
    primary: '#87dea0',
    secondary: '#e8fde7',
  },
  {
    primary: '#ffaeae',
    secondary: '#ea6767',
  }
];

