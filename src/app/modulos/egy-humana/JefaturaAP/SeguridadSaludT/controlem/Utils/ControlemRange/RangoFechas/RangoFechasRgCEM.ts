import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import RangoComando from "../../Comandos/Rango/RangoComando";
import ValidacionAgregarUnRangoTgCEM from "../../Comandos/Rango/ValidacionAgregarUnRangoTgCEM";
import Swal from "sweetalert2";
import moment from "moment";

export default class RangoFechasRgCEM {
  private comandoRango: IComandoCEM = new RangoComando();

  private _fb: FormBuilder = new FormBuilder();
  form: FormGroup = this._fb.group({
    dFechIni: [null, [Validators.required]],
    dFechFin: [null, [Validators.required]],
  });

  constructor(private component: ControlemRangeComponent) {}

  async fechaSeleccionada(date: any) {
    var fechIni: Date = this.form.controls["dFechIni"].value;
    var fechFin: Date = this.form.controls["dFechFin"].value;

    if (fechIni !== null && fechFin !== null) {
      this.component.spi.show("spi_reject");

      await this.component.resposablesTabla.cargarDataServicio(
        new Date(fechIni),
        new Date(fechFin)
      );
      this.component.spi.hide("spi_reject");

      this.component.calendario.mostrarNuevoRangoFechasSeleccionada(
        fechIni,
        fechFin
      );
    }
  }

  public desactivarFechaFin = (date: Date) => {
    var limiteFecha: Date = new Date(moment(new Date()).add(2, "d").toDate());
    var fechIni: Date = this.form.controls["dFechIni"].value;

    if (fechIni === null) {
      return date > limiteFecha;
    }

    return date > fechIni && date > limiteFecha;
  };

  desactivarFechaIni = (date: Date) => {
    var limiteFecha: Date = new Date(moment(new Date()).add(1, "d").toDate());
    var fechFin: Date = this.form.controls["dFechFin"].value;
    if (fechFin === null) {
      return date > limiteFecha;
    }

    return date < fechFin && date > limiteFecha;
  };

  private async _validacionNuevoRangoDeRechas(
    nIdResp: number,
    dFechaInicio: Date,
    dFechaFin: Date
  ): Promise<boolean> {
    const servicio = new ValidacionAgregarUnRangoTgCEM(this.component.service);
    servicio.setData(nIdResp, dFechaInicio, dFechaFin);
    this.comandoRango.setServicio(servicio);
    const resp = await this.comandoRango.ejecutar();
    return resp;
  }
}
