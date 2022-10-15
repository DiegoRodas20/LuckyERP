import { IDevengue } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import ComboComando from "../../Comandos/Combo/ComboComando";
import DevengueComboServicio from "../../Comandos/Combo/DevengueComboServicio";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import moment from "moment";
import { ControlemComponent } from "../../../controlem.component";

export default class DevengueCEM {
  private _comando: IComandoCEM = new ComboComando();
  private _data: IDevengue[] = [];

  meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };

  constructor(private componente: ControlemComponent) {}

  public async obtenerDataservicio() {
    this._comando.setServicio(
      new DevengueComboServicio(this.componente.service)
    );
    this._data = await this._comando.ejecutar();
    await this.componente.cargarDataServicioPersonal(
      this.obtenerElDevengueActual()
    );
    this.componente.sFechaDevengueSeleccionado = this.obtenerElDevengueActual();
  }

  public getData(): IDevengue[] {
    return this._data;
  }

  public opcionSwal(): Map<number, any> {
    const map = new Map<number, any>();
    var key = "";
    var listaEjercicios = this._obtenerLosEjercicios();

    listaEjercicios.forEach((ejercicio) => {
      var item = new Map();

      this._data.forEach((v) => {
        if (v.nEjercicio === ejercicio) {
          key =
            v.nIdDevengue +
            "|" +
            moment(new Date(v.nEjercicio, v.nMes - 1, 1)).format("MM/DD/YYYY");
          item.set(key, this.meses[v.nMes]);
        }
      });
      map.set(ejercicio, item);
    });
    return map;
  }

  private _obtenerLosEjercicios(): number[] {
    var ejercicios: number[] = this._data.map((v) => v.nEjercicio);
    ejercicios = ejercicios.filter(function (value, index) {
      return ejercicios.indexOf(value) == index;
    });
    ejercicios = ejercicios.sort((a, b) => b - a);
    return ejercicios;
  }

  public obtenerElDevengueActual(): string {
    const devengue: IDevengue = this.getData().find((v) => v.nIdEstado !== 2);
    const fecha =
      devengue.nIdDevengue +
      "|" +
      moment(new Date(devengue.nEjercicio, devengue.nMes - 1, 1)).format(
        "MM/DD/YYYY"
      );
    return fecha;
  }

  public obtenerNombreDelDevengue(): string {
    var nombreDevengue = "";
    if (this.componente.sFechaDevengueSeleccionado !== "") {
      nombreDevengue = this.componente.sFechaDevengueSeleccionado.split("|")[1];
      var fecha = moment(nombreDevengue, "MM/DD/YYYY").toDate();
      nombreDevengue =
        this.meses[fecha.getMonth() + 1] + " del " + fecha.getFullYear();
    }

    return nombreDevengue;
  }
}
