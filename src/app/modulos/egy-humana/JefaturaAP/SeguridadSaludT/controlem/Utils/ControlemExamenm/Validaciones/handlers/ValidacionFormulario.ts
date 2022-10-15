import { FormGroup } from "@angular/forms";
import ValidacionExamenm from "../ValidacionExamenm";

export default class ValidacionFormulario extends ValidacionExamenm {
  public async handle(): Promise<string> {
    this.data = this.data as FormGroup;
    if (this.data.invalid) {
      return "Ingrese todos los datos requeridos.";
    }

    return super.handle();
  }
}
