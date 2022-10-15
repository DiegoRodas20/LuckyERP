import { Component, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";
import { GRUPO_DESTINO_CABECERA } from "../models/grupoDestino-cabecera.model";
import { E_Armado_Rutas } from "../models/rutaModal.model";
import { E_Sucursales } from "../models/surcursales.model";
import { TransporteService } from "../transporte.service";
import { DialogArmadoRutasComponent } from "./dialog-armado-rutas/dialog-armado-rutas.component";
import { DialogNotasRechazadasComponent } from "./dialog-notas-rechazadas/dialog-notas-rechazadas.component";

@Component({
  selector: "app-armado-rutas",
  templateUrl: "./armado-rutas.component.html",
  styleUrls: ["./armado-rutas.component.css"],
})
export class ArmadoRutasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dsRutas: MatTableDataSource<GRUPO_DESTINO_CABECERA>;
  listaSucursales: E_Sucursales[];
  formSucursal = new FormControl();
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '40', align: 'center', sort: false },
    { header: 'Año', field: 'nAnio', type: null, width: '50', align: 'center', sort: true },
    { header: 'Mes', field: 'sMes', type: null, width: '70', align: 'left', sort: true },
    { header: 'Sucursal', field: 'sSucursal', type: null, width: '120', align: 'left', sort: true },
    { header: 'Fecha', field: 'dFecha', type: null, width: '100', align: 'center', sort: true },
    { header: 'Nro. Ruta', field: 'sNumero', type: null, width: '50', align: 'left', sort: true },
    { header: 'Cantidad Puntos', field: 'nCantPuntos', type: null, width: '50', align: 'center', sort: true },
    { header: 'Unidades', field: 'nCantidad', type: null, width: '70', align: 'right', sort: true },
    { header: 'Peso', field: 'nPeso', type: 'deci2', width: '70', align: 'right', sort: true },
    { header: 'Volumen', field: 'nVolumen', type: 'deci6', width: '100', align: 'right', sort: true },
    { header: 'Estado', field: 'sEstado', type: null, width: '100', align: 'left', sort: true },
  ];
  /* #endregion */
  constructor(
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private _router: Router
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    const pPais = localStorage.getItem("Pais");
    let user = localStorage.getItem("currentUser");
    const idUser = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.spinner.show();
    forkJoin({
      resSucursales: this.transporteService.fnArmadoRuta(1, 2, 9, pPais),
      resIdSucursal: this.transporteService.fnArmadoRuta(1, 2, 10, idUser)
    }).subscribe(({ resSucursales, resIdSucursal }) => {
      this.listaSucursales = resSucursales ? resSucursales.lista : [];
      this.formSucursal.setValue(resIdSucursal.sucursal.nIdSucursal);
      this.fnListarRutas(false);
    }, (error) => { this.spinner.hide(); });
  }

  //#region Funcion que filta en la tabla en memoria
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsRutas.filter = filterValue.trim().toLowerCase();
  }
  //#endregion

  //#region Funcion que muestra un modal
  fnNuevoArmado(): void {
    this.dialog.open(DialogArmadoRutasComponent, { autoFocus: false, data: { 'idSucursal': Number(this.formSucursal.value) } }
    ).afterClosed().subscribe((result: number) => {
      if (result) { this._router.navigate(["/almacen/transporte/gestion-armado-rutas", result]) }
    });
  }
  //#endregion

  //#region Funcion que lista la tabla principal
  fnListarRutas(spinner: boolean): void {
    if(spinner){this.spinner.show()}
    this.transporteService.fnArmadoRuta(1, 2, 1, `${this.formSucursal.value}`).subscribe(resp => {
      let lst = resp ? resp.lista : [];
      lst = lst.map((item: GRUPO_DESTINO_CABECERA) => item = { ...item, sEstado: item.bEstado == 1 ? `${item.nCantVhPendiente} ${item.sEstado}` : item.sEstado });
      this.dsRutas = new MatTableDataSource(lst);
      this.dsRutas.paginator = this.paginator;
      this.dsRutas.sort = this.sort;
      this.spinner.hide();
    }, () => this.spinner.hide());
  }
  //#endregion

  //#region ver Detalle de la cabecera
  verDetalle(id: number): void { this._router.navigate(["/almacen/transporte/gestion-armado-rutas", id]) }
  //#endregion

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { if (this.dsRutas) { this.dsRutas.filter = '' } }
  /* #endregion */

  verNotasAnuladas(): void {
    this.spinner.show();
    const sSucursal = this.listaSucursales.find(x => x.nId == this.formSucursal.value).sDescripcion;
    this.transporteService.fnArmadoRuta(1, 2, 17, `${this.formSucursal.value}`).subscribe(res => {
      this.spinner.hide();
      const lst = res ? res.lista as E_Armado_Rutas[] : [];
      this.dialog.open(DialogNotasRechazadasComponent, { autoFocus: false, width: '80%', data: { 'sSucursal': sSucursal, 'notaList': lst } }
      ).afterClosed().subscribe((result: number[]) => {
        if (result) {

        }
      });
    })
  }
}
