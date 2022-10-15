import { IInformacionResponsable } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class InformacionResponsableServicio implements IServicioCEM {
  constructor(
    private servicio: ControlemService,
    private nIdResponsable: number
  ) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡PER.nIdPersonal!" + this.nIdResponsable);
    const data = await this.servicio._loadSP(4, params);
    return data;
  }
}
