import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Armado_Rutas } from '../../../models/rutaModal.model';

@Component({
  templateUrl: './log-dialog-select-nota.component.html',
  styleUrls: ['./log-dialog-select-nota.component.css']
})
export class LogDialogSelectNotaComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<E_Armado_Rutas>
  txtFiltro = new FormControl();
  displayedColumns: string[];
  listIdOperMov: number[] = [];

  cols: any[] = [
    { header: 'Selección', field: 'opcion', type: 'accion', width: '60', align: 'center' },
    { header: 'Empresa', field: 'sNombreEmpresa', type: null, width: '120', align: 'left' },
    { header: 'Nota', field: 'sNota', type: null, width: '100', align: 'center' },
    { header: 'Presupuesto', field: 'sCodPresupuesto', type: null, width: '80', align: 'center' },
    { header: 'Guía', field: 'sGuia', type: null, width: '100', align: 'center' },
    { header: 'Almacén', field: 'sCodAlmacen', type: null, width: '150', align: 'left' },
    { header: 'Unidades', field: 'nCantidad', type: null, width: '60', align: 'center' },
    { header: 'Peso', field: 'nPeso', type: 'deci2', width: '80', align: 'right' },
    { header: 'Volumen', field: 'nVolumen', type: 'deci6', width: '100', align: 'right' },
    { header: 'Punto Llegada', field: 'sPuntoLLegada', type: null, width: '200', align: 'left' },
    { header: 'Distrito', field: 'sDistrito', type: null, width: '150', align: 'left' },
    { header: 'Fecha Entrega', field: 'sFechaEntrega', type: null, width: '100', align: 'center' },
    { header: 'Hora', field: 'sHora', type: null, width: '50', align: 'left' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notaList: E_Armado_Rutas[] },
    public dialogRef: MatDialogRef<LogDialogSelectNotaComponent>,
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<E_Armado_Rutas>(this.data.notaList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    this.dataSource.filter = '';
    this.txtFiltro.setValue('');
  }
  /* #endregion */

  /* #region selecciona una guía y verifica si existe en la lista de operaciones por actualizar, si no existe la agrega y si existe la elimina */
  select(nIdOperMov: number): void {
    const indice = this.listIdOperMov.indexOf(nIdOperMov);
    indice >= 0 ? this.listIdOperMov.splice(indice, 1) : this.listIdOperMov.push(nIdOperMov);
  }
  /* #endregion */

  get hasSelected(): boolean {
    return this.listIdOperMov?.length === 0 ? true : false;
  }

  fnGuardar(): void {
    this.dialogRef.close(this.listIdOperMov);
  }
}
