import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dialog-orden-compra-historial-estados',
  templateUrl: './dialog-orden-compra-historial-estados.component.html',
  styleUrls: ['./dialog-orden-compra-historial-estados.component.css']
})
export class DialogOrdenCompraHistorialEstadosComponent implements OnInit {

  titulo: string // Nombre del documento

  historialDeEstados = []; // Lista de todos los historiales

  dsHistorial: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  displayedColumnsHistorial: string[] = ['sUsuario', 'sEstado', 'sMensaje', 'sFecha'];

  constructor(
    public dialogRef: MatDialogRef<DialogOrdenCompraHistorialEstadosComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {
      console.log(data);
      this.historialDeEstados = data.historial;
      this.titulo = data.titulo;
    }

  async ngOnInit(): Promise<void> {
    await this.fnCrearTablaHistorialEstados();
    this.spinner.hide();
  }

  // Generar la tabla de historial de estados
  async fnCrearTablaHistorialEstados(): Promise<void> {
    this.dsHistorial = new MatTableDataSource(this.historialDeEstados);
    setTimeout(() => this.dsHistorial.paginator = this.paginator);
  }

}
