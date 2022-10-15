import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { E_Liquidacion_Transporte_Articulo } from '../../../models/liquidacionTransporte';

@Component({
  selector: 'app-liquidacion-transporte-body-articulo',
  templateUrl: './liquidacion-transporte-body-articulo.component.html',
  styleUrls: ['./liquidacion-transporte-body-articulo.component.css']
})
export class LiquidacionTransporteBodyArticuloComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dsArticulos: MatTableDataSource<E_Liquidacion_Transporte_Articulo>
  displayedColumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Código'        , field: 'sCodArticulo' , type: null    },
    { header: 'Descripción'   , field: 'sDescripcion' , type: null    },
    { header: 'U.M.'          , field: 'sUndMedida'   , type: null    },
    { header: 'Lote'          , field: 'sLote'        , type: null    },
    { header: 'Cantidad'      , field: 'nUnidades'    , type: null    },
    { header: 'Peso Total'    , field: 'nPesoTotal'   , type: 'deci2' },
    { header: 'Volumen Total' , field: 'nVolumenTotal', type: 'deci6' },
  ];
  /* #endregion */

  constructor(
    public dialogRef: MatDialogRef<LiquidacionTransporteBodyArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { list: E_Liquidacion_Transporte_Articulo[], concatenado: string }
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.dsArticulos = new MatTableDataSource<E_Liquidacion_Transporte_Articulo>(this.data.list);
    this.dsArticulos.paginator = this.paginator;
    this.dsArticulos.sort = this.sort;
  }
}
