import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EditarExamenMedicoServicio implements IServicioCEM {
  nIdExamenM: number;
  nIdCitaEM: number;
  sFechIni: string;
  sFechFin: string;
  sFileSustento: string;

  constructor(private servicio: ControlemService) {}

  public setData(
    nIdExamenM: number,
    nIdCitaEM: number,
    sFechIni: string,
    sFechFin: string,
    sFileSustento: string
  ) {
    this.nIdExamenM = nIdExamenM;
    this.nIdCitaEM = nIdCitaEM;
    this.sFechIni = sFechIni;
    this.sFechFin = sFechFin;
    this.sFileSustento = sFileSustento;
  }

  async ejecutarServicio() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const params = [];
    params.push("T1¡nIdExamenM!" + this.nIdExamenM);
    params.push("T1¡nIdCitaEM!" + this.nIdCitaEM);
    params.push("T1¡dFechIni!" + this.sFechIni);
    params.push("T1¡dFechFin!" + this.sFechFin);
    params.push("T1¡sFileSustento!" + this.sFileSustento);
    params.push("T1¡nIdModUser!" + uid);
    params.push("T1¡dtMod!GETDATE()");

    const data = await this.servicio._crudEM(8, params);
  }
}
