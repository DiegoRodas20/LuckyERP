import { MatTableDataSource } from "@angular/material/table";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import PersonalComando from "../../Comandos/Personal/PersonalComando";
import ResponsablesTablaServicioRgCEM from "../../Comandos/Responsable/ResponsablesTablaServicioRgCEM";
import { IResponsableDataTablaRgCEM } from "./IResponsableDataTablaRgCEM";

export default class ResponsableDataTablaRgCEM {
  comando: IComandoCEM = new PersonalComando();
  seleccionado: IResponsableDataTablaRgCEM = {
    nIdPersonal: -1,
    sNombres: "",
    sDocumento: "",
    sTipo: "",
    sDscTipo: "",
    sCodPlla: "",
    dFechIni: new Date(),
    dFechFin: new Date(),
    sCiudad: "",
    nCantidad: 0,
    verEventos: true,
  };

  columnas: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
    "dFechIni",
    "sCiudad",
    "nPersCargo",
  ];
  dataSource = new MatTableDataSource<IResponsableDataTablaRgCEM>([]);

  constructor(private component: ControlemRangeComponent) {}

  public async cargarDataServicio(dFechIni: Date, dFechFin: Date) {
    const servicio = new ResponsablesTablaServicioRgCEM(this.component.service);
    servicio.setRangoFechas(dFechIni, dFechFin);
    this.comando.setServicio(servicio);
    var data = await this.comando.ejecutar();
    data = this.eliminarAlResposableDeLaTabla(data);
    this.dataSource = new MatTableDataSource<IResponsableDataTablaRgCEM>(data);
    this.dataSource.paginator = this.component.paginacionResponsablesTabla;
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionResponsablesTabla;
  }

  public eliminarAlResposableDeLaTabla(data: IResponsableDataTablaRgCEM[]) {
    return data.filter((v) => v.nIdPersonal !== this.component.nIdResponsable);
  }

  public personalSeleccionado(respSeleccionado: IResponsableDataTablaRgCEM) {
    this.component.calendario.eliminarRangoResponsableSeleccionado(
      this.seleccionado
    );
    if (respSeleccionado.nIdPersonal === this.seleccionado.nIdPersonal) {
      this.resetSeleccionado();
      return;
    }

    if (respSeleccionado.nIdPersonal !== this.seleccionado.nIdPersonal) {
      this.seleccionado = respSeleccionado;
      this.component.calendario.mostrarRangoDeResponsableSeleccionado(
        respSeleccionado
      );
    }
  }

  public resetSeleccionado() {
    this.seleccionado = {
      nIdPersonal: -1,
      sNombres: "",
      sDocumento: "",
      sTipo: "",
      sDscTipo: "",
      sCodPlla: "",
      dFechIni: new Date(),
      dFechFin: new Date(),
      sCiudad: "",
      nCantidad: 0,
      verEventos: true,
    };
  }
}
