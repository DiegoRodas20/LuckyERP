import { IComando } from "./IComando";
import { IComboServicio } from "./Combos/IComboServicio";

export default class ComboComando implements IComando {
  servicio: IComboServicio;

  setServicio(servicio: IComboServicio) {
    this.servicio = servicio;
  }

  async ejecutar(): Promise<any> {
    return await this.servicio.obtenerData();
  }
}
