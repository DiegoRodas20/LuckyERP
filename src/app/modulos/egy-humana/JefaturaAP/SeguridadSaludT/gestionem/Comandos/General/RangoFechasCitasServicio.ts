import { IRangoFechasCita } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";

export default class RangoFechasCitasServicio implements IGeneralServicio {
  constructor(private service: GestionemService) {}

  async obtenerData(): Promise<IRangoFechasCita[]> {
    var data: any;
    const param = [];
    param.push("0¡nIdResp!167");

    data = await this.service._loadSP(5, param);
    return data;
  }
}
