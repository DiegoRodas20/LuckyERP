import { IComandoCEM } from "../IComandoCem";
import { IServicioCEM } from "../IServicioCEM";

export default class RangoComando implements IComandoCEM {
  private service: IServicioCEM;
  setServicio(servicio: IServicioCEM): void {
    this.service = servicio;
  }
  async ejecutar() {
    return await this.service.ejecutarServicio();
  }
}
