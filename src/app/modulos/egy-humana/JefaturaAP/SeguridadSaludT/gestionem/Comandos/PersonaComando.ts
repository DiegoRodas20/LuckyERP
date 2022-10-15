import { IComando } from "./IComando";
import { IPersonaServicio } from "./Persona/IPersonaServicio";

export default class PersonaComando implements IComando {
  servicio: IPersonaServicio;

  setServicio(servicio: IPersonaServicio) {
    this.servicio = servicio;
  }

  async ejecutar(): Promise<any> {
    return await this.servicio.obtenerData();
  }
}
