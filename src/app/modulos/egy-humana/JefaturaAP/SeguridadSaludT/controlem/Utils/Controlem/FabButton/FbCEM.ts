import Swal from "sweetalert2";
import { ControlemComponent } from "../../../controlem.component";

export default class FbCEM {
  animacion = "inactive";
  opciones: any[] = [];
  devenge: any[] = [
    {
      icon: "calendar_today",
      tool: "Cambiar devengue",
    },
  ];

  constructor(private componente: ControlemComponent) {
    //this.opciones = this.devenge;
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
    this.opciones = this.devenge;
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }

  public ejecucionOpciones(index: number) {
    this._mostrarDevengues();
  }

  private _mostrarDevengues() {
    Swal.fire({
      title: "Seleccionar Devengue",
      icon: "info",
      text:
        "Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.",
      input: "select",
      inputOptions: this.componente.opcionSwalDevengue(),
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        if (
          this.componente.sFechaDevengueSeleccionado ===
          resultado.value.toString()
        ) {
          this.componente.snackBar.open(
            "No se realizó ningún cambio",
            "Cerrar",
            {
              duration: 1000,
              horizontalPosition: "right",
              verticalPosition: "top",
            }
          );
        } else {
          this.componente.spi.show("spi_main");
          await this.componente.cargarDataServicioPersonal(
            resultado.value.toString()
          );
          this.componente.sFechaDevengueSeleccionado = resultado.value.toString();
          this.componente.spi.hide("spi_main");
        }
      }
    });
  }
}
