import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";
import * as moment from "moment";

export default class RangoDeResposablePorRangoFechaServicioRgCEM
  implements IServicioCEM {
  sFechaIni: string = "";
  sFechaFin: string = "";
  nIdResp: number = 0;
  constructor(private service: ControlemService) {}

  public setData(nIdResp: number, dFechaIni: Date, dFechaFin: Date) {
    this.sFechaIni = moment(dFechaIni).format("YYYYMMDD");
    this.sFechaFin = moment(dFechaFin).format("YYYYMMDD");
    this.nIdResp = nIdResp;
  }

  public async ejecutarServicio(): Promise<any> {
    const params = [];

    var sParam = "";
    sParam =
      sParam +
      "7¡" +
      this.sFechaIni +
      "!RANGO.dFechIni|8¡" +
      this.sFechaFin +
      "!RANGO.dFechIni-";
    sParam =
      sParam +
      "7¡" +
      this.sFechaIni +
      "!RANGO.dFechFin|8¡" +
      this.sFechaFin +
      "!RANGO.dFechFin-";
    sParam =
      sParam +
      "7¡RANGO.dFechIni!" +
      this.sFechaIni +
      "|8¡RANGO.dFechFin!" +
      this.sFechaFin +
      "-";
    sParam =
      sParam +
      "7¡RANGO.dFechIni!" +
      this.sFechaIni +
      "|8¡RANGO.dFechFin!" +
      this.sFechaFin +
      "-";
    sParam = sParam + "0¡RANGO.nIdResp!" + this.nIdResp;
    params.push(sParam);
    const data = await this.service._loadSP(8, params);
    return data;
  }
}
