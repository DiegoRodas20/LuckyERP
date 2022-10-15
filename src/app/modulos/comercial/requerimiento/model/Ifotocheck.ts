
export interface DetalleElement {
  codigo: number;
  nombres: string;
  apellidos: string;
  id: number;
  cargo: string;
  total: number;
  imagen: string;
}
export interface NuevoElement {
  pEstado:string;
  codnombre: string;
  codcargo: string;
  total: number;
  imagen: string;
}

export interface ControlElement {
  anio: number;
  pedido: number;
  fecha: string;
  rq: number;
  nomcampana: number;
  campana: string;
  ciudad: string;
  partida: string;
  marca: string;
  pers: number;
  estado: string;
}

export  interface Plla {
    value: string;
    viewValue: string;
  }