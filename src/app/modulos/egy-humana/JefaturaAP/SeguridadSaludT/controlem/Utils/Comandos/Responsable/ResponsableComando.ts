import { IComandoCEM } from "../IComandoCem";
import { IServicioCEM } from "../IServicioCEM";

export default class ResponsableComando implements IComandoCEM {
  servicio: IServicioCEM;

  setServicio(servicio: IServicioCEM) {
    this.servicio = servicio;
  }
  async ejecutar(): Promise<any> {
    return await this.servicio.ejecutarServicio();
  }
}
