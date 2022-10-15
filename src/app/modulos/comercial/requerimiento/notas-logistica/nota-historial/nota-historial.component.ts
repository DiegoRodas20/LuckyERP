import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotasLogisticaService } from '../notas-logistica.service';

@Component({
  selector: 'app-nota-historial',
  templateUrl: './nota-historial.component.html',
  styleUrls: ['./nota-historial.component.css']
})
export class NotaHistorialComponent implements OnInit {

  displayedColumns: string[] = ['estado', 'sMensaje', 'usuario', 'fecha'];
  dataSource: any;
  listaHistorial: any;
  parametros: string[];
  url: string;
  idNota: any;
  constructor(
    public dialogRef: MatDialogRef<NotaHistorialComponent>,
    private notaLogisticaService: NotasLogisticaService,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.url = baseUrl;
  }

  async ngOnInit() {
    const parametro = [];
    const parametroDet = [];
    this.idNota = this.data.idNota;
    parametro.push(this.idNota);
    this.listaHistorial = await this.notaLogisticaService.fnControlVisorDeHistorial(11, 0, parametro, 13, parametroDet, this.url);
    this.llenarHistorial(this.listaHistorial);
  }

  llenarHistorial(listaHistorial: any[]) {

    this.dataSource = new MatTableDataSource(listaHistorial)

  }

}
