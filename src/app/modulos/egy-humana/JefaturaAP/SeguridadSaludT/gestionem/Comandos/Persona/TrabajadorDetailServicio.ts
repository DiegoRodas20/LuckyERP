import { GestionemService } from "../../../../Services/gestionem.service";

export default class TrabajadorDetailServicio {
  constructor(private service: GestionemService) {}
  async obtenerData(): Promise<any> {
    var data: any;
    const param = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    param.push("0¡TUSER.nCodUser!" + uid);

    data = await this.service._loadSP(1, param);
    return data;
  }
}
