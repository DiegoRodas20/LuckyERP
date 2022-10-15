import { IPlanillaCombo } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class PlanillaComboServicio implements IServicioCEM {
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

    const params = [];
    params.push("0¡PLLA.nIdEmp!" + nIdEmp);
    params.push("0¡PLLA.bEstado!1");

    const data = await this.servicio._loadSP(10, params);
    return data;
  }
}
