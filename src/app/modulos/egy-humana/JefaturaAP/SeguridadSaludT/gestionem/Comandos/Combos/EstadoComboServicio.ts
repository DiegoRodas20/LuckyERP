import { IEstadoCombo } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import { IComboServicio } from "./IComboServicio";

export default class EstadoComboServicio implements IComboServicio {
  constructor(private service: GestionemService) {}

  async obtenerData(): Promise<IEstadoCombo[]> {
    var data: any;
    const param = [];

    param.push("0¡SYSELE.nEleCodDad!2316");

    data = await this.service._loadSP(4, param);
    return data;
  }
}
