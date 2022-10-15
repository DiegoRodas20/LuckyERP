import { MatTableDataSource } from "@angular/material/table";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import PersonalComando from "../../Comandos/Personal/PersonalComando";
import PersonalDelResposableTablaServicioRgCEM from "../../Comandos/Personal/PersonalDelResposableTablaServicioRgCEM";
import IPersonalDelResponsableDataTablaRgCEM from "./IPersonalDelResponsableDataTablaRgCEM";

export default class PersonalDelResponsableTablaRgCEM {
  comando: IComandoCEM = new PersonalComando();

  columnas: string[] = ["sNombres", "sCodPlla", "sTipo", "sDocumento"];
  dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaRgCEM>(
    []
  );

  constructor(private component: ControlemRangeComponent) {}

  public async cargarDataServicio() {
    const nIdDevengue: number = +this.component.sFechaDevengueSeleccionado.split(
      "|"
    )[0];
    const sFechaDevengue: string = this.component.sFechaDevengueSeleccionado.split(
      "|"
    )[1];

    const servicio = new PersonalDelResposableTablaServicioRgCEM(
      this.component.service
    );

    servicio.setData(
      this.component.nIdResponsable,
      nIdDevengue,
      sFechaDevengue
    );

    this.comando.setServicio(servicio);
    const data = await this.comando.ejecutar();
    this.dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaRgCEM>(
      data
    );
    this.dataSource.paginator = this.component.paginacionPersonalDelResponsableTabla;
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionPersonalDelResponsableTabla;
  }
}
