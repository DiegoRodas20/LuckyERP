import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { ControlemComponent } from "../../../controlem.component";
import { ControlemDetailrComponent } from "../../../Modals/controlem-detailr/controlem-detailr.component";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";

export default class FbResponsableCEM {
  componente: ControlemComponent;
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  opciones: any[] = [
    {
      icon: "calendar_today",
      tool: "Nuevo rango",
    },
    {
      icon: "visibility",
      tool: "Ver detalle",
    },
  ];

  public setModalService(componente: ControlemComponent) {
    this.componente = componente;
  }

  public ejecucionOpciones(index: number, nIdResponsable: number) {
    switch (index) {
      case 0:
        this._abrirModalNuevoRango(nIdResponsable);

        break;
      case 1:
        this._abrirModalVerDetalle(nIdResponsable);

        break;
      default:
        break;
    }
  }

  private _abrirModalVerDetalle(nIdResponsable: number) {
    const modal = this.componente.modalService.open(
      ControlemDetailrComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdResponsable = nIdResponsable;
    modal.componentInstance.sFechaDevengueSeleccionado = this.componente.sFechaDevengueSeleccionado;
  }

  private _abrirModalNuevoRango(nIdResponsable: number) {
    const modal = this.componente.modalService.open(
      ControlemRangeComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdResponsable = nIdResponsable;
    modal.componentInstance.sFechaDevengueSeleccionado = this.componente.sFechaDevengueSeleccionado;
  }
}
