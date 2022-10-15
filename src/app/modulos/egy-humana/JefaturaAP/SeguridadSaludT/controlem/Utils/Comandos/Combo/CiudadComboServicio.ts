import { ICiudadCombo } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class CiudadComboServicio implements IServicioCEM {
  constructor(private servicio: ControlemService) {}

  public async ejecutarServicio(): Promise<any> {
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    const params = [];
    params.push("0¡nDadTipEle!694");
    params.push("0¡nIdPais!" + sIdPais);
    params.push("0¡bEstado!1");
    const data = await this.servicio._loadSP(9, params);
    return data;
  }
}
