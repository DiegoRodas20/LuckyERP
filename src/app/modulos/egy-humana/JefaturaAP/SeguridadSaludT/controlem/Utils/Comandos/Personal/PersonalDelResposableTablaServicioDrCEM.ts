import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import IPersonalDelResponsableDataTablaDrCEM from "../../ControlemDetailr/PersonalDelResponsableTabla/IPersonalDelResponsableDataTablaDrCEM";
import { IServicioCEM } from "../IServicioCEM";
import ExamenEstados from "../../Commons/ExamenEstados";

export default class PersonalDelResposableTablaServicioDrCEM
  implements IServicioCEM {
  constructor(
    private service: ControlemService,
    private nIdResposable: number,
    private nIdRango: number
  ) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡RANGO.nIdResp!" + this.nIdResposable);
    params.push("0¡RANGO.nIdRangoEM!" + this.nIdRango);

    var data = await this.service._loadSP(6, params);
    data = new ExamenEstados<IPersonalDelResponsableDataTablaDrCEM>().agregarEstadoExamenData(
      data
    );
    return data;
  }
}
