import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class GuardarExamenMedicoServicio implements IServicioCEM {
  nIdCitaEM: number;
  nIdPerlab: number;
  sFechIni: string;
  sFechFin: string;
  sFileSustento: string;

  constructor(private servicio: ControlemService) {}

  public setData(
    nIdCitaEM: number,
    nIdPerlab: number,
    sFechIni: string,
    sFechFin: string,
    sFileSustento: string
  ) {
    this.nIdCitaEM = nIdCitaEM;
    this.nIdPerlab = nIdPerlab;
    this.sFechIni = sFechIni;
    this.sFechFin = sFechFin;
    this.sFileSustento = sFileSustento;
  }

  async ejecutarServicio() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const params = [];
    params.push("T1¡nIdCitaEM!" + this.nIdCitaEM);
    params.push("T1¡nIdPerlab!" + this.nIdPerlab);
    params.push("T1¡dFechIni!" + this.sFechIni);
    params.push("T1¡dFechFin!" + this.sFechFin);
    params.push("T1¡sFileSustento!" + this.sFileSustento);
    params.push("T1¡nIdRegUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");

    const data = await this.servicio._crudEM(6, params);
  }
}
