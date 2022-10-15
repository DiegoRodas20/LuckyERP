import { ControlemExamenmComponent } from "../../../Modals/controlem-examenm/controlem-examenm.component";

export interface IEstadoFb {
  getAnimacion(): string;
  getOpciones(): any[];
  ejecutar(index: number): void;
  opcionesMostrarOcultar(): void;
}
