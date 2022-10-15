export interface VehiculoModel {
  nIdDetTransporte: number;
  nIdVehiculo: number;
  sPLaca: string;
  sDescripcion: string;
  sModelo: string;
  nIdTipoVehiculo: number;
  sTipoVehiculo: string;
  bLucky: boolean;
  sLucky: string;
  bEstado: boolean;
  sEstado: string;
  nPesoCarga: number;
  nVolumen: number;
  nIdEmpresaTrans: number;
  nIdChofer: number;
  sCodTransporte: string;
  nCantPunto: number;
  sProveedor: string;
  sChofer: string;

  /* #region  Atributos auxiliares */
  nPesoRestante: number;
  nVolumenRestante: number;
  /* #endregion */
}
