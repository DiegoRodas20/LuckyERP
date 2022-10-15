export interface E_Reporte_Deta_Punto_Movilidad{
  nPunto: number;
  sOrigen: string;
  sDestinatario: string;
  sZona: string;
  nPeso: number;
  nVolumen: number;
  lNotas: E_Reporte_Detalle_Movilidad[];
}

export interface E_Reporte_Detalle_Movilidad {
  nPunto: number;
  nIdOperMov: number;
  sCodEmp: string;
  sNota: string;
  sGuia: string;
  sHora: string;
  sCodAlmacen: string;
  sDireccionDestino: string;
  nPeso: number;
  nVolumen: number;
}
