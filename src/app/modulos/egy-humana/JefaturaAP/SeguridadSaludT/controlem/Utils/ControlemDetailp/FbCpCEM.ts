import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { ControlemDetailpComponent } from "../../Modals/controlem-detailp/controlem-detailp.component";
import { ControlemExamenmComponent } from "../../Modals/controlem-examenm/controlem-examenm.component";

export default class FbCpCEM {
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  animacion = "inactive";
  opciones: any[] = [];
  devenge: any[] = [
    {
      icon: "add",
      tool: "Nuevo Examen Medico",
    },
  ];

  constructor(private componente: ControlemDetailpComponent) {
    this._mostrarOpciones();
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

  public ejecutar(index: number) {
    this._nuevoExamenMedico();
  }

  private _nuevoExamenMedico() {
    const modal = this.componente.modalService.open(
      ControlemExamenmComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdEstadoModal = 0;
    modal.componentInstance.nIdPersonal = this.componente.nIdPersonal;
    modal.componentInstance.sNombresResp = this.componente.sNombresResp;
    modal.componentInstance.nIdExamenMedico = 0;

    modal.result.then(
      async (result) => {
        if (result.status) {
          this.componente.recargarCerrarMadal = result.status;
          await this.componente.examenMedTabla.cargarDataServicio();
        }
      },
      (reason) => {}
    );
  }
}
