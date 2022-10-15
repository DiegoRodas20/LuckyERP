import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Question } from "../../models/constantes";
import { E_Armado_Rutas } from "../../models/rutaModal.model";
import { TransporteService } from "../../transporte.service";

@Component({
  selector: "app-dialog-notas-rechazadas",
  templateUrl: "./dialog-notas-rechazadas.component.html",
  styleUrls: ["./dialog-notas-rechazadas.component.css"],
})
export class DialogNotasRechazadasComponent implements OnInit {
  listaPrincipal: E_Armado_Rutas[];
  dsAnulados: MatTableDataSource<E_Armado_Rutas>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    "opcion",
    'sGrupo',
    'sPunto',
    'sCodTransporte',
    //'bEstado',
    "sNombreEmpresa",
    "sNota",
    "sCodPresupuesto",
    "sGuia",
    "sCodAlmacen",
    "nCantidad",
    "nPeso",
    "nVolumen",
    "sPuntoLLegada",
    "sDistrito",
    "sFechaEntrega",
    "sHora",
  ];

  constructor(
    private spinner: NgxSpinnerService,
    private transporteService: TransporteService,
    public dialogRef: MatDialogRef<DialogNotasRechazadasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sSucursal: string, notaList: E_Armado_Rutas[], },
  ) { }

  ngOnInit(): void {
    this.dsAnulados = new MatTableDataSource(this.data.notaList);
    this.dsAnulados.paginator = this.paginator;
    this.dsAnulados.sort = this.sort;
  }

  //#region Funcion que filta en la tabla en memoria
  applyFilter(filter: string): void { this.dsAnulados.filter = filter.trim().toLowerCase() }
  //#endregion

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    if (this.dsAnulados) { this.dsAnulados.filter = '' }
  }
  /* #endregion */

  Desvincular(row: E_Armado_Rutas, index: number): void {
    if(row.bEstado){
      Swal.fire({ title: `El vehículo se encuentra liquidado`, icon: 'info', timer: 2000 });
      return;
    }
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 20, `${row.nId}`).subscribe(res => {
      this.spinner.hide();
      Swal.fire(new Question(res.result) as unknown).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          this.transporteService.fnArmadoRuta(1, 1, 13, `${row.nId}`).subscribe(res => {
            this.spinner.hide();
            if (res.result == 0) {
              Swal.fire({ title: `Hubo un error en la transacción`, icon: 'error', timer: 2000 });
            } else {
              Swal.fire({ title: `Se ha desvinculado de manera exitosa`, icon: 'success', timer: 2000 });
              this.dsAnulados.data.splice(index, 1);
              this.dsAnulados._updateChangeSubscription();
            }
          }, (error) => { this.spinner.hide(); console.log(error) });
        }
      });
    });
  }
}
