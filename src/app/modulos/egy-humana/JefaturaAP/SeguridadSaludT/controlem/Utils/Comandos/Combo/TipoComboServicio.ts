import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class TipoComboServicio implements IServicioCEM {
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡nElecodDad!2032");
    params.push("0¡bStatus!1");
    params.push("2¡cEleCod!3");
    const data = await this.servicio._loadSP(15, params);
    return data;
  }
}
