import { MatTableDataSource } from "@angular/material/table";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { IDevengue } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemComponent } from "../../../controlem.component";
import { ControlemDetailpComponent } from "../../../Modals/controlem-detailp/controlem-detailp.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import PersonalComando from "../../Comandos/Personal/PersonalComando";
import PersonalDelResponsableTablaServicioCEM from "../../Comandos/Personal/PersonalDelResponsableTablaServicioCEM";
import FiltroPersonalDelResponsableTablaCEM from "./FiltroPersonalDelResponsableTablaCEM";
import { IPersonalDelResponsableDataTablaCEM } from "./IPersonalDelResponsableDataTablaCEM";

export default class PersonalDelResponsableTablaCEM {
  comando: IComandoCEM = new PersonalComando();
  data: IPersonalDelResponsableDataTablaCEM[];
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
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
    "dFechIni",
    "dFechFin",
    "sCiudad",
    "sEstado",
  ];
  dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaCEM>([]);

  constructor(public component: ControlemComponent) {}

  public async cargarDataServicio(sIdFechaDevengue: string) {
    const nIdDevengue = +sIdFechaDevengue.split("|")[0];
    const sFechaDevengue = sIdFechaDevengue.split("|")[1];
    const servicio = new PersonalDelResponsableTablaServicioCEM(
      this.component.service
    );
    servicio.setFechaDevengue(nIdDevengue, sFechaDevengue);
    this.comando.setServicio(servicio);
    this.data = await this.comando.ejecutar();
  }

  public getData() {
    return this.data;
  }

  public filtrarDataPorResponsable(nIdResponsable: number) {
    const newData = this.data.filter((v) => v.nIdResp === nIdResponsable);
    this.cargarData(newData);
  }

  public async cargarData(data: IPersonalDelResponsableDataTablaCEM[]) {
    this.dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaCEM>(
      data
    );
    this.dataSource.paginator = this.component.paginacionPersonalDelResponsableTablaCEM;
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionPersonalDelResponsableTablaCEM;
  }

  public abrirModalDetallePersonal(nIdPersonal: number) {
    const modal = this.component.modalService.open(
      ControlemDetailpComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdPersonal = nIdPersonal;
    modal.componentInstance.sNombresResp = this.component.seleccionadoResponsable.sResp;

    modal.result.then(
      async (result) => {
        if (result.status) {
          await this.component.cargarDataServicioPersonal(
            this.component.sFechaDevengueSeleccionado
          );

          this.component.cargarPersonalDelResponsable(
            this.component.seleccionadoResponsable
          );
        }
      },
      (reason) => {}
    );
  }
}
