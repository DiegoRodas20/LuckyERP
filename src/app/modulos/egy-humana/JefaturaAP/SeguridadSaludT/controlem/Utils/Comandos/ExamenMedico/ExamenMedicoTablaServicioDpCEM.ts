import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IExamenMedicoTablaDpCEM } from "../../ControlemDetailp/ExamenMedicoTabla/IExamenMedicoTablaDpCEM";
import { IServicioCEM } from "../IServicioCEM";
import ExamenEstados from "../../Commons/ExamenEstados";
export default class ExamenMedicoTablaServicioDpCEM implements IServicioCEM {
  constructor(private servicio: ControlemService, private nIdPerlab: number) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡EM.nIdPerLab!" + this.nIdPerlab);
    var data = await this.servicio._loadSP(13, params);
    data = new ExamenEstados<IExamenMedicoTablaDpCEM>().agregarEstadoExamenData(
      data
    );
    return data;
  }
}
