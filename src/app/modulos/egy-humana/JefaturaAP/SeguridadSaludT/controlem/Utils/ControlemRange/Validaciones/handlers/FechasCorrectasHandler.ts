import { FormGroup } from "@angular/forms";
import ValidacionEnvioData from "../ValidacionEnvioData";

export default class FechasCorrectasHandler extends ValidacionEnvioData {
  public async handle(): Promise<string> {
    this.data = this.data as FormGroup;
    if (this.data.invalid) {
      return "Seleccione las fechas porfavor.";
    }

    return super.handle();
  }
}
