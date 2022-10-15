import { FormGroup } from "@angular/forms";
import ValidacionEnvioData from "../ValidacionEnvioData";

export default class DatosContactoHandler extends ValidacionEnvioData {
  public handle(): string {
    this.data = this.data as FormGroup;
    if (this.data.invalid) {
      return "Datos incompletos del contacto";
    }
    return super.handle();
  }
}
