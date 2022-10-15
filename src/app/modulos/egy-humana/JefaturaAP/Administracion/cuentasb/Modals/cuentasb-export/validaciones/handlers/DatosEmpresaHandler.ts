import { FormGroup } from "@angular/forms";
import ValidacionEnvioData from "../ValidacionEnvioData";

export default class DatosEmpresaHandler extends ValidacionEnvioData {
  public handle(): string {
    this.data = this.data as FormGroup;
    if (this.data.invalid()) {
      return "Datos incompletos de la empresa";
    }

    return super.handle();
  }
}
