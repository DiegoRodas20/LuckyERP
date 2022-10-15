import { MatTableDataSource } from "@angular/material/table";
import { ControlemDetailrComponent } from "../../../Modals/controlem-detailr/controlem-detailr.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import PersonalComando from "../../Comandos/Personal/PersonalComando";
import PersonalDelResposableTablaServicioDrCEM from "../../Comandos/Personal/PersonalDelResposableTablaServicioDrCEM";
import FiltroPersonalDelResponsableTablaDrCEM from "./FiltroPersonalDelResponsableTablaDrCEM";
import IPersonalDelResponsableDataTablaDrCEM from "./IPersonalDelResponsableDataTablaDrCEM";

export default class PersonalDelResponsableTablaDrCEM {
  comando: IComandoCEM = new PersonalComando();

  columnas: string[] = [
    "sNombres",
    "sCodPlla",
    "sDscTipo",
    "sDocumento",
    "dFechIni",
    "sCiudad",
    "sEstado",
  ];
  dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaDrCEM>(
    []
  );

  filtro: FiltroPersonalDelResponsableTablaDrCEM = new FiltroPersonalDelResponsableTablaDrCEM(
    this
  );

  constructor(public component: ControlemDetailrComponent) {}

  public async cargarData(nIdRango: number) {
    this.comando.setServicio(
      new PersonalDelResposableTablaServicioDrCEM(
        this.component.servicio,
        this.component.nIdResponsable,
        nIdRango
      )
    );
    const data = await this.comando.ejecutar();
    this.dataSource = new MatTableDataSource<IPersonalDelResponsableDataTablaDrCEM>(
      data
    );
    this.dataSource.paginator = this.component.paginacionPersonalRango;
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionPersonalRango;
  }
}
