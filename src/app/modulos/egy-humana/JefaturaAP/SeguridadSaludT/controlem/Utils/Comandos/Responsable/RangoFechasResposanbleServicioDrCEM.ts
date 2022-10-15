import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IRangoResponsableDataTablaDrCEM } from "../../ControlemDetailr/RangoResponsableTabla/IRangoResponsableDataTablaDrCEM";
import { IServicioCEM } from "../IServicioCEM";

export default class RangoFechasResposanbleServicioDrCEM
  implements IServicioCEM {
  constructor(
    private service: ControlemService,
    private nIdResponsable: number
  ) {}

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("0¡nIdResp!" + this.nIdResponsable);
    var data = await this.service._loadSP(5, params);
    data = this._agregarEstadoDeCadaRango(data);
    return data;
  }

  private _agregarEstadoDeCadaRango(
    data: any
  ): IRangoResponsableDataTablaDrCEM[] {
    const res = data.map((v) => this._calcularEstadoDeRango(v));
    return res;
  }

  private _calcularEstadoDeRango(
    data: IRangoResponsableDataTablaDrCEM
  ): IRangoResponsableDataTablaDrCEM {
    if (new Date(data.dFechFin) < new Date()) {
      data.sEstado = "No disponible";
    } else {
      data.sEstado = "Disponible";
    }

    return data;
  }
}
