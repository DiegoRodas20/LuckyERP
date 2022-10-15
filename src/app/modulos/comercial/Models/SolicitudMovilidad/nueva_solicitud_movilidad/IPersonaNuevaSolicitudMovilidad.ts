import { IDia } from './IDia';

export interface IPersonaNuevaSolicitudMovilidad {
  persona_id: number;
  nombres: string;
  apellidos: string;
  cargo: string;
  f_inicio: string;
  f_fin: string;
  pasaje_por_dia: string;
  sm_reembolso: string;
}
