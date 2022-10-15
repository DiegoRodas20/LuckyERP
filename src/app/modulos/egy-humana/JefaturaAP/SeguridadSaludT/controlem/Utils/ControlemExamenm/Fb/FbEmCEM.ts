import { ControlemExamenmComponent } from "../../../Modals/controlem-examenm/controlem-examenm.component";
import CargarSustentoEstado from "./estados/CargarSustentoEstado";
import EdicionExamenEstado from "./estados/EdicionExamenEstado";
import EditarEliminarExamenEstado from "./estados/EditarEliminarExamenEstado";
import SustentoCargadoEstado from "./estados/SustentoCargadoEstado";
import { EstadosFbExamenmEnumCEM } from "./EstadosFbExamenmEnumCEM";
import { IEstadoFb } from "./IEstadoFb";

export default class FbEmCEM {
  numEstado = 0;
  estadosEnum = EstadosFbExamenmEnumCEM;

  private _estado: IEstadoFb;
  constructor(private componente: ControlemExamenmComponent) {}

  public setEstado(estado: IEstadoFb, numEstado: number) {
    this._estado = estado;
    this.numEstado = numEstado;
  }

  public ejecutar(index: number) {
    this._estado.ejecutar(index);
  }

  public getAnimacion(): string {
    return this._estado.getAnimacion();
  }

  public getOpciones(): any[] {
    return this._estado.getOpciones();
  }

  public opcionesMostrarOcultar() {
    this._estado.opcionesMostrarOcultar();
  }

  public cambiarEstado(index: number) {
    if (this.numEstado === this.estadosEnum.nuevoExamenSinSustento) {
      if (index === 0) {
        this.numEstado = this.estadosEnum.nuevoExamenConSustento;
        this._estado = new SustentoCargadoEstado(this.componente);
      }
      return;
    }

    if (this.numEstado === this.estadosEnum.nuevoExamenConSustento) {
      if (index === 2) {
        this.numEstado = this.estadosEnum.nuevoExamenSinSustento;
        this._estado = new CargarSustentoEstado(this.componente);
      }
      return;
    }

    if (this.numEstado === this.estadosEnum.editarEliminarExamen) {
      if (index === 0) {
        this.numEstado = this.estadosEnum.edicionExamen;
        this._estado = new EdicionExamenEstado(this.componente);
      }
      return;
    }

    if (this.numEstado === this.estadosEnum.edicionExamen) {
      if (index === 2 || index === 1) {
        this.numEstado = this.estadosEnum.editarEliminarExamen;
        this._estado = new EditarEliminarExamenEstado(this.componente);
      }
      return;
    }
  }
}
