import { IExamenMedicoTablaDpCEM } from "../../../ControlemDetailp/ExamenMedicoTabla/IExamenMedicoTablaDpCEM";
import ValidacionExamenm from "../ValidacionExamenm";

export default class ValidacionEliminarExamen extends ValidacionExamenm {
  public async handle(): Promise<string> {
    var examen: IExamenMedicoTablaDpCEM = this.data;

    if (examen.nEstado !== 2317) {
      return "Este examen no puede ser eliminado.";
    }

    return super.handle();
  }
}
