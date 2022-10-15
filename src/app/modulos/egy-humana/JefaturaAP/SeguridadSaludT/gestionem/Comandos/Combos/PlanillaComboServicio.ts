import { IPlanillaCombo } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import { IComboServicio } from "./IComboServicio";

export default class PlanillaComboServicio implements IComboServicio {
  constructor(private service: GestionemService) {}

  async obtenerData(): Promise<IPlanillaCombo[]> {
    var data: any;
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡PLLA.nIdEmp!" + nIdEmp);
    param.push("0¡PLLA.bEstado!1");

    data = await this.service._loadSP(3, param);
    return data;
  }
}
