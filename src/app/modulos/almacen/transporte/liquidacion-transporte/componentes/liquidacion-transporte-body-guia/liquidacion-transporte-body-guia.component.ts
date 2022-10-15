import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Liquidacion_Transporte_Guia } from '../../../models/liquidacionTransporte';

@Component({
  selector: 'app-liquidacion-transporte-body-guia',
  templateUrl: './liquidacion-transporte-body-guia.component.html',
  styleUrls: ['./liquidacion-transporte-body-guia.component.css']
})
export class LiquidacionTransporteBodyGuiaComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output() sendGuia: EventEmitter<E_Liquidacion_Transporte_Guia> = new EventEmitter<E_Liquidacion_Transporte_Guia>();
  @Output() sendEstado: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendCostoCero: EventEmitter<number> = new EventEmitter<number>();
  @Input() guiaList: E_Liquidacion_Transporte_Guia[];
  @Input() origenPunto: string;
  @Input() destinoPunto: string;
  @Input() isTerminado: boolean;
  dataSource: MatTableDataSource<E_Liquidacion_Transporte_Guia>
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción'      , field: 'accion'         , type: 'accion'    , width: '40' , align: 'center' , sort: false },
    { header: 'Empresa'     , field: 'sNombreEmpresa' , type: null        , width: '120', align: 'left'   , sort: true  },
    { header: 'Almacén'     , field: 'sAlmacen'       , type: null        , width: '60' , align: 'center' , sort: true  },
    { header: 'Presupuesto' , field: 'sCodPresupuesto', type: null        , width: '90' , align: 'center' , sort: true  },
    { header: 'Nota'        , field: 'sNota'          , type: null        , width: '70' , align: 'center' , sort: true  },
    { header: 'Guía'        , field: 'sGuia'          , type: null        , width: '100', align: 'center' , sort: true  },
    { header: 'Unidades'    , field: 'nUnidades'      , type: null        , width: '70' , align: 'right'  , sort: true  },
    { header: 'Peso'        , field: 'nPeso'          , type: 'deci2'     , width: '70' , align: 'right'  , sort: true  },
    { header: 'Volumen'     , field: 'nVolumen'       , type: 'deci6'     , width: '70' , align: 'right'  , sort: true  },
    { header: 'Costo Cero'  , field: 'bCostoCero'     , type: 'chkCosto'  , width: '70' , align: 'center' , sort: false },
    { header: 'Situación'   , field: 'sSituacion'     , type: null        , width: '100', align: 'left'   , sort: true  },
    { header: 'Partida'     , field: 'sCodPartida'    , type: null        , width: '60' , align: 'center' , sort: true  },
    { header: 'Selección'   , field: 'bLiquidado'     , type: 'chkEstado' , width: '60' , align: 'center' , sort: false }
  ];
  /* #endregion */

  constructor() {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.guiaList && this.guiaList) {
      this.dataSource = new MatTableDataSource<E_Liquidacion_Transporte_Guia>(this.guiaList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  /* #region  Método de envío del código de operación */
  fnGetArticuloList(element: E_Liquidacion_Transporte_Guia): void { this.sendGuia.emit(element) }
  /* #endregion */

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { this.dataSource.filter = '' }
  /* #endregion */

  /* #region envía el nIdOperMov de la guía en caso cambie de estado*/
  fnChangeCostoCero(row: E_Liquidacion_Transporte_Guia): void { this.sendCostoCero.emit(row.nIdOperMov) }
  /* #endregion */

  /* #region envía el nIdOperMov de la guía en caso cambie de estado*/
  fnChangeEstado(row: E_Liquidacion_Transporte_Guia): void { this.sendEstado.emit(row.nIdOperMov) }
  /* #endregion */
}
