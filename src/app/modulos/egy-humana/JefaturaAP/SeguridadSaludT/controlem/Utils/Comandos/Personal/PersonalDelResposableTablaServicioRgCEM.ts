import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import IPersonalDelResponsableDataTablaRgCEM from "../../ControlemRange/PersonalDelResponsableTabla/IPersonalDelResponsableDataTablaRgCEM";
import { IServicioCEM } from "../IServicioCEM";

export default class PersonalDelResposableTablaServicioRgCEM
  implements IServicioCEM {
  private nIdResponsable: number = 0;
  private nIdDevengue: number = 0;
  private sFechaDevengue: string = "";

  constructor(private servicio: ControlemService) {}

  public setData(
    nIdResponsable: number,
    nIdDevengue: number,
    sFechaDevengue: string
  ) {
    this.nIdResponsable = nIdResponsable;
    this.nIdDevengue = nIdDevengue;
    this.sFechaDevengue = sFechaDevengue;
  }

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push(
      "6¡spFechDevengue!" +
        this.sFechaDevengue +
        "-0¡nIdDevengue!" +
        this.nIdDevengue +
        "-0¡A.nIdEmp!1|1¡sCodPlla!2,3"
    );
    var data = await this.servicio._loadSP(2, params);
    data = this._filtrarPorResponsable(this.nIdResponsable, data);
    return data;
  }

  private _filtrarPorResponsable(
    nIdResp: number,
    data: any
  ): IPersonalDelResponsableDataTablaRgCEM[] {
    const res = data.filter((v) => v.nIdResp === nIdResp);
    return res;
  }
}
