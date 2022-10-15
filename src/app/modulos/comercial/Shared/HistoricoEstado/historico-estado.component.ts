import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource,  } from '@angular/material/table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Estado } from '../../Models/IEstado';



@Component({
  selector: 'app-historico-estado',
  templateUrl: './historico-estado.component.html',
  styleUrls: ['./historico-estado.component.css']
})
export class HistoricoEstadoComponent implements OnInit {

  //#region Variable del Sistema
  nIdUsuario: number;
  nIdEmpresa: string;  
  sPais: string;
  url: string;
  //#endregion 

  //#region Variables de la Tabla
  displayedColumns: string[] = ['cUser', 'sEstado', 'fecha', 'mensaje'];
  dataSource: MatTableDataSource<Estado>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  //#endregion

  constructor(
    public dialogRef: MatDialogRef<HistoricoEstadoComponent>,   
    @Inject(MAT_DIALOG_DATA) public data: Estado[]
  ) { 
    
  }

  ngOnInit(): void {     
    this.dataSource = new MatTableDataSource(this.data);   
    this.dataSource.sort = this.sort;  
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

}
