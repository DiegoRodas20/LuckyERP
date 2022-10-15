import { IEstadoExamenCombo } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EstadoExamenComboServicio implements IServicioCEM {
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡SYSELE.nEleCodDad!2316");

    const data = await this.servicio._loadSP(11, params);
    return data;
  }
}
