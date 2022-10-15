import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Liquidacion_Transporte_Prorrateo } from '../../../models/liquidacionTransporte';

@Component({
  templateUrl: './log-dialog-ver-prorrateos.component.html',
  styleUrls: ['./log-dialog-ver-prorrateos.component.css']
})
export class LogDialogVerProrrateosComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dsProrrateos: MatTableDataSource<E_Liquidacion_Transporte_Prorrateo>
  displayedColumns: string[];
  calculado: number;

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Empresa', field: 'sEmpresa', type: null, width: '80', align: 'left' },
    { header: 'Presupuesto', field: 'sCodPresupuesto', type: null, width: '60', align: 'center' },
    { header: 'Descripción', field: 'sPresupuesto', type: null, width: '200', align: 'left' },
    { header: 'Peso', field: 'nPeso', type: 'deci2', width: '50', align: 'right' },
    { header: 'Volumen', field: 'nVolumen', type: 'deci6', width: '70', align: 'right' },
    { header: 'Costo traslado', field: 'nCostoTraslado', type: 'deci4', width: '70', align: 'right' }
  ];
  /* #endregion */

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { list: E_Liquidacion_Transporte_Prorrateo[], nPrecioTotal: number }
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
    this.calculado = this.data.list.reduce((acc, item) => acc + item.nCostoTraslado, 0);
  }

  indicePaginado(indice: number): number { return indice + 1 + this.paginator.pageIndex * this.paginator.pageSize }

  ngOnInit(): void {
    this.dsProrrateos = new MatTableDataSource<E_Liquidacion_Transporte_Prorrateo>(this.data.list);
    this.dsProrrateos.paginator = this.paginator;
    this.dsProrrateos.sort = this.sort;
  }

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dsProrrateos.filter = filterValue.trim().toLowerCase() }
  /* #endregion */
}
