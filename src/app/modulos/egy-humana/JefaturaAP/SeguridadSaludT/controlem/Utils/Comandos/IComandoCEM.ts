import { IServicioCEM } from "./IServicioCEM";

export interface IComandoCEM {
  setServicio(servicio: IServicioCEM): void;
  ejecutar(): any;
}
