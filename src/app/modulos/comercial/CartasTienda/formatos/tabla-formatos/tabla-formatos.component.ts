import {
  AfterViewInit,
  Component,
  ViewChild,
  OnInit,
  Inject,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { FormatoMostrar } from "../../models/formatos/FormatoMostrar";
import { CartaTiendaService } from "../../service/carta-tienda.service";

interface DialogData {
  cadena_id: number;
}

@Component({
  selector: "app-tabla-formatos",
  templateUrl: "./tabla-formatos.component.html",
  styleUrls: ["./tabla-formatos.component.css"],
})
export class TablaFormatosComponent implements AfterViewInit, OnInit {
  //#region Variables para mostrar los formatos
  dataMostrar: FormatoMostrar[] = [];

  displayedColumns: string[] = ["pId", "sNombre", "Ver", "Eliminar"];
  dataSource = new MatTableDataSource<FormatoMostrar>(this.dataMostrar);

  htmlRenderizar: string = "";
  //#endregion

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private cartaTiendaService: CartaTiendaService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  //#region CICLO DE VIDA
  ngOnInit() {
    this._cargarData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  //#endregion

  //#region CARGAR DATA DE LA API
  private _cargarData() {
    let param = [];
    param.push(this.data.cadena_id);
    this.cartaTiendaService
      .crudFormato(11, param)
      .then((data: FormatoMostrar[]) => {
        this.dataMostrar = data;
        this.dataSource = new MatTableDataSource<FormatoMostrar>(
          this.dataMostrar
        );
        this.dataSource.paginator = this.paginator;
      });
  }
  //#endregion

  //#region Acciones de la tabla
  public pasarHtmlDocumento(data: string) {
    this.htmlRenderizar = data;
  }

  public eliminarFomato(formatoID: number) {
    let param = [];
    param.push(formatoID);
    this.cartaTiendaService.crudFormato(12, param).then((id: number) => {
      this.dataMostrar = this.dataMostrar.filter((item) => item.pId !== id);
      this.dataSource = new MatTableDataSource<FormatoMostrar>(
        this.dataMostrar
      );
      this.dataSource.paginator = this.paginator;
    });
  }
  //#endregion
}
