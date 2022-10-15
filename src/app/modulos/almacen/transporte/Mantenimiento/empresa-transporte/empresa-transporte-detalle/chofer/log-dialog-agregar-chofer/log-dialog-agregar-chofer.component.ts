import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chofer_Empresa } from '../../../../models/Chofer.model';

@Component({
  templateUrl: './log-dialog-agregar-chofer.component.html',
  styleUrls: ['./log-dialog-agregar-chofer.component.css']
})
export class LogDialogAgregarChoferComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dsChoferes: MatTableDataSource<Chofer_Empresa>;
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Acción', field: 'accion', type: 'accion', width: '80', align: 'center' },
    { header: 'Tipo Doc.', field: 'sTipoDoc', type: null, width: '100', align: 'left' },
    { header: 'Documento', field: 'sNumDocumento', type: null, width: '100', align: 'left' },
    { header: 'Brevete', field: 'sBrevete', type: null, width: '120', align: 'left' },
    { header: 'Nombres y Apellidos', field: 'sNombreCompleto', type: null, width: '250', align: 'left' },
    { header: 'Venc. Brevete', field: 'dVence', type: null, width: '100', align: 'center' }
  ];
  /* #endregion */

  txtFiltro = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<LogDialogAgregarChoferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { list: Chofer_Empresa[] }
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.dsChoferes = new MatTableDataSource<Chofer_Empresa>(this.data.list);
    this.dsChoferes.sort = this.sort;
    this.dsChoferes.paginator = this.paginator;
  }

  fnAgregar(row: Chofer_Empresa): void {
    this.dialogRef.close(row.nIdChofer);
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dsChoferes.filter = filtro;
  }
}
