import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IResponsableDataTablaRgCEM } from "../../ControlemRange/ResponsablesTabla/IResponsableDataTablaRgCEM";
import { IServicioCEM } from "../IServicioCEM";
import * as moment from "moment";
export default class ResponsablesTablaServicioRgCEM implements IServicioCEM {
  sFechaIni: string = "";
  sFechaFin: string = "";
  constructor(private service: ControlemService) {}

  public setRangoFechas(dFechaIni: Date, dFechaFin: Date) {
    this.sFechaIni = moment(dFechaIni).format("YYYYMMDD");
    this.sFechaFin = moment(dFechaFin).format("YYYYMMDD");
  }

  async ejecutarServicio(): Promise<any> {
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

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
    sParam = sParam + "0¡PER.nIdEmp!" + nIdEmp;
    params.push(sParam);

    const data = await this.service._loadSP(7, params);
    return data;
  }
}
