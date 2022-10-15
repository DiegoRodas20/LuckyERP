import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Vehiculo_Empresa } from '../../../../models/Vehiculo.model';

@Component({
  templateUrl: './log-dialog-agregar-vehiculo.component.html',
  styleUrls: ['./log-dialog-agregar-vehiculo.component.css']
})
export class LogDialogAgregarVehiculoComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dsVehiculos: MatTableDataSource<Vehiculo_Empresa>
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Acción', field: 'accion', type: 'accion', width: '80', align: 'center' },
    { header: 'Placa', field: 'sPlaca', type: null, width: '100', align: 'left' },
    { header: 'Descripción', field: 'sDescripcion', type: null, width: '300', align: 'left' },
    { header: 'Modelo', field: 'sModelo', type: null, width: '120', align: 'left' },
    { header: 'Tipo Vehículo', field: 'sTipoVehiculo', type: null, width: '120', align: 'left' },
    { header: '¿De Lucky?', field: 'sLucky', type: null, width: '50', align: 'center' }
  ];
  /* #endregion */
  txtFiltro = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<LogDialogAgregarVehiculoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { list: Vehiculo_Empresa[] }
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.dsVehiculos = new MatTableDataSource<Vehiculo_Empresa>(this.data.list);
    this.dsVehiculos.paginator = this.paginator;
    this.dsVehiculos.sort = this.sort;
  }

  fnAgregar(row: Vehiculo_Empresa): void {
    this.dialogRef.close(row.nIdVehiculo);
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dsVehiculos.filter = filtro;
  }
}
