import IGeneralServicio from "./General/IGeneralServicio";
import { IComando } from "./IComando";

export default class GeneralComando implements IComando {
  servicio: IGeneralServicio;

  public setServicio(servicio: IGeneralServicio) {
    this.servicio = servicio;
  }

  public async ejecutar(): Promise<any> {
    return this.servicio.obtenerData();
  }
}
