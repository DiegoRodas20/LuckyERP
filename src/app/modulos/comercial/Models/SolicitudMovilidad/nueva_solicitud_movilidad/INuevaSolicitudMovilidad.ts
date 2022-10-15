import { ICabeceraNuevaSolicitudMovilidad } from './ICabeceraNuevaSolicitudMovilidad';
import { IPersonaNuevaSolicitudMovilidad } from './IPersonaNuevaSolicitudMovilidad';

export interface INuevaSolicitudMovilidad {
  cabecera: ICabeceraNuevaSolicitudMovilidad;
  personas: IPersonaNuevaSolicitudMovilidad[];
}
