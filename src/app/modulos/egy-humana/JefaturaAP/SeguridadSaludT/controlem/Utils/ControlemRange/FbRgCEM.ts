import { ControlemRangeComponent } from "../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../Comandos/IComandoCem";
import AgregarRangoServicioRgCEM from "../Comandos/Rango/AgregarRangoServicioRgCEM";
import RangoComando from "../Comandos/Rango/RangoComando";
import * as moment from "moment";
import Swal from "sweetalert2";
import FechasCorrectasHandler from "./Validaciones/handlers/FechasCorrectasHandler";
import CruceConRangosPropiosHandler from "./Validaciones/handlers/CruceConRangosPropiosHandler";
export default class FbRgCEM {
  comando: IComandoCEM = new RangoComando();
  animacion = "active";
  opciones: any[] = [];
  guardar_cancelar: any[] = [
    {
      icon: "save",
      tool: "Nuevo rango",
    },
    {
      icon: "close",
      tool: "Cancelar",
    },
  ];

  constructor(private componente: ControlemRangeComponent) {
    this.opciones = this.guardar_cancelar;
  }

  public opcionesMostrarOcultar() {
    if (this.animacion === "active") {
      this._ocultarOpciones();
      return;
    }

    if (this.animacion === "inactive") {
      this._mostrarOpciones();
      return;
    }
  }

  private _mostrarOpciones() {
    this.animacion = "active";
    this.opciones = this.guardar_cancelar;
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }

  public async ejecucionOpciones(index: number) {
    if (index === 0) {
      this._guardarRango();
      return;
    }

    if (index === 1) {
      this.componente.closeModal(false);
    }
  }

  private async _guardarRango() {
    const res = await this._validacionAntesDeGuardar();
    if (res) {
      this._confirmacionGuardarNuevoRango();
    }
  }

  private async _validacionAntesDeGuardar() {
    const fechasCorrectasH = new FechasCorrectasHandler(
      this.componente.nuevoRango.form
    );
    const cruceRangosH = new CruceConRangosPropiosHandler({
      service: this.componente.service,
      nIdResp: this.componente.nIdResponsable,
      formFechas: this.componente.nuevoRango.form,
    });

    fechasCorrectasH.setNext(cruceRangosH);
    const resp = await fechasCorrectasH.handle();

    if (resp !== null) {
      this.componente.snackBar.open(resp, "Cerrar", {
        duration: 1000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }

    return resp === null;
  }

  private async _confirmacionGuardarNuevoRango() {
    await Swal.fire({
      title: "¿ Guardar ?",
      text:
        "Se creara un nuevo rango para : " +
        this.componente.infoResp.getValorCampo("sNombres"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, Guardar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this._guardarNuevoRangoServicio();
        this.componente.closeModal(true);
        Swal.fire({
          title: "Guardado",
          text: "El rango fue creado.",
          icon: "success",
        });
      }
    });
  }

  private async _guardarNuevoRangoServicio() {
    var fechIni: Date = this.componente.nuevoRango.form.controls["dFechIni"]
      .value;
    var fechFin: Date = this.componente.nuevoRango.form.controls["dFechFin"]
      .value;
    var sFechaInicio = moment(fechIni).format("MM/DD/YYYY");

    var sFechaFin = moment(fechFin).format("MM/DD/YYYY");

    this.comando.setServicio(
      new AgregarRangoServicioRgCEM(
        this.componente.service,
        this.componente.nIdResponsable,
        sFechaInicio,
        sFechaFin
      )
    );

    this.componente.spi.show("spi_reject");
    await this.comando.ejecutar();
    this.componente.spi.hide("spi_reject");
  }
}
