import { FormGroup } from "@angular/forms";
import ValidacionExamenm from "../ValidacionExamenm";

export default class ValidacionFormularioModificado extends ValidacionExamenm {
  public async handle(): Promise<string> {
    var form: FormGroup = this.data.form as FormGroup;
    var urlOriginalDoc: string = this.data.urlOriginalDoc;
    var urlRespaldoDoc: string = this.data.urlRespaldoDoc;
    if (!form.dirty && urlOriginalDoc === urlRespaldoDoc) {
      return "La informacion del formulario no fue modificada.";
    }

    return super.handle();
  }
}
