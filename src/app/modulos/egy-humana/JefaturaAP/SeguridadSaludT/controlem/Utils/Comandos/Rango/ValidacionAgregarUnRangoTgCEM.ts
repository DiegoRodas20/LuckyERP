import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import * as moment from "moment";
import { IServicioCEM } from "../IServicioCEM";

interface IRango {
  nIdRangoEM: number;
  nIdResp: number;
  dFechIni: Date;
  dFechFin: Date;
}

export default class ValidacionAgregarUnRangoTgCEM implements IServicioCEM {
  sFechaIni: string = "";
  sFechaFin: string = "";
  nIdResp: number = 0;
  constructor(private service: ControlemService) {}

  public setData(nIdResp: number, dFechaIni: Date, dFechaFin: Date) {
    this.sFechaIni = moment(dFechaIni).format("YYYYMMDD");
    this.sFechaFin = moment(dFechaFin).format("YYYYMMDD");
    this.nIdResp = nIdResp;
  }

  public async ejecutarServicio(): Promise<boolean> {
    const params = [];
    params.push("7¡" + this.sFechaIni + "!RANGO.dFechIni");
    params.push(
      "8¡" +
        this.sFechaFin +
        "!RANGO.dFechIni-" +
        "7¡" +
        this.sFechaIni +
        "!RANGO.dFechFin"
    );
    params.push(
      "8¡" +
        this.sFechaFin +
        "!RANGO.dFechFin-" +
        "0¡RANGO.nIdResp!" +
        this.nIdResp
    );
    const data = await this.service._loadSP(14, params);
    return this._verificarSiContieneRangos(data);
  }

  private _verificarSiContieneRangos(data: any) {
    return data.length === 0;
  }
}
