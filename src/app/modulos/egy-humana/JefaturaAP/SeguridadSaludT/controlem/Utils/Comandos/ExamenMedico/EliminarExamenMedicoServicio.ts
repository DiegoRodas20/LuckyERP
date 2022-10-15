import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EliminarExamenMedicoServicio implements IServicioCEM {
  nIdExamenM: number;
  constructor(private servicio: ControlemService) {}

  public setData(nIdExamenM: number) {
    this.nIdExamenM = nIdExamenM;
  }

  async ejecutarServicio() {
    const params = [];
    params.push("T1¡nIdExamenM!" + this.nIdExamenM);

    const data = await this.servicio._crudEM(7, params);
    return data;
  }
}
