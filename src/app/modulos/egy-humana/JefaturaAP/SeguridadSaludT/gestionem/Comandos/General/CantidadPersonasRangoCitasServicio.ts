import { IRangoFechasCita } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";

export default class CantidadPersonasRangoCitasServicio
  implements IGeneralServicio {
  nIdRangoEM: number;
  constructor(private service: GestionemService, nIdRangoEM: number) {
    this.nIdRangoEM = nIdRangoEM;
  }

  async obtenerData(): Promise<IRangoFechasCita[]> {
    var data: any;
    const param = [];
    param.push("0¡CITEM.nIdRangoEM!" + this.nIdRangoEM);

    data = await this.service._loadSP(6, param);
    return data;
  }
}
