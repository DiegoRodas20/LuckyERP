import { IRangoFechasCita } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";
import Swal from "sweetalert2";

export default class EliminarCitaMedicaServicio implements IGeneralServicio {
  nIdCitaEM: number;
  constructor(private service: GestionemService, nIdCitaEM: number) {
    this.nIdCitaEM = nIdCitaEM;
  }

  async obtenerData(): Promise<boolean> {
    var data: any;
    const param = [];
    param.push("T1¡nIdCitaEM!" + this.nIdCitaEM);
    data = await this.service._crudEM(4, param);
    return true;
  }
}
