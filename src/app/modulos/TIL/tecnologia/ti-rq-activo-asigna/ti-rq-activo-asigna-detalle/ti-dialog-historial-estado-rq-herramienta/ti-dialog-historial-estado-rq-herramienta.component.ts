import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { HistorialEstadoRqHerramienta } from '../../../api/models/requerimientoHerramienta.model';
import { RequerimientoHerramientaService } from '../../../api/services/requerimiento-herramienta.service';

@Component({
  selector: 'app-ti-dialog-historial-estado-rq-herramienta',
  templateUrl: './ti-dialog-historial-estado-rq-herramienta.component.html',
  styleUrls: ['./ti-dialog-historial-estado-rq-herramienta.component.css']
})
export class TiDialogHistorialEstadoRqHerramientaComponent implements OnInit {

  dataSource: MatTableDataSource<HistorialEstadoRqHerramienta>;
  displayedColumns: string[] = ['sUsuario', 'sEstado', 'sFecha'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<TiDialogHistorialEstadoRqHerramientaComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private _requerimientoHerramientaService: RequerimientoHerramientaService,
    @Inject(MAT_DIALOG_DATA) public data: number
  ) {
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      this.spinner.show();
      await this.GetHistorialEstado()

      this.spinner.hide();

    });
  }

  async GetHistorialEstado() {
    this.spinner.show();

    let response = await this._requerimientoHerramientaService.GetHistorialEstado(this.data)

    this.spinner.hide();

    this.dataSource = new MatTableDataSource(response.response.data)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
