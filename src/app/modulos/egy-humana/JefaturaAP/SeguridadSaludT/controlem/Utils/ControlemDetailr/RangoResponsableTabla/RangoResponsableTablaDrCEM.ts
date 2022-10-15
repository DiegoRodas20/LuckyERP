import { MatTableDataSource } from "@angular/material/table";
import Swal from "sweetalert2";

import { ControlemDetailrComponent } from "../../../Modals/controlem-detailr/controlem-detailr.component";
import EliminarExamenMedicoServicio from "../../Comandos/ExamenMedico/EliminarExamenMedicoServicio";
import ExamenMedicoComando from "../../Comandos/ExamenMedico/ExamenMedicoComando";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import EliminarRangoServicio from "../../Comandos/Rango/EliminarRangoServicio";
import RangoFechasResposanbleServicioDrCEM from "../../Comandos/Responsable/RangoFechasResposanbleServicioDrCEM";
import ResponsableComando from "../../Comandos/Responsable/ResponsableComando";
import { IRangoResponsableDataTablaDrCEM } from "./IRangoResponsableDataTablaDrCEM";

export default class RangoResponsableTablaDrCEM {
  comando: IComandoCEM = new ResponsableComando();
  comandoRango: IComandoCEM = new ExamenMedicoComando();

  columnas: string[] = [
    "action",
    "dFechIni",
    "dFechFin",
    "sEstado",
    "eliminar",
  ];
  dataSource = new MatTableDataSource<IRangoResponsableDataTablaDrCEM>([]);

  constructor(private component: ControlemDetailrComponent) {}

  public async cargarDataServicio() {
    this.comando.setServicio(
      new RangoFechasResposanbleServicioDrCEM(
        this.component.servicio,
        this.component.nIdResponsable
      )
    );
    const data = await this.comando.ejecutar();
    this._cambiarDataTabla(data);
    this._mostrarPersonalEnElUltimoRango();
  }

  private _cambiarDataTabla(data: IRangoResponsableDataTablaDrCEM[]) {
    this.dataSource = new MatTableDataSource<IRangoResponsableDataTablaDrCEM>(
      data
    );
    this.dataSource.paginator = this.component.paginacionHistorialRangos;
  }

  private _mostrarPersonalEnElUltimoRango() {
    const data = this.dataSource.data;
    if (data.length > 0) {
      var ultimoRango: IRangoResponsableDataTablaDrCEM = data[0];
      this.verPersonalAsignadoAlRango(ultimoRango.nIdRangoEM);
    }
  }

  public async verPersonalAsignadoAlRango(nIdRango: number) {
    this.component.spi.show("spi_reject");
    await this.component.personalRango.cargarData(nIdRango);
    this.component.spi.hide("spi_reject");
  }

  public paginar() {
    this.dataSource.paginator = this.component.paginacionHistorialRangos;
  }

  public estadoBtnEliminar(rango: IRangoResponsableDataTablaDrCEM): boolean {
    return rango.nCantidad === 0 && new Date(rango.dFechFin) >= new Date();
  }

  public async eliminarRango(rango: IRangoResponsableDataTablaDrCEM) {
    await Swal.fire({
      title: "¿ Esta seguro de eliminar ?",
      text: "El rango una vez eliminado, no se podra recuperar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this._eliminarRangoServicio(rango);
        Swal.fire({
          title: "Eliminado",
          text: "El rango fue eliminado.",
          icon: "success",
        });
      }
    });
  }

  private async _eliminarRangoServicio(rango: IRangoResponsableDataTablaDrCEM) {
    const servicio = new EliminarRangoServicio(this.component.servicio);
    servicio.setData(rango.nIdRangoEM);
    this.comandoRango.setServicio(servicio);
    const res = await this.comandoRango.ejecutar();

    if (res !== null && res !== "") {
      const nuevaData: IRangoResponsableDataTablaDrCEM[] = this.dataSource.data.filter(
        (v) => v.nIdRangoEM !== rango.nIdRangoEM
      );
      this._cambiarDataTabla(nuevaData);
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar.",
        icon: "error",
      });
    }
  }
}
