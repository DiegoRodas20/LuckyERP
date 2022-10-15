import { FormGroup } from "@angular/forms";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IComandoCEM } from "../../../Comandos/IComandoCem";
import { IServicioCEM } from "../../../Comandos/IServicioCEM";
import RangoComando from "../../../Comandos/Rango/RangoComando";
import ValidacionAgregarUnRangoTgCEM from "../../../Comandos/Rango/ValidacionAgregarUnRangoTgCEM";
import ValidacionEnvioData from "../ValidacionEnvioData";

export default class CruceConRangosPropiosHandler extends ValidacionEnvioData {
  comandoRango: IComandoCEM = new RangoComando();

  public async handle(): Promise<string> {
    const service: ControlemService = this.data.service;
    const nIdResp: number = this.data.nIdResp;
    const formFechas: FormGroup = this.data.formFechas;

    const fechIni = new Date(formFechas.controls["dFechIni"].value);
    const fechFin = new Date(formFechas.controls["dFechFin"].value);

    const servicio = new ValidacionAgregarUnRangoTgCEM(service);
    servicio.setData(nIdResp, fechIni, fechFin);
    this.comandoRango.setServicio(servicio);
    const res: boolean = await this.comandoRango.ejecutar();

    if (!res) {
      return "Fechas se sobreponen a rango(s) existente(s).";
    }

    return super.handle();
  }
}
