import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";
import { E_Reporte_Cabecera_Movilidad } from "../../../models/reporte-cabecera-movilidad.model";
import { E_Cabecera_Reporte_Ruta } from "../../../models/reporte-cabecera-rutas.model";
import { E_Reporte_Detalle_Movilidad, E_Reporte_Deta_Punto_Movilidad } from "../../../models/reporte-detalle-movilidad-model";
import { E_Detalle_Reporte_Transportista } from "../../../models/reporte-detalle-rutas.model";
import { E_Rutas_Transporte } from "../../../models/rutas-transporte.model";
import { TransporteService } from "../../../transporte.service";

@Component({
  selector: "app-rutas-transporte",
  templateUrl: "./rutas-transporte.component.html",
  styleUrls: ["./rutas-transporte.component.css"],
})
export class RutasTransporteComponent implements OnInit {
  searchKey = new FormControl();
  dsRutas: MatTableDataSource<E_Rutas_Transporte>;
  cabReporteTranporte: E_Cabecera_Reporte_Ruta;
  detReporteTransporte: E_Detalle_Reporte_Transportista[];
  cabReporteMovilidad: E_Reporte_Cabecera_Movilidad;
  detPuntoReportePunto: E_Reporte_Deta_Punto_Movilidad[];
  detReporteMovilidad: E_Reporte_Detalle_Movilidad[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    "opcion",
    "sCodTransporte",
    "sBrevete",
    "sDescripcion",
    "nCantPunto",
    "sPLaca",
  ];

  constructor(
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 11).subscribe(resp => {
      this.spinner.hide();
      this.searchKey.setValue("");
      this.dsRutas = new MatTableDataSource(resp.lista);
      this.dsRutas.paginator = this.paginator;
      this.dsRutas.sort = this.sort;
    }, () => this.spinner.hide());
  }

  //#region Funcion que filta en la tabla en memoria
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsRutas.filter = filterValue.trim().toLowerCase();
  }
  //#endregion

  
  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    if (this.dsRutas) { this.dsRutas.filter = '' }
    this.searchKey.setValue('');
  }
  /* #endregion */

  mostrarReportes(sCodTransporte: string): void {
    this.spinner.show();
    forkJoin({
      resTransporte: this.transporteService.fnArmadoRuta(1, 2, 13, sCodTransporte),
      resMovilidad: this.transporteService.fnArmadoRuta(1, 2, 15, sCodTransporte)
    }).subscribe(({ resTransporte, resMovilidad }) => {
      this.spinner.hide();
      this.cabReporteTranporte = resTransporte.data;
      this.detReporteTransporte = resTransporte ? resTransporte.lista : [];
      this.cabReporteMovilidad = resMovilidad.data;
      this.detPuntoReportePunto = resMovilidad ? resMovilidad.listaPunto : [];
      this.detReporteMovilidad = resMovilidad ? resMovilidad.lista : [];
    }, (error) => { this.spinner.hide(); console.log(error); });
  }
}
