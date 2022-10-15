import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EliminarPDFServicio implements IServicioCEM {
  nArea: number;
  sNombreConExtencion: string;

  constructor(private servicio: ControlemService) {}

  public setData(sNombreConExtencion: string, nArea: number) {
    this.sNombreConExtencion = sNombreConExtencion;
    this.nArea = nArea;
  }

  public async ejecutarServicio(): Promise<any> {
    const data: any = await this.servicio._deleteFile(
      this.sNombreConExtencion,
      this.nArea,
      "application/pdf"
    );
    return data;
  }
}
