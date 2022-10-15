export interface E_Armado_Rutas {
  nId: number;
  nEmp: number;
  sNombreEmpresa: string;
  nIdOperMov: number;
  sNota: string;
  sNotaTipo: string;
  sCodPresupuesto: string;
  sGuia: string;
  nIdAlmacen: number;
  sCodAlmacen: string;
  nCantidad: number;
  nPeso: number;
  nVolumen: number;
  sPuntoLLegada: string;
  sIdUbigeo: string;
  sDistrito: string;
  sFechaEntrega: Date | string;
  sHora: string;
  sEstado: string;
  bEstado: boolean;
}
