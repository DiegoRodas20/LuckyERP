import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class InformacionExamenMedicoServicio implements IServicioCEM {
  nIdExamenM: number;
  constructor(private servicio: ControlemService) {}

  public setData(nIdExamenM: number) {
    this.nIdExamenM = nIdExamenM;
  }

  async ejecutarServicio() {
    const params = [];
    params.push("0¡nIdExamenM!" + this.nIdExamenM);

    const data = await this.servicio._loadSP(18, params);
    return data;
  }
}
