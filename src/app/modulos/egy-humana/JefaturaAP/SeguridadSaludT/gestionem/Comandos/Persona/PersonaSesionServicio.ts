import { IInfoPersona } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import { IPersonaServicio } from "./IPersonaServicio";

export default class PersonaSesionServicio implements IPersonaServicio {
  constructor(private service: GestionemService) {}

  async obtenerData(): Promise<IInfoPersona> {
    var data: any;
    const param = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    param.push("0¡TUSER.nCodUser!" + uid);

    data = await this.service._loadSP(1, param);
    return data;
  }
}
