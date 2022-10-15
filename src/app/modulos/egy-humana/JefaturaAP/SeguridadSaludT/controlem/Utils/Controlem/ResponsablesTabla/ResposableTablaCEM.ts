import { MatTableDataSource } from "@angular/material/table";
import { ControlemComponent } from "../../../controlem.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import ResponsableComando from "../../Comandos/Responsable/ResponsableComando";
import ResponsablesTablaServicioCEM from "../../Comandos/Responsable/ResponsablesTablaServicioCEM";
import FbResponsableCEM from "./FbResponsableCEM";
import { IResponsableDataTablaCEM } from "./IResponsableDataTablaCEM";

export default class ResponsableTablaCEM {
  comando: IComandoCEM = new ResponsableComando();
  component: ControlemComponent;

  columnas: string[] = ["sRespImg", "sResp"];
  dataSource = new MatTableDataSource<IResponsableDataTablaCEM>([]);
  seleccionado: IResponsableDataTablaCEM = {
    nIdResp: 0,
    sResp: "",
    fb: null,
  };

  constructor(component: ControlemComponent) {
    this.component = component;
  }

  public async cargarDataServicio() {
    this.comando.setServicio(
      new ResponsablesTablaServicioCEM(
        this.component.service,
        this._obtenerIDsResponsables()
      )
    );
    var data: IResponsableDataTablaCEM[] = await this.comando.ejecutar();
    data = data.map((v) => {
      v.fb = new FbResponsableCEM();
      return v;
    });
    this.dataSource = new MatTableDataSource<IResponsableDataTablaCEM>(data);
    this.dataSource.paginator = this.component.paginacionResponsableTablaCEM;
    this._cargarPersonalDelPrimerResposable(data);
  }

  private _cargarPersonalDelPrimerResposable(data: IResponsableDataTablaCEM[]) {
    if (data.length > 0) {
      this.cargarPersonalDelResponsable(data[0]);
    }
  }

  public obtenerDataTabla(): IResponsableDataTablaCEM[] {
    return this.dataSource.data;
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionResponsableTablaCEM;
  }

  public cargarPersonalDelResponsable(responsable: IResponsableDataTablaCEM) {
    this.component.filtrarDataPorResponsable(responsable.nIdResp);
    this.seleccionado = responsable;
    this.seleccionado.fb.setModalService(this.component);
  }

  private _obtenerIDsResponsables(): number[] {
    var respIds = this.component.getDataPersonal().map((item) => item.nIdResp);
    respIds = respIds.filter(function (value, index) {
      return respIds.indexOf(value) == index;
    });
    return respIds;
  }
}
