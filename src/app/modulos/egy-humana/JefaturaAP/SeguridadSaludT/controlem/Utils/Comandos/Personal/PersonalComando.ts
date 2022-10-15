import { IComandoCEM } from "../IComandoCem";
import { IServicioCEM } from "../IServicioCEM";

export default class PersonalComando implements IComandoCEM {
  servicio: IServicioCEM;

  setServicio(servicio: IServicioCEM) {
    this.servicio = servicio;
  }
  public async ejecutar() {
    return await this.servicio.ejecutarServicio();
  }
}
