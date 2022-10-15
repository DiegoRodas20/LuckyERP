export class FormatoCartaTiendaStateModel {
  formatosCarta: FormatoCartaTienda[];
}

export interface FormatoCartaTienda {
  pId: number;
  pIdCadena: number;
  pNombre: string;
  pContenido: string;
  campos: CampoFormatoCartaTienda[];
}

export interface CampoFormatoCartaTienda {
  pIdCampo: number;
  pIdFormatoCampo: number;
  pIdTipoCampo: number;
  pNombre: string;
}
