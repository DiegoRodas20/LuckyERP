import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import FbResponsableCEM from "../../Controlem/ResponsablesTabla/FbResponsableCEM";
import { IResponsableDataTablaCEM } from "../../Controlem/ResponsablesTabla/IResponsableDataTablaCEM";
import { IServicioCEM } from "../IServicioCEM";

export default class ResponsablesTablaServicioCEM implements IServicioCEM {
  constructor(private servicio: ControlemService, private nIDsResp: number[]) {}

  async ejecutarServicio(): Promise<any> {
    //await this.delay(4000);
    const params = [];
    params.push("1¡nIdPersonal!" + this.nIDsResp.join(","));
    const data = await this.servicio._loadSP(3, params);
    return data;
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
