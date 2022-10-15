import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class CitasSinExamenPersonalServicio implements IServicioCEM {
  nIdPerlab: number = 0;

  constructor(private servicio: ControlemService) {}

  public setData(nIdPerlab: number) {
    this.nIdPerlab = nIdPerlab;
  }

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("10¡EXAM.nIdExamenM!0");
    params.push("0¡CITA.nIdPerLab!" + this.nIdPerlab);
    var data = await this.servicio._loadSP(17, params);
    return data;
  }
}
