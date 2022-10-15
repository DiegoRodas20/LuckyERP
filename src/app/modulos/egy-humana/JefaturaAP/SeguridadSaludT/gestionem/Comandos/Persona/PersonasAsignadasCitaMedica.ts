import moment from "moment";

import { IPersonaAsignadaCitaMedica } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import { IPersonaServicio } from "./IPersonaServicio";

export default class PersonasAsignadasCitaMedica implements IPersonaServicio {
  nIdRangoEM: number;
  diaSeleccionado: string;
  constructor(
    private service: GestionemService,
    nIdRangoEM: number,
    diaSeleccionado: Date
  ) {
    this.nIdRangoEM = nIdRangoEM;
    this.diaSeleccionado = moment(diaSeleccionado).format("MM/DD/YYYY");
  }

  async obtenerData(): Promise<IPersonaAsignadaCitaMedica[]> {
    var data: any;
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

    param.push("0¡PER.nIdEmp!" + nIdEmp);
    param.push("0¡nIdRangoEM!" + this.nIdRangoEM);
    param.push("6¡CITA.dFecha!" + this.diaSeleccionado);

    data = await this.service._loadSP(7, param);
    data = this._agregarCampoEliminado(data);
    return data;
  }

  private _agregarCampoEliminado(
    data: IPersonaAsignadaCitaMedica[]
  ): IPersonaAsignadaCitaMedica[] {
    var res = data.map((v) => {
      v.eliminado = false;
      return v;
    });
    return res;
  }
}
