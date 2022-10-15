import { IDevengue } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class DevengueComboServicio implements IServicioCEM {
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡nIdEmp!1");
    var data = await this.servicio._loadSP(1, params);
    return data;
  }
}
