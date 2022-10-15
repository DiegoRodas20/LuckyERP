import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Ajuste_Congelado } from '../../../models/ajusteCongelado';

@Component({
  selector: 'app-ajuste-congelado-table',
  templateUrl: './ajuste-congelado-table.component.html',
  styleUrls: ['./ajuste-congelado-table.component.css']
})

export class AjusteCongeladoTableComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @Output() sendIdGasto: EventEmitter<number> = new EventEmitter<number>();
  @Input() listado: E_Ajuste_Congelado[];
  txtFiltro = new FormControl();
  displayedColumns: string[];
  //dataSource: MatTableDataSource<E_AjusteCongelado>;
  dataSource = new MatTableDataSource();

  constructor() {
    this.displayedColumns = [
      'colOpciones',
      'sCiudad',
      'sFechaOperMov',
      'sCodTransporte',
      'sNota',
      'sCliente',
      'sCodAlmacen',
      'sDestino',
      'nPeso',
      'nVolumen',
      'nPrecio',
      'sEstado'
    ];
  }

  ngOnInit(): void {
    /* #region  Personalización de la paginación*/
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      return `${page * pageSize + 1} - ${(page + 1) * pageSize} de ${length}`;
    };
    /* #endregion */
  }

  ngOnChanges(changes: SimpleChanges): void {
    /* #region  Detección de existencia de datos en el listado */
    if (changes.listado && this.listado) {
      //this.dataSource = new MatTableDataSource<E_AjusteCongelado>(this.listado);
      this.dataSource = new MatTableDataSource(this.listado);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    /* #endregion */
  }

  /* #region  Método de envío del Id del Gasto Congelado */
  fnEditar(element: E_Ajuste_Congelado): void {
    this.sendIdGasto.emit(element.nId);
  }
  /* #endregion */

  /* #region  Método de filtración del listado */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    if (this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
  }
  /* #endregion */
}
