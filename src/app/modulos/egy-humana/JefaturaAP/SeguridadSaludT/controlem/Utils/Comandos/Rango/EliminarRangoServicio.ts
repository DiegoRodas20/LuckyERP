import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EliminarRangoServicio implements IServicioCEM {
  nIdRangoEM: number;
  constructor(private servicio: ControlemService) {}

  public setData(nIdRangoEM: number) {
    this.nIdRangoEM = nIdRangoEM;
  }

  async ejecutarServicio() {
    const params = [];
    params.push("T1¡nIdRangoEM!" + this.nIdRangoEM);

    const data = await this.servicio._crudEM(4, params);
    return data;
  }
}
