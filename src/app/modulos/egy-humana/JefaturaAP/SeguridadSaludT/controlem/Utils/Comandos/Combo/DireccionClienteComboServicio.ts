import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class DireccionClienteComboServicio implements IServicioCEM {
  nIdsCentroCosto: any[] = [];

  constructor(private servicio: ControlemService) {}

  public setData(nIdsCentroCosto: any[]) {
    this.nIdsCentroCosto = nIdsCentroCosto;
  }

  public async ejecutarServicio(): Promise<any> {
    const params = [];
    params.push("1¡nIdCentroCosto!" + this.nIdsCentroCosto.join(","));

    const data = await this.servicio._loadSP(16, params);
    return data;
  }
}
