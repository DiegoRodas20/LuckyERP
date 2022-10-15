import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Liquidacion_Transporte_Punto } from '../../../models/liquidacionTransporte';

@Component({
  selector: 'app-liquidacion-transporte-body',
  templateUrl: './liquidacion-transporte-body.component.html',
  styleUrls: ['./liquidacion-transporte-body.component.css']
})
export class LiquidacionTransporteBodyComponent implements OnChanges {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output() sendPunto: EventEmitter<E_Liquidacion_Transporte_Punto> = new EventEmitter<E_Liquidacion_Transporte_Punto>();
  @Input() detalleList: E_Liquidacion_Transporte_Punto[];
  dataSource: MatTableDataSource<E_Liquidacion_Transporte_Punto>;
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '50', align: 'center' },
    { header: 'Nro. Punto', field: 'sPunto', type: null, width: '60', align: 'center' },
    { header: 'Cadena Origen', field: 'sCadenaOrigen', type: null, width: '250', align: 'left' },
    { header: 'Lugar Origen', field: 'sLugarOrigen', type: null, width: '250', align: 'left' },
    { header: 'Cadena Destino', field: 'sCadenaDestino', type: null, width: '250', align: 'left' },
    { header: 'Sucursal Destino', field: 'sSucursalDestino', type: null, width: '250', align: 'left' },
    { header: 'Zona', field: 'sZona', type: null, width: '120', align: 'left' },
    { header: 'Cono', field: 'sCono', type: null, width: '150', align: 'left' },
    { header: 'Clientes', field: 'sClientes', type: null, width: '300', align: 'left' }
  ];
  /* #endregion */

  constructor() {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.detalleList == null) {
      this.dataSource = new MatTableDataSource<E_Liquidacion_Transporte_Punto>([]);
    }
    if (changes.detalleList && this.detalleList) {
      this.dataSource = new MatTableDataSource<E_Liquidacion_Transporte_Punto>(this.detalleList);
      this.dataSource.sort = this.sort;
    }
  }

  /* #region  Método de envío del punto */
  fnGetGuiaList(punto: E_Liquidacion_Transporte_Punto): void {
    this.sendPunto.emit(punto);
  }
  /* #endregion */

  headerName(field: string, header: string): string { return field == 'accion' ? 'Listar Guías' : header }

  /* #region  Método de filtración del listado */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { this.dataSource.filter = '' }
  /* #endregion */
}
