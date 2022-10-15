import { AfterViewInit, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-dialog-lista-articulo',
  templateUrl: './dialog-lista-articulo.component.html',
  styleUrls: ['./dialog-lista-articulo.component.css']
})

export class DialogListaArticuloComponent implements AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];
  dataSource: MatTableDataSource<any>;

  cols: any[] = [
    { header: 'Tipo', field: 'sTipo', width: '100', align: 'left' },
    { header: 'Código', field: 'codigo', width: '80', align: 'center' },
    { header: 'Nombre', field: 'nombre', width: '300', align: 'left' },
    { header: 'Creado Por', field: 'nameUser', width: '250', align: 'left' },
    { header: 'Estado', field: 'sEstado', width: '80', align: 'center' },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) { 
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<any>(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}