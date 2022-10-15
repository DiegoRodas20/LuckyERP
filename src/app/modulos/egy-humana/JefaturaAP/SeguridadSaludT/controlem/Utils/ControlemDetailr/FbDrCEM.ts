import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { ControlemDetailrComponent } from "../../Modals/controlem-detailr/controlem-detailr.component";
import { ControlemRangeComponent } from "../../Modals/controlem-range/controlem-range.component";

export default class FbDrCEM {
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  animacion = "active";
  opciones: any[] = [];
  nuevoRango: any[] = [
    {
      icon: "today",
      tool: "Nuevo rango",
    },
  ];

  constructor(private componente: ControlemDetailrComponent) {
    this.opciones = this.nuevoRango;
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
    this.opciones = this.nuevoRango;
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }

  public ejecucionOpciones(index: number) {
    if (index === 0) {
      this._abrirModalNuevoRango();
      return;
    }
  }

  private _abrirModalNuevoRango() {
    const modal = this.componente.modalService.open(
      ControlemRangeComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdResponsable = this.componente.nIdResponsable;
    modal.componentInstance.sFechaDevengueSeleccionado = this.componente.sFechaDevengueSeleccionado;
    modal.result.then(
      async (result) => {
        if (result.status) {
          await this.componente.histRangos.cargarDataServicio();
        }
      },
      (reason) => {}
    );
  }
}
