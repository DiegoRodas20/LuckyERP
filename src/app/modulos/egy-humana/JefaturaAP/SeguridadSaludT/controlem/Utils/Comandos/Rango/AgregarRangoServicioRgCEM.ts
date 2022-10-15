import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class AgregarRangoServicioRgCEM implements IServicioCEM {
  constructor(
    private servicio: ControlemService,
    private nIdResp: number,
    private dFechIni: string,
    private dFechFin: string
  ) {}

  async ejecutarServicio() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const params = [];
    params.push("T1¡nIdResp!" + this.nIdResp);
    params.push("T1¡dFechIni!" + this.dFechIni);
    params.push("T1¡dFechFin!" + this.dFechFin);
    params.push("T1¡nIdRegUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");

    const data = await this.servicio._crudEM(1, params);
  }
}
