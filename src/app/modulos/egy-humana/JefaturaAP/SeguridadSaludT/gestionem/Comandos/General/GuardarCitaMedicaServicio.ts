import Swal from "sweetalert2";
import { CalendarEvent } from "angular-calendar";
import * as moment from "moment";

import {
  IPersonaAsignadaCitaMedica,
  IRangoFechasCita,
} from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";

export default class GuardarCitaMedicaServicio implements IGeneralServicio {
  data: IPersonaAsignadaCitaMedica[];
  evento: CalendarEvent;

  constructor(
    private service: GestionemService,
    data: IPersonaAsignadaCitaMedica[],
    evento: CalendarEvent
  ) {
    this.data = data;
    this.evento = evento;
  }

  async obtenerData(): Promise<boolean> {
    const param = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    var sparam = "";

    param.push("T1¡nIdRangoEM!" + this.evento.id);
    this.data.forEach((item) => {
      sparam = "";
      sparam = sparam + "T1¡nIdPerLab!" + item.nIdPerlab;
      sparam =
        sparam + "-T1¡dFecha!" + moment(this.evento.start).format("MM/DD/YYYY");
      sparam = sparam + "-T1¡nIdRegUser!" + uid;
      sparam = sparam + "-T1¡dtReg!GETDATE()";

      if (item.nIdCitaEM === 0) {
        param.push(sparam);
      }
    });

    var res = await this.service._crudEM(2, param);
    return true;
  }
}
