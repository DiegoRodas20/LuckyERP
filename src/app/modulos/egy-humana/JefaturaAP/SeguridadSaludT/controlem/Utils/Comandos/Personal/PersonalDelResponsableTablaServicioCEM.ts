import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IPersonalDelResponsableDataTablaCEM } from "../../Controlem/PersonalDelResponsableTabla/IPersonalDelResponsableDataTablaCEM";
import { IServicioCEM } from "../IServicioCEM";
import ExamenEstados from "../../Commons/ExamenEstados";
export default class PersonalDelResponsableTablaServicioCEM
  implements IServicioCEM {
  private nIdDevengue: number = 0;
  private sFechaDevengue: string = "";
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push(
      "6¡spFechDevengue!" +
        this._getFechaDevengue() +
        "-0¡nIdDevengue!" +
        this.nIdDevengue +
        "-0¡A.nIdEmp!1|1¡sCodPlla!2,3"
    );
    var data = await this.servicio._loadSP(2, params);
    data = new ExamenEstados<IPersonalDelResponsableDataTablaCEM>().agregarEstadoExamenData(
      data
    );
    return data;
  }

  public setFechaDevengue(nIdDevengue: number, sFechaDevengue: string) {
    this.nIdDevengue = nIdDevengue;
    this.sFechaDevengue = sFechaDevengue;
  }

  private _getFechaDevengue() {
    return this.sFechaDevengue;
  }
}
