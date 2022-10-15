import { MatTableDataSource } from "@angular/material/table";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { ControlemDetailpComponent } from "../../../Modals/controlem-detailp/controlem-detailp.component";
import { ControlemExamenmComponent } from "../../../Modals/controlem-examenm/controlem-examenm.component";
import ExamenMedicoComando from "../../Comandos/ExamenMedico/ExamenMedicoComando";
import ExamenMedicoTablaServicioDpCEM from "../../Comandos/ExamenMedico/ExamenMedicoTablaServicioDpCEM";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import FiltroExamenMedicoTablaDpCEM from "./FiltroExamenMedicoTablaDpCEM";
import { IExamenMedicoTablaDpCEM } from "./IExamenMedicoTablaDpCEM";

export default class ExamenMedicoTablaDpCEM {
  comando: IComandoCEM = new ExamenMedicoComando();

  filtro: FiltroExamenMedicoTablaDpCEM = new FiltroExamenMedicoTablaDpCEM(this);

  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  columnas: string[] = [
    "action",
    "dFechCita",
    "dFechIniEm",
    "dFechFinEm",
    "sEstado",
  ];
  dataSource = new MatTableDataSource<IExamenMedicoTablaDpCEM>([]);

  constructor(private component: ControlemDetailpComponent) {}

  public async cargarDataServicio() {
    const nIdPerLab: number =
      +this.component.infoPersonal.getValorCampo("nIdPerlab");

    this.comando.setServicio(
      new ExamenMedicoTablaServicioDpCEM(this.component.service, nIdPerLab)
    );
    const data = await this.comando.ejecutar();
    this.dataSource = new MatTableDataSource<IExamenMedicoTablaDpCEM>(data);
    this.dataSource.paginator = this.component.paginacionExamenesMedicos;
  }

  public verExamen(examen: IExamenMedicoTablaDpCEM) {
    const modal = this.component.modalService.open(
      ControlemExamenmComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdEstadoModal = 1;
    modal.componentInstance.nIdPersonal = this.component.nIdPersonal;
    modal.componentInstance.sNombresResp = this.component.sNombresResp;
    modal.componentInstance.nIdExamenMedico = examen.nIdExamenM;
    modal.componentInstance.examenSeleccionado = examen;

    modal.result.then(
      async (result) => {
        if (result.status) {
          await this.component.examenMedTabla.cargarDataServicio();
          this.component.recargarCerrarMadal = true;
        }
      },
      (reason) => {}
    );
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionExamenesMedicos;
  }
}
