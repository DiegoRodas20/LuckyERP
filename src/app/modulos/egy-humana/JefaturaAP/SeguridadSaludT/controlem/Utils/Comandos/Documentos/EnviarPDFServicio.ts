import { ICiudadCombo } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IServicioCEM } from "../IServicioCEM";

export default class EnviarPDFServicio implements IServicioCEM {
  file: any;
  nArea: number;
  sNombre: string;

  constructor(private servicio: ControlemService) {}

  public setData(file: any, nArea: number, sNombre: string) {
    this.file = file;
    this.nArea = nArea;
    this.sNombre = sNombre;
  }

  public async ejecutarServicio(): Promise<any> {
    const data: any = await this.servicio._uploadFile(
      this.file,
      this.nArea,
      this.sNombre,
      "application/pdf"
    );

    return data.fileUrl;
  }
}
