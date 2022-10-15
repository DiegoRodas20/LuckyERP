import { IComandoCEM } from "../IComandoCem";
import { IServicioCEM } from "../IServicioCEM";

export default class ExamenMedicoComando implements IComandoCEM {
  servicio: IServicioCEM;
  setServicio(servicio: IServicioCEM): void {
    this.servicio = servicio;
  }
  async ejecutar() {
    return await this.servicio.ejecutarServicio();
  }
}
